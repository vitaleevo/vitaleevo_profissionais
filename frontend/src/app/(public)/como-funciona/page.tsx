import { BadgeCheck, ClipboardCheck, CreditCard, Handshake, Headphones, Radar, ShieldCheck, UserRoundCheck } from "lucide-react";

import { StatsGrid } from "@/components/domain/dashboard/stats-grid";
import { PublicOrAppShell } from "@/components/layout/public-or-app-shell";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent } from "@/components/ui/card";
import { getMarketplaceHome } from "@/lib/api/marketplace";

export const dynamic = "force-dynamic";

const steps = [
  {
    title: "Cliente solicita",
    body: "Seleciona categoria, descreve o problema, localizacao, orcamento e horario.",
    icon: ClipboardCheck,
  },
  {
    title: "Plataforma faz matching",
    body: "Calcula candidatos por avaliacao, proximidade, disponibilidade e experiencia.",
    icon: Radar,
  },
  {
    title: "Operacao acompanha",
    body: "Admin ou operador atribui, monitora status, pagamentos e eventuais disputas.",
    icon: ShieldCheck,
  },
  {
    title: "Profissional executa",
    body: "Aceita, inicia e conclui o servico com historico rastreavel na plataforma.",
    icon: Handshake,
  },
];

const lifecycle = [
  {
    title: "1. Pedido aberto",
    body: "O cliente escolhe categoria, descreve o problema, localizacao, urgencia, horario e orcamento.",
  },
  {
    title: "2. Triagem e matching",
    body: "A plataforma avalia categoria, disponibilidade, proximidade e reputacao dos profissionais.",
  },
  {
    title: "3. Execucao acompanhada",
    body: "O pedido passa por estados claros para que cliente, profissional e operacao saibam o que fazer.",
  },
  {
    title: "4. Pagamento e avaliacao",
    body: "Pagamentos, repasses e avaliacao ficam ligados ao historico do atendimento.",
  },
];

const safeguards = [
  {
    title: "Acesso por perfil",
    body: "Cliente, profissional e operacao veem areas diferentes conforme permissao.",
    icon: UserRoundCheck,
  },
  {
    title: "Estados rastreaveis",
    body: "Pedido pendente, atribuido, em execucao e concluido reduzem incerteza.",
    icon: BadgeCheck,
  },
  {
    title: "Suporte operacional",
    body: "Disputas, evidencias e excecoes podem ser acompanhadas por equipa autorizada.",
    icon: Headphones,
  },
  {
    title: "Pagamento organizado",
    body: "Transacoes, comissoes e repasses ficam ligados ao pedido certo.",
    icon: CreditCard,
  },
];

export default async function HowItWorksPage() {
  const home = await getMarketplaceHome();

  return (
    <PublicOrAppShell>
        <section className="border-b bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Como funciona</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
                Cliente, plataforma e profissional conectados com rastreio.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                O modelo centraliza solicitacao, triagem, matching, atribuicao, execucao e pagamentos para
                aumentar confianca e previsibilidade.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LinkButton href="/pedidos/novo">Criar pedido</LinkButton>
                <LinkButton href="/servicos" variant="outline">Ver catalogo</LinkButton>
              </div>
            </div>
            <StatsGrid
              className="mb-0 content-end gap-3"
              columns={1}
              items={[
                { label: "Categorias", value: home.categories.length },
                { label: "Profissionais em destaque", value: home.top_professionals.length },
              ]}
            />
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="shadow-sm">
                <CardContent className="grid gap-4 p-5">
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <span className="text-sm font-black text-primary">0{index + 1}</span>
                    <h2 className="mt-1 text-xl font-black">{step.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Fluxo completo</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Da solicitacao ao historico final</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                A camada de servicos do ecossistema Conexao foi desenhada para evitar pedidos soltos em mensagens, chamadas e
                folhas paralelas. Cada etapa fica ligada ao pedido.
              </p>
            </div>
            <div className="grid gap-3">
              {lifecycle.map((item) => (
                <div key={item.title} className="rounded-lg border bg-background p-4">
                  <h3 className="text-base font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 max-w-3xl">
            <p className="text-sm font-bold uppercase text-primary">Controlo e seguranca</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal">O fluxo protege a experiencia sem expor areas internas</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {safeguards.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="shadow-sm">
                  <CardContent className="grid gap-4 p-5">
                    <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-black">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
    </PublicOrAppShell>
  );
}
