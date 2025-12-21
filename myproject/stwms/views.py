
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login
from django.conf import settings

from django.contrib import messages
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponse
from .models import (
    Users, Location, WasteBin, Sensor,
    Collector, Vehicle, CollectionRoute,
    Alert, Report,Admin,Resident
)

from django.db.models import Count
from django.db.models.functions import TruncMonth

from .forms import (
    UsersForm, LocationForm, WasteBinForm, SensorForm,
    CollectorForm, VehicleForm, RouteForm,
    AlertForm, ReportForm
)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from .serializers import (
    UserSerializer, UsersProfileSerializer, LocationSerializer,
    WasteBinSerializer, SensorSerializer, CollectorSerializer,
    VehicleSerializer, CollectionRouteSerializer, AlertSerializer,
    ReportSerializer
)
# users views
def users_list(request):
    users = Users.objects.all()
    return render(request, "users/users_list.html", {"users": users})


def users_create(request):
    form = UsersForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:users_list")
    return render(request, "users/users_form.html", {"form": form})


def users_update(request, pk):
    user = get_object_or_404(Users, pk=pk)
    form = UsersForm(request.POST or None, instance=user)
    if form.is_valid():
        form.save()
        return redirect("stwms:users_list")
    return render(request, "users/users_form.html", {"form": form})


def users_delete(request, pk):
    user = get_object_or_404(Users, pk=pk)
    user.delete()
    return redirect("stwms:users_list")

# location views
def location_list(request):
    locations = Location.objects.all()
    return render(request, "location/location_list.html", {"locations": locations})

def vw(request):
    
    return render(request, "landing.html")

def base(request):
    return render(request, "base.html")


def location_create(request):
    form = LocationForm(request.POST or None)
    if form.is_valid():
        location = form.save()
        # If it's an AJAX request, return JSON response with location data
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True, 
                'location_id': location.house,
                'location_display': f"{location.sector}, {location.cell}",
                'redirect_to': 'bin_create'
            })
        return redirect("stwms:location_list")
    
    # If it's an AJAX request, return just the form HTML
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        from django.template.loader import render_to_string
        html = render_to_string('location/location_form_content.html', {'form': form}, request=request)
        return HttpResponse(html)
    
    return render(request, "location/location_form.html", {"form": form})


def location_update(request, pk):
    location = get_object_or_404(Location, pk=pk)
    form = LocationForm(request.POST or None, instance=location)
    if form.is_valid():
        form.save()
        return redirect("stwms:location_list")
    return render(request, "location/location_form.html", {"form": form})


def location_delete(request, pk):
    location = get_object_or_404(Location, pk=pk)
    location.delete()
    return redirect("stwms:location_list")

# waste bin views
def bin_list(request):
    bins = WasteBin.objects.all()
    return render(request, "bin/bin_list.html", {"bins": bins})


def bin_create(request):
    form = WasteBinForm(request.POST or None)
    if form.is_valid():
        form.save()
        # If it's an AJAX request, return JSON response
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': True, 'redirect': '/tank_status/'})
        return redirect("stwms:bin_list")
    
    # If it's an AJAX request, return just the form HTML
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        from django.template.loader import render_to_string
        html = render_to_string('bin/bin_form_content.html', {'form': form}, request=request)
        return HttpResponse(html)
    
    return render(request, "bin/bin_form.html", {"form": form})


def bin_update(request, pk):
    bin = get_object_or_404(WasteBin, pk=pk)
    form = WasteBinForm(request.POST or None, instance=bin)
    if form.is_valid():
        form.save()
        return redirect("stwms:bin_list")
    return render(request, "bin/bin_form.html", {"form": form})


def bin_delete(request, pk):
    bin = get_object_or_404(WasteBin, pk=pk)
    bin.delete()
    
    # Support AJAX requests
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'success': True})
    
    return redirect("stwms:tank_status")
# sensor views
def sensor_list(request):
    sensors = Sensor.objects.all()
    return render(request, "sensor/sensor_list.html", {"sensors": sensors})


def sensor_create(request):
    form = SensorForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:sensor_list")
    return render(request, "sensor/sensor_form.html", {"form": form})


def sensor_update(request, pk):
    sensor = get_object_or_404(Sensor, pk=pk)
    form = SensorForm(request.POST or None, instance=sensor)
    if form.is_valid():
        form.save()
        return redirect("stwms:sensor_list")
    return render(request, "sensor/sensor_form.html", {"form": form})


def sensor_delete(request, pk):
    sensor = get_object_or_404(Sensor, pk=pk)
    sensor.delete()
    return redirect("stwms:sensor_list")

# collector views
def collector_list(request):
    collectors = Collector.objects.all()
    return render(request, "collector/collector_list.html", {"collectors": collectors})


def collector_create(request):
    form = CollectorForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:collector_list")
    return render(request, "collector/collector_form.html", {"form": form})


