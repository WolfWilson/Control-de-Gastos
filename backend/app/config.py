from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Expense Tracker API"
    app_version: str = "0.1.0"
    debug: bool = True

    database_url: str = "sqlite:///./expenses.db"

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
