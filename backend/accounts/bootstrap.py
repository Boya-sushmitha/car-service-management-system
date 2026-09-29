from django.contrib.auth.models import User


def ensure_default_admin():
    """Create or reset the demo admin account (username/password: admin)."""
    user, _created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@localhost',
            'first_name': 'Admin',
            'last_name': 'User',
        },
    )
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.set_password('admin')
    user.save()
    return user
