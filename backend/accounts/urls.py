from django.urls import path
from .views import register, login_view, logout_view, me, user_list, toggle_user_status, change_password, delete_account

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('me/', me, name='me'),
    path('users/', user_list, name='user-list'),
    path('users/<int:user_id>/toggle-status/', toggle_user_status, name='toggle-user-status'),
    path('change-password/', change_password, name='change-password'),
    path('delete-account/', delete_account, name='delete-account'),
]
