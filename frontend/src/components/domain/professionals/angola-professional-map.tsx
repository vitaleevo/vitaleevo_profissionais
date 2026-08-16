"use client";

import { ExternalLink, LocateFixed, MapPin, Navigation } from "lucide-react";

import type { Professional } from "@/lib/api/types";
import { ANGOLA_PROVINCE_CENTERS, getAngolaMunicipalityCenter } from "@/lib/locations/angola";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type MapBounds = {
  maxLatitude: number;
  maxLongitude: number;
  minLatitude: number;
  minLongitude: number;
};

type FallbackTileGrid = {
  columns: number;
  rows: number;
  tiles: string[];
};

type MapProfessional = Professional & {
  province?: string | null;
  municipality?: string | null;
  distance_km?: number;
};

type AngolaProfessionalMapProps = {
  coordinates: Coordinates | null;
  municipality: string | null;
  onProvinceSelect?: (province: string) => void;
  professionals: MapProfessional[];
  radiusKm: string;
  selectedProvince: string | null;
};

const LUANDA_CENTER = { latitude: -8.95429, longitude: 13.24299 };
const LUANDA_BOUNDS = {
  maxLatitude: -8.897056860638294,
  maxLongitude: 13.353366851806642,
  minLatitude: -9.011516126180938,
  minLongitude: 13.132610321044922,
};
const OSM_LAYER = "mapnik";

