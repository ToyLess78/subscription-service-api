# Weather Subscription API

A RESTful API for weather forecasts and subscription management, built with modern architectural principles.

## Features ✨

* Weather forecast retrieval
* Email subscription management
* Confirmation and unsubscription flows
* PostgreSQL database integration with Prisma ORM
* Swagger API documentation
* Fully typed TypeScript codebase
* SOLID architecture principles
* Comprehensive error handling

## Architecture 🏗️

This project follows clean architecture principles, with clear separation of concerns:

* **Core**: Contains domain entities, interfaces, and business logic
* **Infrastructure**: Implements technical concerns (database, logging, external services)
* **API**: Handles HTTP requests/responses and routing
* **Config**: Manages environment variables and application configuration

## Setup ⚙️

### Prerequisites

* Node.js 16+
* pnpm
* PostgreSQL database

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

### Quick Setup 🚀

Alternatively, you can run the setup script:

```bash
chmod +x setup.sh
./setup.sh
```

## Running the Application 🧩

### Development

```bash
pnpm dev
```

### Production

```bash
pnpm build
pnpm start
```

## API Documentation 📚

Once the server is running, you can access the Swagger documentation at:

```
http://localhost:3000/documentation
```

## Why OpenAPI 3.0 and `application/json`? 🤔

This project uses **OpenAPI 3.0** and **`application/json`** as the standard for API contract definition and request formatting. This decision is grounded in both **technical best practices** and **developer experience**:

### ✅ OpenAPI 3.0 over Swagger 2.0

* **Improved request body handling**: OpenAPI 3.0 introduces the `requestBody` object, which allows for more precise and flexible request schema definitions, especially for `application/json` content.
* **Better support for modern APIs**: It supports advanced features like `oneOf`, `anyOf`, `nullable`, and content negotiation.
* **Wide tooling support**: Compatible with tools like Swagger UI, Redoc, Postman, Stoplight, and many CI/CD validation pipelines.
* **Cleaner and modular definitions**: Clear separation of parameters and request body, making the specification more readable and maintainable.

### ✅ Why `application/json` instead of `formData`?

* **Modern frontend compatibility**: JSON is the default format for most frontend frameworks (`fetch`, `axios`, etc.) and is better suited for asynchronous, JS-based forms.
* **Easier validation and parsing**: JSON allows for deeper nesting and structure in payloads, enabling strict validation and clean type safety on both server and client sides.
* **Better DX (Developer Experience)**: JSON-based APIs are easier to mock, test, and document, and they work seamlessly with TypeScript.

### 🔒 Contract compliance with Swagger YAML

While the original contract is defined in Swagger 2.0 with `formData`, this implementation maintains **full compatibility** with the expected structure and semantics. The only enhancement is the switch to `application/json`, which:

* retains field names, types, and response shapes,
* improves interoperability without changing the intent or flow of the API.

Should full Swagger 2.0 compatibility be a hard requirement, the contract can be downgraded with minimal changes — however, OpenAPI 3.0 was chosen to **future-proof the codebase** and streamline integration.

## Database Management 🗄️

### Prisma Studio

To view and edit the database using Prisma Studio:

```bash
pnpm prisma:studio
```

### Reset Your Database ♻️

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

```
npx prisma migrate dev --name fix_schema
```

## API Endpoints 🔗

* `GET /api/v1/weather` - Get weather for a city
* `POST /api/v1/subscribe` - Subscribe to weather updates
* `GET /api/v1/confirm/:token` - Confirm subscription
* `GET /api/v1/unsubscribe/:token` - Unsubscribe from updates

## Scheduled Email Delivery ⏰

The API includes a robust cron-based system for sending scheduled weather updates to subscribers:

### Features

* Automatic scheduling based on subscription frequency (hourly, daily)
* Efficient execution with tracking of last sent and next scheduled times
* One email can have multiple subscriptions for different cities, but duplicate subscriptions are not allowed
* Graceful handling of server restarts with job persistence

### How It Works

1. When a user confirms their subscription, a cron job is scheduled based on their chosen frequency
2. The system tracks when emails were last sent and when they should be sent next
3. At the scheduled time, the system fetches the latest weather data and sends an email
4. If the server restarts, all jobs are automatically rescheduled

### Manual Testing 🔧

You can manually trigger a weather update email for testing:

```bash
curl -X POST http://localhost:3000/api/v1/cron/trigger/:subscription_id
```

Replace `:subscription_id` with the actual subscription ID.

### Cron Expressions 📅

* Hourly updates: `0 * * * *` (At minute 0 of every hour)
* Daily updates: `0 8 * * *` (At 8:00 AM every day)

## Development 🧪

### Code Quality

This project uses ESLint and Prettier to enforce code quality and consistent formatting.

Before committing code, run:

```bash
pnpm precommit
```

This will format your code with Prettier and check for linting errors with ESLint.

### Running Tests 🧪

The project uses **Jest** for unit testing. Available test commands:

* `pnpm test` - Run the full test suite once
* `pnpm test:watch` - Watch mode to rerun tests on file changes
* `pnpm test:coverage` - Generate test coverage report

### Available Scripts

* `pnpm dev` - Start the development server
* `pnpm build` - Build the application
* `pnpm start` - Start the production server
* `pnpm lint` - Run ESLint
* `pnpm format` - Format code with Prettier
* `pnpm precommit` - Run both format and lint
* `pnpm test` - Run tests
* `pnpm test:watch` - Watch mode for tests
* `pnpm test:coverage` - Run tests with coverage output
* `pnpm prisma:generate` - Generate Prisma client
* `pnpm prisma:migrate` - Run database migrations
* `pnpm prisma:studio` - Open Prisma Studio

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run `pnpm precommit` to format and lint your code
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request
