from django.core.management.base import BaseCommand
from eventiq_core.models import SystemRegistry
import secrets

class Command(BaseCommand):
    help = 'Seeds the database with a default SystemRegistry for the demo app'

    def handle(self, *args, **kwargs):
        system_id = "demo-web-app"
        api_key = "demo_api_key_12345" # Use a known key for demo purposes

        system, created = SystemRegistry.objects.get_or_create(
            system_id=system_id,
            defaults={
                'name': 'Demo Web Application',
                'description': 'A demo web app used to test the EventIQ SDK integration.',
                'api_key': api_key,
                'is_active': True
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Successfully created demo system: {system_id}'))
        else:
            self.stdout.write(self.style.WARNING(f'Demo system {system_id} already exists.'))
            # ensure api key is updated for demo
            if system.api_key != api_key:
                system.api_key = api_key
                system.save()
                self.stdout.write(self.style.SUCCESS(f'Updated demo system API key.'))
