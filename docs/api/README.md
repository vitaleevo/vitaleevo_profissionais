# Conexao API Contracts

Este diretorio e a fonte de verdade para o frontend Next.js.

- `openapi.yaml`: contrato HTTP da API v1.
- Todas as rotas protegidas usam sessao Rails por cookie HttpOnly.
- Mutacoes com cookie de sessao devem enviar `X-CSRF-Token`.
- O frontend deve chamar `GET /api/v1/session/csrf` antes de login/logout/mutacoes com cookie.
- O frontend nao deve confiar em regras de permissao locais; autorizacao real fica no Rails via Pundit.

Convencoes:

- Respostas de sucesso usam `{ "data": ... }`.
- Respostas de erro usam `{ "error": { "code": "...", "message": "..." } }`.
- Valores monetarios sao sempre em centavos de kwanza (`*_cents`).
- Datas usam ISO 8601.
- Dados sensiveis de contacto e coordenadas so devem aparecer para perfis autorizados.
