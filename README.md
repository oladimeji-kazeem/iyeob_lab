# Ubasify Practical Labs (Iyeob Lab)

A modern full-stack academic platform for independent practical learning and laboratory management.

---

## Architecture Overview

The repository is organized as a modular full-stack monorepo:

- **`frontend/`**: Next.js 16 (Turbopack), React 19, and TypeScript client featuring App Router, custom modern CSS design system, ESLint, and Prettier formatting.
- **`backend/`**: FastAPI (Python 3.11+), Pydantic Settings, and Uvicorn providing high-performance REST APIs, configuration management, and automated test coverage.
- **`db` (PostgreSQL)**: PostgreSQL 16 relational database service orchestrated via Docker Compose with volume persistence and health checks.

```
.
├── backend/                  # FastAPI / Python backend service
│   ├── app/
│   │   ├── api/              # API router & versioned endpoints
│   │   │   └── v1/
│   │   │       └── endpoints/
│   │   │           └── health.py  # Health-check endpoint
│   │   ├── core/             # Pydantic Settings configuration
│   │   │   └── config.py
│   │   └── main.py           # FastAPI app instance, CORS & server bootstrapper
│   ├── tests/                # Pytest test suite & TestClient fixtures
│   │   ├── conftest.py
│   │   ├── test_config.py
│   │   └── test_health.py
│   ├── .dockerignore         # Backend Docker ignore rules
│   ├── Dockerfile            # Python 3.13 production containerfile
│   ├── .env.example          # Environment variable template
│   ├── pyproject.toml        # uv / PEP 621 project configuration
│   ├── requirements.txt      # Python dependencies
│   └── README.md             # Backend service documentation
├── frontend/                 # Next.js 16 + TypeScript frontend
│   ├── src/
│   │   └── app/              # App Router, Layout, Page & Styles
│   ├── .dockerignore         # Frontend Docker ignore rules
│   ├── Dockerfile            # Multi-stage production containerfile
│   ├── package.json          # Frontend scripts & dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   ├── eslint.config.mjs     # ESLint configuration with Next.js & Prettier
│   ├── .prettierrc           # Prettier formatting rules
│   └── README.md             # Frontend application documentation
├── .env.example              # Monorepo environment template
├── .gitignore                # Monorepo git ignore rules
├── docker-compose.yml        # PostgreSQL, FastAPI, and Next.js services
├── DOCKER.md                 # Docker Compose operations & troubleshooting
├── package.json              # Root workspace orchestrator
└── README.md                 # Repository documentation
```

---

## Docker Compose Quickstart

The entire stack (PostgreSQL, FastAPI backend, Next.js frontend) is managed via `docker-compose.yml`.

### Environment Configuration
Copy `.env.example` to `.env` to configure credentials:
```bash
cp .env.example .env
```

### Startup Commands

| Command | Description |
| :--- | :--- |
| `docker compose up -d` | Starts all services (PostgreSQL, Backend, Frontend) in the background |
| `docker compose up --build -d` | Rebuilds container images and starts all services |
| `docker compose up` | Starts all services with live stream logs |
| `docker compose up -d db` | Starts only the PostgreSQL database |

### Shutdown Commands

| Command | Description |
| :--- | :--- |
| `docker compose down` | Stops and removes all containers and networks (**preserves database volume**) |
| `docker compose down -v` | Stops containers and **deletes the PostgreSQL volume** (resets database) |
| `docker compose stop` | Pauses/stops containers without removing them |
| `docker compose start` | Resumes stopped containers |

For operational commands, log streaming, and database inspection, see [DOCKER.md](file:///c:/Users/oladi/sources/ubasify-labs-academy/DOCKER.md).

---

## Local Development (Without Docker)

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.x or higher) & npm
- [Python](https://www.python.org/) (v3.11 or higher)
- [`uv`](https://docs.astral.sh/uv/) (recommended for Python package management)

### Installation

1. **Frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Backend dependencies**:
   ```bash
   cd backend
   uv sync --all-extras
   # Or with pip: pip install -r requirements.txt
   ```

### Running Locally

| Service | Command | URL |
| :--- | :--- | :--- |
| **Frontend** | `npm run dev:frontend` | `http://localhost:3000` |
| **Backend** | `npm run dev:backend` | `http://localhost:5000` |

### Backend API Documentation
- **Interactive OpenAPI Docs**: `http://localhost:5000/docs`
- **ReDoc Documentation**: `http://localhost:5000/redoc`
- **Health Check Probe**: `http://localhost:5000/health` (also available at `/api/v1/health`)

---

## Testing & Quality

Run code checks across the workspaces:

```bash
# Frontend linting & formatting
npm run lint
npm run format
npm run typecheck

# Backend tests
npm run test:backend
```
