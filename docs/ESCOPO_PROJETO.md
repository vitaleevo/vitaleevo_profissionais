# Escopo - Projeto Profissionais

Este diretorio e o projeto independente de profissionais liberais.

## Decisao ativa

O produto deixou de ser tratado como parte de um ecossistema maior. Novas decisoes devem
priorizar apenas o fluxo de servicos: cliente solicita, plataforma faz matching, profissional
executa, operacao acompanha e pagamento fica rastreavel.

## Incluido

- Clientes, profissionais, categorias de servico e pedidos.
- Matching, atribuicao, estados de pedido e pagamentos de servico.
- Painel do profissional.
- Area do cliente.
- Operacao/admin focada em pedidos e rede profissional.
- Documentacao e deploy deste produto como aplicacao propria.

## Nao incluir neste projeto

- Lojas independentes.
- Produtos fisicos.
- Carrinho, checkout de produto e acompanhamento de pedido de loja.
- Planos e assinaturas de vendedores.

## Nota tecnica

Primeira limpeza executada: telas, rotas, clientes frontend e documentacao de lojas foram
removidos da superficie ativa. Segunda limpeza executada: backend, migrations, seeds,
schema Rails, testes e OpenAPI/schema frontend de lojas tambem foram removidos.
