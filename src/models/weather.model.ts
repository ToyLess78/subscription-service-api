// Domain model
export interface WeatherData {
  city: string
  country: string
  temperature: {
    celsius: number
    fahrenheit: number
  }
  humidity: number
  description: string
  icon: string
}

// DTO for external API response
export interface WeatherApiResponse {
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

// Request DTO
export interface WeatherRequestDto {
  city: string
}

// Response DTO
export type WeatherResponseDto = WeatherData
