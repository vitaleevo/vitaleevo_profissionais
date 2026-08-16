import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AuditLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('action', models.CharField(max_length=80)),
                ('resource_type', models.CharField(max_length=80)),
                ('resource_id', models.CharField(blank=True, max_length=80)),
                ('details', models.JSONField(blank=True, default=dict)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='audit_logs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'registo de auditoria',
                'verbose_name_plural': 'registos de auditoria',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['resource_type', 'resource_id'], name='audit_audit_resourc_2a3aef_idx'),
                    models.Index(fields=['created_at'], name='audit_audit_created_2c1626_idx'),
                ],
            },
        ),
    ]
