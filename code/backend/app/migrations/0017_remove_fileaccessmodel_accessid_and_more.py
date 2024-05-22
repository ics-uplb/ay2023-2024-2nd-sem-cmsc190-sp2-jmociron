# Generated by Django 5.0.1 on 2024-04-30 09:07

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0016_rename_userid_userfilemodel_user_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='fileaccessmodel',
            name='accessID',
        ),
        migrations.RemoveField(
            model_name='fileaccessmodel',
            name='ownerID',
        ),
        migrations.AddField(
            model_name='fileaccessmodel',
            name='accessor',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, related_name='accessor', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='fileaccessmodel',
            name='owner',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, related_name='owner', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
