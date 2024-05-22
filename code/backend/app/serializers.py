from rest_framework import serializers
from .models import *

class CustomUserModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUserModel
        fields = [
            "userID",
            "username",
            "email",
            "password",
        ]
    def create(self, validated_data):
        user = CustomUserModel.objects.create_user(
            validated_data["username"],
            validated_data["email"],
            validated_data["password"],
        )
        return user
        
class UserFileSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(
        slug_field='email',
        queryset=CustomUserModel.objects.all()
    )
    class Meta:
        model = UserFileModel
        fields = "__all__"

class FileAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileAccessModel
        fields = "__all__"

class ReferenceLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferenceLinkModel
        fields = "__all__"