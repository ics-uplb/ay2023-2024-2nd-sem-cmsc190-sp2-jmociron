from rest_framework.permissions import BasePermission
from .models import *

class IsOwner(BasePermission):
    def has_object_permission(self, request, view, object):
        user = CustomUserModel.objects.get(userID=request.headers.get('User-ID'))
        return object.user == user
    
class HasAccess(BasePermission):
    def has_object_permission(self, request, view, object):
        user = CustomUserModel.objects.get(userID=request.headers.get('User-ID'))
        if object.user == user: # skip checking access if user is the owner
            return True
        try:
            file_access = FileAccessModel.objects.get(file=object.id, accessor=user)
            return True
        except FileAccessModel.DoesNotExist:
            return False