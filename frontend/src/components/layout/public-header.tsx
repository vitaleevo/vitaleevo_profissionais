import { LayoutDashboard, LogIn, LogOut } from "lucide-react";

import { Brand } from "./brand";
import { MobilePublicNavigation } from "./mobile-public-navigation";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { getCurrentUser } from "@/lib/api/account";
import { isAccessError } from "@/lib/api/errors";
import type { User } from "@/lib/api/types";
import { getCurrentVertical } from "@/lib/ecosystem/server";
import type { EcosystemVerticalKey } from "@/lib/ecosystem/verticals";
import { getPublicNavigation } from "@/lib/navigation/items";

type PublicHeaderProps = {
  verticalKey?: EcosystemVerticalKey;
};

export async function PublicHeader({ verticalKey }: PublicHeaderProps = {}) {
  const [vertical, currentUser] = await Promise.all([
    getCurrentVertical(verticalKey),
    getOptionalCurrentUser(),
  ]);
  const navigation = getPublicNavigation("profi_angola");
  const session = currentUser ? sessionFor(currentUser) : null;

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:gap-4 lg:px-8">
        <Brand vertical={vertical} />
        <div className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <LinkButton
              href={item.href}
              key={item.href}
              variant="ghost"
              size="sm"
            >
              {item.label}
            </LinkButton>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <LinkButton href={session.homeHref} size="sm" className="hidden min-[440px]:inline-flex">
                <LayoutDashboard />
                {session.homeLabel}
              </LinkButton>
              <form action="/api/auth/logout" method="post" className="hidden min-[520px]:block">
                <Button type="submit" variant="outline" size="sm">
                  <LogOut />
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <>
              <LinkButton href="/login" size="sm" className="hidden min-[360px]:inline-flex">
                <LogIn />
                Entrar
              </LinkButton>
              <LinkButton href="/login" size="icon-sm" className="min-[360px]:hidden" aria-label="Entrar">
                <LogIn />
              </LinkButton>
            </>
          )}
          <div className="lg:hidden">
            <MobilePublicNavigation navigation={navigation} session={session} vertical={vertical} />
          </div>
        </div>
      </nav>
    </header>
  );
}

async function getOptionalCurrentUser(): Promise<User | null> {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

function sessionFor(user: User) {
  if (user.role === "admin" || user.role === "operator") {
    return {
      homeHref: "/operacoes",
      homeLabel: "Operacoes",
      name: user.name,
      role: user.role,
    };
  }

  if (user.role === "professional") {
    return {
      homeHref: "/profissional",
      homeLabel: "Painel",
      name: user.name,
      role: user.role,
    };
  }

  return {
    homeHref: "/pedidos",
    homeLabel: "Meus pedidos",
    name: user.name,
    role: user.role,
  };
}
