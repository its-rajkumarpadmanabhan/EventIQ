# EventIQ Backend

This is the Django backend API for EventIQ. It handles the ingestion of events from the SDK, processes them asynchronously using Celery, and serves analytics data to the dashboard.

## Setup

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server:**
   ```bash
   python manage.py runserver
   ```

## Features
- Scalable event ingestion batch API.
- Celery integration for asynchronous processing.
- Data enrichment (IP tracking, etc.).
- Robust querying for real-time analytics and user journey timelines.
