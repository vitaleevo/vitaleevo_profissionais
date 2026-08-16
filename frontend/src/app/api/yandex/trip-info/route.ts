import { NextResponse } from "next/server";

import { clientIpFromRequest, consumeRateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

const yandexTripInfoUrl = "https://taxi-routeinfo.taxi.yandex.net/taxi_info";
const supportedFareClasses = new Set(["econom", "business", "comfortplus", "minivan", "vip"]);
const supportedLanguages = new Set(["en", "pt", "pt-AO", "ru", "es", "fr"]);
const rateLimitWindowMs = 60_000;
const rateLimitMax = Number(process.env.YANDEX_TRIP_INFO_RATE_LIMIT_PER_MINUTE ?? 30);

export async function GET(request: Request) {
  const rateLimit = consumeRateLimit(`yandex-trip:${clientIpFromRequest(request)}`, rateLimitMax, rateLimitWindowMs);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { message: "Muitas tentativas. Tente novamente dentro de instantes." } },
      { status: 429, headers: { "Retry-After": rateLimit.retryAfterSeconds.toString() } },
    );
  }

  const clid = process.env.YANDEX_TAXI_CLID;
  const apiKey = process.env.YANDEX_TAXI_API_KEY;

  if (!clid || !apiKey) {
    return NextResponse.json(
      { error: { message: "Servico de estimativa de viagem indisponivel." } },
      { status: 503 },
    );
  }

  const sourceUrl = new URL(request.url);
  const origin = coordinatesFromParams(sourceUrl.searchParams, "origin");
  const destination = coordinatesFromParams(sourceUrl.searchParams, "destination");

  if (!origin || !destination) {
    return NextResponse.json(
      {
        error: {
          message: "Informe origin_latitude, origin_longitude, destination_latitude e destination_longitude.",
        },
      },
      { status: 400 },
    );
  }

  const fareClass = fareClassFromParams(sourceUrl.searchParams);
  const yandexUrl = new URL(yandexTripInfoUrl);
  yandexUrl.searchParams.set("clid", clid);
  yandexUrl.searchParams.set("rll", `${origin.longitude},${origin.latitude}~${destination.longitude},${destination.latitude}`);
  yandexUrl.searchParams.set("lang", languageFromParams(sourceUrl.searchParams));
  if (fareClass) yandexUrl.searchParams.set("class", fareClass);

  const requirements = requirementsFromParams(sourceUrl.searchParams);
  if (requirements) yandexUrl.searchParams.set("req", requirements);

  const response = await fetch(yandexUrl, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "YaTaxi-Api-Key": apiKey,
    },
  });

  if (response.status === 204) {
    return NextResponse.json(
      { data: null, error: { message: "A regiao informada nao e suportada pela Yandex Go." } },
      { status: 200 },
    );
  }

  const payload = await response.json().catch(() => ({
    error: {
      message: "A Yandex respondeu num formato inesperado.",
    },
  }));

  return NextResponse.json(payload, { status: response.status });
}

function coordinatesFromParams(params: URLSearchParams, prefix: "origin" | "destination") {
  const latitude = Number(params.get(`${prefix}_latitude`));
  const longitude = Number(params.get(`${prefix}_longitude`));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;

  return { latitude, longitude };
}

function fareClassFromParams(params: URLSearchParams) {
  const requestedClasses = (params.get("class") ?? "econom")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => supportedFareClasses.has(item));

  return requestedClasses.join(",");
}

function languageFromParams(params: URLSearchParams) {
  const lang = params.get("lang") ?? "en";
  return supportedLanguages.has(lang) ? lang : "en";
}

function requirementsFromParams(params: URLSearchParams) {
  const requirements = params.get("req");
  if (!requirements) return null;

  return /^[a-z0-9_,:-]{1,160}$/i.test(requirements) ? requirements : null;
}
