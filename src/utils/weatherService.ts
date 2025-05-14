import axios from "axios"
import type { WeatherData } from "../models/weather"

// Define the response type for the weather API
interface WeatherApiResponse {
  location: {
    name: string
    region: string
    country: string
  }
  current: {
    temp_c: number
    temp_f: number
    condition: {
      text: string
      icon: string
    }
    humidity: number
  }
}

export class WeatherService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = "https://api.weatherapi.com/v1"
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    try {
      const response = await axios.get<WeatherApiResponse>(`${this.baseUrl}/current.json`, {
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
          throw new Error("Invalid city name provided")
        } else if (error.response.status === 401 || error.response.status === 403) {
          throw new Error("Invalid or unauthorized API key")
        } else {
          throw new Error(`Weather API error: ${error.response.data?.error?.message || "Unknown error"}`)
        }
      }
      // Handle network errors or other issues
      throw new Error("Failed to fetch weather data")
    }
  }
}
