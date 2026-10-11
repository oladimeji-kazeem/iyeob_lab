# Backend Service

Node.js, Express, and TypeScript backend application.

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Installation
```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env` and adjust the variables:
```bash
cp .env.example .env
```

### Available Scripts
- `npm run dev`: Starts the development server with live reload via `tsx`.
- `npm run build`: Compiles TypeScript to `dist/`.
- `npm run start`: Runs compiled JavaScript output from `dist/server.js`.
- `npm run typecheck`: Runs TypeScript compiler type verification without emitting files.

### Base Endpoints
- `GET /api/health`: Health status probe returning service status and timestamp.
