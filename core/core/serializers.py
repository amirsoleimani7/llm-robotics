from rest_framework import serializers
from .models import Conversation ,Message

class ConversationSerilizer(serializers.ModelSerializer):  
    class Meta:
        model = Conversation
        fields = ['conversation_id', 'created_at' , 'lastedited_at']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        mode = Message
        fields = ['conversation' , 'role' ,'created_at' , 'content']
