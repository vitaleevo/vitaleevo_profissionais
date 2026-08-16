"use client";

import {
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Send,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const questions = [
  {
    id: "team_size",
    title: "1. Qual é o tamanho atual da sua equipa?",
    description: "Selecione o número de colaboradores diretos na sua empresa.",
    options: [
      { label: "1 a 5 colaboradores", value: "small", score: 1 },
      { label: "6 a 20 colaboradores", value: "medium", score: 2 },
      { label: "21 a 50 colaboradores", value: "growth", score: 3 },
      { label: "Mais de 50 colaboradores", value: "enterprise", score: 4 },
    ],
  },
  {
    id: "sales_challenge",
    title: "2. Qual é o maior gargalo comercial ou de vendas hoje?",
    description: "Identifique a principal dificuldade nas receitas do seu negócio.",
    options: [
      { label: "Poucos leads e falta de visibilidade nas redes sociais", value: "marketing", score: "marketing" },
      { label: "A equipa fala com clientes mas não consegue fechar vendas", value: "closing", score: "sales" },
      { label: "Não temos equipa de vendas dedicada nem processos definidos", value: "no_team", score: "sales_team" },
      { label: "Falta de controlo de métricas, CRM e acompanhamento de metas", value: "crm", score: "360" },
    ],
  },
  {
    id: "technology",
    title: "3. Que nível de tecnologia e processos a sua empresa utiliza?",
    description: "Como é feito o controlo diário de clientes e produtividade.",
    options: [
      { label: "Cadernos, bloco de notas ou WhatsApp informal", value: "basic", score: 1 },
      { label: "Folhas de cálculo de Excel manuais", value: "excel", score: 2 },
      { label: "Software de faturação básico sem CRM integrado", value: "billing", score: 3 },
      { label: "CRM estruturado com dashboards de Power BI / KPIs", value: "advanced", score: 4 },
    ],
  },
  {
    id: "primary_goal",
    title: "4. Qual é o objetivo prioritário para os próximos 6 meses?",
    description: "O que trará maior impacto para a administração.",
    options: [
      { label: "Aumentar as vendas imediatas com força comercial no terreno", value: "sales", score: "sales_team" },
      { label: "Estruturar a presença digital e marketing com equipa dedicada", value: "marketing", score: "marketing_team" },
      { label: "Treinar e certificar a equipa interna já existente", value: "training", score: "training" },
      { label: "Auditoria total, implantação de CRM e metas comerciais 360", value: "all", score: "360" },
    ],
  },
];

export function DiagnosticAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSelectOption = (questionId: string, optionValue: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionValue }));
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setSubmitted(true);
    }
  };

  const getRecommendedPackage = () => {
    const goal = answers["primary_goal"];
    const challenge = answers["sales_challenge"];

    if (goal === "360" || challenge === "crm") {
      return {
        title: "Pacote Comercial 360",
        price: "2.500.000 Kz – 10.000.000 Kz",
        badge: "Recomendação Ideal",
        description: "Reestruturação profunda com auditoria comercial, formação de equipa, parametrização de CRM e acompanhamento de KPIs.",
        link: "/pacotes#comercial-360",
      };
    }

    if (goal === "sales_team" || challenge === "no_team") {
      return {
        title: "Pacote Sales Team (Outsourcing)",
        price: "3.000.000 Kz – 5.000.000 Kz / mês",
        badge: "Força de Vendas Dedicada",
        description: "1 Supervisor Sénior + 5 Vendedores treinados com gestão de rotinas, prospecção e acompanhamento diário pela Vitaleevo.",
        link: "/outsourcing#pacotes",
      };
    }

    if (goal === "marketing_team" || challenge === "marketing") {
      return {
        title: "Pacote Marketing Team (Outsourcing)",
        price: "800.000 Kz – 1.500.000 Kz / mês",
        badge: "Equipa Criativa Alocada",
        description: "1 Designer Gráfico + 1 Gestor de Redes Sociais com supervisão e direção de arte Vitaleevo para acelerar a geração de leads.",
        link: "/outsourcing#pacotes",
      };
    }

    return {
      title: "Pacote Formação Corporativa",
      price: "500.000 Kz – 2.000.000 Kz",
      badge: "Capacitação Imediata",
      description: "Diagnóstico inicial, ementa sob medida para o setor da sua empresa, treino imersivo e certificação oficial de todos os participantes.",
      link: "/formacao",
    };
  };

  const recommended = getRecommendedPackage();

  return (
    <div>
      {!submitted ? (
        <div>
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>Passo {currentStep + 1} de {questions.length}</span>
              <span>{Math.round(((currentStep + 1) / questions.length) * 100)}% concluído</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <Card className="border-border/80 shadow-md">
            <CardHeader className="p-6 sm:p-8">
              <CardTitle className="text-2xl font-black text-foreground">
                {questions[currentStep].title}
              </CardTitle>
              <CardDescription className="text-sm">
                {questions[currentStep].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
              <div className="grid gap-3.5">
                {questions[currentStep].options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(questions[currentStep].id, opt.value)}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-left font-semibold text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-[0.99]"
                  >
                    <span className="text-sm sm:text-base">{opt.label}</span>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>

              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="mt-6 text-muted-foreground"
                >
                  ← Voltar para a pergunta anterior
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Result recommendation */}
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 via-card to-card shadow-lg">
            <CardHeader className="p-6 sm:p-8">
              <Badge className="w-fit bg-primary text-white">
                {recommended.badge}
              </Badge>
              <CardTitle className="mt-3 text-3xl font-black text-foreground">
                {recommended.title}
              </CardTitle>
              <p className="mt-1 text-2xl font-black text-primary">{recommended.price}</p>
              <CardDescription className="mt-3 text-base leading-relaxed text-muted-foreground">
                {recommended.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
              <div className="rounded-xl border border-border bg-background p-5">
                <h4 className="font-bold text-sm text-foreground">Próximos passos recomendados pela Vitaleevo:</h4>
                <div className="mt-3 grid gap-2 text-xs sm:text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    Diagnóstico detalhado sem compromisso com os consultores seniores.
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    Apresentação de proposta executiva com cronograma de implementação.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead submission form */}
          <Card className="border-border/80 shadow-md">
            <CardHeader className="p-6 sm:p-8">
              <CardTitle className="text-xl font-bold">
                Receber Relatório Completo do Diagnóstico
              </CardTitle>
              <CardDescription>
                Informe os dados da sua empresa para que a equipa da Vitaleevo envie o parecer técnico detalhado.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
              <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); alert("Diagnóstico enviado com sucesso! A equipa da Vitaleevo entrará em contacto."); }}>
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Nome da Empresa</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Clínica Talatona Care"
                    className="h-11 rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Seu Nome & Cargo</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Ex: Carlos Silva - Diretor Geral"
                      className="h-11 rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+244 923 000 000"
                      className="h-11 rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">E-mail Corporativo</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="direcao@empresa.co.ao"
                    className="h-11 rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Button type="submit" size="lg" className="flex-1 justify-center">
                    <Send className="mr-2 size-4" />
                    Agendar Reunião de Diagnóstico
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => { setSubmitted(false); setCurrentStep(0); }}
                  >
                    <RefreshCw className="mr-2 size-4" />
                    Refazer Teste
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
