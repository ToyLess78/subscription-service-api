document.addEventListener("DOMContentLoaded", () => {
  const cityInput = document.getElementById("cityInput")
  const searchButton = document.getElementById("searchButton")
  const loadingElement = document.getElementById("loading")
  const errorElement = document.getElementById("error")
  const weatherResultElement = document.getElementById("weatherResult")

  // Elements for displaying weather data
  const cityNameElement = document.getElementById("cityName")
  const countryElement = document.getElementById("country")
  const tempCElement = document.getElementById("tempC")
  const tempFElement = document.getElementById("tempF")
  const humidityElement = document.getElementById("humidity")
  const descriptionElement = document.getElementById("description")
  const weatherIconElement = document.getElementById("weatherIcon")

  // Function to fetch weather data
  async function fetchWeather(city) {
    showLoading()
    hideError()
    hideWeatherResult()

    try {
      const response = await fetch(`/api/v1/weather?city=${encodeURIComponent(city)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch weather data")
      }

      displayWeatherData(data)
    } catch (error) {
      showError(error.message)
    } finally {
      hideLoading()
    }
  }

  // Function to display weather data
  function displayWeatherData(data) {
    cityNameElement.textContent = data.city
    countryElement.textContent = data.country
    tempCElement.textContent = data.temperature.celsius
    tempFElement.textContent = data.temperature.fahrenheit
    humidityElement.textContent = data.humidity
    descriptionElement.textContent = data.description

    // Make sure the icon URL is absolute
    const iconUrl = data.icon.startsWith("//") ? `https:${data.icon}` : data.icon
    weatherIconElement.src = iconUrl
    weatherIconElement.alt = data.description

    showWeatherResult()
  }

  // Helper functions to show/hide elements
  function showLoading() {
    loadingElement.classList.remove("hidden")
  }

  function hideLoading() {
    loadingElement.classList.add("hidden")
  }

  function showError(message) {
    errorElement.textContent = message
    errorElement.classList.remove("hidden")
  }

  function hideError() {
    errorElement.classList.add("hidden")
  }

  function showWeatherResult() {
    weatherResultElement.classList.remove("hidden")
  }

  function hideWeatherResult() {
    weatherResultElement.classList.add("hidden")
  }

  // Event listeners
  searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim()
    if (city) {
      fetchWeather(city)
    } else {
      showError("Please enter a city name")
    }
  })

  cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const city = cityInput.value.trim()
      if (city) {
        fetchWeather(city)
      } else {
        showError("Please enter a city name")
      }
    }
  })
})
