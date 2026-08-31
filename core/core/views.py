import base64
from django.http import JsonResponse, FileResponse, Http404
from django.core.files.base import ContentFile
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from rest_framework import status
from .models import Conversation, Message, User
from .serializers import ConversationSerilizer, MessageSerializer, UserSerializer
from rest_framework.decorators import api_view
from .utils.create_llm import agent
from .utils.socket_client import send_commands_to_socket
import os

WEBOTS_RECORDINGS_DIR = "/home/amir/Desktop/projects/llm-robotics/webots-robot/scara_t6/scara_t6/controllers/scara_socket_server/webots_recordings"

@api_view(['GET', 'POST'])
def handle_prompt(request):
    if request.method == 'POST':
        try:
            prompt_conversation = Conversation.objects.get(
                conversation_id=request.data['conversation']['conversation_id'])
            prompt = request.data['content']
            llm_response = agent.process_command(prompt)

            if not llm_response or llm_response.startswith("System Error"):
                return Response(
                    {"detail": "LLM did not return a valid robot command.",
                        "llm_response": llm_response},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            new_response = Message(
                conversation=prompt_conversation, role="assistant", content=llm_response)

            # send commands to robot and capture returned video basename (if any)
            try:
                robot_execution = send_commands_to_socket(llm_response)
                execution_payload = {
                    "status": "success",
                    "commands": robot_execution,
                }

                # parse first command response for video filename format 'OK|basename'
                try:
                    if robot_execution and isinstance(robot_execution, list) and len(robot_execution) > 0:
                        first_resp = robot_execution[0].get('response', '')
                        if isinstance(first_resp, str) and '|' in first_resp:
                            parts = first_resp.split('|', 1)
                            if parts[0] == 'OK' and parts[1]:
                                new_response.video_url = parts[1]
                except Exception:
                    pass

            except Exception as socket_error:
                execution_payload = {
                    "status": "error",
                    "detail": str(socket_error),
                }

            new_response.save()

            # converting and sending the created message to the reactapp
            serialized_response = MessageSerializer(new_response)
            payload = dict(serialized_response.data)
            payload["robot_execution"] = execution_payload
            return Response(payload, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"we are in the exception : asdas", e)
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


# user codesc
@api_view(['POST', 'PUT'])
def update_user(request):

    if request.method == "PUT":
        if request.data['command'] == "change_name":
            try:
                user_object = User.objects.get(user_id="user")
                user_object.name = request.data['new_name']
                user_object.save()

                return Response("changed", status=status.HTTP_200_OK)

            except ObjectDoesNotExist:
                # make the default user, the user will be using that for the rest of time
                return Response("error", status=status.HTTP_204_NO_CONTENT)

        if request.data['command'] == "change_profile":
            try:
                user_object = User.objects.get(user_id="user")
                query_image = request.FILES['image']
                user_object.profile_picture = query_image
                user_object.save()
                serialized_user = UserSerializer(user_object)

                return Response(serialized_user.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response("something went wrong", status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_user(request):

    if request.method == "GET":
        try:
            user = User.objects.get(user_id="user")

            with user.profile_picture.open('rb') as image_file:
                encoded_string = base64.b64encode(
                    image_file.read()).decode('utf-8')

            format = user.profile_picture.name.split('.')[-1].lower()

            return Response({
                'image': encoded_string,
                'name': user.name,
                'format': format,
                'data_url': f'data:image/{format};base64,{encoded_string}'
            })

        except ObjectDoesNotExist:
            made_user = User(user_id="user", name="change this")
            made_user.save()

            with made_user.profile_picture.open('rb') as image_file:
                encoded_string = base64.b64encode(
                    image_file.read()).decode('utf-8')

            format = made_user.profile_picture.name.split('.')[-1].lower()

            return Response({
                'image': encoded_string,
                'name': made_user.name,
                'format': format,
                'data_url': f'data:image/{format};base64,{encoded_string}'
            })


@api_view(['GET'])
def serve_recording_video(request, filename):
    file_path = os.path.join(WEBOTS_RECORDINGS_DIR, filename)
    if not os.path.exists(file_path):
        raise Http404("Video not found")
    return FileResponse(open(file_path, "rb"), content_type="video/mp4")
