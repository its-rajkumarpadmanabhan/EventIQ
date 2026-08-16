import json
from typing import List, Optional
from datetime import datetime
from django.shortcuts import get_object_or_404
from ninja import NinjaAPI, Schema
from ninja.security import APIKeyHeader
from pydantic import Field
from eventiq_core.models import SystemRegistry, EventLog
from eventiq_core.tasks import process_events_batch

api = NinjaAPI(title="EventIQ API", version="1.0.0")

class ApiKeyAuth(APIKeyHeader):
    param_name = "X-API-Key"
    
    def authenticate(self, request, key):
        try:
            system = SystemRegistry.objects.get(api_key=key, is_active=True)
            return system
        except SystemRegistry.DoesNotExist:
            return None

class EventPayloadSchema(Schema):
    log_id: str
    timestamp: datetime
    system_id: str
    username: Optional[str] = None
    employee_id: Optional[str] = None
    event_category: str
    event_action: str
    payload: dict = Field(default_factory=dict)

class EventResponseSchema(Schema):
    status: str
    message: str

@api.post("/events/ingest/batch/", response=EventResponseSchema, auth=ApiKeyAuth())
def ingest_events_batch(request, events: List[EventPayloadSchema]):
    # Get the authenticated system
    system = request.auth
    
    # Fast path: Push to Celery/Redis for background processing to return < 20ms
    # We serialize the validated Pydantic models back to dicts
    events_data = [event.dict() for event in events]
    
    # Retrieve IP address for enrichment
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    process_events_batch.delay(events_data, system.system_id, ip)
    
    return {"status": "success", "message": f"Queued {len(events)} events for processing"}

class PaginatedEventResponse(Schema):
    total: int
    page: int
    items: List[EventPayloadSchema]

@api.get("/analytics/events/", response=PaginatedEventResponse)
def get_analytics_events(
    request, 
    system_id: Optional[str] = None, 
    username: Optional[str] = None,
    action_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    page: int = 1,
    page_size: int = 50
):
    # In a real system, this would also have authentication for dashboard users
    queryset = EventLog.objects.all()
    
    if system_id:
        queryset = queryset.filter(system__system_id=system_id)
    if username:
        queryset = queryset.filter(username=username)
    if action_type:
        queryset = queryset.filter(event_action=action_type)
    if start_date:
        queryset = queryset.filter(timestamp__gte=start_date)
    if end_date:
        queryset = queryset.filter(timestamp__lte=end_date)
        
    total = queryset.count()
    start = (page - 1) * page_size
    end = start + page_size
    
    events = queryset[start:end]
    
    # Convert to schema
    items = []
    for event in events:
        items.append(EventPayloadSchema(
            log_id=str(event.log_id),
            timestamp=event.timestamp,
            system_id=event.system.system_id,
            username=event.username,
            employee_id=event.employee_id,
            event_category=event.event_category,
            event_action=event.event_action,
            payload=event.payload
        ))
        
    return {"total": total, "page": page, "items": items}

@api.get("/analytics/users/{username}/timeline/", response=List[EventPayloadSchema])
def get_user_timeline(request, username: str):
    events = EventLog.objects.filter(username=username).order_by('-timestamp')[:100]
    items = []
    for event in events:
        items.append(EventPayloadSchema(
            log_id=str(event.log_id),
            timestamp=event.timestamp,
            system_id=event.system.system_id,
            username=event.username,
            employee_id=event.employee_id,
            event_category=event.event_category,
            event_action=event.event_action,
            payload=event.payload
        ))
    return items
