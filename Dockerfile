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

# Copy the start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Generate Prisma client
RUN npx prisma generate

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:3000/api/v1/health || exit 1

# Start the application using the script
CMD ["/app/start.sh"]
