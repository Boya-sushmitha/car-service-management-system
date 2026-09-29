from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer
from cars.models import Car
from customers.models import Customer
from services.models import Service

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def get_queryset(self):
        queryset = Booking.objects.all()
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset


@api_view(['GET'])
def dashboard_stats(request):
    """Return summary stats for the dashboard."""
    total_cars = Car.objects.count()
    available_cars = Car.objects.filter(status='available').count()
    cars_in_garage = Car.objects.filter(status='in_service').count()
    total_customers = Customer.objects.count()
    total_bookings = Booking.objects.count()
    pending_bookings = Booking.objects.filter(status='pending').count()
    total_services = Service.objects.count()
    total_garage_visits = total_services + total_bookings

    # Revenue from completed services
    from django.db.models import Sum
    revenue = Service.objects.filter(completed=True).aggregate(total=Sum('cost'))['total'] or 0

    return Response({
        'total_cars': total_cars,
        'available_cars': available_cars,
        'cars_in_garage': cars_in_garage,
        'total_customers': total_customers,
        'total_bookings': total_bookings,
        'pending_bookings': pending_bookings,
        'total_services': total_services,
        'total_garage_visits': total_garage_visits,
        'total_revenue': float(revenue),
    })
