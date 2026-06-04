from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from rest_framework import status
from .models import Conversation, Message
from .serializers import ConversationSerilizer, MessageSerializer
from rest_framework.decorators import api_view
from .utils.create_llm import agent


@api_view(['GET', 'POST'])
def handle_prompt(request):
    if request.method == 'POST':
        try:
            print("we are in the main")
            prompt_conversation = Conversation.objects.get(
                conversation_id=request.data['conversation']['conversation_id'])
            prompt = request.data['content']
            llm_response = agent.process_command(prompt)
            new_response = Message(
                conversation=prompt_conversation, role="assistant", content=llm_response)
            new_response.save()

            # converting and sending the created message to the reactapp
            serialized_response = MessageSerializer(new_response)
            return Response(serialized_response.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"we are in the exception : " , e)
            return Response("error", status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def get_converastions(request):
    # this functions will handle differnet kinds of GETs (based on )
    if request.method == 'GET' and request.query_params.get("commnad") == "get_conversations":
        all_conversations = Conversation.objects.all()
        serializers = ConversationSerilizer(all_conversations, many=True)
        print(serializers)
        return JsonResponse(serializers.data, safe=False)


@api_view(['GET'])
def get_conversation_chats(request, pk):
    if request.method == 'GET':
        print(f"primary key is : {pk}")
        try:
            query_conv = Conversation.objects.get(conversation_id=pk)
            messages = Message.objects.filter(conversation=query_conv)
            serialzied_Data = MessageSerializer(messages, many=True)
            return JsonResponse(serialzied_Data.data, safe=False)

        except ObjectDoesNotExist:
            print("object does not exist!")
            Response("object does not exist", status=status.HTTP_404_NOT_FOUND)

        return Response("somehing", status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
def update_conversation(request, conversation_id):
    if request.method == "PUT" and request.data['command'] == 'pin-conversation':
        try:
            to_pin_conversation = Conversation.objects.get(
                conversation_id=conversation_id)
            to_pin_conversation.is_pinned = True
            to_pin_conversation.save()
            return Response("", status=status.HTTP_200_OK)

        except ObjectDoesNotExist:
            return Response("", status=status.HTTP_404_NOT_FOUND)

    if request.method == "PUT" and request.data['command'] == 'unpin-conversation':
        try:
            to_pin_conversation = Conversation.objects.get(
                conversation_id=conversation_id)
            to_pin_conversation.is_pinned = False
            to_pin_conversation.save()
            return Response("", status=status.HTTP_200_OK)

        except ObjectDoesNotExist:
            return Response("", status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def add_new_chat(request):

    if request.method == 'POST' and request.data['command'] == "new_chat":
        created_conversation = Conversation()
        created_conversation.save()
        serialized_conv = ConversationSerilizer(created_conversation)
        return Response(serialized_conv.data, status=status.HTTP_201_CREATED)

    if request.method == 'POST' and request.data['command'] == "new_message":
        print(request.data)
        current_conv = Conversation.objects.get(
            conversation_id=request.data['conversaion']['conversation_id'])
        new_msg = Message(conversation=current_conv,
                          role=request.data['role'], content=request.data['content'])
        new_msg.save()
        msg_serial = MessageSerializer(new_msg)

        return Response(msg_serial.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def delete_conversation(request, conversation_id):
    if request.method == 'DELETE':
        try:
            query_delete = Conversation.objects.get(
                conversation_id=conversation_id)
            query_delete.delete()
            return Response("ok nigga im gonna remove this object", status=status.HTTP_204_NO_CONTENT)
        except:
            return Response("some error", status=status.HTTP_404_NOT_FOUND)
