Rails.application.routes.draw do
  devise_for :users
  root "frontend_redirect#show"

  get "dashboard" => "frontend_redirect#show", as: :dashboard
  get "categorias" => "frontend_redirect#show", as: :categories
  get "servicos/:slug" => "frontend_redirect#show", as: :service_detail
  get "operacoes" => "frontend_redirect#show", as: :operations
  get "como-funciona" => "frontend_redirect#show", as: :how_it_works
  get "ajuda" => "frontend_redirect#show", as: :help_center
  get "confianca" => "frontend_redirect#show", as: :trust_center
  get "meus-pedidos" => "frontend_redirect#show", as: :my_service_requests
  get "minha-conta" => "frontend_redirect#show", as: :account
  get "profissional/painel" => "frontend_redirect#show", as: :professional_dashboard
  get "profissional/carteira" => "frontend_redirect#show", as: :professional_wallet
  get "profissional/historico" => "frontend_redirect#show", as: :professional_history
  get "profissional/vagas" => "frontend_redirect#show", as: :professional_jobs
  get "profissional/cadastro" => "frontend_redirect#show", as: :professional_registration

  get "professionals" => "frontend_redirect#show", as: :professionals
  get "professionals/:id" => "frontend_redirect#show", as: :professional

  get "service_requests" => "frontend_redirect#show", as: :service_requests
  post "service_requests" => "frontend_redirect#show"
  get "service_requests/new" => "frontend_redirect#show", as: :new_service_request
  get "service_requests/:id" => "frontend_redirect#show", as: :service_request
  post "service_requests/:id/assign" => "service_requests#assign", as: :assign_service_request
  patch "service_requests/:id/status" => "service_requests#update_status", as: :status_service_request

  namespace :api do
    namespace :v1 do
      get "health" => "health#show"
      get "marketplace/home" => "marketplace#home"
      get "marketplace/trust" => "marketplace#trust"
      get "dashboard" => "dashboard#show"
      get "professional_portal/dashboard" => "professional_portal#dashboard"
      get "professional_portal/wallet" => "professional_portal#wallet"
      get "professional_portal/history" => "professional_portal#history"
      get "professional_portal/jobs" => "professional_portal#jobs"
      get "professional_portal/profile" => "professional_portal#profile"
      post "professional_portal/profile" => "professional_portal#upsert_profile"
      patch "professional_portal/profile" => "professional_portal#upsert_profile"
      get "professional_portal/documents" => "professional_documents#index"
      post "professional_portal/documents" => "professional_documents#create"
      patch "professional_documents/:id/review" => "professional_documents#review"

      resource :session, only: %i[create destroy], controller: :sessions do
        get :csrf
      end
      resource :me, only: :show, controller: :me
      resource :account, only: :show, controller: :account
      get "locations/angola" => "locations#angola"
      resources :service_categories, param: :slug, only: %i[index show]
      get "professionals/search" => "professionals#search"
      patch "professionals/:id/operational_profile" => "professionals#update_operational_profile"
      resources :professionals, only: %i[index show]
      resources :payments, only: :index
      resources :service_requests, only: %i[index show create] do
        get :matches, on: :member
        post :assign, on: :member
        post :review, on: :member, to: "reviews#create"
        patch :status, on: :member, action: :update_status
      end
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
