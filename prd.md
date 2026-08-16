PRD — Plataforma de Gestão e Intermediação de Profissionais Liberais
Produto SaaS Web baseado em Ruby on Rails
1. Visão Geral do Produto
Nome Temporário

ConectaPro

Objetivo

Construir uma plataforma web SaaS que permita:

cadastrar profissionais liberais
gerenciar disponibilidade
conectar clientes a profissionais
automatizar ordens de serviço
controlar pagamentos
gerir operações da empresa
escalar para múltiplas categorias de serviços

O sistema funcionará como:

marketplace de serviços
CRM operacional
ERP leve
sistema de dispatch/alocação
Problema

Atualmente, muitos clientes em Angola enfrentam:

dificuldade em encontrar profissionais confiáveis
falta de transparência
ausência de acompanhamento
pagamentos desorganizados
baixa confiança

Enquanto profissionais enfrentam:

dificuldade em conseguir clientes
baixa organização
ausência de agenda digital
falta de reputação online
dificuldade em receber pagamentos
Solução

Uma plataforma centralizada onde:

clientes solicitam serviços
sistema encontra profissionais adequados
empresa controla a operação
pagamentos são organizados
reputação e qualidade são monitoradas
Público-Alvo
Primário

Profissionais liberais:

eletricistas
canalizadores
médicos
enfermeiros
advogados
designers
técnicos
motoristas
consultores
Secundário

Clientes:

pessoas físicas
pequenas empresas
empresas médias
Modelo de Negócio
Receita
Comissão

10%–25% por serviço

Assinatura

Plano mensal para profissionais

Taxas

Taxa de urgência
Taxa de prioridade

SaaS B2B

Licença para empresas

2. Objetivos do Produto
Objetivos de Negócio
Curto Prazo
lançar MVP
validar mercado
conseguir primeiros clientes
Médio Prazo
automatizar operações
expandir categorias
Longo Prazo
tornar-se referência nacional
tornar-se referencia nacional em servicos profissionais
Objetivos Técnicos
arquitetura escalável
modularidade
API-first
multiempresa
alta disponibilidade
3. Funcionalidades Principais
3.1 Gestão de Usuários
Tipos de Usuário
Admin

Controle total

Operador

Gestão operacional

Profissional

Prestador de serviços

Cliente

Consumidor

Funcionalidades
Cadastro
nome
telefone
email
senha
documentos
Login
email/senha
OTP futuramente
Recuperação de senha
Gestão de perfil
3.2 Gestão de Profissionais
Cadastro Profissional

Campos:

nome
especialidade
documentos
biografia
localização
experiência
preço/hora
disponibilidade
Status
online
offline
ocupado
suspenso
Documentos

Upload:

BI
certificados
licenças
Avaliações

Métricas:

qualidade
pontualidade
comunicação
3.3 Gestão de Clientes
Funcionalidades
cadastro
histórico
pedidos
favoritos
avaliações
pagamentos
3.4 Catálogo de Serviços
Categorias

Exemplo:

saúde
manutenção
construção
TI
limpeza
Serviço

Campos:

nome
descrição
preço base
duração média
urgência
3.5 Solicitação de Serviço
Fluxo

Cliente:

escolhe categoria
descreve problema
define localização
seleciona horário
envia pedido
Campos
descrição
fotos
localização
urgência
orçamento
3.6 Matching Inteligente
Objetivo

Encontrar profissional ideal automaticamente.

Critérios
distância
avaliação
disponibilidade
preço
especialidade
histórico
Score
score =
(avaliacao * 0.4) +
(proximidade * 0.3) +
(disponibilidade * 0.2) +
(experiencia * 0.1)
3.7 Ordens de Serviço
Estados
pending
assigned
accepted
in_progress
completed
cancelled
disputed
Funcionalidades
atribuição
acompanhamento
histórico
anexos
observações
3.8 Agenda
Funcionalidades
calendário
horários disponíveis
bloqueios
conflitos
3.9 Pagamentos
Métodos
Angola
Multicaixa Express
Unitel Money
Referência
Internacional
Stripe
PayPal
Fluxo
Cliente paga
↓
Plataforma retém comissão
↓
Profissional recebe saldo
3.10 Sistema Financeiro
Funcionalidades
carteira
extrato
comissões
reembolsos
repasses
3.11 Chat em Tempo Real
Funcionalidades
mensagens
envio de fotos
notificações
histórico
3.12 Notificações
Canais
email
SMS
push
WhatsApp futuramente
Eventos
novo pedido
aceite
cancelamento
pagamento
3.13 Avaliações
Cliente avalia profissional

