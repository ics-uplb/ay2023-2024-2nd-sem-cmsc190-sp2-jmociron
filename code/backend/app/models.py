from django.db import models
from django.template.defaultfilters import slugify
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from uuid import uuid4
from auditlog.registry import auditlog

# Create your models here.
class CustomUserModelManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        user = self.model(
            username = username,
            email = self.normalize_email(email)
        )
        user.set_password(password)
        user.save(using = self._db)
        return user
    def create_superuser(self, username, email, password):
        user = self.create_user(
            username,
            email,
            password = password
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using = self._db)
        return user
    
class CustomUserModel(AbstractBaseUser, PermissionsMixin):
    userID = models.CharField(max_length = 16, default = uuid4, primary_key = True, editable = False)
    username = models.CharField(max_length = 100, unique = True, null = False, blank = False)
    email = models.EmailField(max_length = 100, unique = True, null = False, blank = False)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    active = models.BooleanField(default = True)
    is_staff = models.BooleanField(default = False)
    is_superuser = models.BooleanField(default = False)
    created_at = models.DateTimeField(auto_now_add = True, blank = True, null = True)
    updated_at = models.DateTimeField(auto_now = True)

    objects = CustomUserModelManager()

    class Meta:
        verbose_name = "Custom User"

class ReferenceLinkModel(models.Model):
    name = models.CharField(max_length = 100)
    genome = models.CharField(max_length = 100)
    organism = models.CharField(max_length = 200)
    fastaURL = models.URLField(max_length = 200)
    indexURL = models.URLField(max_length = 200)

class UserFileModel(models.Model):

    # File content:
    name = models.CharField(max_length = 100)
    organism = models.CharField(max_length = 100)
    main_file = models.FileField() # TODO: add file validation
    index_file = models.FileField()
    reference_file = models.ForeignKey("self", on_delete=models.CASCADE, blank = True, null = True)
    reference_link = models.ForeignKey(ReferenceLinkModel, on_delete=models.CASCADE, blank = True, null = True)

    # File information:
    user = models.ForeignKey(CustomUserModel, on_delete=models.CASCADE)
    file_type = models.CharField(max_length = 100)
    slug = models.SlugField(null = True, blank = True)
    created_at = models.DateTimeField(auto_now_add = True, blank = True, null = True)
    updated_at = models.DateTimeField(auto_now = True)

    class Meta:
        ordering = ("-created_at",)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):

        self.slug = slugify(self.name)       
        super().save(*args, **kwargs)

class FileAccessModel(models.Model):
    owner = models.ForeignKey(CustomUserModel, on_delete=models.CASCADE, related_name="owner")
    accessor = models.ForeignKey(CustomUserModel, on_delete=models.CASCADE, related_name="accessor")
    file = models.ForeignKey(UserFileModel, on_delete=models.CASCADE)

auditlog.register(CustomUserModel)
auditlog.register(UserFileModel)
auditlog.register(FileAccessModel)
