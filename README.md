# EventIQ
High-intelligence event capturing and analytical parsing.

EventIQ/
├── .github/workflows/          # CI/CD pipelines
├── docker-compose.yml          # Local orchestration (Django, React, Redis, Postgres, ClickHouse)
│
├── eventiq-backend/            # Python / Django Core & API Layer
│   ├── manage.py
│   ├── core/                   # Django settings, WSGI/ASGI, base configs
│   ├── apps/
│   │   ├── authentication/     # MNC SSO (SAML/OAuth2), RBAC, API Keys
│   │   ├── ingestion/          # High-speed log intake endpoints & serializers
│   │   ├── processing/         # Celery tasks, batch enrichment, PII masking
│   │   ├── analytics/          # Query engine for ClickHouse/Elasticsearch
│   │   └── alerts/             # Real-time anomaly detection & webhooks
│   └── requirements.txt
│
├── eventiq-dashboard/          # React + TypeScript Web App
│   ├── src/
│   │   ├── api/                # Axios clients & React Query hooks
│   │   ├── components/         # Reusable UI (Timelines, LogTables, FilterBars)
│   │   ├── features/
│   │   │   ├── live-stream/    # WebSocket/SSE real-time event feed
│   │   │   ├── user-journey/   # Visual breadcrumb reconstruction
│   │   │   ├── heatmaps/       # Activity distribution & interaction density
│   │   │   └── audit-export/   # Multi-variable log search & export
│   │   └── pages/              # Routed views
│   └── package.json
│
├── eventiq-collectors/         # Client-side SDKs & background trackers
│   ├── web-sdk/                # Browser script & NPM package (DOM/route tracking)
│   ├── browser-extension/      # Chrome/Edge extension for broad web capture
│   └── desktop-agent/          # Python/C# background daemon for OS-level actions
│
└── docs/                       # API specs, OpenAPI/Swagger, architecture diagrams
