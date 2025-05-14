import type { FastifyPluginAsync } from "fastify"
import { WeatherService } from "../utils/weatherService"

interface WeatherQueryParams {
  city?: string
}

const weatherRoutes: FastifyPluginAsync = async (fastify) => {
  // Create a new instance of the WeatherService
  const weatherService = new WeatherService(fastify.config.WEATHER_API_KEY)

  // GET /weather endpoint
  fastify.get<{ Querystring: WeatherQueryParams }>("/weather", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          city: { type: "string" },
        },
        required: ["city"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            city: { type: "string" },
            country: { type: "string" },
            temperature: {
              type: "object",
              properties: {
                celsius: { type: "number" },
                fahrenheit: { type: "number" },
              },
            },
            humidity: { type: "number" },
            description: { type: "string" },
            icon: { type: "string" },
          },
        },
        400: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        500: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { city } = request.query

      if (!city) {
        return reply.code(400).send({ error: "City parameter is required" })
      }

      try {
        const weatherData = await weatherService.getCurrentWeather(city)
        return weatherData
      } catch (error) {
        fastify.log.error(error)

        if (error instanceof Error) {
          if (error.message.includes("Invalid city")) {
            return reply.code(400).send({ error: error.message })
          }
          if (error.message.includes("API key")) {
            return reply.code(500).send({ error: "Internal server error with weather provider" })
          }
        }

        return reply.code(500).send({ error: "Failed to fetch weather data" })
      }
    },
  })
}

export default weatherRoutes
