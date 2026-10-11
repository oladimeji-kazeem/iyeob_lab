# FastAPI Backend Service

Modern, high-performance Python backend service built with **FastAPI**, **Pydantic Settings**, and **Uvicorn**.

---

## Features

- **FastAPI Framework**: Automatic interactive OpenAPI documentation (`/docs` and `/redoc`).
- **Configuration Management**: Strongly typed environment configuration via `pydantic-settings` with `.env` support.
- **Health-Check Endpoints**: Probes available at `/health`, `/api/health`, and `/api/v1/health`.
- **CORS Middleware**: Preconfigured for Next.js frontend (`http://localhost:3000`).
- **Automated Testing**: Test suite built with `pytest` and `httpx`.

---

## Getting Started

### Prerequisites
- Python 3.11+
- `uv` (recommended) or standard Python `venv` + `pip`

### Virtual Environment & Dependency Installation

Using `uv`:
```bash
# Sync all dependencies including dev tools
uv sync --all-extras
```

Or using standard `venv` + `pip`:
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

---

## Configuration

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PROJECT_NAME` | `Ubasify Practical Labs API` | API service display title |
| `ENVIRONMENT` | `development` | Deployment environment (`development` / `production`) |
| `DEBUG` | `true` | Enables auto-reload and debug mode |
| `PORT` | `5000` | Port for the HTTP server |
| `HOST` | `0.0.0.0` | Bind host address |
| `CORS_ORIGINS` | `["http://localhost:3000", ...]` | Allowed client origins |

---

## Running the Application

Using `uv`:
```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

Or with active virtual environment:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

- **API Base URL**: `http://localhost:5000`
- **Swagger UI**: `http://localhost:5000/docs`
- **ReDoc UI**: `http://localhost:5000/redoc`
- **Health Probe**: `http://localhost:5000/health`

---

## Running Tests

Execute the test suite with `pytest`:

Using `uv`:
```bash
uv run pytest -v
```

Or with active virtual environment:
```bash
pytest -v
```
