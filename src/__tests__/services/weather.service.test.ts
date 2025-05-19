import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import axios from "axios";
import { WeatherService } from "../../services/weather.service";
import { WEATHER_API, ErrorMessage } from "../../core/constants";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("WeatherService", () => {
  const apiKey = "mock-api-key";
  let weatherService: WeatherService;

  beforeEach(() => {
    weatherService = new WeatherService(apiKey);
    jest.clearAllMocks();

    // We need to mock isAxiosError without changing its type
    // This is a workaround that preserves the original function's type
    // @ts-ignore - Intentionally ignoring type checking for this mock
    axios.isAxiosError = jest.fn().mockImplementation((payload: any) => {
      // Type guard to check if payload is an object with a response property
      return (
        payload !== null && typeof payload === "object" && "response" in payload
      );
    });
  });

  describe("getCurrentWeather", () => {
    it("should return weather data for a valid city", async () => {
      // Mock successful API response
      const mockResponse = {
        data: {
          location: {
            name: "London",
            region: "City of London, Greater London",
            country: "United Kingdom",
          },
          current: {
            temp_c: 15.0,
            temp_f: 59.0,
            condition: {
              text: "Partly cloudy",
              icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
            },
            humidity: 72,
          },
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await weatherService.getCurrentWeather("London");

      // Verify axios was called with correct parameters
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${WEATHER_API.BASE_URL}${WEATHER_API.ENDPOINTS.CURRENT}`,
        {
          params: {
            key: apiKey,
            q: "London",
          },
        },
      );

      // Verify the returned data is correctly mapped
      expect(result).toEqual({
        city: "London",
        country: "United Kingdom",
        temperature: {
          celsius: 15.0,
          fahrenheit: 59.0,
        },
        humidity: 72,
        description: "Partly cloudy",
        icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
      });
    });

    it("should throw InvalidCityError for an invalid city", async () => {
      // Create an error that matches what we need
      const error = new Error("City not found") as any;
      error.response = {
        status: 400,
        data: {
          error: {
            code: 1006,
            message: "No matching location found.",
          },
        },
      };

      mockedAxios.get.mockRejectedValueOnce(error);

      // Test that the correct error type is thrown
      await expect(
        weatherService.getCurrentWeather("InvalidCity"),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Invalid city"),
        }),
      );

      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it("should throw UnauthorizedError for invalid API key", async () => {
      // Create an error that matches what we need
      const error = new Error("Invalid API key") as any;
      error.response = {
        status: 401,
        data: {
          error: {
            code: 2006,
            message: "API key is invalid.",
          },
        },
      };

      mockedAxios.get.mockRejectedValueOnce(error);

      // Test that the correct error type is thrown with the actual error message
      await expect(weatherService.getCurrentWeather("London")).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(
            ErrorMessage.WEATHER_API_UNAUTHORIZED,
          ),
        }),
      );

      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it("should throw WeatherApiError for other API errors", async () => {
      // Create an error that matches what we need
      const error = new Error("Internal server error") as any;
      error.response = {
        status: 500,
        data: {
          error: {
            message: "Internal server error",
          },
        },
      };

      mockedAxios.get.mockRejectedValueOnce(error);

      // Test that the correct error type is thrown
      await expect(weatherService.getCurrentWeather("London")).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Weather API error"),
        }),
      );

      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });
});
