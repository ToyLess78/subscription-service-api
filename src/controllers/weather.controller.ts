import type { FastifyRequest, FastifyReply } from "fastify";
import type { IWeatherService } from "../core/interfaces/services.interface";
import type { WeatherRequestDto } from "../models/weather.model";
import { BadRequestError } from "../utils/errors";
import { ErrorMessage } from "../core/constants";

export interface IWeatherController {
  getCurrentWeather(
    request: FastifyRequest<{ Querystring: WeatherRequestDto }>,
    reply: FastifyReply,
  ): Promise<void>;
}

export class WeatherController implements IWeatherController {
  private weatherService: IWeatherService;

  constructor(weatherService: IWeatherService) {
    this.weatherService = weatherService;
  }

  async getCurrentWeather(
    request: FastifyRequest<{ Querystring: WeatherRequestDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { city } = request.query;

    if (!city) {
      throw new BadRequestError(ErrorMessage.MISSING_CITY);
    }

    const weatherData = await this.weatherService.getCurrentWeather(city);
    reply.send(weatherData);
  }
}
