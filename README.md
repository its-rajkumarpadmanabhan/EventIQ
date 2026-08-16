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

## How to Run locally

1. Ensure Docker Desktop is installed and running.
2. Run `docker-compose up --build -d` in the root directory.
3. The dashboard is accessible at `http://localhost`.
4. The API is accessible at `http://localhost:8000/api/v1/`.
# EventIQ Platform Implementation

This document outlines the architecture and implementation strategy for the EventIQ enterprise telemetry and user activity logging platform.

## User Review Required

> [!IMPORTANT]
> The requested implementation spans an entire full-stack application with a client SDK, message queue, backend API, and a frontend dashboard. To ensure a structured execution, I propose scaffolding the projects and implementing them iteratively, starting with the core backend and SDK. Please review the proposed architecture and tech stack below before we begin code generation.

## Open Questions

> [!WARNING]
> - **Database Choice:** You mentioned PostgreSQL JSONField or ClickHouse. I will proceed with PostgreSQL for simplicity in a Django setup, unless ClickHouse is specifically required.
> - **Django API Framework:** Django Ninja is highly performant and supports async well, which is great for ingestion. I will use Django Ninja for the backend APIs unless DRF is strongly preferred.
> - **Authentication:** For the dashboard, what kind of authentication should be used? (e.g., simple JWT, session-based). I will implement a standard JWT-based auth for the dashboard if not specified.

## Proposed Changes

### 1. Client-Side Telemetry SDK (`eventiq-tracker.ts`)
A zero-dependency TypeScript SDK that tracks interactions, buffers events, and handles retries.

#### [NEW] `sdk/src/eventiq-tracker.ts`
- Implementation of the `EventIQTracker` class.
- Listeners for `click`, `contextmenu`, `mousemove` (throttled).
- SPA navigation tracking and page lifecycle events.
- In-memory buffering (size 25 or 5s interval).
- PII sanitization for inputs and `data-eventiq-ignore`.
- Delivery mechanisms: `fetch` and `navigator.sendBeacon`.
- Offline support via `IndexedDB`.

### 2. Backend Ingestion & Pipeline (Django + Celery)
A high-throughput ingestion pipeline.

#### [NEW] `backend/requirements.txt`
Dependencies: Django, django-ninja, celery, redis, psycopg2-binary, etc.

#### [NEW] `backend/eventiq_core/models.py`
- `SystemRegistry`: Model for client apps/API keys.
- `EventLog`: Model using `JSONField` for payloads, with composite indexes.

#### [NEW] `backend/api/api.py`
- Django Ninja API definitions.
- `POST /api/v1/events/ingest/batch/`: Fast ingestion endpoint.
- `GET /api/v1/analytics/events/`: Filtered search.

#### [NEW] `backend/eventiq_core/tasks.py`
- Celery tasks for bulk insert (`bulk_create`) and geo-enrichment.

### 3. Frontend Dashboard (React)
A high-density enterprise UI using Vite, React, TS, Tailwind, and React Query.

#### [NEW] `dashboard/src/components/LiveEventStream.tsx`
- Streaming table for real-time incoming events.

#### [NEW] `dashboard/src/components/UserJourneyTimeline.tsx`
- Chronological timeline component with expandable JSON detail cards.

#### [NEW] `dashboard/src/components/MetricsCards.tsx`
- Summary cards for 24h metrics.

### 4. Deployment & Orchestration
Dockerization for local development and deployment.

#### [NEW] `docker-compose.yml`
- Services: `db` (Postgres), `redis`, `backend` (Django), `celery`, `frontend` (React/Nginx).

#### [NEW] `backend/Dockerfile`
#### [NEW] `dashboard/Dockerfile`

## Verification Plan

### Automated Tests
- SDK tests for event buffering and PII redaction.
- Django unit tests for ingestion throughput and Celery task execution.

### Manual Verification
- Spin up the stack via `docker-compose up`.
- Integrate the SDK into a dummy HTML file.
- Verify events appear in the React Dashboard in real-time.
- Test offline buffering by disconnecting the network on the client side.
