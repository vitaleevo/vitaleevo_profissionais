export const LOGIN_ERROR_MESSAGES = {
  invalid_request: "Pedido de login invalido.",
  missing_credentials: "Preencha email e senha.",
  invalid_credentials: "Email ou senha invalidos.",
  rate_limited: "Muitas tentativas. Tente novamente dentro de instantes.",
  session_failed: "Nao foi possivel preparar a sessao segura.",
} as const;

export type LoginErrorCode = keyof typeof LOGIN_ERROR_MESSAGES;

export function loginErrorMessage(code?: string) {
  if (!code || !isLoginErrorCode(code)) {
    return undefined;
  }

  return LOGIN_ERROR_MESSAGES[code];
}

function isLoginErrorCode(code: string): code is LoginErrorCode {
  return Object.hasOwn(LOGIN_ERROR_MESSAGES, code);
}
