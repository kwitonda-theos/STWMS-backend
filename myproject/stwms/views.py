from django.shortcuts import render, redirect, get_object_or_404
from .models import (
    Users, Location, WasteBin, Sensor,
    Collector, Vehicle, CollectionRoute,
    Alert, Report
)
from .forms import (
    UsersForm, LocationForm, WasteBinForm, SensorForm,
    CollectorForm, VehicleForm, RouteForm,
    AlertForm, ReportForm
)
# users views
def users_list(request):
    users = Users.objects.all()
    return render(request, "users_list.html", {"users": users})


def users_create(request):
    form = UsersForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:users_list")
    return render(request, "users_form.html", {"form": form})


def users_update(request, pk):
    user = get_object_or_404(Users, pk=pk)
    form = UsersForm(request.POST or None, instance=user)
    if form.is_valid():
        form.save()
        return redirect("stwms:users_list")
    return render(request, "users_form.html", {"form": form})


def users_delete(request, pk):
    user = get_object_or_404(Users, pk=pk)
    user.delete()
    return redirect("stwms:users_list")

# location views
def location_list(request):
    locations = Location.objects.all()
    return render(request, "location_list.html", {"locations": locations})

def vw(request):
    
    return render(request, "landing.html")

def base(request):
    return render(request, "base.html")


def location_create(request):
    form = LocationForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:location_list")
    return render(request, "location_form.html", {"form": form})


def location_update(request, pk):
    location = get_object_or_404(Location, pk=pk)
    form = LocationForm(request.POST or None, instance=location)
    if form.is_valid():
        form.save()
        return redirect("stwms:location_list")
    return render(request, "location_form.html", {"form": form})


def location_delete(request, pk):
    location = get_object_or_404(Location, pk=pk)
    location.delete()
    return redirect("stwms:location_list")

# waste bin views
def bin_list(request):
    bins = WasteBin.objects.all()
    return render(request, "bin_list.html", {"bins": bins})


def bin_create(request):
    form = WasteBinForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:bin_list")
    return render(request, "bin_form.html", {"form": form})


def bin_update(request, pk):
    bin = get_object_or_404(WasteBin, pk=pk)
    form = WasteBinForm(request.POST or None, instance=bin)
    if form.is_valid():
        form.save()
        return redirect("stwms:bin_list")
    return render(request, "bin_form.html", {"form": form})


def bin_delete(request, pk):
    bin = get_object_or_404(WasteBin, pk=pk)
    bin.delete()
    return redirect("stwms:bin_list")
# sensor views
def sensor_list(request):
    sensors = Sensor.objects.all()
    return render(request, "sensor_list.html", {"sensors": sensors})


def sensor_create(request):
    form = SensorForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:sensor_list")
    return render(request, "sensor_form.html", {"form": form})


def sensor_update(request, pk):
    sensor = get_object_or_404(Sensor, pk=pk)
    form = SensorForm(request.POST or None, instance=sensor)
    if form.is_valid():
        form.save()
        return redirect("stwms:sensor_list")
    return render(request, "sensor_form.html", {"form": form})


def sensor_delete(request, pk):
    sensor = get_object_or_404(Sensor, pk=pk)
    sensor.delete()
    return redirect("stwms:sensor_list")

# collector views
def collector_list(request):
    collectors = Collector.objects.all()
    return render(request, "collector_list.html", {"collectors": collectors})


def collector_create(request):
    form = CollectorForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:collector_list")
    return render(request, "collector_form.html", {"form": form})


def collector_update(request, pk):
    collector = get_object_or_404(Collector, pk=pk)
    form = CollectorForm(request.POST or None, instance=collector)
    if form.is_valid():
        form.save()
        return redirect("stwms:collector_list")
    return render(request, "collector_form.html", {"form": form})


def collector_delete(request, pk):
    collector = get_object_or_404(Collector, pk=pk)
    collector.delete()
    return redirect("stwms:collector_list")

# vehicle views
def vehicle_list(request):
    vehicles = Vehicle.objects.all()
    return render(request, "vehicle_list.html", {"vehicles": vehicles})


def vehicle_create(request):
    form = VehicleForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:vehicle_list")
    return render(request, "vehicle_form.html", {"form": form})


def vehicle_update(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    form = VehicleForm(request.POST or None, instance=vehicle)
    if form.is_valid():
        form.save()
        return redirect("stwms:vehicle_list")
    return render(request, "vehicle_form.html", {"form": form})


def vehicle_delete(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    vehicle.delete()
    return redirect("stwms:vehicle_list")

# collection route views
def route_list(request):
    routes = CollectionRoute.objects.all()
    return render(request, "route_list.html", {"routes": routes})


def route_create(request):
    form = RouteForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:route_list")
    return render(request, "route_form.html", {"form": form})


def route_update(request, pk):
    route = get_object_or_404(CollectionRoute, pk=pk)
    form = RouteForm(request.POST or None, instance=route)
    if form.is_valid():
        form.save()
        return redirect("stwms:route_list")
    return render(request, "route_form.html", {"form": form})


def route_delete(request, pk):
    route = get_object_or_404(CollectionRoute, pk=pk)
    route.delete()
    return redirect("stwms:route_list")

# alert views
def alert_list(request):
    alerts = Alert.objects.all()
    return render(request, "alert_list.html", {"alerts": alerts})


def alert_create(request):
    form = AlertForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:alert_list")
    return render(request, "alert_form.html", {"form": form})


def alert_update(request, pk):
    alert = get_object_or_404(Alert, pk=pk)
    form = AlertForm(request.POST or None, instance=alert)
    if form.is_valid():
        form.save()
        return redirect("stwms:alert_list")
    return render(request, "alert_form.html", {"form": form})


def alert_delete(request, pk):
    alert = get_object_or_404(Alert, pk=pk)
    alert.delete()
    return redirect("stwms:alert_list")

# report views
def report_list(request):
    reports = Report.objects.all()
    return render(request, "report_list.html", {"reports": reports})


def report_create(request):
    form = ReportForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("stwms:report_list")
    return render(request, "report_form.html", {"form": form})


def report_update(request, pk):
    report = get_object_or_404(Report, pk=pk)
    form = ReportForm(request.POST or None, instance=report)
    if form.is_valid():
        form.save()
        return redirect("stwms:report_list")
    return render(request, "report_form.html", {"form": form})


def report_delete(request, pk):
    report = get_object_or_404(Report, pk=pk)
    report.delete()
    return redirect("stwms:report_list")

def register(request):
    # if request.method == 'POST':
    #     form = UsersForm(request.POST)
    #     if form.is_valid():
    #         form.save()
    #         return redirect('stwms:users_list')
    #else:
    # form = UsersForm()
    return render(request, "register.html")