def collector_update(request, pk):
    collector = get_object_or_404(Collector, pk=pk)
    form = CollectorForm(request.POST or None, instance=collector)
    if form.is_valid():
        form.save()
        return redirect("stwms:collector_list")
    return render(request, "collector/collector_form.html", {"form": form})


def collector_delete(request, pk):
    collector = get_object_or_404(Collector, pk=pk)
    collector.delete()
    return redirect("stwms:collector_list")

# vehicle views
def vehicle_list(request):
    vehicles = Vehicle.objects.all()
    return render(request, "vehicles/vehicle_list.html", {"vehicles": vehicles})


# ... (imports) ...

# ... existing imports ...

def vehicle_create(request):
    form = VehicleForm(request.POST or None)
    if form.is_valid():
        form.save()
        # FIX: Redirect to /vehicles/ (the list), NOT /overview/
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': True, 'redirect': '/vehicles/'})
        return redirect("stwms:vehicle_list")
        
    # Return HTML for AJAX modal/content
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        from django.template.loader import render_to_string
        html = render_to_string('vehicles/vehicle_form.html', {'form': form}, request=request)
        if request.method == 'POST': 
             # Return error HTML with status 400
             return JsonResponse({'success': False, 'html': html}, status=400)
        return HttpResponse(html)
        
    return render(request, "vehicles/vehicle_form.html", {"form": form})


def vehicle_update(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    form = VehicleForm(request.POST or None, instance=vehicle)
    
    if form.is_valid():
        form.save()
        # FIX: Added AJAX support for Edit
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': True, 'redirect': '/vehicles/'})
        return redirect("stwms:vehicle_list")

    # Return HTML for AJAX modal/content
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        from django.template.loader import render_to_string
        html = render_to_string('vehicles/vehicle_form.html', {'form': form}, request=request)
        if request.method == 'POST':
            return JsonResponse({'success': False, 'html': html}, status=400)
        return HttpResponse(html)

    return render(request, "vehicles/vehicle_form.html", {"form": form})

def vehicle_delete(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    vehicle.delete()
    
    # Support AJAX requests
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'success': True})
    
    return redirect("stwms:vehicle_list")

# collection route views
def route_list(request):
    routes = CollectionRoute.objects.all()
    return render(request, "route/route_list.html", {"routes": routes})


def route_create(request):
    form = RouteForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:route_list")
    return render(request, "route/route_form.html", {"form": form})


def route_update(request, pk):
    route = get_object_or_404(CollectionRoute, pk=pk)
    form = RouteForm(request.POST or None, instance=route)
    if form.is_valid():
        form.save()
        return redirect("stwms:route_list")
    return render(request, "route/route_form.html", {"form": form})


def route_delete(request, pk):
    route = get_object_or_404(CollectionRoute, pk=pk)
    route.delete()
    return redirect("stwms:route_list")

# alert views
def alert_list(request):
    alerts = Alert.objects.all()
    return render(request, "alert/alert_list.html", {"alerts": alerts})


def alert_create(request):
    form = AlertForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:alert_list")
    return render(request, "alert/alert_form.html", {"form": form})


def alert_update(request, pk):
    alert = get_object_or_404(Alert, pk=pk)
    form = AlertForm(request.POST or None, instance=alert)
    if form.is_valid():
        form.save()
        return redirect("stwms:alert_list")
    return render(request, "alert/alert_form.html", {"form": form})


def alert_delete(request, pk):
    alert = get_object_or_404(Alert, pk=pk)
    alert.delete()
    return redirect("stwms:alert_list")

# report views
def report_list(request):
    reports = Report.objects.all()
    return render(request, "report/report_list.html", {"reports": reports})


def report_create(request):
    form = ReportForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:report_list")
    return render(request, "report/report_form.html", {"form": form})


def report_update(request, pk):
    report = get_object_or_404(Report, pk=pk)
    form = ReportForm(request.POST or None, instance=report)
    if form.is_valid():
        form.save()
        return redirect("stwms:report_list")
    return render(request, "report/report_form.html", {"form": form})


def report_delete(request, pk):
    report = get_object_or_404(Report, pk=pk)
    report.delete()
    return redirect("stwms:report_list")



# authentication views

