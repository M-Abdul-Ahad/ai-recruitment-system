from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resumes', '0006_resume_ai_recommended_certifications'),
    ]

    operations = [
        migrations.AddField(
            model_name='resume',
            name='file_hash',
            field=models.CharField(
                blank=True,
                db_index=True,
                help_text='SHA-256 hex digest of the uploaded file, used for duplicate detection.',
                max_length=64,
                null=True,
            ),
        ),
    ]
