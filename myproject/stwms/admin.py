from django.contrib import admin
from .models import (
    Users, Location, WasteBin, Sensor,
    Collector, Vehicle, CollectionRoute,
    Alert, Report)
# Register your models here.
admin.site.register(Users)
admin.site.register(Location)
admin.site.register(WasteBin)   
admin.site.register(Sensor)
admin.site.register(Collector)
admin.site.register(Vehicle)
admin.site.register(CollectionRoute)
admin.site.register(Alert)
admin.site.register(Report)