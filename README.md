# Weather Subscription API

A RESTful API for weather forecasts and subscription management.

## Features

- Weather forecast retrieval
- Email subscription management
- Confirmation and unsubscription flows
- PostgreSQL database integration with Prisma ORM
- Swagger API documentation

## Setup

### Prerequisites

- Node.js 16+
- pnpm
- PostgreSQL database

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

## API Endpoints

- `GET /api/v1/weather` - Get weather for a city
- `POST /api/v1/subscribe` - Subscribe to weather updates
- `GET /api/v1/confirm/:token` - Confirm subscription
- `GET /api/v1/unsubscribe/:token` - Unsubscribe from updates
