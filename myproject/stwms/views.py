from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.contrib import messages
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponse
from .models import (
    Users, Location, WasteBin, Sensor,
    Collector, Vehicle, CollectionRoute,
    Alert, Report
)

from django.db.models import Count
from django.db.models.functions import TruncMonth

from .forms import (
    UsersForm, LocationForm, WasteBinForm, SensorForm,
    CollectorForm, VehicleForm, RouteForm,
    AlertForm, ReportForm
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


def vehicle_create(request):
    form = VehicleForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:vehicle_list")
    return render(request, "vehicles/vehicle_form.html", {"form": form})


def vehicle_update(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    form = VehicleForm(request.POST or None, instance=vehicle)
    if form.is_valid():
        form.save()
        return redirect("stwms:vehicle_list")
    return render(request, "vehicles/vehicle_form.html", {"form": form})


def vehicle_delete(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    vehicle.delete()
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

# driver home view
def driver_home(request):
    return render(request, "Driver/home.html")


