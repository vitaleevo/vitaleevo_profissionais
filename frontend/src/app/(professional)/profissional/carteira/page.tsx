import { ArrowLeft, Coins, Percent, ReceiptText, Wallet } from "lucide-react";

import { StatsGrid } from "@/components/domain/dashboard/stats-grid";
import { AccessPanel } from "@/components/layout/access-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { isAccessError } from "@/lib/api/errors";
import { getProfessionalWallet } from "@/lib/api/professional-portal";
import { formatAoa } from "@/lib/formatters/money";

export const dynamic = "force-dynamic";

export default async function ProfessionalWalletPage() {
  const result = await getProfessionalWallet()
    .then((wallet) => ({ wallet, error: null }))
    .catch((error: unknown) => ({ wallet: null, error }));

  if (result.error) {
    if (isAccessError(result.error)) {
      return (
        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <AccessPanel title="Carteira do Profissional" message="Inicie sessão como consultor ou talento para ver repasses e comissões." />
        </main>
      );
    }
    throw result.error;
  }

  if (!result.wallet) {
    throw new Error("A API respondeu sem carteira.");
  }

  const { payments, totals } = result.wallet;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <LinkButton href="/profissional" variant="ghost" size="sm" className="mb-3 text-muted-foreground">
          <ArrowLeft className="mr-1.5 size-4" />
          Voltar ao Meu Painel
        </LinkButton>
        <PageHeader
          eyebrow="Finanças & Repasses · Vitaleevo Human Capital"
          title="Carteira & Extrato de Ganhos"
          description="Acompanhamento detalhado de valores faturados, comissões de projetos e repasses líquidos."
        />
      </div>

      <StatsGrid
        className="mb-8"
        columns={3}
        items={[
          {
            label: "Total Repassado",
            value: formatAoa(totals.paid_total_cents),
            detail: "Ganhos líquidos creditados",
            icon: <Wallet className="size-4 text-emerald-500" />,
          },
          {
            label: "Comissões & Taxas",
            value: formatAoa(totals.commission_cents),
            detail: "Taxa de plataforma Vitaleevo",
            icon: <Percent className="size-4 text-primary" />,
          },
          {
            label: "Projetos Faturados",
            value: totals.transactions_count,
            detail: "Total de transações registadas",
            icon: <ReceiptText className="size-4 text-amber-500" />,
          },
        ]}
      />

      <DataList
        empty={payments.length === 0}
        emptyState={(
          <EmptyState
            description="Os pagamentos de formações e projetos de outsourcing aparecerão aqui quando forem faturados."
            icon={<Coins className="size-6" />}
            title="Ainda não tem transações registadas."
          />
        )}
        eyebrow="Movimentações"
        title="Histórico de Pagamentos e Repasses"
      >
        <div className="grid gap-3">
          {payments.map((payment) => (
            <Card key={payment.id} className="card-hover border-border/80 rounded-2xl shadow-sm">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-bold text-xs">{payment.method}</Badge>
                    <Badge className="bg-emerald-500/15 text-emerald-700 text-xs font-bold">{payment.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Transação #{payment.id}</p>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-muted-foreground">Valor Total</span>
                    <strong className="text-foreground">{formatAoa(payment.amount_cents)}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-muted-foreground">Taxa</span>
                    <span className="text-muted-foreground">{formatAoa(payment.commission_cents)}</span>
                  </div>
                  <div className="rounded-xl bg-primary/10 px-4 py-2 text-right">
                    <span className="block text-[10px] font-black uppercase text-primary">Seu Repasse</span>
                    <strong className="text-base font-black text-primary">
                      {formatAoa(payment.professional_payout_cents)}
                    </strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DataList>
    </main>
  );
}
