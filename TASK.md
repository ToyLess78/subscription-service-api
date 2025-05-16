# Weather API Application

Build a weather API application that allows users to subscribe to weather updates for a choosen city. You can use any free Weather API (e.g [WeatherAPI.com](https://www.weatherapi.com/my))

## Endpoints

Implement the next endpoints:

- `GET /api/weather?city={city}` - Get current weather for a given city with `Temperature`, `Humidity` and `Weather description`
- `POST /api/subscribe` - Subscribe a given `email` to weather updates for a given `city` with a given frequency (`daily` or `hourly`)
- `GET /api/confirm/{token}` - Confirm email subscription (send a link to this endpoint on the confirmation email)
- `GET /api/unsubscribe/{token}` - Unsubscribe from weather updates (send a link to this endpoint in each weather update)

> **Note**: `swagger.yaml` file contains API documentation. You can watch it using [Swagger Editor](https://editor.swagger.io/).

## Requirements

Provide a link to your public Github repo containing:

- The app implemented with `Node.js`, `PHP` or `Golang` using any libraries or frameworks.
- Migrations to setup initial `PostgreSQL` DB structure.
- `readme.md` file explainig what was done and how to run the app locally
- `Dockerfile` and `docker-compose.yml` to run the app with a single `docker compose up` command

## Extras

- deploy your API to some hosting (e.g., [Render](https://render.com/docs/docker))
- Create a simple HTML page to initiate the subscription
- Cover the API with functional tests
