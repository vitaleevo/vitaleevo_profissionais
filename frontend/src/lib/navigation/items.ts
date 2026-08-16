import {
  ECOSYSTEM_VERTICALS,
  getVerticalByKey,
  type EcosystemVerticalKey,
  type NavigationItem,
} from "@/lib/ecosystem/verticals";

export type { NavigationItem };

export const publicNavigation = ECOSYSTEM_VERTICALS.profi_angola.navigation;

export const serviceNavigation = ECOSYSTEM_VERTICALS.profi_angola.navigation;

export function getPublicNavigation(verticalKey?: EcosystemVerticalKey) {
  return getVerticalByKey(verticalKey).navigation;
}

export const legalNavigation = [
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos de uso" },
] satisfies NavigationItem[];
