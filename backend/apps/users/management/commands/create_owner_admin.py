"""Comando Django para criar/atualizar o utilizador superadministrador do dono."""
import os
from django.core.management.base import BaseCommand, CommandError
from apps.users.models import User
from apps.core.enums import StaffRole

class Command(BaseCommand):
    help = "Cria ou atualiza o Superusuário Administrador Principal do Dono"

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            default=os.environ.get("ADMIN_EMAIL", "negociosvitaleevo@gmail.com"),
            help="E-mail do administrador principal",
        )
        parser.add_argument(
            "--password",
            type=str,
            default=os.environ.get("ADMIN_PASSWORD", "Vitaleevo@2026!Admin"),
            help="Senha do administrador principal",
        )
        parser.add_argument(
            "--first-name",
            type=str,
            default="Admin",
            help="Primeiro nome",
        )
        parser.add_argument(
            "--last-name",
            type=str,
            default="Vitaleevo",
            help="Último nome",
        )

    def handle(self, *args, **options):
        email = options["email"]
        password = options["password"]
        first_name = options["first_name"]
        last_name = options["last_name"]

        if not password:
            raise CommandError("ADMIN_PASSWORD é obrigatório para criar ou atualizar o superusuário.")

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
                "role": StaffRole.ADMIN,
            },
        )

        user.first_name = first_name
        user.last_name = last_name
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.role = StaffRole.ADMIN
        user.set_password(password)
        user.save()

        action = "criado" if created else "atualizado"
        self.stdout.write(
            self.style.SUCCESS(
                f"Superusuário Administrador [{email}] {action} com sucesso!"
            )
        )
