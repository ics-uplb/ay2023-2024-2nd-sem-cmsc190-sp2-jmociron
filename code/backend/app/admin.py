from django.contrib import admin
from .models import *

class FileModelAdmin(admin.ModelAdmin):
    list_display = ("name", "organism", "file_type", "created_at")
    search_fields = ("name",)
    list_per_page = 10

class UserModelAdmin(admin.ModelAdmin):
    list_display = ("username", "email")
    search_fields = ("email",)
    list_per_page = 10

# Register your models here.
admin.site.register(CustomUserModel, UserModelAdmin)
admin.site.register(UserFileModel, FileModelAdmin)