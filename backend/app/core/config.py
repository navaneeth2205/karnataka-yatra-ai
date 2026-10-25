import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Karnataka Yatra AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # LLM Settings
    GEMINI_API_KEY: str = ""
    LLM_PROVIDER: str = "deterministic"
    MODEL_NAME: str = "gemini-1.5-flash"

    # Sample dataset location
    DATA_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "data", "sample_destinations.json"
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
