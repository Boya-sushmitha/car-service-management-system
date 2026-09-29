import sys

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        if any(cmd in sys.argv for cmd in ('migrate', 'makemigrations', 'collectstatic', 'test')):
            return
        try:
            from .bootstrap import ensure_default_admin
            ensure_default_admin()
        except Exception:
            # Tables may not exist yet (e.g. during first migrate).
            pass
