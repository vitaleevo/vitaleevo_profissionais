import { Database, ExternalLink, FileCheck2, LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";

import { PublicOrAppShell } from "@/components/layout/public-or-app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

const dataCategories = [
  "Identificacao e contacto: nome, email, telefone e endereco de atendimento.",
  "Dados de pedidos: categoria, descricao, localizacao, agenda, orcamento, estado e historico.",
  "Dados profissionais: especialidade, documentos de verificacao, experiencia, agenda, avaliacao e carteira.",
  "Dados de pagamento: metodo, referencia, estado da transacao, comissoes e comprovativos quando aplicavel.",
  "Dados tecnicos: registos de acesso, cookies essenciais, dispositivo, navegador e eventos de seguranca.",
];

const principles = [
  {
    title: "Finalidade clara",
    body: "Tratamos dados para criar pedidos, fazer matching, gerir pagamentos, prevenir fraude e prestar suporte.",
    icon: FileCheck2,
  },
  {
    title: "Minimizacao",
    body: "Pedimos apenas dados necessarios para executar o servico, verificar perfis e cumprir obrigacoes legais.",
    icon: Database,
  },
  {
    title: "Seguranca",
    body: "Aplicamos controlo de acesso por perfil, registos operacionais e medidas tecnicas proporcionais ao risco.",
    icon: LockKeyhole,
  },
  {
    title: "Direitos do titular",
    body: "Clientes e profissionais podem solicitar acesso, correcao, oposicao, portabilidade ou eliminacao quando cabivel.",
    icon: UserCheck,
  },
];

const references = [
  {
    label: "APD Angola - Direitos do Cidadao",
    href: "https://apd.ao/ao/direitos-do-cidadao/",
  },
  {
    label: "ANPD Brasil - Direitos dos titulares",
    href: "https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares",
  },
  {
    label: "Comissao Europeia - Direitos no GDPR",
    href: "https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en",
  },
];

export default function PrivacyPage() {
  return (
    <PublicOrAppShell>
        <section className="border-b bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
            <div>
              <Badge className="gap-2">
                <ShieldCheck className="size-3" />
                Privacidade e protecao de dados
              </Badge>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
                Politica de privacidade alinhada a Angola, LGPD e GDPR.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Esta politica explica como a ProfiAngola recolhe, usa, conserva e protege dados
                pessoais de clientes, profissionais e utilizadores da plataforma.
              </p>
            </div>
            <Card className="self-end shadow-sm">
              <CardContent className="grid gap-3 p-5">
                <span className="text-sm font-bold uppercase text-muted-foreground">Ultima atualizacao</span>
                <strong className="text-3xl font-black">24 maio 2026</strong>
                <p className="text-sm leading-6 text-muted-foreground">
                  Canal de pedidos: privacidade@profiangola.ao
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {principles.map((item) => {
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
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Dados tratados</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">O que podemos recolher</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                A recolha depende do seu papel na plataforma e do servico solicitado. Dados sensiveis
                so devem ser enviados quando forem indispensaveis para o atendimento.
              </p>
            </div>
            <div className="grid gap-3">
              {dataCategories.map((item) => (
                <div key={item} className="rounded-lg border bg-background p-4 text-sm leading-6 text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <Card className="shadow-sm lg:col-span-2">
            <CardContent className="grid gap-5 p-6">
              <div>
                <p className="text-sm font-bold uppercase text-primary">Como usamos e partilhamos</p>
                <h2 className="mt-2 text-3xl font-black tracking-normal">Uso responsavel dos dados</h2>
              </div>
              <div className="grid gap-4 text-sm leading-6 text-muted-foreground">
                <p>
                  Usamos dados para autenticar utilizadores, apresentar categorias, criar pedidos,
                  selecionar profissionais compativeis, gerir pagamentos, comunicar estados de atendimento
                  e melhorar a qualidade da operacao.
                </p>
                <p>
                  Podemos partilhar dados necessarios com profissionais, clientes, operadores internos,
                  processadores de pagamento, fornecedores de infraestrutura, autoridades competentes ou
                  parceiros que atuem sob instrucao e deveres de confidencialidade.
                </p>
                <p>
                  Conservamos dados pelo periodo necessario para prestar o servico, cumprir obrigacoes
                  legais, resolver disputas, prevenir fraude e manter historico contabil e operacional.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="grid gap-4 p-6">
              <h2 className="text-xl font-black">Referencias normativas</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                A politica foi estruturada considerando boas praticas de protecao de dados em Angola,
                Brasil e Uniao Europeia.
              </p>
              <div className="grid gap-2">
                {references.map((item) => (
                  <LinkButton
                    href={item.href}
                    key={item.href}
                    variant="outline"
                    className="justify-between"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.label}
                    <ExternalLink />
                  </LinkButton>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
    </PublicOrAppShell>
  );
}