def register(request):
    if request.method == 'POST':
        # Get and strip whitespace from form fields
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        phone = request.POST.get('phone', '').strip()
        address = request.POST.get('address', '').strip()
        role = request.POST.get('role', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')
        
        # Validation
        errors = []
        
        # Check if all fields are provided
        if not all([username, email, phone, address, role, password, confirm_password]):
            errors.append("All fields are required.")
        
        # Check if passwords match
        if password and confirm_password and password != confirm_password:
            errors.append("Passwords do not match.")
        
        # Check password length
        if password and len(password) < 8:
            errors.append("Password must be at least 8 characters long.")
        
        # Check if username already exists
        if username and User.objects.filter(username=username).exists():
            errors.append("Username already exists. Please choose a different username.")
        
        # Check if email already exists
        if email and User.objects.filter(email=email).exists():
            errors.append("Email already exists. Please use a different email.")
        
        # If there are errors, display them and re-render form
        if errors:
            for error in errors:
                messages.error(request, error)
            return render(request, "authentication/register.html", {
                'username': username,
                'email': email,
                'phone': phone,
                'address': address,
                'role': role,
            })
        
        # Create the Django User and Users profile
        try:
            # Create the Django User (this handles password hashing)
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            
            # Create the Users profile linked to the User
            user_profile = Users.objects.create(
                user=user,
                username=username,
                email=email,
                phone=phone,
                address=address,
                role=role,
                password=""  # Don't store plain password - it's securely stored in User model
            )
            

            # connect role-specific models
            if role.lower() == "collector":
                from .models import Collector
                Collector.objects.create(
                    user=user,
                    contact=phone,
                    status="Active"
                )
            elif role.lower() == "admin":
                from .models import Admin
                Admin.objects.create(
                    user=user,
                    contact=phone,
                    status ="Active"
                )
            elif role.lower() == "resident":
                from .models import Resident
                Resident.objects.create(
                    user=user,
                    contact=phone,
                    status ="Active"
                )
            

            messages.success(request, "Account created successfully! You can now log in.")
            return redirect('stwms:log_in')
            
        except IntegrityError:
            messages.error(request, "An error occurred while creating your account. The username or email may already be taken.")
            return render(request, "authentication/register.html", {
                'username': username,
                'email': email,
                'phone': phone,
                'address': address,
                'role': role,
            })
        except Exception as e:
            messages.error(request, f"An unexpected error occurred. Please try again.")
            # Log the error in production (you can use logging module)
            return render(request, "authentication/register.html", {
                'username': username,
                'email': email,
                'phone': phone,
                'address': address,
                'role': role,
            })
    
    # GET request - show the registration form
    return render(request, "authentication/register.html")

def log_in(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # 1. Authenticate the user (Checks username/password match)
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # 2. Log the user in (Creates session)
            auth_login(request, user)
            
            # 3. Check Role & Redirect
            try:
                # Get the extended profile (Users model)
                user_profile = Users.objects.get(user=user)
                role = user_profile.role.lower().strip()
                
                if role == 'admin' or role == 'company':
                    return redirect('stwms:company_dashboard')
                
                elif role == 'collector' or role == 'driver':
                    return redirect('stwms:driver_dashboard')
                
                elif role == 'resident':
                    return redirect('stwms:resident_dashboard') 
                
                else:
                    # Fallback if role is unknown
                    return redirect('stwms:home')
                    
            except Users.DoesNotExist:
                # If they are a superuser or missing a profile
                if user.is_superuser:
                    return redirect('/admin/')
                messages.error(request, "User profile not found.")
                
        else:
            messages.error(request, "Invalid username or password.")
            
    return render(request, "authentication/log_in.html")

def forgot_password(request):
    return render(request, "authentication/forgot_password.html")

# company info view
def company_dashboard(request):
    return render(request, "company/company.html")


def overview(request):
    # 1. Fetch Basic Counts
    total_bins = WasteBin.objects.count()
    total_trucks = Vehicle.objects.count()
    
    # 2. Urgent Collections: Count bins where status is 'full'
    urgent_collections = WasteBin.objects.filter(status='full').count()
    
    # 3. Efficiency Score Logic (Example: % of bins that are NOT full/defective)
    # If total_bins is 0, avoid division by zero error
    if total_bins > 0:
        working_bins = WasteBin.objects.filter(status='empty').count()
        efficiency = int((working_bins / total_bins) * 100)
    else:
        efficiency = 0

    # 4. Recent Alerts: Get the 3 newest alerts
    recent_alerts = Alert.objects.order_by('-timestamp')[:3]

    context = {
        "total_bins": total_bins,
        "total_trucks": total_trucks,
        "urgent_collections": urgent_collections,
        "efficiency": efficiency,
        "recent_alerts": recent_alerts
    }

    return render(request, "company/overview.html", context)
def tank_status(request):
    # Fetch all bins and 'select_related' to get location data efficiently in one query
    bins = WasteBin.objects.select_related('location').all()
    
    context = {
        "bins": bins
    }
    return render(request, "company/tank_status.html", context)

def analytics(request):
# 1. Bar Chart: Completed Collections per Month
    monthly_stats = CollectionRoute.objects.filter(completed=True) \
        .annotate(month=TruncMonth('start_time')) \
        .values('month') \
        .annotate(count=Count('id')) \
        .order_by('month')
    
    # Prepare data lists for the template
    months = []
    collections = []
    max_count = 0
    
    for entry in monthly_stats:
        if entry['month']:
            months.append(entry['month'].strftime('%b')) # Jan, Feb...
            count = entry['count']
            collections.append(count)
            if count > max_count:
                max_count = count
            
    # Normalize bar heights (percentage relative to max value)
    bar_data = []
    for count in collections:
        height = (count / max_count * 100) if max_count > 0 else 0
        bar_data.append({'height': height, 'value': count})
        
    # Zip months and data together for easier looping in template
    chart_data = zip(months, bar_data)

    # 2. Pie Chart: Bin Distribution by District
    # We count how many bins are in each district
    district_stats = Location.objects.values('district') \
        .annotate(bin_count=Count('wastebin')) \
        .order_by('-bin_count')

    total_bins_count = sum(item['bin_count'] for item in district_stats)
    
    # Colors for the chart segments
    colors = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6']
    
    pie_segments = []
    current_angle = 0
    legend_data = []

    if total_bins_count > 0:
        for i, item in enumerate(district_stats):
            count = item['bin_count']
            percent = (count / total_bins_count) * 100
            end_angle = current_angle + percent
            color = colors[i % len(colors)]
            
            # Create CSS gradient string: "color start% end%"
            pie_segments.append(f"{color} {current_angle}% {end_angle}%")
            
            legend_data.append({
                'label': item['district'],
                'percent': round(percent, 1),
                'color': color
            })
            current_angle = end_angle

    # Join segments for the CSS 'conic-gradient' property
    pie_style = f"background: conic-gradient({', '.join(pie_segments)});" if pie_segments else "background: #E5E7EB;"

    context = {
        "chart_data": chart_data,
        "pie_style": pie_style,
        "legend_data": legend_data,
        "max_y": max_count + 10 if max_count else 100 # Y-axis top limit
    }
    return render(request, "company/analytics.html", context)

def settings(request):
# You can pass the logged-in user's profile if you want to display their name/role
    user_profile = None
    if hasattr(request.user, 'profile'):
        user_profile = request.user.profile
        
    context = {
        'user': request.user,
        'profile': user_profile
    }
    return render(request, "company/settings.html", context)

# Company: Assign tasks to collectors
def assign_task(request):
    """
    Company view to assign collection routes (tasks) to collectors
    """
    if request.method == 'POST':
        form = RouteForm(request.POST)
        
        # Debug: Log form data
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            import json
            print(f"Form data received: {dict(request.POST)}")
            print(f"Bins selected: {request.POST.getlist('bins')}")
        
        if form.is_valid():
            try:
                route = form.save(commit=False)
                route.completed = False
                route.save()
                
                # Save many-to-many relationships (bins)
                form.save_m2m()
                
                # Verify bins were saved
                bin_count = route.bins.count()
                print(f"Route {route.id} created with {bin_count} bins")
                
                messages.success(request, f'Task assigned to {route.assigned_collector.user.username} successfully!')
                
                # Support AJAX requests
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': True, 
                        'redirect': '/overview/',
                        'message': f'Task assigned successfully with {bin_count} bins'
                    })
                
                return redirect('stwms:overview')
            except Exception as e:
                # Handle any errors during save
                import traceback
                error_trace = traceback.format_exc()
                print(f"Error saving route: {error_trace}")
                
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': False, 
                        'error': str(e),
                        'trace': error_trace if settings.DEBUG else None
                    }, status=400)
                messages.error(request, f'Error assigning task: {str(e)}')
        else:
            # Form is invalid - log errors
            print(f"Form validation errors: {form.errors}")
            print(f"Form non-field errors: {form.non_field_errors()}")
            
            # Return form with errors
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                # Return form with errors as HTML
                from django.template.loader import render_to_string
                collectors = Collector.objects.filter(status='Active')
                full_bins = WasteBin.objects.filter(status='full')
                urgent_bins = WasteBin.objects.filter(status__in=['full', 'intermediate']).select_related('location')
                html = render_to_string('company/assign_task.html', {
                    'form': form,
                    'collectors': collectors,
                    'full_bins': full_bins,
                    'urgent_bins': urgent_bins
                }, request=request)
                return HttpResponse(html, status=400)
    else:
        form = RouteForm()
    
    # Get available collectors and bins
    collectors = Collector.objects.filter(status='Active')
    full_bins = WasteBin.objects.filter(status='full')
    urgent_bins = WasteBin.objects.filter(status__in=['full', 'intermediate']).select_related('location')
    
    # Support AJAX requests for form loading
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' and request.method == 'GET':
        from django.template.loader import render_to_string
        html = render_to_string('company/assign_task.html', {
            'form': form,
            'collectors': collectors,
            'full_bins': full_bins,
            'urgent_bins': urgent_bins
        }, request=request)
        return HttpResponse(html)
    
    context = {
        'form': form,
        'collectors': collectors,
        'full_bins': full_bins,
        'urgent_bins': urgent_bins
    }
    return render(request, "company/assign_task.html", context)

