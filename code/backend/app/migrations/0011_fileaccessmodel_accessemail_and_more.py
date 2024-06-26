# Generated by Django 5.0.1 on 2024-04-14 09:05

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0010_rename_shareid_fileaccessmodel_accessid_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='fileaccessmodel',
            name='accessEmail',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, to_field='email'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='userfilemodel',
            name='description',
            field=models.TextField(blank=True),
        ),
    ]
