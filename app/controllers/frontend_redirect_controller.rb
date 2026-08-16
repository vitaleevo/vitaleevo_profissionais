class FrontendRedirectController < ApplicationController
  skip_before_action :authenticate_user!

  LEGACY_PATHS = {
    "/" => "/",
    "/categorias" => "/servicos",
    "/como-funciona" => "/como-funciona",
    "/ajuda" => "/ajuda",
    "/confianca" => "/confianca",
    "/meus-pedidos" => "/pedidos",
    "/minha-conta" => "/conta",
    "/dashboard" => "/operacoes",
    "/professionals" => "/profissionais",
    "/service_requests" => "/pedidos",
    "/service_requests/new" => "/pedidos/novo",
    "/profissional/painel" => "/profissional",
    "/profissional/carteira" => "/profissional/carteira",
    "/profissional/historico" => "/profissional/historico",
    "/profissional/vagas" => "/profissional/vagas",
    "/profissional/cadastro" => "/profissional/cadastro"
  }.freeze

  def show
    redirect_to frontend_url(next_path), allow_other_host: true, status: :found
  end

  private

  def next_path
    path = request.path
    return LEGACY_PATHS.fetch(path) if LEGACY_PATHS.key?(path)

    return path.sub(%r{\A/servicos/}, "/servicos/") if path.start_with?("/servicos/")
    return path.sub(%r{\A/professionals/}, "/profissionais/") if path.start_with?("/professionals/")
    return path.sub(%r{\A/service_requests/}, "/pedidos/") if path.start_with?("/service_requests/")

    "/"
  end

  def frontend_url(path)
    base_url = ENV.fetch("FRONTEND_PUBLIC_BASE_URL", "http://localhost:3001").delete_suffix("/")
    query = request.query_string.present? ? "?#{request.query_string}" : ""

    "#{base_url}#{path}#{query}"
  end
end
