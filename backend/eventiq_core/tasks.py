import logging
from celery import shared_task
from django.db import transaction
from eventiq_core.models import EventLog, SystemRegistry

logger = logging.getLogger(__name__)

def strip_server_side_pii(payload):
    """
    Perform any additional server-side PII stripping.
    Example: remove Authorization headers if accidentally captured,
    mask IP addresses in the payload, etc.
    """
    if not isinstance(payload, dict):
        return payload
        
    keys_to_remove = ['password', 'token', 'authorization', 'secret']
    
    # Simple recursive key stripping
    def clean_dict(d):
        if not isinstance(d, dict):
            return d
        cleaned = {}
        for k, v in d.items():
            if any(secret in k.lower() for secret in keys_to_remove):
                cleaned[k] = "[REDACTED_SERVER]"
            elif isinstance(v, dict):
                cleaned[k] = clean_dict(v)
            else:
                cleaned[k] = v
        return cleaned

    return clean_dict(payload)

@shared_task
def process_events_batch(events_data, system_id, ip_address=None):
    """
    Background task to process a batch of events, enrich them,
    and bulk insert into the database.
    """
    try:
        system = SystemRegistry.objects.get(system_id=system_id)
    except SystemRegistry.DoesNotExist:
        logger.error(f"System {system_id} not found during background processing.")
        return
        
    event_objects = []
    
    for event in events_data:
        # Strip server-side PII
        cleaned_payload = strip_server_side_pii(event.get('payload', {}))
        
        # Optionally perform GeoIP lookup based on ip_address here
        if ip_address and 'geo' not in cleaned_payload:
            # Placeholder for GeoIP enrichment
            cleaned_payload['geo'] = {"ip": ip_address, "status": "enriched"}
            
        event_obj = EventLog(
            log_id=event.get('log_id'),
            timestamp=event.get('timestamp'),
            system=system,
            username=event.get('username'),
            employee_id=event.get('employee_id'),
            event_category=event.get('event_category'),
            event_action=event.get('event_action'),
            ip_address=ip_address,
            payload=cleaned_payload
        )
        event_objects.append(event_obj)
        
    # Bulk create for performance
    if event_objects:
        with transaction.atomic():
            EventLog.objects.bulk_create(event_objects, batch_size=1000)
            
    logger.info(f"Successfully processed and inserted {len(event_objects)} events.")
