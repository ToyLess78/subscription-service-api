import axios from "axios";
import type { WeatherData, WeatherApiResponse } from "../models/weather.model";
import { ErrorMessage, HttpStatus, WEATHER_API } from "../core/constants";
import {
  WeatherApiError,
  InvalidCityError,
  UnauthorizedError,
  InternalServerError,
} from "../utils/errors";
import type { IWeatherService } from "../core/interfaces/services.interface";

interface ErrorResponseData {
  error?: {
    message?: string;
  };
}

export class WeatherService implements IWeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = WEATHER_API.BASE_URL;
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    try {
      const response = await axios.get<WeatherApiResponse>(
        `${this.baseUrl}${WEATHER_API.ENDPOINTS.CURRENT}`,
        {
          params: {
            key: this.apiKey,
            q: city,
          },
        },
      );

      const { location, current } = response.data;

      return {
        city: location.name,
        country: location.country,
        temperature: {
          celsius: current.temp_c,
          fahrenheit: current.temp_f,
        },
        humidity: current.humidity,
        description: current.condition.text,
        icon: current.condition.icon,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle API errors
        if (error.response.status === HttpStatus.BAD_REQUEST) {
          throw new InvalidCityError(city);
        } else if (
          error.response.status === HttpStatus.UNAUTHORIZED ||
          error.response.status === HttpStatus.FORBIDDEN
        ) {
          throw new UnauthorizedError(ErrorMessage.WEATHER_API_UNAUTHORIZED);
        } else {
          // Use ErrorMessage enum for the base message
          const responseData = error.response.data as ErrorResponseData;
          const errorDetails = responseData?.error?.message
            ? `: ${responseData.error.message}`
            : "";
          const errorMessage = `${ErrorMessage.WEATHER_API_ERROR}${errorDetails}`;
          throw new WeatherApiError(errorMessage, error.response.status);
        }
      }
      // Handle network errors or other issues
      throw new InternalServerError(ErrorMessage.FAILED_TO_FETCH_WEATHER);
    }
  }
}
