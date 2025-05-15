#!/bin/bash

# Setup script for the Weather API

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Generate Prisma client
echo "Generating Prisma client..."
pnpm prisma:generate

# Run migrations
echo "Running migrations..."
pnpm prisma:migrate

echo "Setup complete! You can now run the application with 'pnpm dev'"
