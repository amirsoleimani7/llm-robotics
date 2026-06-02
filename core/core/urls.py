from django.urls import path, include
from django.contrib import admin
from . import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("get_converastions", views.get_converastions),
    path("make_chat", views.add_new_chat),
    path("get_conversation/<int:pk>", views.get_conversation_chats),
    path("delete_conversation/<int:conversation_id>", views.delete_conversation)
]
