import { NextResponse, type NextRequest } from "next/server";

import { getVerticalByHost, type EcosystemVerticalKey } from "./lib/ecosystem/verticals";

const ROOT_REWRITES: Partial<Record<EcosystemVerticalKey, string>> = {
  account: "/conta",
  operations: "/operacoes",
};

export function proxy(request: NextRequest) {
  const vertical = getVerticalByHost(request.headers.get("host"));
  const rewritePath = ROOT_REWRITES[vertical.key];

  if (!rewritePath) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = rewritePath;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/"],
};
