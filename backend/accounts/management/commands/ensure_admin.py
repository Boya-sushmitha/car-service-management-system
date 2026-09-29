from django.core.management.base import BaseCommand

from accounts.bootstrap import ensure_default_admin


class Command(BaseCommand):
    help = 'Create or reset the admin user (username: admin, password: admin).'

    def handle(self, *args, **options):
        ensure_default_admin()
        self.stdout.write(self.style.SUCCESS('Admin login is ready: username=admin password=admin'))
