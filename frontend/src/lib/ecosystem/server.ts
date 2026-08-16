import "server-only";

import { headers } from "next/headers";

import { getVerticalByHost, getVerticalByKey, type EcosystemVerticalKey } from "./verticals";

export async function getCurrentVertical(verticalKey?: EcosystemVerticalKey) {
  if (verticalKey) {
    return getVerticalByKey(verticalKey);
  }

  const requestHeaders = await headers();

  return getVerticalByHost(requestHeaders.get("host"));
}
