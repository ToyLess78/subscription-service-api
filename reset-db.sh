#!/bin/bash

# Reset the database and regenerate the Prisma client

# Stop on errors
set -e

echo "Resetting database..."

# Drop the database if it exists
echo "Dropping existing database tables..."
npx prisma migrate reset --force

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Apply migrations
echo "Applying migrations..."
npx prisma migrate deploy

echo "Database reset complete!"
