# EventIQ Platform

Enterprise-grade telemetry and user activity logging platform designed for monitoring multiple interconnected web and desktop systems.

## Version 1.0.0 (Initial Implementation)

This initial version provides the foundational architecture for EventIQ:

### 1. Client-Side Telemetry SDK
- Located in `/sdk/src/eventiq-tracker.ts`
- Zero-dependency TypeScript tracker.
- Captures clicks, mouse movements, visibility changes, and SPA navigations.
- Features automatic client-side PII redaction for sensitive inputs.
- Implements an `IndexedDB` fallback mechanism for offline buffering.

### 2. Django Backend Pipeline
- High-throughput API built with Django Ninja.
- `EventLog` and `SystemRegistry` models using PostgreSQL `JSONField`.
- Asynchronous event processing and batch database inserts via Celery and Redis.

### 3. React Dashboard
- Built with Vite, React, TypeScript, and Tailwind CSS.
- Features a real-time `LiveEventStream` view.
- Includes a detailed `UserJourneyTimeline` to inspect individual user sessions.

### 4. Docker Orchestration
- Complete local development stack via `docker-compose.yml`.
- Includes PostgreSQL, Redis, Django API, Celery worker, and NGINX-hosted React frontend.

## Version 1.1.0 (Real-World Integration)

This update connects all isolated components to enable live data flow:
- **SDK Compilation**: The TypeScript SDK is compiled and ready for direct browser usage.
- **Demo App**: A local `demo/index.html` simulates a client application, sending real interactions to the backend.
- **Backend Migrations & Seeding**: The Docker orchestration automatically runs database migrations and seeds a `SystemRegistry` API key for the demo app.
- **Live Dashboard**: The React dashboard now fetches real data directly from the Django backend API instead of using mock data.

## How to Run locally

1. Ensure Docker Desktop is installed and running.
2. Run `docker-compose up --build -d` in the root directory.
3. The dashboard is accessible at `http://localhost`.
4. The API is accessible at `http://localhost:8000/api/v1/`.