# driver home view
def driver_home(request):
    username = request.user.username if request.user.is_authenticated else "Driver"
    context = {
        'username': username
    }
    return render(request, "Driver/home.html", context)

def history(request):
    # Get collector for the logged-in user
    collector = None
    if request.user.is_authenticated:
        try:
            collector = Collector.objects.get(user=request.user)
        except Collector.DoesNotExist:
            pass
    
    context = {
        'collector': collector,
        'period': 'today'
    }
    return render(request, "Driver/history.html", context)

def history_week(request):
    # Get collector for the logged-in user
    collector = None
    if request.user.is_authenticated:
        try:
            collector = Collector.objects.get(user=request.user)
        except Collector.DoesNotExist:
            pass
    
    context = {
        'collector': collector,
        'period': 'week'
    }
    return render(request, "Driver/history.html", context)

def history_month(request):
    # Get collector for the logged-in user
    collector = None
    if request.user.is_authenticated:
        try:
            collector = Collector.objects.get(user=request.user)
        except Collector.DoesNotExist:
            pass
    
    context = {
        'collector': collector,
        'period': 'month'
    }
    return render(request, "Driver/history.html", context)

def notifications(request):
    # Get alerts for the driver's assigned bins
    alerts = []
    unread_count = 0
    
    if request.user.is_authenticated:
        try:
            collector = Collector.objects.get(user=request.user)
            # Get bins assigned to this collector's routes
            from datetime import date
            today = date.today()
            routes = CollectionRoute.objects.filter(
                assigned_collector=collector,
                start_time__date=today
            )
            
            # Get all bins from these routes
            route_bins = WasteBin.objects.filter(routes__in=routes).distinct()
            
            # Get alerts for these bins
            alerts = Alert.objects.filter(
                bin__in=route_bins,
                resolved=False
            ).select_related('bin', 'bin__location').order_by('-timestamp')[:50]
            
            unread_count = alerts.count()
        except Collector.DoesNotExist:
            # If not a collector, show all unresolved alerts
            alerts = Alert.objects.filter(resolved=False).select_related('bin', 'bin__location').order_by('-timestamp')[:50]
            unread_count = alerts.count()
    
    context = {
        'alerts': alerts,
        'unread_count': unread_count
    }
    return render(request, "Driver/notification.html", context)
