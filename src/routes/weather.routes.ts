import type { FastifyPluginAsync } from "fastify";
import { WeatherController } from "../controllers/weather.controller";
import { WeatherService } from "../services/weather.service";
import { weatherRequestSchema } from "../schemas";
import { ApiPath } from "../core/constants";

const weatherRoutes: FastifyPluginAsync = async (fastify) => {
  // Create service and controller instances
  const weatherService = new WeatherService(fastify.config.WEATHER_API_KEY);
  const weatherController = new WeatherController(weatherService);

  // GET /weather endpoint
  fastify.get(ApiPath.WEATHER, {
    schema: {
      tags: ["weather"],
      summary: "Get current weather by city",
      description:
        "Retrieves current weather information for the specified city using WeatherAPI.com",
      querystring: weatherRequestSchema,
      response: {
        200: {
          description:
            "Successful operation - current weather forecast returned",
          $ref: "weather#",
        },
        400: {
          description: "Invalid request - Missing or invalid city parameter",
          $ref: "errorResponse#",
        },
        404: {
          description: "City not found",
          $ref: "errorResponse#",
        },
        500: {
          description: "Server error",
          $ref: "errorResponse#",
        },
      },
    },
    handler: weatherController.getCurrentWeather.bind(weatherController),
  });
};

export default weatherRoutes;
