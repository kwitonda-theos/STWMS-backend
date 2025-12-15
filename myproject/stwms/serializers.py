from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Users, Location, WasteBin, Sensor,
    Collector, Vehicle, CollectionRoute,
    Alert, Report
)

# 1. Standard User Serializer 
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

# 2. Custom User Profile Serializer for each specific role
class UsersProfileSerializer(serializers.ModelSerializer):
    user_info = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Users
        fields = ['id', 'user_info', 'role', 'address', 'phone']

# 3. Location Serializer
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['house', 'sector', 'district', 'cell']

# 4. Waste Bin Serializer
class WasteBinSerializer(serializers.ModelSerializer):
    # Nested Location: Instead of just an ID, we get the full address object
    location_details = LocationSerializer(source='location', read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = WasteBin
        fields = [
            'WasteBin_id', 
            'location',          # The ID (good for updating)
            'location_details',  # The Object (good for displaying)
            'owner', 
            'owner_name', 
            'fill_level', 
            'status', 
            'last_updated'
        ]

# 5. Sensor Serializer
class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = ['id', 'status', 'waste_bin', 'last_reading']

# 6. Collector Serializer
class CollectorSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Collector
        fields = ['id', 'user', 'name', 'contact', 'status']

# 7. Vehicle Serializer
class VehicleSerializer(serializers.ModelSerializer):
    # Show location details to track vehicle position
    current_location_details = LocationSerializer(source='current_location', read_only=True)
    assigned_collector_name = serializers.CharField(source='assigned_collector.user.username', read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 
            'plate_number', 
            'capacity', 
            'current_location', 
            'current_location_details',
            'assigned_collector', 
            'assigned_collector_name'
        ]

# 8. Collection Route Serializer
class CollectionRouteSerializer(serializers.ModelSerializer):
    collector_name = serializers.CharField(source='assigned_collector.user.username', read_only=True)
    # Return the full list of bins in this route, not just IDs
    bins = WasteBinSerializer(many=True, read_only=True)

    class Meta:
        model = CollectionRoute
        fields = ['id', 'assigned_collector', 'collector_name', 'bins', 'start_time', 'completed']

# 9. Alert Serializer
class AlertSerializer(serializers.ModelSerializer):
    bin_id = serializers.CharField(source='bin.WasteBin_id', read_only=True)
    location = serializers.CharField(source='bin.location.sector', read_only=True)

    class Meta:
        model = Alert
        fields = ['id', 'alert_type', 'bin', 'bin_id', 'location', 'timestamp', 'resolved']

# 10. Report Serializer
class ReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.username', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'report_type', 'generated_by', 'generated_by_name', 'date', 'summary']