def route_details(request):
    # Get the collector for the logged-in user
    collector = None
    if request.user.is_authenticated:
        try:
            collector = Collector.objects.get(user=request.user)
        except Collector.DoesNotExist:
            pass
    
    context = {
        'collector': collector
    }
    return render(request, "Driver/routes.html", context)

def driver_dashboard(request):
    return render(request, "Driver/driver.html")




# --- API ENDPOINTS ---

@api_view(['GET'])
def api_dashboard_stats(request):
    """
    Returns JSON data for the Overview cards:
    - Total Bins, Trucks, Urgent Collections, Efficiency
    """
    total_bins = WasteBin.objects.count()
    total_trucks = Vehicle.objects.count()
    urgent_collections = WasteBin.objects.filter(status='full').count()
    
    efficiency = 0
    if total_bins > 0:
        working_bins = WasteBin.objects.filter(status='empty').count()
        efficiency = int((working_bins / total_bins) * 100)

    # Get recent alerts (serialized)
    recent_alerts = Alert.objects.order_by('-timestamp')[:5]
    alerts_data = AlertSerializer(recent_alerts, many=True).data

    data = {
        "total_bins": total_bins,
        "total_trucks": total_trucks,
        "urgent_collections": urgent_collections,
        "efficiency": efficiency,
        "recent_alerts": alerts_data
    }
    return Response(data)

@api_view(['GET'])
def api_tank_status(request):
    """
    Returns list of all bins for the Tank Status page.
    Supports filtering via ?status=full query param.
    """
    status_filter = request.GET.get('status')
    
    if status_filter and status_filter != 'all':
        bins = WasteBin.objects.filter(status=status_filter).select_related('location')
    else:
        bins = WasteBin.objects.select_related('location').all()
        
    serializer = WasteBinSerializer(bins, many=True)
    return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows standard Django users to be viewed or edited.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UsersProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for extended user profiles (Residents, Collectors, Admins).
    """
    queryset = Users.objects.all()
    serializer_class = UsersProfileSerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class WasteBinViewSet(viewsets.ModelViewSet):
    queryset = WasteBin.objects.all()
    serializer_class = WasteBinSerializer

class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

class CollectorViewSet(viewsets.ModelViewSet):
    queryset = Collector.objects.all()
    serializer_class = CollectorSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

class CollectionRouteViewSet(viewsets.ModelViewSet):
    queryset = CollectionRoute.objects.all()
    serializer_class = CollectionRouteSerializer

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

# --- DRIVER API ENDPOINTS ---

@api_view(['GET'])
def api_driver_stats(request):
    """
    Returns driver-specific stats:
    - Pending collections, Completed today, Route progress
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    try:
        collector = Collector.objects.get(user=request.user)
    except Collector.DoesNotExist:
        return Response({
            'pending_collections': 0,
            'completed_today': 0,
            'route_progress': 0
        })
    
    # Get today's routes for this collector
    from datetime import date, datetime
    today = date.today()
    today_routes = CollectionRoute.objects.filter(
        assigned_collector=collector,
        start_time__date=today
    )
    
    # Count pending bins (in routes that aren't completed)
    pending_routes = today_routes.filter(completed=False)
    pending_bins = 0
    for route in pending_routes:
        pending_bins += route.bins.count()
    
    # Count completed bins today
    completed_routes = today_routes.filter(completed=True)
    completed_bins = 0
    for route in completed_routes:
        completed_bins += route.bins.count()
    
    # Calculate route progress
    total_bins_today = pending_bins + completed_bins
    route_progress = int((completed_bins / total_bins_today * 100)) if total_bins_today > 0 else 0
    
    return Response({
        'pending_collections': pending_bins,
        'completed_today': completed_bins,
        'route_progress': route_progress
    })

