# Generated by Django 5.0.1 on 2024-04-09 13:27

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_userreadsmodel_userid'),
    ]

    operations = [
        migrations.CreateModel(
            name='FileModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('organism', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('bam_file', models.FileField(upload_to='')),
                ('index_file', models.FileField(upload_to='')),
                ('slug', models.SlugField(blank=True, null=True)),
                ('file_type', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('userID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('-created_at',),
            },
        ),
        migrations.CreateModel(
            name='FileAccessModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ownerID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ownerID', to=settings.AUTH_USER_MODEL)),
                ('shareID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='shareID', to=settings.AUTH_USER_MODEL)),
                ('fileID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.filemodel')),
            ],
        ),
    ]
