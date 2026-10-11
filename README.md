# Ubasify Practical Labs (Iyeob Lab)

A modern full-stack platform for independent practical learning and laboratory management.

---

## Architecture Overview

The repository is organized as a modular monorepo:

- **`frontend/`**: TanStack Start, React 19, and Vite frontend application featuring client and SSR routing, UI components, and state management.
- **`backend/`**: Node.js, Express, and TypeScript service designed for API routing, validation, authentication, and institution data operations.

```
.
├── backend/                # Node.js / Express / TypeScript backend
│   ├── src/
│   │   ├── config/         # Environment & service configuration
│   │   ├── app.ts          # Express application initialization & middleware
│   │   └── server.ts       # Server lifecycle & graceful shutdown
│   ├── .env.example        # Environment variable template
│   ├── package.json        # Backend dependencies & scripts
│   ├── tsconfig.json       # TypeScript configuration
│   └── README.md           # Backend service guide
├── frontend/               # TanStack Start / React frontend
│   ├── src/                # Pages, routes, components, and hooks
│   ├── public/             # Static public assets
│   ├── package.json        # Frontend dependencies & scripts
│   ├── vite.config.ts      # Vite configuration
│   └── README.md           # Frontend application guide
├── .gitignore              # Monorepo git ignore rules
├── package.json            # Root workspace orchestrator
└── README.md               # Repository documentation
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.x or higher)
- [npm](https://www.npmjs.com/) (v10.x or higher)

### Installation

Install dependencies for all workspaces from the project root:

```bash
npm install
```

Or install dependencies inside each workspace independently:

```bash
cd frontend && npm install
cd ../backend && npm install
```

---

## Development

Run development servers using npm workspace commands from the root:

| Command | Action | URL |
| :--- | :--- | :--- |
| `npm run dev:frontend` | Starts Vite dev server | `http://localhost:8080` |
| `npm run dev:backend` | Starts Express dev server with live reload | `http://localhost:5000` |

### Backend Environment Setup
1. Enter the `backend/` directory:
   ```bash
   cd backend
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Set the variables as needed:
   - `PORT`: HTTP server port (default: `5000`)
   - `NODE_ENV`: Runtime mode (`development` / `production`)
   - `FRONTEND_URL`: Allowed CORS origin (default: `http://localhost:8080`)

### Backend Health Check
When the backend service is running, verify the setup with:
```bash
curl http://localhost:5000/api/health
```

---

## Build & Production

Compile both services for production:

```bash
# Build both frontend and backend
npm run build

# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend
```

Run the compiled backend in production:
```bash
cd backend
npm run start
```
