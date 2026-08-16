import { AlertTriangle, BadgeCheck, BriefcaseBusiness, FileText, Scale, ShieldCheck } from "lucide-react";

import { PublicOrAppShell } from "@/components/layout/public-or-app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

const terms = [
  {
    title: "Conta e elegibilidade",
    body: "O utilizador deve fornecer informacoes verdadeiras, proteger as credenciais e usar a conta apenas para fins licitos.",
    icon: BadgeCheck,
  },
  {
    title: "Pedidos de servico",
    body: "O cliente deve descrever o pedido com clareza, informar local, horario, restricoes e validar o orcamento antes da execucao.",
    icon: FileText,
  },
  {
    title: "Profissionais",
    body: "Profissionais devem manter dados, documentos, disponibilidade e qualificacoes atualizados, cumprindo normas tecnicas e legais.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Seguranca e conduta",
    body: "E proibido fraudar pagamentos, assediar utilizadores, contornar a plataforma ou publicar conteudo ilegal ou enganoso.",
    icon: ShieldCheck,
  },
];

export default function TermsPage() {
  return (
    <PublicOrAppShell>
        <section className="border-b bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
            <div>
              <Badge className="gap-2">
                <Scale className="size-3" />
                Termos de uso
              </Badge>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
                Regras para usar a ProfiAngola com seguranca e transparencia.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Estes termos regulam o acesso ao marketplace, a criacao de pedidos, a relacao com
                profissionais, pagamentos, conteudo e responsabilidades dos utilizadores.
              </p>
            </div>
            <Card className="self-end shadow-sm">
              <CardContent className="grid gap-3 p-5">
                <span className="text-sm font-bold uppercase text-muted-foreground">Ultima atualizacao</span>
                <strong className="text-3xl font-black">24 maio 2026</strong>
                <p className="text-sm leading-6 text-muted-foreground">
                  Ao usar a plataforma, voce aceita estes termos e a politica de privacidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {terms.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="shadow-sm">
                <CardContent className="grid gap-4 p-5">
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
            <Card className="shadow-sm">
              <CardContent className="grid gap-4 p-6">
                <h2 className="text-2xl font-black">Pagamentos, cancelamentos e disputas</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Valores, taxas, comissoes, reembolsos e repasses podem variar conforme categoria,
                  urgencia, localizacao e metodo de pagamento. Cancelamentos ou alteracoes devem ser
                  solicitados antes da execucao, e disputas podem exigir evidencias, mensagens,
                  comprovativos e revisao operacional.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="grid gap-4 p-6">
                <h2 className="text-2xl font-black">Responsabilidade da plataforma</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  A ProfiAngola intermedeia pedidos, matching, acompanhamento e pagamentos. A
                  execucao tecnica do servico e a conduta presencial cabem ao profissional ou empresa
                  prestadora, sem prejuizo das verificacoes e medidas de qualidade da plataforma.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Condicoes legais</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal">Privacidade, lei aplicavel e alteracoes</h2>
          </div>
          <div className="grid gap-4 text-sm leading-6 text-muted-foreground">
            <p>
              O tratamento de dados pessoais segue a politica de privacidade e considera a legislacao
              aplicavel em Angola, alem de boas praticas inspiradas na LGPD brasileira e no GDPR quando
              houver utilizadores, parceiros ou transferencias internacionais relevantes.
            </p>
            <p>
              A plataforma pode suspender contas, pedidos ou pagamentos quando houver risco de fraude,
              incumprimento destes termos, exigencia legal ou ameaca a clientes, profissionais ou operadores.
            </p>
            <p>
              Os termos podem ser atualizados para refletir alteracoes operacionais, legais ou de seguranca.
              A versao publicada nesta pagina substitui versoes anteriores a partir da data indicada.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <LinkButton href="/privacidade" variant="outline">
                Politica de privacidade
              </LinkButton>
              <LinkButton href="/ajuda" variant="outline">
                Centro de ajuda
              </LinkButton>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex gap-3 rounded-lg border bg-muted/50 p-5 text-sm leading-6 text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" />
            <p>
              Estes termos sao uma base operacional para o MVP e devem ser revistos por assessoria
              juridica antes de uso comercial amplo, especialmente para pagamentos, responsabilidade civil,
              dados sensiveis e transferencias internacionais.
            </p>
          </div>
        </section>
    </PublicOrAppShell>
  );
}
