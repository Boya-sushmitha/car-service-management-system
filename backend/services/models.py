from django.db import models
from django.contrib.auth.models import User
from cars.models import Car

SERVICE_STATUS = [
    ('pending',     'Pending'),
    ('accepted',    'Accepted'),
    ('rejected',    'Rejected'),
    ('in_progress', 'In Progress'),
    ('completed',   'Completed'),
]

class Service(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='services')
    description = models.TextField()
    mechanic = models.CharField(max_length=100, blank=True, default='')
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    service_date = models.DateField()
    completed = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=SERVICE_STATUS, default='pending')
    requested_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='service_requests'
    )
    pickup_date = models.DateField(null=True, blank=True)
    pickup_details = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Service for {self.car} on {self.service_date} [{self.status}]"

    class Meta:
        ordering = ['-created_at']
