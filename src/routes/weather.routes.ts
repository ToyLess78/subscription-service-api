import type { FastifyPluginAsync } from "fastify"
import { WeatherController } from "../controllers/weather.controller"
import { WeatherService } from "../services/weather.service"
import { weatherRequestSchema } from "../models/weather.schema"

const weatherRoutes: FastifyPluginAsync = async (fastify) => {
  // Create service and controller instances
  const weatherService = new WeatherService(fastify.config.WEATHER_API_KEY)
  const weatherController = new WeatherController(weatherService)

  // GET /weather endpoint
  fastify.get("/weather", {
    schema: {
      tags: ["weather"],
      summary: "Get current weather by city",
      description: "Retrieves current weather information for the specified city",
      querystring: weatherRequestSchema,
      response: {
        200: {
          description: "Successful response with weather data",
          $ref: "weather#",
        },
        400: {
          description: "Bad request - Missing or invalid city parameter",
          $ref: "errorResponse#",
        },
        500: {
          description: "Server error",
          $ref: "errorResponse#",
        },
      },
    },
    handler: weatherController.getCurrentWeather.bind(weatherController),
  })
}

export default weatherRoutes
