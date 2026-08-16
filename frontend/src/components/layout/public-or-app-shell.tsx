import type { ReactNode } from "react";

import { AppShell } from "./app-shell";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";
import { getCurrentUser } from "@/lib/api/account";
import { isAccessError } from "@/lib/api/errors";
import type { EcosystemVerticalKey } from "@/lib/ecosystem/verticals";

type PublicOrAppShellProps = {
  children: ReactNode;
  verticalKey?: EcosystemVerticalKey;
};

export async function PublicOrAppShell({
  children,
  verticalKey = "profi_angola",
}: PublicOrAppShellProps) {
  const currentUser = await getOptionalCurrentUser();
  const content = <main>{children}</main>;

  if (currentUser) {
    return (
      <AppShell currentUser={currentUser} verticalKey={verticalKey}>
        {content}
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader verticalKey={verticalKey} />
      {content}
      <PublicFooter verticalKey={verticalKey} />
    </div>
  );
}

async function getOptionalCurrentUser() {
  return getCurrentUser().catch((error: unknown) => {
    if (isAccessError(error)) {
      return null;
    }

    throw error;
  });
}
