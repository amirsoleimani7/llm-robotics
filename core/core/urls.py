from django.urls import path, include
from django.contrib import admin
from . import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("handle_prompt", views.handle_prompt),
    path("make_chat", views.handle_add_chat),
    path("get_conversation/<int:pk>", views.get_conversation_chats)
]
