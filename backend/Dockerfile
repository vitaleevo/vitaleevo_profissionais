FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.production

WORKDIR /app

# Dependências primeiro (cache eficiente do Docker).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 80

# Ponto de entrada padrão: web (gunicorn).
CMD ["sh", "-c", "python manage.py makemigrations --noinput && python manage.py migrate --noinput && python manage.py collectstatic --noinput && python manage.py create_owner_admin && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-80} --workers 2 --timeout 60"]