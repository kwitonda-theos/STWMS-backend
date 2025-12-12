from django.apps import AppConfig


class StwmsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'stwms'

    def ready(self):
        # Import signal handlers to ensure they are registered
        import stwms.signals
