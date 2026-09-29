from django.db import models
from django.contrib.auth.models import User

CAR_STATUS = [
    ('pending_check',  'Checking Pending Stage'),
    ('good_condition', 'Good Condition'),
    ('needs_service',  'Needs Service'),
    ('under_repair',   'Under Repair'),
    ('not_in_use',     'Not In Use'),
]

class Car(models.Model):
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    color = models.CharField(max_length=50)
    plate_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=50, choices=CAR_STATUS, default='pending_check')
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True)
    mileage = models.IntegerField(default=0)
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_cars')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.year} {self.make} {self.model} ({self.plate_number})"

    class Meta:
        ordering = ['-created_at']
