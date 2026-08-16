import Image from "next/image";
import Link from "next/link";
import { Headphones, Mail, MapPin, ShieldCheck } from "lucide-react";

import { LinkButton } from "@/components/ui/link-button";
import { getCurrentVertical } from "@/lib/ecosystem/server";
import type { EcosystemVerticalKey } from "@/lib/ecosystem/verticals";
import { getPublicNavigation, legalNavigation, type NavigationItem } from "@/lib/navigation/items";

type PublicFooterProps = {
  verticalKey?: EcosystemVerticalKey;
};

export async function PublicFooter({ verticalKey }: PublicFooterProps = {}) {
  const vertical = await getCurrentVertical(verticalKey);
  const footerColumns: Array<{ links: NavigationItem[]; title: string }> = [
    {
      title: vertical.name,
      links: getPublicNavigation(vertical.key),
    },
    {
      title: "Soluções Vitaleevo",
      links: [
        { href: "/formacao", label: "Formação Corporativa" },
        { href: "/academia", label: "Academia de Talentos" },
        { href: "/outsourcing", label: "Outsourcing de Equipas" },
        { href: "/limpeza-corporativa", label: "Limpeza Corporativa" },
        { href: "/pacotes", label: "Pacotes Empresariais" },
        { href: "/diagnostico", label: "Diagnóstico 360" },
      ],
    },
    {
      title: "Legal & Conformidade",
      links: legalNavigation,
    },
  ];

  return (
    <footer className="border-t bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="grid content-start gap-5">
          <Link href={vertical.homeHref} className="flex min-w-max items-center">
            <div className="relative flex h-10 w-44 items-center sm:w-52">
              <Image
                src="/footer-logo.png"
                alt="Vitaleevo Human Capital"
                width={200}
                height={42}
                className="h-9 w-auto object-contain object-left brightness-125"
                priority
                unoptimized
              />
            </div>
          </Link>
          <p className="max-w-md text-sm leading-6 text-secondary-foreground/75">
            {vertical.footerSummary}
          </p>
          <div className="grid gap-2 text-sm text-secondary-foreground/75">
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Talatona & Luanda, Angola
            </span>
            <a className="inline-flex w-fit items-center gap-2 hover:text-primary" href="mailto:comercial@vitaleevo.ao">
              <Headphones className="size-4 text-primary" />
              comercial@vitaleevo.ao
            </a>
            <a className="inline-flex w-fit items-center gap-2 hover:text-primary" href="mailto:academia@vitaleevo.ao">
              <Mail className="size-4 text-primary" />
              academia@vitaleevo.ao
            </a>
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-black uppercase tracking-wider text-secondary-foreground/60">{column.title}</h2>
            <nav className="mt-4 grid gap-2.5" aria-label={column.title}>
              {column.links.map((item) => (
                <LinkButton
                  href={item.href}
                  key={item.href}
                  variant="link"
                  className="h-auto justify-start px-0 py-0 text-secondary-foreground/80 hover:text-primary"
                >
                  {item.label}
                </LinkButton>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-secondary-foreground/65 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>Copyright © 2026 Vitaleevo Human Capital. Todos os direitos reservados.</span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Desenvolvimento de talentos, produtividade e governança operacional.
          </span>
        </div>
      </div>
    </footer>
  );
}
