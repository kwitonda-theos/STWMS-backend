from django.db import models
from django.contrib.auth.models import User



class Users(models.Model):
    """User profile to extend Django's built-in User.

    Avoid subclassing `django.contrib.auth.models.User` directly; use a
    OneToOne profile to store the role instead.
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('collector', 'Collector'),
        ('resident', 'Resident'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='resident')
    username = models.CharField(max_length=150, default="")
    email = models.EmailField(max_length=254, default="")
    password = models.CharField(max_length=128, default="")
    address = models.CharField(max_length=255, default="")
    phone = models.CharField(max_length=20, default="")

class Location(models.Model):
    house= models.CharField(max_length=10, primary_key=True)
    sector = models.CharField(max_length=20)       
    district = models.CharField(max_length=20)   
    cell = models.CharField(max_length=20)
    
    def __str__ (self):
        return self.house
    


class WasteBin(models.Model):
    status_choices = [
        ('full','Full'),('intermediate','Intermediate'), ('empty', 'Empty'),('maintenance','Maintenance')
    ]

    WasteBin_id = models.CharField(max_length=10, primary_key=True)
    location = models.OneToOneField(Location, on_delete=models.SET_NULL, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_bins')
    fill_level = models.DecimalField(default=0, max_digits=5, decimal_places=2)      
    status = models.CharField(max_length=50, choices=status_choices)
    last_updated = models.DateTimeField(auto_now=True)


class Sensor(models.Model):
    status_choices = [
        ('defective', 'Defective'),
        ('working', 'Working'),
        ('check up', 'Check up'),
    ]
    status = models.CharField(max_length=10, choices=status_choices)
    waste_bin = models.OneToOneField(WasteBin, on_delete=models.CASCADE, related_name="sensor")
    last_reading = models.DateTimeField(auto_now=True)


class Collector(models.Model):
    collector_status_choices = [('Active', 'Active'),('Inactive', 'Inactive'),]
    # limit_choices_to should reference the related profile's role field
    user = models.OneToOneField(User,on_delete=models.CASCADE,limit_choices_to={'profile__role': 'collector'})
    contact = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=collector_status_choices, default='Active')

    def __str__(self):
        return self.user.username

class Admin(models.Model):
    admin_status_choices = [('Active', 'Active'),('Inactive', 'Inactive'),]
    # limit_choices_to should reference the related profile's role field
    user = models.OneToOneField(User,on_delete=models.CASCADE,limit_choices_to={'profile__role': 'admin'})
    contact = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=admin_status_choices, default='Active')
    
    def __str__(self):
        return self.user.username
    
class Resident(models.Model):
    resident_status_choices = [('Active', 'Active'),('Inactive', 'Inactive'),]
    # limit_choices_to should reference the related profile's role field
    user = models.OneToOneField(User,on_delete=models.CASCADE,limit_choices_to={'profile__role': 'resident'})
    contact = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=resident_status_choices, default='Active')
    def __str__(self):
        return self.user.username
    
class Vehicle(models.Model):
    plate_number = models.CharField(max_length=20)
    capacity = models.DecimalField(max_digits=7, decimal_places=2)
    current_location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    assigned_collector = models.ForeignKey(Collector, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return self.plate_number

class CollectionRoute(models.Model):
    assigned_collector = models.ForeignKey(Collector, on_delete=models.SET_NULL, null=True)
    bins = models.ManyToManyField(WasteBin, related_name="routes")
    start_time = models.DateTimeField()
    completed = models.BooleanField(default=False)

class Alert(models.Model):
    ALERT_TYPES = [
        ('bin_full', 'Bin Full'),
        ('sensor_error', 'Sensor Error'),
        ('overheat', 'Overheat'),
        ('leakage', 'Leakage'),
    ]
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    bin = models.ForeignKey(WasteBin, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

class Report(models.Model):
    REPORT_TYPES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    date = models.DateField(auto_now_add=True)
    summary = models.TextField()

