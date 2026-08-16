#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

output_file="${1:-${PROFISSIONAIS_MANUAL_QA_FILE:-tmp/staging-manual-qa/manual-qa-checklist.md}}"
base_url="${PROFISSIONAIS_MANUAL_QA_BASE_URL:-${PROFISSIONAIS_SCREENSHOT_BASE_URL:-${FRONTEND_PUBLIC_BASE_URL:-https://profiangola.ao}}}"
release_id="${PROFISSIONAIS_RELEASE_ID:-staging-manual}"
tester="${PROFISSIONAIS_MANUAL_QA_TESTER:-PENDENTE}"
overwrite="${PROFISSIONAIS_MANUAL_QA_OVERWRITE:-false}"

if [[ -e "$output_file" && "$overwrite" != "true" ]]; then
  printf "SKIP checklist manual ja existe: %s\n" "$output_file"
  exit 0
fi

mkdir -p "$(dirname "$output_file")"

cat >"$output_file" <<EOF
# QA Manual de Staging - Profissionais

Base URL: ${base_url}
Release: ${release_id}
Testador: ${tester}
Gerado em UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Resultado final: PENDENTE
Data/hora final: PENDENTE
Evidencias anexadas: PENDENTE

## Regra de aprovacao

Este checklist fecha o gate "browser manual no dominio real". Para aprovar,
marque todos os itens com \`[x]\`, preencha os campos pendentes acima e altere
\`Resultado final\` para \`APROVADO\`. Depois rode:

\`\`\`bash
bash scripts/check_staging_manual_qa_profissionais.sh ${output_file}
\`\`\`

## Preparacao

- [ ] Abrir o dominio em janela anonima ou perfil limpo.
- [ ] Confirmar que o ambiente usa dados de staging/demo, sem dados reais de clientes.
- [ ] Confirmar que o certificado HTTPS aparece valido no navegador.
- [ ] Confirmar que nao ha erros fatais no console do navegador durante a navegacao principal.
- [ ] Confirmar que logout limpa acesso a rotas protegidas ao usar voltar/recarregar.

## Publico

- [ ] \`${base_url}/\` abre com header publico limpo e sem sidebar interna.
- [ ] \`${base_url}/servicos\` mostra categorias/servicos com copy clara para Angola.
- [ ] \`${base_url}/como-funciona\` explica cliente, profissional e operacao sem linguagem tecnica excessiva.
- [ ] \`${base_url}/confianca\` comunica seguranca, verificacao e criterios de qualidade.
- [ ] \`${base_url}/ajuda\` mostra FAQ real e dados de suporte.
- [ ] \`${base_url}/demo\` permite entender o fluxo ponta a ponta sem explicacao externa.
- [ ] Rotas publicas em 320px nao tem overflow horizontal nem texto cortado.

## Rotas protegidas sem sessao

- [ ] \`${base_url}/pedidos\` sem sessao nao mostra dashboard/sidebar interna.
- [ ] \`${base_url}/conta\` sem sessao nao mostra dados privados.
- [ ] \`${base_url}/profissional\` sem sessao nao mostra area profissional.
- [ ] \`${base_url}/profissional/vagas\` sem sessao nao mostra vagas internas.
- [ ] \`${base_url}/operacoes\` sem sessao nao mostra operacao/admin.
- [ ] \`${base_url}/operacoes/profissionais\` sem sessao nao mostra rede profissional.

## Cliente autenticado

- [ ] Cliente consegue entrar com credenciais de staging.
- [ ] Cliente ve dashboard/area de pedidos com estados vazios bem escritos quando aplicavel.
- [ ] Cliente cria um pedido novo com categoria, descricao, localizacao e urgencia.
- [ ] Cliente ve o pedido criado na lista/historico.
- [ ] Cliente acompanha o estado do pedido apos acao da operacao.
- [ ] Cliente nao ve notas internas, custos internos, documentos de profissionais ou dados de operacao.
- [ ] Cliente consegue sair da conta e perde acesso a rotas protegidas.

## Operacao/admin

- [ ] Operador/admin consegue entrar com credenciais de staging.
- [ ] Dashboard mostra metricas uteis para trabalho diario.
- [ ] Lista de pedidos permite identificar prioridade, estado, categoria, provincia e urgencia.
- [ ] Operador abre um pedido e ve candidatos/matching quando existirem.
- [ ] Operador atribui profissional ao pedido de teste.
- [ ] Rede profissional mostra status, documentos e notas internas sem quebrar layout.
- [ ] Revisao documental permite aprovar/rejeitar documento de staging ou visualizar estado ja revisado.
- [ ] Acoes importantes aparecem em logs/auditoria ou estado operacional verificavel.
- [ ] Operacao em mobile/tablet permanece utilizavel sem sobreposicoes graves.

## Profissional autenticado

- [ ] Profissional consegue entrar com credenciais de staging.
- [ ] Profissional ve vagas/servicos atribuidos ou disponiveis.
- [ ] Profissional abre uma vaga/servico e entende proximo passo operacional.
- [ ] Profissional ve carteira com valores/estados coerentes ou estado vazio claro.
- [ ] Profissional ve historico sem dados indevidos de outros profissionais.
- [ ] Profissional consegue revisar cadastro/documentos.
- [ ] Profissional nao ve painel admin, notas internas de operacao nem dados financeiros internos.

## Responsivo

- [ ] Desktop 1440px: navegacao, tabelas e dashboards estao alinhados.
- [ ] Tablet 768px: listas e formularios continuam legiveis.
- [ ] Mobile 320px: sem overflow horizontal nas rotas principais.
- [ ] Botoes principais mantem tamanho tocavel e texto sem corte.
- [ ] Estados de loading, erro, sucesso e vazio aparecem com copy clara quando simulados ou observados.

## Evidencias obrigatorias

- [ ] Smoke remoto publico passou contra o dominio real.
- [ ] Smoke remoto autenticado passou com cliente de staging.
- [ ] Preflight remoto passou para DNS, TLS, headers e cookies.
- [ ] Screenshots seguros foram gerados para publico, cliente, profissional e operacao.
- [ ] Caminho das evidencias foi preenchido no topo deste arquivo.

## Observacoes

- Use este espaco para anotar falhas, ajustes aceitos ou decisoes de release.
- Se qualquer item acima nao puder ser validado, mantenha \`Resultado final:
  PENDENTE\` e registre o bloqueio aqui.
EOF

printf "OK checklist manual criado em %s\n" "$output_file"
