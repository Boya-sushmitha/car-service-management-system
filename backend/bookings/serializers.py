from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    car_display = serializers.StringRelatedField(source='car', read_only=True)
    customer_display = serializers.StringRelatedField(source='customer', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
