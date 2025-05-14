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

// Fastify schema definitions
export const temperatureSchema = {
  $id: "temperature",
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
}

export const weatherSchema = {
  $id: "weather",
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
      properties: temperatureSchema.properties,
      description: "Temperature information",
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
}

export const errorResponseSchema = {
  $id: "errorResponse",
  type: "object",
  properties: {
    error: {
      type: "string",
      description: "Error message",
    },
  },
}
