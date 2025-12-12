from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import WasteBin, Alert

@receiver(post_save, sender=WasteBin)
def check_bin_status(sender, instance, created, **kwargs):
    """
    Triggered every time a WasteBin is saved.
    Checks if an alert needs to be created based on fill_level or status.
    """
    
    # Logic 1: Create Alert if Bin is Full
    if instance.status == 'full':
        # Check if an unresolved 'bin_full' alert already exists for this bin to avoid duplicates
        active_alert = Alert.objects.filter(
            bin=instance, 
            alert_type='bin_full', 
            resolved=False
        ).exists()
        
        if not active_alert:
            Alert.objects.create(
                alert_type='bin_full',
                bin=instance,
                resolved=False
            )
            print(f"Alert Created: Bin {instance.WasteBin_id} is full.")

    # Logic 2: Create Alert if Fill Level is critical (> 90%)
    # This covers cases where status might not be 'full' yet but level is high
    elif instance.fill_level >= 90.00:
        # Check for duplicates
        active_alert = Alert.objects.filter(
            bin=instance, 
            alert_type='bin_full', 
            resolved=False
        ).exists()
        
        if not active_alert:
            Alert.objects.create(
                alert_type='bin_full',
                bin=instance,
                resolved=False
            )
            print(f"Alert Created: Bin {instance.WasteBin_id} is at critical capacity ({instance.fill_level}%).")

    # Logic 3: Handle Maintenance Status
    elif instance.status == 'maintenance':
        active_alert = Alert.objects.filter(
            bin=instance, 
            alert_type='sensor_error', # Mapping maintenance to sensor/technical error
            resolved=False
        ).exists()
        
        if not active_alert:
            Alert.objects.create(
                alert_type='sensor_error',
                bin=instance,
                resolved=False
            )
            print(f"Alert Created: Bin {instance.WasteBin_id} requires maintenance.")