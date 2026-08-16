import { ArrowRight, CreditCard, FileWarning, Headphones, LifeBuoy, Mail, MessageSquareText, PlayCircle, ShieldCheck, UserRoundCheck } from "lucide-react";

import { PublicOrAppShell } from "@/components/layout/public-or-app-shell";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent } from "@/components/ui/card";

const topics = [
  {
    title: "Pedidos",
    body: "Criacao, acompanhamento, cancelamento e estados da ordem de servico.",
    icon: Headphones,
  },
  {
    title: "Pagamentos",
    body: "Multicaixa, Unitel Money, referencias, comissoes e repasses.",
    icon: CreditCard,
  },
  {
    title: "Profissionais",
    body: "Documentos, verificacao, agenda, reputacao e carteira profissional.",
    icon: UserRoundCheck,
  },
  {
    title: "Disputas",
    body: "Abertura de disputa, evidencias e acompanhamento operacional.",
    icon: FileWarning,
  },
];

const supportFlow = [
  {
    title: "Identificar o pedido",
    body: "Use codigo, categoria, data ou nome do cliente para localizar o atendimento.",
  },
  {
    title: "Reunir evidencias",
    body: "Mensagens, comprovativos, fotos e notas ajudam a resolver disputas com mais rapidez.",
  },
  {
    title: "Atualizar o estado",
    body: "Acompanhe se o pedido esta pendente, atribuido, em execucao, concluido ou em revisao.",
  },
];

const helpFaqs = [
  {
    question: "Nao consigo criar pedido. O que faco?",
    answer: "Entre na conta, confirme dados basicos e tente novamente pelo catalogo ou pela pagina do cliente.",
  },
  {
    question: "Como sei se o profissional foi atribuido?",
    answer: "O pedido muda de estado e passa a mostrar os dados permitidos do profissional associado.",
  },
  {
    question: "Posso alterar horario ou local?",
    answer: "Sim, mas a alteracao pode depender do estado do pedido e da disponibilidade do profissional.",
  },
  {
    question: "Onde vejo privacidade e termos?",
    answer: "As paginas de Privacidade e Termos de uso ficam no rodape publico da plataforma.",
  },
  {
    question: "Como entro como profissional?",
    answer: "A candidatura comeca pela area profissional. Em staging, use credenciais de teste fornecidas pela equipa para validar cadastro, documentos, vagas e carteira.",
  },
  {
    question: "Como devo testar a plataforma antes de apresentar?",
    answer: "Use a demo guiada: crie um pedido como cliente, atribua na operacao, valide a vaga no painel profissional e confirme o historico.",
  },
  {
    question: "Quais contactos posso usar para suporte?",
    answer: "Use suporte@profiangola.ao para atendimento operacional e privacidade@profiangola.ao para pedidos de dados pessoais.",
  },
];

const contactChannels = [
  {
    title: "Suporte operacional",
    body: "Pedidos, estados, pagamentos, profissionais, disputas e qualidade de atendimento.",
    href: "mailto:suporte@profiangola.ao",
    label: "suporte@profiangola.ao",
    icon: Headphones,
  },
  {
    title: "Privacidade e dados",
    body: "Acesso, correcao, oposicao, eliminacao e duvidas sobre tratamento de dados.",
    href: "mailto:privacidade@profiangola.ao",
    label: "privacidade@profiangola.ao",
    icon: Mail,
  },
];

export default function HelpPage() {
  return (
    <PublicOrAppShell>
        <section className="border-b bg-card">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Centro de ajuda</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
                Suporte para clientes, profissionais e operacao.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Respostas rapidas para pedidos, pagamentos, verificacao profissional e qualidade de atendimento.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/pedidos">Meus pedidos</LinkButton>
              <LinkButton href="/demo" variant="outline">
                <PlayCircle />
                Demo guiada
              </LinkButton>
              <LinkButton href="/confianca" variant="outline">
                <ShieldCheck />
                Confianca
              </LinkButton>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Card key={topic.title} className="shadow-sm">
                <CardContent className="grid gap-4 p-5">
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black">{topic.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{topic.body}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Como pedir suporte</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Quanto mais contexto, melhor a resposta</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                O suporte deve trabalhar com dados do pedido, estado atual e evidencias. Isso evita
                decisoes baseadas apenas em mensagens soltas.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LinkButton href="/cliente">
                  Area do cliente
                  <ArrowRight />
                </LinkButton>
                <LinkButton href="/privacidade" variant="outline">Privacidade</LinkButton>
              </div>
            </div>
            <div className="grid gap-3">
              {supportFlow.map((item) => (
                <div key={item.title} className="rounded-lg border bg-background p-4">
                  <h3 className="text-base font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-primary">FAQ</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal">Duvidas comuns antes de falar com suporte</h2>
            <div className="mt-6 grid gap-3">
              <div className="flex gap-3 rounded-lg border bg-card p-4 text-sm leading-6 text-muted-foreground">
                <LifeBuoy className="mt-0.5 size-5 shrink-0 text-primary" />
                Para casos urgentes, detalhe impacto, local e horario no proprio pedido.
              </div>
              <div className="flex gap-3 rounded-lg border bg-card p-4 text-sm leading-6 text-muted-foreground">
                <MessageSquareText className="mt-0.5 size-5 shrink-0 text-primary" />
                Evite enviar dados sensiveis fora dos campos necessarios do atendimento.
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            {helpFaqs.map((faq) => (
              <div key={faq.question} className="rounded-lg border bg-card p-5">
                <h3 className="text-base font-black">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Contactos</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Canais claros para teste, suporte e privacidade</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Use emails diferentes para operacao e dados pessoais. Isso evita que pedidos de
                suporte misturem informacao sensivel com atendimento comercial.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {contactChannels.map((channel) => {
                const Icon = channel.icon;

                return (
                  <Card key={channel.title} className="shadow-sm">
                    <CardContent className="grid gap-4 p-5">
                      <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-black">{channel.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{channel.body}</p>
                      </div>
                      <LinkButton href={channel.href} variant="outline" className="w-fit">
                        {channel.label}
                      </LinkButton>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
    </PublicOrAppShell>
  );
}
