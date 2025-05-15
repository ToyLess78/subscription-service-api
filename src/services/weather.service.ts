import axios from "axios"
import type { WeatherData, WeatherApiResponse } from "../models/weather.model"
import { WEATHER_API } from "../constants/weather-api.constants"
import { WeatherApiError, InvalidCityError, UnauthorizedError, InternalServerError } from "../utils/errors"
import { ErrorMessage } from "../constants/error-message.enum"
import { HttpStatus } from "../constants/http-status.enum"

export interface IWeatherService {
  getCurrentWeather(city: string): Promise<WeatherData>
}

export class WeatherService implements IWeatherService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = WEATHER_API.BASE_URL
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    try {
      const response = await axios.get<WeatherApiResponse>(`${this.baseUrl}${WEATHER_API.ENDPOINTS.CURRENT}`, {
        params: {
          key: this.apiKey,
          q: city,
        },
      })

      const { location, current } = response.data

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
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle API errors
        if (error.response.status === HttpStatus.BAD_REQUEST) {
          throw new InvalidCityError(city)
        } else if (
            error.response.status === HttpStatus.UNAUTHORIZED ||
            error.response.status === HttpStatus.FORBIDDEN
        ) {
          throw new UnauthorizedError(ErrorMessage.WEATHER_API_UNAUTHORIZED)
        } else {
          // Fix: Use ErrorMessage enum for the base message
          const errorDetails = error.response.data?.error?.message ? `: ${error.response.data.error.message}` : ""
          const errorMessage = `${ErrorMessage.WEATHER_API_ERROR}${errorDetails}`
          throw new WeatherApiError(errorMessage, error.response.status)
        }
      }
      // Handle network errors or other issues
      throw new InternalServerError(ErrorMessage.FAILED_TO_FETCH_WEATHER)
    }
  }
}
