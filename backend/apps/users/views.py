"""Endpoints de autenticação e perfil."""
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import EmailTokenObtainPairSerializer, RegisterSerializer, UserSerializer


class LoginView(TokenObtainPairView):
    """POST /auth/login/ — autenticação JWT com e-mail e password."""

    serializer_class = EmailTokenObtainPairSerializer
    throttle_scope = "auth"


class RegisterView(generics.CreateAPIView):
    """POST /auth/register/ — cria conta de cliente e devolve o perfil."""

    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    throttle_scope = "auth"


class MeView(generics.RetrieveAPIView):
    """GET /auth/me/ — perfil do utilizador autenticado + capacidades."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user