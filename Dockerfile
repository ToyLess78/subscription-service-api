# Use Debian-based Node.js image instead of Alpine
FROM node:20-slim AS base

# Install OpenSSL 1.1 (required by Prisma) and other tools
RUN apt-get update -y && apt-get install -y openssl wget grep sed

# Set working directory
WORKDIR /app

# Install dependencies
FROM base AS dependencies
COPY package*.json ./
RUN npm install

# Build the application
FROM dependencies AS build
COPY . .
RUN npm run build

# Production image
FROM base AS production

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy built application and dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./

# Create a more robust script to ensure server listens on 0.0.0.0
RUN echo '#!/bin/bash\n\
SERVER_FILES=$(find ./dist -type f -name "*.js" -exec grep -l "listen.*localhost\\|listen.*127.0.0.1" {} \\;)\n\
if [ -n "$SERVER_FILES" ]; then\n\
  echo "Found server files to patch:"\n\
  for file in $SERVER_FILES; do\n\
    echo "  - $file"\n\
    # More comprehensive replacement patterns\n\
    sed -i "s/\$$listen[^,]*,[ ]*['\\\"]\$$localhost\$$['\\\"]\$$/\\10.0.0.0\\2/g" "$file"\n\
    sed -i "s/\$$listen[^,]*,[ ]*['\\\"]\$$127\\.0\\.0\\.1\$$['\\\"]\$$/\\10.0.0.0\\2/g" "$file"\n\
    sed -i "s/\$$host[^,]*:[ ]*['\\\"]\$$localhost\$$['\\\"]\$$/\\10.0.0.0\\2/g" "$file"\n\
    sed -i "s/\$$host[^,]*:[ ]*['\\\"]\$$127\\.0\\.0\\.1\$$['\\\"]\$$/\\10.0.0.0\\2/g" "$file"\n\
    echo "  - Patched $file"\n\
  done\n\
else\n\
  echo "No server files found that need patching."\n\
fi\n\
\n\
# Start the application\n\
exec node dist/server.js' > /app/start.sh

RUN chmod +x /app/start.sh

# Generate Prisma client
RUN npx prisma generate

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:3000/api/v1/health || exit 1

# Start the application using the new script
CMD ["/app/start.sh"]
