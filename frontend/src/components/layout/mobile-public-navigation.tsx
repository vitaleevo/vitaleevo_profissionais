"use client";

import { useState } from "react";
import { LayoutDashboard, LogIn, LogOut, Menu } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Button, buttonVariants } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { EcosystemVertical, NavigationItem } from "@/lib/ecosystem/verticals";

type MobilePublicNavigationProps = {
  navigation: NavigationItem[];
  session: {
    homeHref: string;
    homeLabel: string;
    name: string;
    role: string;
  } | null;
  vertical: EcosystemVertical;
};

export function MobilePublicNavigation({ navigation, session, vertical }: MobilePublicNavigationProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Abrir menu"
        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader className="border-b">
          <Brand vertical={vertical} />
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Navegacao principal do projeto.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-2 px-4">
          {navigation.map((item) => (
            <LinkButton
              className="h-11 justify-start"
              href={item.href}
              key={item.href}
              onClick={() => setOpen(false)}
              variant="ghost"
            >
              {item.label}
            </LinkButton>
          ))}
        </div>
        <div className="mt-auto grid gap-2 border-t p-4">
          {session ? (
            <>
              <div className="rounded-lg bg-muted p-3 text-sm">
                <strong className="block truncate">{session.name}</strong>
                <span className="text-xs font-semibold uppercase text-muted-foreground">{session.role}</span>
              </div>
              <LinkButton
                className="w-full"
                href={session.homeHref}
                onClick={() => setOpen(false)}
              >
                <LayoutDashboard />
                {session.homeLabel}
              </LinkButton>
              <form action="/api/auth/logout" method="post">
                <Button className="w-full" type="submit" variant="outline">
                  <LogOut />
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <LinkButton
              className="w-full"
              href="/login"
              onClick={() => setOpen(false)}
            >
              <LogIn />
              Entrar
            </LinkButton>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
