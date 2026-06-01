from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from .models import Conversation,Message
from .serializers import ConversationSerilizer, MessageSerializer
from rest_framework.decorators import api_view
# from .utils.create_llm import agent


@api_view(['GET', 'POST'])
def handle_prompt(request):
    
    # this functions will handle differnet kinds of GETs (based on ) 
    if request.method == 'GET' and request.query_params.get("commnad") == "get_conversations":
        all_conversations = Conversation.objects.all()
        serializers = ConversationSerilizer(all_conversations, many=True)
        return JsonResponse(serializers.data, safe=False)

    
    # if request.method == 'POST':
    #     serializer = ConversationSerilizer(data=request.data)

    #     if serializer.is_valid():
    #         # serializer.save()
    #         prompt = request.data['prompt']
    #         # response = agenct.process_command(prompt)
    #         # print(response)
            
    #         return Response(prompt, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def handle_add_chat(request):
    if request.method == 'POST':
        if request.data['command'] == "add_new":
            created_conversation = Conversation()
            created_conversation.save()
            conversation_id = created_conversation.conversation_id
            return Response(conversation_id, status=status.HTTP_201_CREATED)

        if request.data['command'] == "make_chat":
            

            conv_id = request.data['conv_id']
            conversation_ = Conversation.objects.get(conversation_id=conv_id)
            role = request.data['role']
            content = request.data['content']

            chat = Message(conversation=conversation_,role=role,content=content)
            
            chat.save()
            chat_id = chat.pk
            return Response(chat_id, status=status.HTTP_201_CREATED)
            

        # we have to make new chat
    