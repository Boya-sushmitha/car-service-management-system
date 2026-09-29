from django.db import models
from cars.models import Car
from customers.models import Customer

BOOKING_STATUS = [
    ('pending', 'Pending'),
    ('confirmed', 'Confirmed'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
]

SERVICE_TYPES = [
    ('oil_change', 'Oil Change'),
    ('tire_rotation', 'Tire Rotation'),
    ('brake_service', 'Brake Service'),
    ('engine_check', 'Engine Check'),
    ('full_service', 'Full Service'),
    ('other', 'Other'),
]

class Booking(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='bookings')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='bookings')
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPES)
    booking_date = models.DateField()
    booking_time = models.TimeField()
    status = models.CharField(max_length=20, choices=BOOKING_STATUS, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer} - {self.service_type} on {self.booking_date}"

    class Meta:
        ordering = ['-booking_date']
