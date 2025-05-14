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
      tags: ["weather"],
      summary: "Get current weather by city",
      description: "Retrieves current weather information for the specified city",
      querystring: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "Name of the city to get weather for (e.g., London, New York, Tokyo)",
          },
        },
        required: ["city"],
      },
      response: {
        200: {
          description: "Successful response with weather data",
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "Name of the city",
            },
            country: {
              type: "string",
              description: "Country where the city is located",
            },
            temperature: {
              type: "object",
              properties: {
                celsius: {
                  type: "number",
                  description: "Temperature in Celsius",
                },
                fahrenheit: {
                  type: "number",
                  description: "Temperature in Fahrenheit",
                },
              },
            },
            humidity: {
              type: "number",
              description: "Humidity percentage",
            },
            description: {
              type: "string",
              description: "Text description of the weather conditions",
            },
            icon: {
              type: "string",
              description: "URL to the weather condition icon",
            },
          },
        },
        400: {
          description: "Bad request - Missing or invalid city parameter",
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
          },
        },
        500: {
          description: "Server error",
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
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
