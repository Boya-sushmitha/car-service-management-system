from rest_framework import serializers
from .models import Service

class ServiceSerializer(serializers.ModelSerializer):
    car_display = serializers.StringRelatedField(source='car', read_only=True)
    requested_by_username = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Service
        fields = '__all__'

    def get_requested_by_username(self, obj):
        return obj.requested_by.username if obj.requested_by else 'Unknown'
