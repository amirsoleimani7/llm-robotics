from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from rest_framework import status
from .models import Conversation, Message
from .serializers import ConversationSerilizer, MessageSerializer
from rest_framework.decorators import api_view

# from .utils.create_llm import agent


@api_view(['GET', 'POST'])
def get_converastions(request):
    # this functions will handle differnet kinds of GETs (based on )
    if request.method == 'GET' and request.query_params.get("commnad") == "get_conversations":
        all_conversations = Conversation.objects.all()
        serializers = ConversationSerilizer(all_conversations, many=True)
        return JsonResponse(serializers.data, safe=False)


@api_view(['GET'])
def get_conversation_chats(request, pk):
    if request.method == 'GET':
        try:
            query_conv = Conversation.objects.get(conversation_id=pk)
            messages = Message.objects.filter(conversation=query_conv)
            serialzied_Data = MessageSerializer(messages, many=True)
            return JsonResponse(serialzied_Data.data, safe=False)

        except ObjectDoesNotExist:
            print("object does not exist!")
            Response("object does not exist", status=status.HTTP_404_NOT_FOUND)

        return Response("somehing", status=status.HTTP_200_OK)


@api_view(['POST'])
def add_new_chat(request):

    if request.method == 'POST' and request.data['command'] == "new_chat":
        created_conversation = Conversation()
        created_conversation.save()
        serialized_conv = ConversationSerilizer(created_conversation)
        return Response(serialized_conv.data, status=status.HTTP_201_CREATED)
    

    if request.method == 'POST' and request.data['command'] == "new_message":
        print(request.data)
        current_conv = Conversation.objects.get(conversation_id=request.data['conversaion']['conversation_id'])
        new_msg = Message(conversation=current_conv,role=request.data['role'],content=request.data['content'])
        new_msg.save()
        msg_serial =  MessageSerializer(new_msg);
         
        
        return Response(msg_serial.data, status=status.HTTP_201_CREATED)
    
@api_view(['DELETE'])
def delete_conversation(request, conversation_id):
    if request.method == 'DELETE':
        try :
            query_delete = Conversation.objects.get(conversation_id=conversation_id)
            query_delete.delete()
            return Response("ok nigga im gonna remove this object", status=status.HTTP_204_NO_CONTENT)
        except:
            return Response("some error", status=status.HTTP_404_NOT_FOUND)
            