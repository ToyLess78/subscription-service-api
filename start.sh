#!/bin/bash

echo "Starting server configuration..."

# Find all server files that might need patching for host binding
SERVER_FILES=$(find /app/dist -type f -name "*.js" -exec grep -l "listen.*localhost\|listen.*127.0.0.1\|host.*localhost\|host.*127.0.0.1" {} \;)

if [ -n "$SERVER_FILES" ]; then
  echo "Found server files to patch for host binding:"
  for file in $SERVER_FILES; do
    echo "  - $file"

    # Replace localhost and 127.0.0.1 with 0.0.0.0
    sed -i 's/localhost/0.0.0.0/g' "$file"
    sed -i 's/127\.0\.0\.1/0.0.0.0/g' "$file"

    echo "  - Patched $file"
  done
else
  echo "No server files found that need host binding patches."
fi

# Find Swagger configuration files
SWAGGER_FILES=$(find /app/dist -type f -name "*.js" -exec grep -l "swagger\|openapi" {} \;)

if [ -n "$SWAGGER_FILES" ]; then
  echo "Found Swagger files to check:"
  for file in $SWAGGER_FILES; do
    echo "  - $file"

    # Check if the file contains server URL configurations
    if grep -q "servers.*url" "$file"; then
      echo "    - Contains server URL configurations"

      # Replace any hardcoded URLs with the BASE_URL environment variable
      if [ -n "$BASE_URL" ]; then
        echo "    - Setting server URL to $BASE_URL"
        # This handles various patterns of server URL definitions in Swagger config
        sed -i "s|http://[^/\"']*|$BASE_URL|g" "$file"
      fi
    fi
  done
else
  echo "No Swagger files found."
fi

# Print environment variables for debugging (excluding sensitive ones)
echo "Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "HOST: $HOST"
echo "PORT: $PORT"
echo "API_VERSION: $API_VERSION"
echo "BASE_URL: $BASE_URL"

# Start the application
echo "Starting the application..."
exec node /app/dist/server.js
