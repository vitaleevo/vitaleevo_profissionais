import {
  BookOpen,
  ClipboardList,
  CreditCard,
  Mail,
  Megaphone,
  PlusCircle,
  SprayCan,
  Target,
  UserRound,
  Zap,
} from "lucide-react";

import { RequestSummaryCard } from "@/components/domain/service-requests/request-summary-card";
import { AccessPanel } from "@/components/layout/access-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { getAccountSummary } from "@/lib/api/account";
import { isAccessError } from "@/lib/api/errors";
import { formatAoa } from "@/lib/formatters/money";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const result = await getAccountSummary()
    .then((account) => ({ account, error: null }))
    .catch((error: unknown) => ({ account: null, error }));

  if (result.error) {
    if (isAccessError(result.error)) {
      return (
        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <AccessPanel title="Portal do Cliente" message="Inicie sessão para gerir os serviços contratados, formações e equipas da sua empresa." />
        </main>
      );
    }
    throw result.error;
  }

  if (!result.account) {
    throw new Error("A API respondeu sem conta.");
  }

  const { user, recent_service_requests: requests = [], recent_payments: payments = [] } = result.account;

  if (!user) {
    throw new Error("A API respondeu sem utilizador da conta.");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        actions={(
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/pedidos/novo">
              <PlusCircle className="mr-1.5 size-4" />
              Contratar Novo Serviço
            </LinkButton>
            <LinkButton href="/diagnostico" variant="outline">
              <Zap className="mr-1.5 size-4" />
              Diagnóstico 360
            </LinkButton>
          </div>
        )}
        eyebrow="Portal da Empresa Contratante · Vitaleevo Human Capital"
        meta={<Badge variant="outline" className="font-bold text-primary">{user.role === "client" ? "Empresa Cliente" : user.role}</Badge>}
        title={user.name}
      />

      {/* Quick Services Request Grid */}
      <section className="mb-10">
        <div className="mb-4">
          <Badge className="mb-1 bg-primary/10 text-primary">Soluções Rápidas</Badge>
          <h2 className="text-xl font-bold text-foreground">O que a sua empresa precisa hoje?</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover border-border/80 shadow-sm flex flex-col justify-between">
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="size-5" />
                </span>
                <Badge variant="secondary" className="text-[0.7rem] font-bold">Divisão 1</Badge>
              </div>
              <CardTitle className="mt-3 text-base font-bold">Formação Corporativa</CardTitle>
              <CardDescription className="text-xs">Treino prático em Vendas, Marketing, Excel, Power BI e Liderança.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <LinkButton href="/pedidos/novo?category=formacao" size="sm" className="w-full justify-center">
                Pedir Formação
              </LinkButton>
            </CardContent>
          </Card>

          <Card className="card-hover border-border/80 shadow-sm flex flex-col justify-between">
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Target className="size-5" />
                </span>
                <Badge variant="secondary" className="text-[0.7rem] font-bold">Divisão 3</Badge>
              </div>
              <CardTitle className="mt-3 text-base font-bold">Força de Vendas (Sales)</CardTitle>
              <CardDescription className="text-xs">1 Supervisor Sénior + 5 Vendedores dedicados com metas diárias.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <LinkButton href="/pedidos/novo?category=sales_team" size="sm" className="w-full justify-center">
                Alocar Vendedores
              </LinkButton>
            </CardContent>
          </Card>

          <Card className="card-hover border-border/80 shadow-sm flex flex-col justify-between">
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Megaphone className="size-5" />
                </span>
                <Badge variant="secondary" className="text-[0.7rem] font-bold">Divisão 3</Badge>
              </div>
              <CardTitle className="mt-3 text-base font-bold">Marketing Team</CardTitle>
              <CardDescription className="text-xs">1 Designer + 1 Gestor de Redes com supervisão e direção de arte.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <LinkButton href="/pedidos/novo?category=marketing_team" size="sm" className="w-full justify-center">
                Alocar Marketing
              </LinkButton>
            </CardContent>
          </Card>

          <Card className="card-hover border-border/80 shadow-sm flex flex-col justify-between">
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <SprayCan className="size-5" />
                </span>
                <Badge variant="secondary" className="text-[0.7rem] font-bold">Divisão 4</Badge>
              </div>
              <CardTitle className="mt-3 text-base font-bold">Limpeza & Facilities</CardTitle>
              <CardDescription className="text-xs">Higienização corporativa, pós-obra ou equipa permanente.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <LinkButton href="/pedidos/novo?category=limpeza" size="sm" className="w-full justify-center">
                Agendar Limpeza
              </LinkButton>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Company Info & Associated Profile */}
      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardContent className="grid gap-4 p-5">
            <h2 className="text-lg font-bold">Dados da Conta</h2>
            <Info icon={<UserRound className="size-4" />} label="Responsável" value={user.name} />
            <Info icon={<Mail className="size-4" />} label="E-mail Corporativo" value={user.email} />
            <Info icon={<CreditCard className="size-4" />} label="Estado do Acesso" value={user.active ? "Ativo" : "Inativo"} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="grid gap-4 p-5">
            <h2 className="text-lg font-bold">Empresa & Localização</h2>
            {user.profile ? (
              <div className="space-y-2">
                <strong className="block text-base text-foreground">
                  {"specialty" in user.profile ? user.profile.specialty : user.profile.name}
                </strong>
                <p className="text-sm text-muted-foreground">
                  {"location" in user.profile ? user.profile.location : user.profile.address ?? "Luanda, Angola"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Empresa cadastrada na plataforma Vitaleevo Human Capital.</p>
                <p>Luanda & Províncias, Angola.</p>
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <LinkButton href="/pedidos" variant="outline" size="sm">
                Ver Meus Pedidos & Contratos
              </LinkButton>
              <LinkButton href="/pacotes" variant="ghost" size="sm">
                Consultar Pacotes
              </LinkButton>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders and Payments */}
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <DataList
          empty={requests.length === 0}
          emptyState={(
            <EmptyState
              description="Quando a sua empresa solicitar serviços de formação ou outsourcing, eles aparecerão aqui para acompanhamento."
              icon={<ClipboardList className="size-5" />}
              title="Ainda não tem pedidos ativos."
            />
          )}
          eyebrow="Histórico de Contratações"
          title="Serviços & Contratos Ativos"
        >
          {requests.map((request) => (
            <RequestSummaryCard request={request} key={request.id} />
          ))}
        </DataList>

        <aside className="grid content-start gap-4">
          <DataList
            empty={payments.length === 0}
            emptyState={(
              <EmptyState
                description="Os comprovativos e faturas pagas pela sua empresa aparecerão aqui."
                icon={<CreditCard className="size-4" />}
                title="Sem faturas pendentes."
              />
            )}
            eyebrow="Faturação"
            title="Pagamentos Recentes"
          >
            {payments.map((payment) => (
              <Card key={payment.id} className="shadow-sm">
                <CardContent className="flex min-w-0 items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <strong className="block truncate text-sm">{payment.method}</strong>
                    <p className="text-xs text-muted-foreground">{payment.status}</p>
                  </div>
                  <strong className="shrink-0 text-sm font-black text-primary">{formatAoa(payment.amount_cents)}</strong>
                </CardContent>
              </Card>
            ))}
          </DataList>
        </aside>
      </section>
    </main>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <span className="block text-[0.7rem] font-bold uppercase text-muted-foreground">{label}</span>
        <strong className="text-sm text-foreground">{value}</strong>
      </div>
    </div>
  );
}
