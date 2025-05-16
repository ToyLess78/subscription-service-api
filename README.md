# Weather Subscription API

A RESTful API for weather forecasts and subscription management, built with modern architectural principles.

## Features

- Weather forecast retrieval
- Email subscription management
- Confirmation and unsubscription flows
- PostgreSQL database integration with Prisma ORM
- Swagger API documentation
- Fully typed TypeScript codebase
- SOLID architecture principles
- Comprehensive error handling

## Architecture

This project follows clean architecture principles, with clear separation of concerns:

- **Core**: Contains domain entities, interfaces, and business logic
- **Infrastructure**: Implements technical concerns (database, logging, external services)
- **API**: Handles HTTP requests/responses and routing
- **Config**: Manages environment variables and application configuration

## Setup

### Prerequisites

- Node.js 16+
- pnpm
- PostgreSQL database (or use Railway)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.env` file with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/weather_api?schema=public
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
BASE_URL=http://localhost:3000
```

4. Generate Prisma client:

```bash
pnpm prisma:generate
```

5. Run database migrations:

```bash
pnpm prisma:migrate
```

### Quick Setup

Alternatively, you can run the setup script:

```bash
chmod +x setup.sh
./setup.sh
```

## Running the Application

### Development

```bash
pnpm dev
```

### Production

```bash
pnpm build
pnpm start
```

## API Documentation

Once the server is running, you can access the Swagger documentation at:

```
http://localhost:3000/documentation
```

## Database Management

### Prisma Studio

To view and edit the database using Prisma Studio:

```bash
pnpm prisma:studio
```

### Reset Your Database

If you need to start fresh or encounter schema issues, you can reset your database:

```bash
chmod +x reset-db.sh
./reset-db.sh
```

This script will:
1. Drop all tables in your database
2. Regenerate the Prisma client
3. Apply all migrations from scratch

Alternatively, if you want to keep your data and just apply schema changes:

```bash
npx prisma migrate dev --name fix_schema
```

## API Endpoints

- `GET /api/v1/weather` - Get weather for a city
- `POST /api/v1/subscribe` - Subscribe to weather updates
- `GET /api/v1/confirm/:token` - Confirm subscription
- `GET /api/v1/unsubscribe/:token` - Unsubscribe from updates

## Development

### Code Quality

This project uses ESLint and Prettier to enforce code quality and consistent formatting.

Before committing code, run:

```bash
pnpm precommit
```

This will format your code with Prettier and check for linting errors with ESLint.

### Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm precommit` - Run both format and lint
- `pnpm test` - Run tests
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:studio` - Open Prisma Studio

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run `pnpm precommit` to format and lint your code
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request
