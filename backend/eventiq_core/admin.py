from django.contrib import admin
from .models import SystemRegistry, EventLog

@admin.register(SystemRegistry)
class SystemRegistryAdmin(admin.ModelAdmin):
    list_display = ('system_id', 'name', 'is_active', 'created_at')
    search_fields = ('system_id', 'name')
    list_filter = ('is_active',)

@admin.register(EventLog)
class EventLogAdmin(admin.ModelAdmin):
    list_display = ('log_id', 'timestamp', 'system', 'username', 'event_category', 'event_action')
    search_fields = ('username', 'event_action', 'system__system_id')
    list_filter = ('event_category', 'system')
    readonly_fields = ('log_id', 'timestamp')
    date_hierarchy = 'timestamp'
