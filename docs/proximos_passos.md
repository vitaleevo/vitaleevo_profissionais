# Proximos Passos - Conexao

Baseado no PRD do `stitch_modular_service_hub.zip` e nas telas de referencia Stitch/Holy Conexao.

## Fase 1 - Marketplace cliente

### Story 1: Vitrine publica de servicos
Como cliente, quero encontrar categorias e servicos populares por localizacao para iniciar uma solicitacao rapidamente.

Aceite:
- Home publica com busca por servico e localizacao.
- Categorias em destaque com icones.
- Servicos populares com preco inicial, avaliacao e CTA.
- Visitante nao autenticado consegue navegar e e direcionado para login/cadastro ao solicitar.

### Story 2: Detalhe do servico
Como cliente, quero ver detalhes de um servico antes de pedir para entender preco, tempo medio, inclusoes e profissionais disponiveis.

Aceite:
- Pagina de categoria/servico com resumo, preco base, SLA e requisitos.
- Lista de profissionais elegiveis com rating e distancia.
- CTA para abrir checkout com categoria pre-selecionada.

### Story 3: Checkout orientado
Como cliente, quero preencher pedido em etapas para reduzir erro e aumentar confianca.

Aceite:
- Etapas: problema, agenda, localizacao, dados do cliente e resumo.
- Upload de fotos preparado via Active Storage.
- Estimativa de preco e taxa de urgencia antes de confirmar.
- Pedido criado com status `pending` e matching calculado.

## Fase 2 - Operacao e profissional

### Story 4: Meus pedidos do cliente
Como cliente, quero acompanhar meus pedidos para saber status, profissional atribuido e historico.

Aceite:
- Lista filtrada por status.
- Timeline da ordem de servico.
- Acao de avaliar pedido concluido.

### Story 5: Painel do profissional
Como profissional, quero ver servicos atribuidos, agenda e desempenho para gerir meu dia.

Aceite:
- Dashboard com proximo servico, ganhos, rating e agenda.
- Acoes para aceitar, iniciar e concluir servico.
- Somente o profissional dono acessa os proprios dados.

### Story 6: Carteira e repasses
Como profissional e operador, quero acompanhar ganhos, comissoes e repasses.

Aceite:
- Carteira por profissional.
- Extrato de pagamentos, comissao e saldo.
- Estados: pendente, pago, reembolsado.

## Fase 3 - Confianca e escala

### Story 7: Cadastro e verificacao profissional
Como profissional, quero submeter documentos e competencias para ser aprovado na plataforma.

Aceite:
- Cadastro com especialidades, biografia, localizacao e preco/hora.
- Upload de BI, certificados e licencas.
- Operador aprova/rejeita documentos.

### Story 8: Centro de ajuda e confianca
Como cliente ou profissional, quero entender regras, suporte e avaliacao para confiar na plataforma.

Aceite:
- Pagina de ajuda com FAQ e canais de suporte.
- Politica de avaliacao e disputa.
- Conteudo responsivo e acessivel.
