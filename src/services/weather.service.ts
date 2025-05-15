import axios from "axios"
import type { WeatherData, WeatherApiResponse } from "../models/weather.model"
import { WEATHER_API } from "../config/constants"
import { WeatherApiError, InvalidCityError, UnauthorizedError, InternalServerError } from "../utils/errors"

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
        if (error.response.status === 400) {
          throw new InvalidCityError(city)
        } else if (error.response.status === 401 || error.response.status === 403) {
          throw new UnauthorizedError("Invalid or unauthorized API key")
        } else {
          throw new WeatherApiError(
            `Weather API error: ${error.response.data?.error?.message || "Unknown error"}`,
            error.response.status,
          )
        }
      }
      // Handle network errors or other issues
      throw new InternalServerError("Failed to fetch weather data")
    }
  }
}
