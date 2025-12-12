import requests
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

class WeatherInput(BaseModel):
    place: str = Field(description="The city or location name")

class WeatherInfoTool:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openweathermap.org/data/2.5"

    def _get_current_weather(self, place: str):
        """Internal method to get current weather"""
        url = f"{self.base_url}/weather"
        params = {
            "q": place,
            "appid": self.api_key
        }
        res = requests.get(url, params=params)
        return res.json()

    def _get_forecast_weather(self, place: str):
        """Internal method to get forecast weather"""
        url = f"{self.base_url}/forecast"
        params = {
            "q": place,
            "appid": self.api_key,
            "cnt": 10,
            "units": "metric"
        }
        res = requests.get(url, params=params)
        return res.json()

    @property
    def weather_tool_list(self):
        return [
            StructuredTool.from_function(
                func=self._get_current_weather,
                name="get_current_weather",
                description="Get current weather for a place.",
                args_schema=WeatherInput
            ),
            StructuredTool.from_function(
                func=self._get_forecast_weather,
                name="get_forecast_weather",
                description="Get forecast weather for a place.",
                args_schema=WeatherInput
            )
        ]