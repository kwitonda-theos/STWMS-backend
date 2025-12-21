from rest_framework.routers import DefaultRouter
from django.urls import path,include
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'profiles', views.UsersProfileViewSet)
router.register(r'locations', views.LocationViewSet)
router.register(r'bins', views.WasteBinViewSet)
router.register(r'sensors', views.SensorViewSet)
router.register(r'collectors', views.CollectorViewSet)
router.register(r'vehicles', views.VehicleViewSet)
router.register(r'routes', views.CollectionRouteViewSet)
router.register(r'alerts', views.AlertViewSet)
router.register(r'reports', views.ReportViewSet)

app_name = 'stwms'

urlpatterns = [

    path('api/', include(router.urls)),

    path('', views.vw, name='home'),
    path('base/', views.base, name='base'),
    path('log_in/', views.log_in, name='log_in'),
    path('register/', views.register, name='register'),
    path('forgot_password/', views.forgot_password, name='forgot_password'),

    # api endpoints
    path('api/overview-stats/', views.api_dashboard_stats, name='api_overview_stats'),
    path('api/tanks/', views.api_tank_status, name='api_tank_status'),
    
    # driver api endpoints
    path('api/driver/stats/', views.api_driver_stats, name='api_driver_stats'),
    path('api/driver/routes/', views.api_driver_routes, name='api_driver_routes'),
    path('api/driver/notifications/', views.api_driver_notifications, name='api_driver_notifications'),
    path('api/driver/complete-collection/', views.api_mark_collection_complete, name='api_mark_collection_complete'),
    path('api/driver/mark-alert-resolved/', views.api_mark_alert_resolved, name='api_mark_alert_resolved'),
    path('api/driver/history/', views.api_driver_history, name='api_driver_history'),
    path('company/bin/create/', views.company_bin_create_view, name='company_bin_create'),
    path('company/location/create/', views.company_location_create_view, name='company_location_create'),

    # driver view
    path('driver_dashboard/', views.driver_dashboard, name='driver_dashboard'),
    path('driver_home/', views.driver_home, name='driver_home'),
    path('driver_history/', views.history, name='driver_history'),
    path('driver_history/week/', views.history_week, name='driver_history_week'),
    path('driver_history/month/', views.history_month, name='driver_history_month'),
    path('driver_notifications/', views.notifications, name='driver_notifications'),
    path('driver_routes/', views.route_details, name='driver_routes'),


    # company dashboard
    path('company_dashboard/', views.company_dashboard, name='company_dashboard'),
    path('overview/', views.overview, name='overview'),
    path('tank_status/', views.tank_status, name='tank_status'),
    path('analytics/', views.analytics, name='analytics'),
    path('settings/', views.settings, name='settings'),

    # users views

    path('users/', views.users_list, name='users_list'),
    path('users/create/', views.users_create, name='users_create'),
    path('users/<int:pk>/edit/', views.users_update, name='users_update'),
    path('users/<int:pk>/delete/', views.users_delete, name='users_delete'),

    # location views

    path('locations/', views.location_list, name='location_list'),
    path('locations/create/', views.location_create, name='location_create'),
    path('locations/<str:pk>/edit/', views.location_update, name='location_update'),
    path('locations/<str:pk>/delete/', views.location_delete, name='location_delete'),

    # waste bin views

    path('bins/', views.bin_list, name='bin_list'),
    path('bins/create/', views.bin_create, name='bin_create'),
    path('bins/<int:pk>/edit/', views.bin_update, name='bin_update'),
    path('bins/<str:pk>/delete/', views.bin_delete, name='bin_delete'),

    # sensor views

    path('sensors/', views.sensor_list, name='sensor_list'),
    path('sensors/create/', views.sensor_create, name='sensor_create'),
    path('sensors/<int:pk>/edit/', views.sensor_update, name='sensor_update'),
    path('sensors/<int:pk>/delete/', views.sensor_delete, name='sensor_delete'),

    # collector views

    path('collectors/', views.collector_list, name='collector_list'),
    path('collectors/create/', views.collector_create, name='collector_create'),
    path('collectors/<int:pk>/edit/', views.collector_update, name='collector_update'),
    path('collectors/<int:pk>/delete/', views.collector_delete, name='collector_delete'),

    # vehicle views

    path('vehicles/', views.vehicle_list, name='vehicle_list'),
    path('vehicles/create/', views.vehicle_create, name='vehicle_create'),
    path('vehicles/<int:pk>/edit/', views.vehicle_update, name='vehicle_update'),
    path('vehicles/<int:pk>/delete/', views.vehicle_delete, name='vehicle_delete'),

    # route views

    path('routes/', views.route_list, name='route_list'),
    path('routes/create/', views.route_create, name='route_create'),
    path('routes/<int:pk>/edit/', views.route_update, name='route_update'),
    path('routes/<int:pk>/delete/', views.route_delete, name='route_delete'),

    # alert views

    path('alerts/', views.alert_list, name='alert_list'),
    path('alerts/create/', views.alert_create, name='alert_create'),
    path('alerts/<int:pk>/edit/', views.alert_update, name='alert_update'),
    path('alerts/<int:pk>/delete/', views.alert_delete, name='alert_delete'),

    # report views

    path('reports/', views.report_list, name='report_list'),
    path('reports/create/', views.report_create, name='report_create'),
    path('reports/<int:pk>/edit/', views.report_update, name='report_update'),
    path('reports/<int:pk>/delete/', views.report_delete, name='report_delete'),

    # --- Resident Views ---
    path('resident/', views.resident_dashboard, name='resident_dashboard'),
    path('resident/settings/', views.resident_settings, name='resident_settings'),
    path('resident/help/', views.resident_help, name='resident_help'),
    path('resident/mark-bin-full/', views.resident_mark_bin_full, name='resident_mark_bin_full'),
    
    # Company: Assign tasks
    path('company/assign-task/', views.assign_task, name='assign_task'),
    
    # API endpoints
    path('api/resident/mark-bin-full/', views.api_mark_bin_full, name='api_mark_bin_full'),
]

