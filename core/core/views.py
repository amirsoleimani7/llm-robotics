from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from .models import Conversation,Message
from .serializers import ConversationSerilizer, MessageSerializer
from rest_framework.decorators import api_view
from .utils.create_llm import agent

@api_view(['GET', 'POST'])
def handle_prompt(request):
    
    if request.method == 'GET':
        tests = Conversation.objects.all()
        serializers = ConversationSerilizer(tests, many=True)
        return JsonResponse(serializers.data, safe=False)

    if request.method == 'POST':
        serializer = ConversationSerilizer(data=request.data)

        if serializer.is_valid():
            # serializer.save()
            prompt = request.data['prompt']
            response = agent.process_command(prompt)
            print(response)

            return Response(response, status=status.HTTP_201_CREATED)
        