@api_view(['GET'])
def api_driver_routes(request):
    """
    Returns routes assigned to the logged-in driver
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    try:
        collector = Collector.objects.get(user=request.user)
    except Collector.DoesNotExist:
        return Response({'routes': [], 'all_stops': [], 'completed_count': 0, 'total_count': 0})
    
    from datetime import date
    today = date.today()
    
    # Get today's routes (both completed and pending)
    routes = CollectionRoute.objects.filter(
        assigned_collector=collector,
        start_time__date=today
    ).prefetch_related('bins', 'bins__location')
    
    routes_data = []
    all_stops = []  # All collection stops from all routes
    completed_count = 0
    total_count = 0
    
    for route in routes:
        bins_data = []
        for bin in route.bins.all():
            # Determine if bin is collected (status is empty or route is completed)
            is_collected = route.completed or bin.status == 'empty'
            if is_collected:
                completed_count += 1
            total_count += 1
            
            bin_data = {
                'id': bin.WasteBin_id,
                'location': f"{bin.location.sector}, {bin.location.cell}" if bin.location else "Unknown",
                'status': bin.status,
                'fill_level': float(bin.fill_level),
                'is_collected': is_collected,
                'route_id': route.id
            }
            bins_data.append(bin_data)
            all_stops.append(bin_data)
        
        routes_data.append({
            'id': route.id,
            'start_time': route.start_time.isoformat(),
            'bins': bins_data,
            'total_bins': len(bins_data),
            'completed': route.completed
        })
    
    # Calculate remaining count
    remaining_count = total_count - completed_count
    
    return Response({
        'routes': routes_data,
        'all_stops': all_stops,
        'completed_count': completed_count,
        'total_count': total_count,
        'remaining_count': remaining_count
    })

@api_view(['GET'])
def api_driver_notifications(request):
    """
    Returns recent alerts/notifications for the driver's assigned bins
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    try:
        collector = Collector.objects.get(user=request.user)
        # Get bins assigned to this collector's routes
        from datetime import date
        today = date.today()
        routes = CollectionRoute.objects.filter(
            assigned_collector=collector,
            start_time__date=today
        )
        
        # Get all bins from these routes
        route_bins = WasteBin.objects.filter(routes__in=routes).distinct()
        
        # Get alerts for these bins
        alerts = Alert.objects.filter(
            bin__in=route_bins,
            resolved=False
        ).select_related('bin', 'bin__location').order_by('-timestamp')[:50]
    except Collector.DoesNotExist:
        # If not a collector, show all unresolved alerts
        alerts = Alert.objects.filter(resolved=False).select_related('bin', 'bin__location').order_by('-timestamp')[:50]
    
    alerts_data = []
    for alert in alerts:
        # Determine priority based on alert type
        priority = 'low'
        if alert.alert_type in ['bin_full', 'leakage']:
            priority = 'high'
        elif alert.alert_type == 'sensor_error':
            priority = 'medium'
        
        # Get alert type display name
        alert_type_display = dict(Alert.ALERT_TYPES).get(alert.alert_type, alert.alert_type)
        
        # Build alert message
        bin_location = "Unknown"
        if alert.bin and alert.bin.location:
            bin_location = f"{alert.bin.location.sector}, {alert.bin.location.cell}"
        
        alert_message = ""
        if alert.alert_type == 'bin_full':
            fill_level = float(alert.bin.fill_level) if alert.bin else 0
            alert_message = f"Bin at {bin_location} is {fill_level:.0f}% full and requires immediate collection"
        elif alert.alert_type == 'sensor_error':
            alert_message = f"Sensor error detected at {bin_location}"
        elif alert.alert_type == 'leakage':
            alert_message = f"Leakage detected at {bin_location} - urgent attention required"
        elif alert.alert_type == 'overheat':
            alert_message = f"Overheating detected at {bin_location}"
        else:
            alert_message = f"Alert at {bin_location}"
        
        alerts_data.append({
            'id': alert.id,
            'type': alert.alert_type,
            'type_display': alert_type_display,
            'bin_id': alert.bin.WasteBin_id if alert.bin else None,
            'location': bin_location,
            'fill_level': float(alert.bin.fill_level) if alert.bin else 0,
            'priority': priority,
            'timestamp': alert.timestamp.isoformat(),
            'time_ago': get_time_ago(alert.timestamp),
            'message': alert_message,
            'resolved': alert.resolved
        })
    
    return Response({
        'notifications': alerts_data,
        'unread_count': len(alerts_data)
    })

