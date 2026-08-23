from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0003_jobapplication_applicant_nullable_source_type_tags'),
        ('resumes', '0007_resume_file_hash'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='jobapplication',
            constraint=models.UniqueConstraint(
                condition=models.Q(resume__isnull=False),
                fields=['job', 'resume'],
                name='unique_job_resume',
            ),
        ),
    ]
