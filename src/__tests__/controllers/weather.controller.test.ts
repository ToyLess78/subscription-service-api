import { WeatherController } from "../../controllers/weather.controller";
import { BadRequestError } from "../../utils/errors";
import { ErrorMessage } from "../../core/constants";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

describe("WeatherController", () => {
  // Mock dependencies
  const mockWeatherService = {
    getCurrentWeather: jest.fn(),
  };

  // Mock request and reply
  const mockRequest = {
    query: {},
  } as any;

  const mockReply = {
    send: jest.fn(),
    code: jest.fn().mockReturnThis(),
  } as any;

  let weatherController: WeatherController;

  beforeEach(() => {
    jest.clearAllMocks();
    weatherController = new WeatherController(mockWeatherService);
  });

  describe("getCurrentWeather", () => {
    it("should return weather data for a valid city", async () => {
      // Arrange
      const city = "London";
      mockRequest.query = { city };

      const weatherData = {
        city: "London",
        country: "UK",
        temperature: { celsius: 20, fahrenheit: 68 },
        humidity: 70,
        description: "Sunny",
        icon: "sun.png",
      };

      mockWeatherService.getCurrentWeather.mockResolvedValue(weatherData);

      // Act
      await weatherController.getCurrentWeather(mockRequest, mockReply);

      // Assert
      expect(mockWeatherService.getCurrentWeather).toHaveBeenCalledWith(city);
      expect(mockReply.send).toHaveBeenCalledWith(weatherData);
    });

    it("should throw BadRequestError if city is missing", async () => {
      // Arrange
      mockRequest.query = {}; // No city

      // Act & Assert
      await expect(
        weatherController.getCurrentWeather(mockRequest, mockReply),
      ).rejects.toThrow(new BadRequestError(ErrorMessage.MISSING_CITY));

      expect(mockWeatherService.getCurrentWeather).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if city is empty", async () => {
      // Arrange
      mockRequest.query = { city: "" }; // Empty city

      // Act & Assert
      await expect(
        weatherController.getCurrentWeather(mockRequest, mockReply),
      ).rejects.toThrow(new BadRequestError(ErrorMessage.MISSING_CITY));

      expect(mockWeatherService.getCurrentWeather).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });
});