@api_view(['POST'])
def api_mark_collection_complete(request):
    """
    Mark a bin collection as complete
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    bin_id = request.data.get('bin_id')
    route_id = request.data.get('route_id')
    
    if not bin_id or not route_id:
        return Response({'error': 'bin_id and route_id required'}, status=400)
    
    try:
        collector = Collector.objects.get(user=request.user)
        route = CollectionRoute.objects.get(id=route_id, assigned_collector=collector)
        waste_bin = WasteBin.objects.get(WasteBin_id=bin_id)
        
        # Update bin status to empty after collection
        waste_bin.status = 'empty'
        waste_bin.fill_level = 0
        waste_bin.save()
        
        # Check if all bins in route are collected (simplified - you might want to track individual bin completion)
        
        return Response({'success': True, 'message': 'Collection marked as complete'})
    except (Collector.DoesNotExist, CollectionRoute.DoesNotExist, WasteBin.DoesNotExist) as e:
        return Response({'error': str(e)}, status=404)

@api_view(['GET'])
def api_driver_history(request):
    """
    Returns collection history for the driver
    Supports filtering by period: today, week, month
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    period = request.GET.get('period', 'today')  # today, week, month
    
    try:
        collector = Collector.objects.get(user=request.user)
    except Collector.DoesNotExist:
        # Return default performance data
        default_performance = {
            'collection_rate': 60,
            'efficiency': 75,
            'total_collections': 85,
            'total_weight': 1250.5,
            'average_weight': 17.9,
            'period': period
        }
        return Response({'collections': [], 'performance': default_performance})
    
    from datetime import date, datetime, timedelta
    from django.utils import timezone
    
    # Calculate date range based on period
    now = timezone.now()
    if period == 'today':
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now
    elif period == 'week':
        start_date = now - timedelta(days=7)
        end_date = now
    elif period == 'month':
        start_date = now - timedelta(days=30)
        end_date = now
    else:
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now
    
    # Get completed routes in the period
    routes = CollectionRoute.objects.filter(
        assigned_collector=collector,
        completed=True,
        start_time__gte=start_date,
        start_time__lte=end_date
    ).prefetch_related('bins', 'bins__location').order_by('-start_time')
    
    collections_data = []
    total_bins = 0
    total_weight = 0  # Estimate based on fill level
    
    for route in routes:
        for bin in route.bins.all():
            # Estimate weight (simplified - you might have actual weight data)
            estimated_weight = float(bin.fill_level) * 0.5  # kg estimate
            total_weight += estimated_weight
            total_bins += 1
            
            location_str = "Unknown"
            if bin.location:
                location_str = f"{bin.location.sector}"
                if bin.location.cell:
                    location_str += f", {bin.location.cell}"
                if bin.location.district:
                    location_str += f" - {bin.location.district}"
            
            collections_data.append({
                'id': bin.WasteBin_id,
                'route_id': route.id,
                'location': location_str,
                'time': route.start_time.strftime('%I:%M %p'),
                'date': route.start_time.strftime('%Y-%m-%d'),
                'datetime': route.start_time.isoformat(),
                'estimated_weight': round(estimated_weight, 1),
                'fill_level': float(bin.fill_level),
                'status': 'completed'
            })
    
    # Calculate performance metrics
    # Collection rate: completed routes / total assigned routes in period
    total_assigned = CollectionRoute.objects.filter(
        assigned_collector=collector,
        start_time__gte=start_date,
        start_time__lte=end_date
    ).count()
    
    completed_count = routes.count()
    collection_rate = int((completed_count / total_assigned * 100)) if total_assigned > 0 else 0
    
    # Efficiency: based on bins collected vs assigned
    total_assigned_bins = 0
    for route in CollectionRoute.objects.filter(
        assigned_collector=collector,
        start_time__gte=start_date,
        start_time__lte=end_date
    ):
        total_assigned_bins += route.bins.count()
    
    efficiency = int((total_bins / total_assigned_bins * 100)) if total_assigned_bins > 0 else 0
    
    # Average weight per collection
    avg_weight = round(total_weight / total_bins, 1) if total_bins > 0 else 0
    
    # Default performance data
    default_performance = {
        'collection_rate': 60,
        'efficiency': 75,
        'total_collections': 85,
        'total_weight': 1250.5,
        'average_weight': 17.9
    }
    
    # If no collections, use default values
    if total_bins == 0:
        performance_data = default_performance.copy()
        performance_data['period'] = period
    else:
        # Use real data if available
        performance_data = {
            'collection_rate': collection_rate if collection_rate > 0 else default_performance['collection_rate'],
            'efficiency': efficiency if efficiency > 0 else default_performance['efficiency'],
            'total_collections': total_bins,
            'total_weight': round(total_weight, 1),
            'average_weight': avg_weight,
            'period': period
        }
    
    return Response({
        'collections': collections_data,
        'performance': performance_data
    })