export function AngolaProfessionalMap({
  coordinates,
  municipality,
  professionals,
  radiusKm,
  selectedProvince,
}: AngolaProfessionalMapProps) {
  const mappedProfessionals = professionals.filter((professional) => Boolean(coordinatesFromProfessional(professional)));
  const municipalityCoordinates = getAngolaMunicipalityCenter(selectedProvince, municipality);
  const provinceCoordinates = provinceCenter(selectedProvince);
  const focus = coordinates ?? municipalityCoordinates ?? provinceCoordinates ?? LUANDA_CENTER;
  const marker = coordinates ?? municipalityCoordinates ?? (selectedProvince ? focus : null);
  const hasMunicipalityFocus = Boolean(municipalityCoordinates);
  const hasLuandaFocus = !selectedProvince || (selectedProvince === "Luanda" && !hasMunicipalityFocus);
  const bounds = mapBoundsForFocus({
    coordinates,
    focus,
    hasMunicipalityFocus,
    radiusKm,
    selectedProvince,
  });
  const mapUrl = openStreetMapEmbedUrl(bounds, marker);
  const mapZoom = hasLuandaFocus || hasMunicipalityFocus || coordinates ? 12 : 9;
  const largerMapUrl = openStreetMapBrowseUrl(focus, marker, mapZoom);
  const fallbackTileGrid = openStreetMapFallbackTileGrid(bounds, mapZoom);
  const focusLabel = coordinates
    ? "A sua localizacao"
    : municipalityCoordinates && municipality
      ? `${municipality}, ${selectedProvince}`
      : selectedProvince ?? "Luanda";

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-col gap-3 border-b bg-background/95 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-black">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span>OpenStreetMap</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Mapa real com foco em {focusLabel} e area ajustada aos filtros da pesquisa.
          </p>
        </div>

        <a
          className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-md border bg-background px-3 text-xs font-bold transition hover:bg-muted"
          href={largerMapUrl}
          rel="noreferrer"
          target="_blank"
        >
          Ver maior
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      <div className="relative h-[400px] overflow-hidden bg-muted sm:h-[460px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 grid bg-[#dce8ea]"
          style={{
            gridTemplateColumns: `repeat(${fallbackTileGrid.columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${fallbackTileGrid.rows}, minmax(0, 1fr))`,
          }}
        >
          {fallbackTileGrid.tiles.map((tile) => (
            <div
              className="h-full w-full bg-cover bg-center opacity-90"
              key={tile}
              style={{ backgroundImage: `url(${tile})` }}
            />
          ))}
        </div>
        <iframe
          className="absolute inset-0 h-full w-full border-0 bg-transparent"
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
          title={`Mapa OpenStreetMap - ${focusLabel}`}
        />
      </div>

      <div className="border-t bg-background/95 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Navigation className="size-3 text-primary" />
            {focusLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-3 rounded-full bg-primary" />
            {mappedProfessionals.length} profissionais com coordenadas
          </span>
          {coordinates ? (
            <span className="inline-flex items-center gap-2">
              <LocateFixed className="size-3 text-foreground" />
              Raio de {radiusKm} km
            </span>
          ) : null}
        </div>

        {municipality ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Municipio pesquisado: <strong className="text-foreground">{municipality}</strong>
          </p>
        ) : null}

        {mappedProfessionals.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {mappedProfessionals.slice(0, 4).map((professional, index) => (
              <div className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 text-xs" key={professional.id}>
                <span className="min-w-0 truncate font-bold">
                  {index + 1}. {professional.name}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {professional.distance_km !== undefined ? `${professional.distance_km} km` : professional.province ?? professional.location}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Quando houver profissionais com coordenadas cadastradas, a area do mapa acompanha os filtros e a lista de resultados.
          </p>
        )}

        <p className="mt-3 text-[0.68rem] leading-4 text-muted-foreground">
          Dados cartograficos:{" "}
          <a className="underline-offset-2 hover:underline" href="https://www.openstreetmap.org/copyright" rel="noreferrer" target="_blank">
            OpenStreetMap contributors
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function mapBoundsForFocus({
  coordinates,
  focus,
  hasMunicipalityFocus,
  radiusKm,
  selectedProvince,
}: {
  coordinates: Coordinates | null;
  focus: Coordinates;
  hasMunicipalityFocus: boolean;
  radiusKm: string;
  selectedProvince: string | null;
}) {
  if (coordinates) {
    return boundsAround(focus, Number(radiusKm) || 25);
  }

  if (hasMunicipalityFocus) {
    return boundsAround(focus, 35);
  }

  if (!selectedProvince || selectedProvince === "Luanda") {
    return LUANDA_BOUNDS;
  }

  return boundsAround(focus, 95);
}

function openStreetMapEmbedUrl(bounds: MapBounds, marker: Coordinates | null) {
  const params = new URLSearchParams({
    bbox: [bounds.minLongitude, bounds.minLatitude, bounds.maxLongitude, bounds.maxLatitude].join(","),
    layer: OSM_LAYER,
  });

  if (marker) {
    params.set("marker", `${marker.latitude},${marker.longitude}`);
  }

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

function openStreetMapBrowseUrl(center: Coordinates, marker: Coordinates | null, zoom: number) {
  const markerParams = marker ? `?mlat=${marker.latitude}&mlon=${marker.longitude}` : "";

  return `https://www.openstreetmap.org/${markerParams}#map=${zoom}/${center.latitude}/${center.longitude}`;
}

function openStreetMapFallbackTileGrid(bounds: MapBounds, zoom: number): FallbackTileGrid {
  const grid = fallbackTileGridAtZoom(bounds, zoom);

  if (grid.tiles.length > 24 && zoom > 7) {
    return openStreetMapFallbackTileGrid(bounds, zoom - 1);
  }

  return grid;
}

function fallbackTileGridAtZoom(bounds: MapBounds, zoom: number): FallbackTileGrid {
  const minX = lonToTileX(bounds.minLongitude, zoom);
  const maxX = lonToTileX(bounds.maxLongitude, zoom);
  const minY = latToTileY(bounds.maxLatitude, zoom);
  const maxY = latToTileY(bounds.minLatitude, zoom);
  const tiles: string[] = [];

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      tiles.push(`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`);
    }
  }

  return {
    columns: Math.max(1, maxX - minX + 1),
    rows: Math.max(1, maxY - minY + 1),
    tiles,
  };
}

function lonToTileX(longitude: number, zoom: number) {
  const scale = 2 ** zoom;
  return clamp(Math.floor(((longitude + 180) / 360) * scale), 0, scale - 1);
}

function latToTileY(latitude: number, zoom: number) {
  const scale = 2 ** zoom;
  const radians = toRadians(clamp(latitude, -85.05112878, 85.05112878));
  const value = ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * scale;

  return clamp(Math.floor(value), 0, scale - 1);
}

function coordinatesFromProfessional(professional: MapProfessional | undefined) {
  const latitude = Number(professional?.coordinates?.latitude);
  const longitude = Number(professional?.coordinates?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function provinceCenter(province: string | null) {
  if (!province) return null;

  return ANGOLA_PROVINCE_CENTERS[province] ?? null;
}

function boundsAround(center: Coordinates, radiusKm: number) {
  const safeRadius = clamp(radiusKm, 5, 250);
  const latitudeDelta = safeRadius / 111;
  const longitudeDelta = latitudeDelta / Math.max(Math.cos(toRadians(center.latitude)), 0.25);

  return {
    maxLatitude: clamp(center.latitude + latitudeDelta, -90, 90),
    maxLongitude: clamp(center.longitude + longitudeDelta, -180, 180),
    minLatitude: clamp(center.latitude - latitudeDelta, -90, 90),
    minLongitude: clamp(center.longitude - longitudeDelta, -180, 180),
  };
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
