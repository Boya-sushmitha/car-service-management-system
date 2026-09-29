from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from utils.email import send_registration_email


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user and return auth token."""
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=400)

    if not email:
        return Response({'error': 'Email is required so we can send your login and car service details.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken.'}, status=400)

    if email and User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered.'}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    user.is_active = True
    user.save()

    # Create associated Customer record
    try:
        from customers.models import Customer
        customer_email = email if email else f"{username}@no-email.com"
        customer_name = f"{first_name} {last_name}".strip()
        if not customer_name:
            customer_name = username
        Customer.objects.create(name=customer_name, email=customer_email)
    except Exception as e:
        print(f"Failed to create Customer record: {e}")

    token, _ = Token.objects.get_or_create(user=user)
    send_registration_email(user, password)

    return Response({
        'message': 'Registration successful.',
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
        }
    }, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login and return auth token."""
    # Accept username or email in request payload
    username_input = request.data.get('username') or request.data.get('email')
    username_input = username_input.strip() if username_input else ''
    password = request.data.get('password', '')

    if not username_input or not password:
        return Response({'error': 'Username/email and password are required.'}, status=400)

    # Find user by username or email (case‑insensitive)
    user_obj = User.objects.filter(username__iexact=username_input).first()
    if not user_obj:
        user_obj = User.objects.filter(email__iexact=username_input).first()

    if not user_obj:
        return Response({'error': 'Invalid credentials. Please check your username/email and password.'}, status=401)

    # Ensure the account is active
    if not user_obj.is_active:
        return Response({'error': 'Your account is pending activation by an administrator.'}, status=403)

    # Use Django's authenticate to verify password and obtain user
    user = authenticate(username=user_obj.username, password=password)
    if not user:
        return Response({'error': 'Invalid credentials. Please check your username/email and password.'}, status=401)

    # Generate token
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout by deleting the auth token."""
    request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Return current authenticated user's info."""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """List all users (only accessible to staff/admin)."""
    if not request.user.is_staff:
        return Response({'error': 'Permission denied.'}, status=403)
    
    users = User.objects.all().order_by('-id')
    data = [{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'first_name': u.first_name,
        'last_name': u.last_name,
        'is_active': u.is_active,
        'is_staff': u.is_staff,
    } for u in users]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_user_status(request, user_id):
    """Toggle a user's is_active status (only accessible to staff/admin)."""
    if not request.user.is_staff:
        return Response({'error': 'Permission denied.'}, status=403)
    
    try:
        user = User.objects.get(pk=user_id)
        if user == request.user:
            return Response({'error': 'You cannot deactivate your own account.'}, status=400)
        
        user.is_active = not user.is_active
        user.save()
        return Response({
            'message': f"User '{user.username}' status updated.",
            'id': user.id,
            'is_active': user.is_active
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change authenticated user's password."""
    user = request.user
    old_password = request.data.get('old_password', '')
    new_password = request.data.get('new_password', '')
    confirm_password = request.data.get('confirm_password', '')

    if not old_password or not new_password or not confirm_password:
        return Response({'error': 'Old password, new password, and confirmation are required.'}, status=400)

    if not user.check_password(old_password):
        return Response({'error': 'Old password is incorrect.'}, status=400)

    if new_password != confirm_password:
        return Response({'error': 'New password and confirmation do not match.'}, status=400)

    if len(new_password) < 4:
        return Response({'error': 'New password must be at least 4 characters long.'}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password changed successfully!'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Permanently delete authenticated user's account."""
    user = request.user
    user.delete()
    return Response({'message': 'Account deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
