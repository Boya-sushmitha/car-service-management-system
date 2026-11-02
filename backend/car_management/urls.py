from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def ping(request):
    """Health-check endpoint – keeps the Render free-tier backend alive."""
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('ping/', ping, name='ping'),
    path('api/auth/', include('accounts.urls')),
    path('api/cars/', include('cars.urls')),
    path('api/customers/', include('customers.urls')),
    path('api/services/', include('services.urls')),
    path('api/bookings/', include('bookings.urls')),
]
