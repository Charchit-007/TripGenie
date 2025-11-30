# code for loading the model

import os
from dotenv import load_dotenv
from typing import Optional, Any
from pydantic import BaseModel, Field
from utils.config_loader import load_config
from langchain_groq import ChatGroq


class ConfigLoader:
    def __init__(self):
        print("Loaded config.....")
        self.config = load_config()
    
    def __getitem__(self, key):
        return self.config[key]


class ModelLoader(BaseModel):
    config: Optional[ConfigLoader] = Field(default=None, exclude=True)

    def model_post_init(self, __context: Any) -> None:
        self.config = ConfigLoader()
    
    class Config:
        arbitrary_types_allowed = True
    
    def load_llm(self):
        """
        Load and return the LLM model using Groq.
        """
        print("LLM loading...")
        print("Loading LLM from Groq...")

        groq_api_key = os.getenv("GROQ_API_KEY")

        primary = self.config["llm"]["groq"]["primary_model"]
        fallback = self.config["llm"]["groq"]["fallback_model"]

        try:
            llm = ChatGroq(model=primary, api_key=groq_api_key)
            print(f"Loaded primary model: {primary}")
        except Exception as e:
            print(f"Primary model failed: {e}")
            print(f"Loading fallback model: {fallback}")
            llm = ChatGroq(model=fallback, api_key=groq_api_key)

        return llm
