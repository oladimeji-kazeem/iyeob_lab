# Docker & Docker Compose Guide

This guide details how to build, run, monitor, and shut down the multi-container environment (PostgreSQL, FastAPI backend, and Next.js frontend) using Docker Compose.

---

## Architecture & Services

The Docker Compose setup orchestrates three services on an isolated bridge network (`iyeob_lab_network`):

| Service | Container Name | Image / Context | Port | Health Check |
| :--- | :--- | :--- | :--- | :--- |
| **Database (`db`)** | `iyeob_lab_db` | `postgres:16-alpine` | `5432:5432` | `pg_isready -U <user> -d <db>` |
| **Backend (`backend`)** | `iyeob_lab_backend` | `./backend/Dockerfile` | `5000:5000` | `curl -f http://localhost:5000/health` |
| **Frontend (`frontend`)** | `iyeob_lab_frontend` | `./frontend/Dockerfile` | `3000:3000` | `wget http://localhost:3000` |

---

## Prerequisites & Environment Setup

Ensure Docker and Docker Compose are installed and the Docker engine is running.

1. Create your local environment file:
   ```bash
   cp .env.example .env
   ```

2. Inspect or customize credentials in `.env`:
   ```dotenv
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=iyeob_lab
   POSTGRES_PORT=5432
   BACKEND_PORT=5000
   FRONTEND_PORT=3000
   ```

3. Validate the compose configuration:
   ```bash
   docker compose config
   ```

---

## Startup Commands

### 1. Start all services in the background (Detached Mode)
```bash
docker compose up -d
```
Starts PostgreSQL, waits for the database health check to pass, boots the FastAPI backend, and starts the Next.js frontend.

### 2. Build images and start all services
```bash
docker compose up --build -d
```
Forces a rebuild of the Docker images before starting the containers.

### 3. Start services in the foreground (with streaming logs)
```bash
docker compose up
```

### 4. Start only the PostgreSQL database
```bash
docker compose up -d db
```

### 5. Start only database and backend
```bash
docker compose up -d db backend
```

---

## Shutdown Commands

### 1. Standard Shutdown (Preserves Database Data)
```bash
docker compose down
```
Gracefully stops and removes all containers and networks while keeping the `iyeob_lab_postgres_data` volume intact.

### 2. Full Teardown (Removes Persistent Volumes & Data)
```bash
docker compose down -v
```
> [!CAUTION]
> This command deletes the `postgres_data` volume, completely resetting the database.

### 3. Pause / Stop Containers (Without removing them)
```bash
docker compose stop
```

### 4. Resume Stopped Containers
```bash
docker compose start
```

---

## Monitoring & Operational Commands

### Check service health and running status
```bash
docker compose ps
```

### View real-time aggregated logs
```bash
docker compose logs -f
```

### View logs for a specific service
```bash
# FastAPI backend logs
docker compose logs -f backend

# Next.js frontend logs
docker compose logs -f frontend

# PostgreSQL logs
docker compose logs -f db
```

### Restart a specific service
```bash
docker compose restart backend
```

### Connect to PostgreSQL via psql CLI
```bash
docker compose exec -it db psql -U postgres -d iyeob_lab
```
*(Replace `postgres` and `iyeob_lab` with your configured credentials if changed in `.env`)*
