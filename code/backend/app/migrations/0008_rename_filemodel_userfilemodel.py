# Generated by Django 5.0.1 on 2024-04-09 13:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0007_rename_bam_file_filemodel_main_file'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='FileModel',
            new_name='UserFileModel',
        ),
    ]
