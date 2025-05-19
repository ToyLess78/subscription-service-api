#!/bin/bash

# Find all server files that might need patching
SERVER_FILES=$(find /app/dist -type f -name "*.js" -exec grep -l "listen.*localhost\|listen.*127.0.0.1\|host.*localhost\|host.*127.0.0.1" {} \;)

if [ -n "$SERVER_FILES" ]; then
  echo "Found server files to patch:"
  for file in $SERVER_FILES; do
    echo "  - $file"

    # More comprehensive replacement patterns for different code patterns
    # Pattern 1: listen('localhost', ...)
    sed -i "s/$$listen[^,]*,[ ]*['\"]$$localhost$$['\"]$$/\10.0.0.0\2/g" "$file"

    # Pattern 2: listen('127.0.0.1', ...)
    sed -i "s/$$listen[^,]*,[ ]*['\"]$$127\.0\.0\.1$$['\"]$$/\10.0.0.0\2/g" "$file"

    # Pattern 3: host: 'localhost'
    sed -i "s/$$host[^,]*:[ ]*['\"]$$localhost$$['\"]$$/\10.0.0.0\2/g" "$file"

    # Pattern 4: host: '127.0.0.1'
    sed -i "s/$$host[^,]*:[ ]*['\"]$$127\.0\.0\.1$$['\"]$$/\10.0.0.0\2/g" "$file"

    # Pattern 5: { host: 'localhost' }
    sed -i "s/$${[ ]*host:[ ]*['\"]$$localhost$$['\"]$$/\10.0.0.0\2/g" "$file"

    # Pattern 6: { host: '127.0.0.1' }
    sed -i "s/$${[ ]*host:[ ]*['\"]$$127\.0\.0\.1$$['\"]$$/\10.0.0.0\2/g" "$file"

    echo "  - Patched $file"
  done
else
  echo "No server files found that need patching."
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
