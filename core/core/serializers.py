from rest_framework import serializers
from .models import Conversation ,Message,User

class ConversationSerilizer(serializers.ModelSerializer):  
    class Meta:
        model = Conversation
        fields = ['conversation_id', 'created_at' , 'lastedited_at','is_pinned']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id' , 'name' ,'profile_picture']
