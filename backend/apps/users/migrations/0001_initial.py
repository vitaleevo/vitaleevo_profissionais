import uuid
from django.db import migrations, models
import apps.users.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='e-mail')),
                ('first_name', models.CharField(blank=True, max_length=80, verbose_name='nome')),
                ('last_name', models.CharField(blank=True, max_length=80, verbose_name='apelido')),
                ('phone', models.CharField(blank=True, max_length=20, verbose_name='telefone')),
                ('role', models.CharField(choices=[('admin', 'Administrador (acesso total)'), ('operator', 'Operador (conteúdo, cotações, catálogo)'), ('consultant', 'Consultor (leitura e cotações atribuídas)'), ('user', 'Utilizador registado (cliente)')], default='user', max_length=20, verbose_name='cargo')),
                ('permissions', models.JSONField(blank=True, default=list, verbose_name='capacidades')),
                ('is_staff', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'utilizador',
                'verbose_name_plural': 'utilizadores',
                'ordering': ['-created_at'],
            },
            managers=[
                ('objects', apps.users.models.UserManager()),
            ],
        ),
    ]