Critérios:

qualidade
tempo
atendimento
3.14 Dashboard Administrativo
KPIs
receita
pedidos
profissionais ativos
cancelamentos
crescimento
Relatórios
financeiro
produtividade
categorias
retenção
4. Requisitos Funcionais
RF001

Sistema deve permitir cadastro de usuários.

RF002

Sistema deve permitir login autenticado.

RF003

Sistema deve permitir upload de documentos.

RF004

Sistema deve permitir criação de pedidos.

RF005

Sistema deve realizar matching automático.

RF006

Sistema deve permitir gestão de agenda.

RF007

Sistema deve registrar pagamentos.

RF008

Sistema deve gerar ordens de serviço.

RF009

Sistema deve permitir avaliações.

RF010

Sistema deve enviar notificações.

5. Requisitos Não Funcionais
Performance
resposta < 300ms
suporte inicial a 10 mil usuários
Segurança
JWT/session auth
criptografia
LGPD/GDPR-ready
Escalabilidade
horizontal scaling
background jobs
Disponibilidade
uptime 99.9%
Backup
backups automáticos diários
6. Arquitetura Técnica
Backend
Framework

Ruby on Rails 8

Banco

PostgreSQL

Cache

Redis

Background Jobs

Sidekiq

WebSockets

ActionCable

Frontend
Opção Inicial

Rails + Hotwire + Turbo

CSS

TailwindCSS

Infraestrutura
Hosting
Render
Railway
Storage

AWS S3 / Cloudflare R2

CDN

Cloudflare

7. Estrutura do Banco de Dados
Principais Tabelas
users
profiles
professionals
clients
services
categories
bookings
assignments
payments
wallets
reviews
notifications
messages
documents
availability_slots
transactions
Relacionamentos
User has_one Profile
Professional has_many Services
Client has_many Bookings
Booking belongs_to Professional
Booking has_many Payments
Professional has_many Reviews
8. API Design
REST Endpoints
Auth
/api/v1/auth/login
/api/v1/auth/register
/api/v1/auth/logout
Professionals
/api/v1/professionals
/api/v1/professionals/:id
Bookings
/api/v1/bookings
/api/v1/bookings/:id
9. Segurança
Autenticação

Devise + JWT

Permissões

Pundit

Proteções
rate limiting
CSRF
SQL injection
XSS
brute force
10. Estratégia de Deploy
Ambiente
Development

Local Docker

Staging

Render

Production

Render + PostgreSQL Managed

CI/CD
Ferramentas
GitHub Actions
Docker
11. Roadmap
Fase 1 — MVP
Duração

6–8 semanas

Features
auth
cadastro
profissionais
pedidos
matching básico
pagamentos simples
Fase 2
Features
chat
notificações
analytics
mobile responsive avançado
Fase 3
Features
IA
dispatch inteligente
geolocalização avançada
12. Métricas de Sucesso
KPIs
Negócio
GMV
receita
CAC
LTV
Produto
pedidos/dia
tempo médio
taxa de sucesso
Operacional
cancelamentos
SLA
retenção
13. Riscos
Operacionais
baixa adesão
fraude
cancelamentos
Técnicos
escalabilidade
integrações bancárias
Legais
contratos
responsabilidade civil
14. Futuro do Produto
Expansões
Mobile App
iOS
Android
IA
matching inteligente
previsão de demanda
precificação dinâmica
Marketplace Multiempresa

Cada empresa pode:

ter seus profissionais
controlar operações
usar white-label
15. Stack Recomendada Final
Backend

Ruby on Rails

Frontend

Hotwire + Tailwind

Banco

PostgreSQL

Queue

Redis + Sidekiq

Storage

Cloudflare R2

Infraestrutura

Render

Monitoramento
Sentry
NewRelic
Analytics
PostHog
Metabase