@api_view(['POST'])
def api_mark_alert_resolved(request):
    """
    Mark an alert as resolved
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    alert_id = request.data.get('alert_id')
    mark_all = request.data.get('mark_all', False)
    
    if mark_all:
        # Mark all alerts for this driver as resolved
        try:
            collector = Collector.objects.get(user=request.user)
            from datetime import date
            today = date.today()
            routes = CollectionRoute.objects.filter(
                assigned_collector=collector,
                start_time__date=today
            )
            route_bins = WasteBin.objects.filter(routes__in=routes).distinct()
            alerts = Alert.objects.filter(bin__in=route_bins, resolved=False)
            alerts.update(resolved=True)
            return Response({'success': True, 'message': f'{alerts.count()} alerts marked as resolved'})
        except Collector.DoesNotExist:
            alerts = Alert.objects.filter(resolved=False)
            count = alerts.count()
            alerts.update(resolved=True)
            return Response({'success': True, 'message': f'{count} alerts marked as resolved'})
    elif alert_id:
        try:
            alert = Alert.objects.get(id=alert_id)
            alert.resolved = True
            alert.save()
            return Response({'success': True, 'message': 'Alert marked as resolved'})
        except Alert.DoesNotExist:
            return Response({'error': 'Alert not found'}, status=404)
    else:
        return Response({'error': 'alert_id or mark_all required'}, status=400)

def get_time_ago(timestamp):
    """Helper function to get human-readable time ago"""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    diff = now - timestamp
    
    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds >= 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds >= 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"

#  (Inside Company Dashboard Views section) 

def company_bin_create_view(request):
    # Use the standard WasteBinForm
    form = WasteBinForm()
    # Point to YOUR existing file
    return render(request, "bin/bin_form_content.html", {"form": form})

# ... existing imports ...

def company_location_create_view(request):
    form = LocationForm()
    return render(request, "location/location_form_content.html", {"form": form})

def resident_dashboard(request):

    return render(request, "resident/index.html")

def resident_settings(request):
    
    return render(request, "resident/settings.html")

def resident_help(request):
    
    return render(request, "resident/help.html")

# Resident: Mark bin as full
@api_view(['POST'])
def api_mark_bin_full(request):
    """
    API endpoint for residents to mark their bin as full
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    bin_id = request.data.get('bin_id')
    
    if not bin_id:
        return Response({'error': 'bin_id is required'}, status=400)
    
    try:
        # Get the bin - check if user owns it or is a resident
        waste_bin = WasteBin.objects.get(WasteBin_id=bin_id)
        
        # Check if user is the owner or is a resident
        is_owner = waste_bin.owner == request.user
        is_resident = False
        try:
            user_profile = Users.objects.get(user=request.user)
            is_resident = user_profile.role == 'resident'
        except Users.DoesNotExist:
            pass
        
        if not (is_owner or is_resident):
            return Response({'error': 'You do not have permission to update this bin'}, status=403)
        
        # Update bin status to full
        waste_bin.status = 'full'
        waste_bin.fill_level = 95  # Set to 95% when marked as full
        waste_bin.save()
        
        # Create an alert for the bin being full
        alert, created = Alert.objects.get_or_create(
            bin=waste_bin,
            alert_type='bin_full',
            resolved=False,
            defaults={
                'timestamp': timezone.now()
            }
        )
        
        if not created:
            # Update timestamp if alert already exists
            alert.timestamp = timezone.now()
            alert.save()
        
        return Response({
            'success': True,
            'message': 'Bin marked as full. Collection team has been notified.',
            'bin_id': bin_id,
            'status': waste_bin.status,
            'fill_level': float(waste_bin.fill_level)
        })
        
    except WasteBin.DoesNotExist:
        return Response({'error': 'Bin not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

def resident_mark_bin_full(request):
    """
    Resident view to mark their bin as full (web form)
    """
    if not request.user.is_authenticated:
        messages.error(request, 'Please log in to mark your bin as full.')
        return redirect('stwms:log_in')
    
    # Get bins owned by this user
    user_bins = WasteBin.objects.filter(owner=request.user)
    
    if request.method == 'POST':
        bin_id = request.POST.get('bin_id')
        if bin_id:
            try:
                waste_bin = WasteBin.objects.get(WasteBin_id=bin_id, owner=request.user)
                waste_bin.status = 'full'
                waste_bin.fill_level = 95
                waste_bin.save()
                
                # Create alert
                Alert.objects.get_or_create(
                    bin=waste_bin,
                    alert_type='bin_full',
                    resolved=False,
                    defaults={'timestamp': timezone.now()}
                )
                
                messages.success(request, f'Bin {bin_id} marked as full. Collection team has been notified!')
                return redirect('stwms:resident_dashboard')
            except WasteBin.DoesNotExist:
                messages.error(request, 'Bin not found or you do not have permission.')
    
    context = {
        'user_bins': user_bins
    }
    return render(request, "resident/mark_bin_full.html", context)