import uuid
from django.db import models

class SystemRegistry(models.Model):
    system_id = models.CharField(max_length=100, unique=True, primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    api_key = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.system_id})"

class EventLog(models.Model):
    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(db_index=True)
    system = models.ForeignKey(SystemRegistry, on_delete=models.CASCADE, related_name='events')
    username = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    employee_id = models.CharField(max_length=100, null=True, blank=True)
    event_category = models.CharField(max_length=50)
    event_action = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    payload = models.JSONField(default=dict)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['system', 'timestamp']),
            models.Index(fields=['username', 'timestamp']),
            models.Index(fields=['event_category', 'event_action']),
        ]

    def __str__(self):
        return f"{self.event_category}:{self.event_action} at {self.timestamp}"
