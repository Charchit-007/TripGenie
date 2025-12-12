import requests
from langchain.tools import tool

class CurrencyConverterTool:
    def __init__(self, api_key: str):
        self.base_url = f"https://v6.exchangerate-api.com/v6/{api_key}/latest/"

    @tool("convert_currency")
    def convert_currency(self, amount: float, from_currency: str, to_currency: str):
        """Convert the amount from one currency to another."""
        url = f"{self.base_url}/{from_currency}"
        response = requests.get(url)

        if response.status_code != 200:
            raise Exception(f"API call failed: {response.text}")

        data = response.json()

        if "conversion_rates" not in data:
            raise ValueError("Invalid response: conversion_rates missing")

        rates = data["conversion_rates"]

        if to_currency not in rates:
            raise ValueError(f"{to_currency} not found in exchange rates.")

        return amount * rates[to_currency]
    
    @property
    def tool_list(self):
        return [self.convert_currency]
