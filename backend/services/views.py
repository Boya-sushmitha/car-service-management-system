from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Service
from .serializers import ServiceSerializer
from utils.email import send_service_details_email


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    def get_queryset(self):
        queryset = Service.objects.all()
        car_id = self.request.query_params.get('car')
        if car_id:
            queryset = queryset.filter(car_id=car_id)
        svc_status = self.request.query_params.get('status')
        if svc_status:
            queryset = queryset.filter(status=svc_status)
        return queryset

    def perform_create(self, serializer):
        """Auto-assign the logged-in user as the requester, default status=pending."""
        service = serializer.save(requested_by=self.request.user, status='pending')
        requester = self.request.user
        if requester and requester.email:
            car = service.car
            send_service_details_email(
                to_email=requester.email,
                username=requester.username,
                subject=f'Service request received for {car}',
                body_lines=[
                    f'We received your service request #{service.id}.',
                    f'Car: {car}',
                    f'Services: {service.description}',
                    f'Requested date: {service.service_date}',
                    f'Status: {service.status}',
                    f'Estimated cost: {service.cost}',
                    'You can track this in the app after you log in.',
                ],
            )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_service_status(request, service_id):
    """Admin-only: update a service request status, pickup info, and cost."""
    if not request.user.is_staff:
        return Response({'error': 'Permission denied.'}, status=403)

    new_status = request.data.get('status')
    valid = ['pending', 'accepted', 'rejected', 'in_progress', 'completed']
    if new_status not in valid:
        return Response({'error': f'Invalid status. Choose from {valid}'}, status=400)

    try:
        service = Service.objects.get(pk=service_id)
        service.status = new_status
        if new_status == 'completed':
            service.completed = True

        # Save pickup info if provided
        pickup_date = request.data.get('pickup_date')
        if pickup_date:
            service.pickup_date = pickup_date

        pickup_details = request.data.get('pickup_details', '')
        if pickup_details:
            service.pickup_details = pickup_details

        # Save cost / amount if provided
        cost = request.data.get('cost')
        if cost is not None and cost != '':
            service.cost = cost


        service.save()

        if service.requested_by and service.requested_by.email:
            if new_status == 'completed':
                subject = f'Service #{service.id} is Completed!'
                car_name = f"{service.car.year} {service.car.make} {service.car.model}" if service.car else "Vehicle"
                body_lines = [
                    f'Great news! The service for your {car_name} is fully completed.',
                    f'Final Cost: {service.cost}',
                    'Please arrange for pickup or delivery.'
                ]
                if service.pickup_date:
                    body_lines.append(f'Pickup date: {service.pickup_date}')
                if service.pickup_details:
                    body_lines.append(f'Pickup details: {service.pickup_details}')
            else:
                subject = f'Service #{service.id} status: {service.status}'
                body_lines = [
                    f'Your service request for {service.car} was updated.',
                    f'Status: {service.status}',
                    f'Cost: {service.cost}',
                    f'Pickup date: {service.pickup_date or "Not set yet"}',
                    f'Pickup details: {service.pickup_details or "—"}',
                ]

            send_service_details_email(
                to_email=service.requested_by.email,
                username=service.requested_by.username,
                subject=subject,
                body_lines=body_lines,
            )

        return Response({
            'message': 'Service status updated.',
            'id': service.id,
            'status': service.status,
        })

    except Service.DoesNotExist:
        return Response({'error': 'Service not found.'}, status=404)

