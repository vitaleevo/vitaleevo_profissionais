"""Ambiente de desenvolvimento: ferramentas locais, sem hardening."""
from .base import *  # noqa: F401,F403

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Executa tarefas em processo (sem precisar de Redis/worker local).
RQ_ASYNC = False

# E-mail impresso na consola.
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"