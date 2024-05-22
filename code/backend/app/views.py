import os
import mimetypes
from django.http import FileResponse, JsonResponse
from rest_framework import generics, viewsets, renderers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *
from .permissions import *
from django.conf import settings

# Create your views here.
class GoogleLogin(SocialLoginView): # if you want to use Authorization Code Grant, use this      
    authentication_classes = []
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://127.0.0.1:3000/api/auth/callback/google" # frontend URL
    client_class = OAuth2Client

    def post(self, request):
        self.request = request
        self.serializer = self.get_serializer(data = request.data)
        self.serializer.is_valid(raise_exception = True)
        self.login()
        response_data = {
            "userID": self.user.userID,
            "access_token": self.token.key
        }
        return JsonResponse(response_data)

class PassthroughRenderer(renderers.BaseRenderer):
    # return data as-is. View should supply a Response.
    media_type = 'text/plain'
    format = ''
    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data

class AllFilesViewSet(viewsets.ModelViewSet):

    serializer_class = UserFileSerializer
    permission_classes = [HasAccess]

    def create(self, request):
        data = request.data
        user = CustomUserModel.objects.get(userID=data["userID"])
        name = data["name"]
    
        if UserFileModel.objects.filter(name = name).exists():
            name = name + " (" + str(UserFileModel.objects.filter(name__contains = name).count()) + ")"

        if data["file_type"] == "reference":
            file_object = UserFileModel.objects.create(
                name = name,
                organism = data["organism"],
                file_type = data["file_type"],
                main_file = data["main_file"],
                index_file = data["index_file"],
                user = user
            )
        else:
            if len(data["reffileID"]) != 0:
                file_object = UserFileModel.objects.create(
                name = name,
                organism = data["organism"],
                file_type = data["file_type"],
                main_file = data["main_file"],
                index_file = data["index_file"],
                reference_file = UserFileModel.objects.get(id=data["reffileID"]),
                user = user
                )
            else:
                file_object = UserFileModel.objects.create(
                name = name,
                organism = data["organism"],
                file_type = data["file_type"],
                main_file = data["main_file"],
                index_file = data["index_file"],
                reference_link = ReferenceLinkModel.objects.get(id=data["reflinkID"]),
                user = user
                )

        file_object.save()
        serializer = UserFileSerializer(file_object)
        return Response(serializer.data)

    def get_queryset(self):
        if self.action == 'list':
            return UserFileModel.objects.all().values('id', 'file_type', 'name', 'organism', 'slug')
        else:
            return UserFileModel.objects.all()

    def get_file_extension(self, name):
        return os.path.splitext(name)[1]

    @action(methods=['get'], detail=True, renderer_classes=(PassthroughRenderer,))
    def download(self, request, *args, **kwargs):
        instance = self.get_object()
               
        file_handle = instance.main_file.open()
        content_type, encoding = mimetypes.guess_type(instance.main_file.path)
        
        response = FileResponse(file_handle, content_type=content_type)
        response["Content-Disposition"] = f"attachment; filename={file_handle}"
        
        return response

class UserReferenceViewSet(generics.ListAPIView):
    model = UserFileModel
    serializer_class = UserFileSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        userID = self.kwargs['userID']
        queryset = self.model.objects.filter(user=userID, file_type="reference")
        return queryset.order_by('-created_at')
    
class UserReadsViewSet(generics.ListAPIView):
    model = UserFileModel
    serializer_class = UserFileSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        userID = self.kwargs['userID']
        queryset = self.model.objects.filter(user=userID, file_type="reads")
        return queryset.order_by('-created_at')

class FileAccessViewSet(viewsets.ViewSet):
    queryset = FileAccessModel.objects.all()
    serializer_class = FileAccessSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):        
        access_data = request.data

        owner = CustomUserModel.objects.get(userID=access_data["ownerID"])
        file = UserFileModel.objects.get(id=access_data["fileID"])

        try: # checks validity of email inputted
            accessor = CustomUserModel.objects.get(email=access_data["accessEmail"])
            if owner == accessor: 
                return Response({"message": "You own this file."}, status=status.HTTP_400_BAD_REQUEST)                   
        except CustomUserModel.DoesNotExist:
            return Response({"message": "User does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        
        # check if file is already shared    
        if FileAccessModel.objects.filter(accessor = accessor, owner = owner, file = file).exists():
            return Response({"message": "File is already shared to this user."}, status=status.HTTP_400_BAD_REQUEST)
        
        # disable sharing if user inputted does not own or have access to the reference file
        if file.file_type == "reads" and file.reference_file:
            # if accessor does not own nor have access to the reference, reads cannot be shared
            if file.reference_file.user != accessor and not FileAccessModel.objects.filter(accessor = accessor, file = file.reference_file).exists():
                return Response({"message": "User does not have access to the reference file."}, status=status.HTTP_400_BAD_REQUEST)

        access_object = FileAccessModel.objects.create(
            accessor = accessor,
            owner = owner,
            file = file
        )
        access_object.save()
        serializer = FileAccessSerializer(access_object)
        return Response(serializer.data)

class SharedReferencesViewSet(generics.ListAPIView):
    model = FileAccessModel
    serializer_class = UserFileSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        file_list = list(self.model.objects.filter(accessor=self.kwargs['accessID']).values_list('file', flat=True))
        queryset = UserFileModel.objects.filter(id__in=file_list, file_type="reference")
        return queryset
    
class SharedReadsViewSet(generics.ListAPIView):
    model = FileAccessModel
    serializer_class = UserFileSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        file_list = list(self.model.objects.filter(accessor=self.kwargs['accessID']).values_list('file', flat=True))
        queryset = UserFileModel.objects.filter(id__in=file_list, file_type="reads")
        return queryset

class SearchReferenceFileViewSet(generics.ListAPIView):
    model = UserFileModel
    serializer_class = UserFileSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        userID = self.kwargs['userID']
        organism = self.kwargs['organism']
        queryset = self.model.objects.filter(user=userID, organism__icontains=organism, file_type="reference")
        return queryset    

class SearchSharedReferencesViewSet(generics.ListAPIView):
    model = FileAccessModel
    serializer_class = UserFileSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        accessID = self.kwargs['accessID']
        organism = self.kwargs['organism']
        file_list = list(self.model.objects.filter(accessor=accessID).values_list('file', flat=True))
        queryset = UserFileModel.objects.filter(id__in=file_list, organism__icontains=organism, file_type="reference")
        return queryset

class SearchLibraryViewSet(generics.ListAPIView):
    model = ReferenceLinkModel
    serializer_class = ReferenceLinkSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        organism = self.kwargs['organism']
        queryset = self.model.objects.filter(organism__icontains=organism)
        return queryset
    
class ReferenceLinkViewSet(generics.ListAPIView):
    model = ReferenceLinkModel
    serializer_class = ReferenceLinkSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        link_id = self.kwargs['id']
        queryset = self.model.objects.filter(id=link_id)
        return queryset   

class AllReferenceLinksViewSet(viewsets.ModelViewSet):
    queryset = ReferenceLinkModel.objects.all().order_by('name')
    serializer_class = ReferenceLinkSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

