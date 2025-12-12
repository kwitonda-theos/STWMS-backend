from django import forms
from django.contrib.auth.models import User
from .models import (
    Users, Location, WasteBin, Sensor,
    Collector, Vehicle, CollectionRoute,
    Alert, Report
)

class UsersForm(forms.ModelForm):
    username = forms.CharField(
        max_length=150,
        required=True,
        label="Username",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter username'})
    )
    email = forms.EmailField(
        required=True,
        label="Email",
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Enter email '})
    )
    role = forms.ChoiceField(
        choices=Users.ROLE_CHOICES,
        required=True,
        label="Role",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    password = forms.CharField(
        required=True,
        label="Password",
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Enter password '})
    )
    phone = forms.CharField(
        required=True, 
        label="Phone",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter phone number '})
    )
    address = forms.CharField(
        required=True,
        label="Address",
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter address '})
    )
    class Meta:
        model = Users
        fields = ['role']
    
    def save(self, commit=True):
        
        username = self.cleaned_data.get('username')
        email = self.cleaned_data.get('email', '')
        role = self.cleaned_data.get('role')
        password = self.cleaned_data.get('password', '')
        phone = self.cleaned_data.get('phone', '')
        address = self.cleaned_data.get('address', '')
        
        # For update: use existing user, for create: check if user exists or create new
        if self.instance.pk and self.instance.user:
            # Updating existing profile
            user = self.instance.user
        else:
            # Creating new profile - check if User with this username exists
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                user = User(username=username)
        
        # Update user fields
        user.username = username
        user.email = email
        user.set_password(password)
        user.phone = phone
        user.address = address
        user.save()
        
        # Now save the Users profile
        profile = super().save(commit=False)
        profile.user = user
        profile.role = role
        
        if commit:
            profile.save()
        return profile


class LocationForm(forms.ModelForm):
    class Meta:
        model = Location
        fields = "__all__"


class WasteBinForm(forms.ModelForm):
    class Meta:
        model = WasteBin
        fields = "__all__"
    
    def clean(self):
        cleaned_data = super().clean()
        fill_level = cleaned_data.get('fill_level')
        status = cleaned_data.get('status')
        
        # Only auto-set status if it's not maintenance (maintenance should stay as is)
        if fill_level is not None and status != 'maintenance':
            if fill_level >= 90:
                cleaned_data['status'] = 'full'
            elif fill_level >= 50:
                cleaned_data['status'] = 'intermediate'
            else:
                cleaned_data['status'] = 'empty'
        
        return cleaned_data


class SensorForm(forms.ModelForm):
    class Meta:
        model = Sensor
        fields = "__all__"


class CollectorForm(forms.ModelForm):
    class Meta:
        model = Collector
        fields = "__all__"


class VehicleForm(forms.ModelForm):
    class Meta:
        model = Vehicle
        fields = "__all__"


class RouteForm(forms.ModelForm):
    class Meta:
        model = CollectionRoute
        fields = "__all__"


class AlertForm(forms.ModelForm):
    class Meta:
        model = Alert
        fields = "__all__"


class ReportForm(forms.ModelForm):
    class Meta:
        model = Report
        fields = "__all__"
