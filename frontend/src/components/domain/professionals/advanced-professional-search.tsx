"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Crosshair, LocateFixed, MapPin, Search, ShieldCheck, SlidersHorizontal, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AngolaProfessionalMap } from "@/components/domain/professionals/angola-professional-map";
import type { ServiceCategory, Professional } from "@/lib/api/types";
import { formatAoa } from "@/lib/formatters/money";
import { statusLabel } from "@/lib/formatters/status";
import {
  ANGOLA_PROVINCES,
  formatAdministrativeLocation,
  getAngolaMunicipalityCenter,
  getAngolaMunicipalities,
  getAngolaNeighborhoods,
} from "@/lib/locations/angola";

type SearchProfessional = Professional & {
  province?: string | null;
  municipality?: string | null;
  distance_km?: number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type AdvancedProfessionalSearchProps = {
  categories: ServiceCategory[];
};

type ApiEnvelope<T> = {
  data?: T;
  error?: {
    message?: string;
  };
};

const ALL_VALUE = "todos";
const radiusOptions = ["5", "10", "25", "50", "100", "250"];

export function AdvancedProfessionalSearch({ categories }: AdvancedProfessionalSearchProps) {
  const [categorySlug, setCategorySlug] = useState(ALL_VALUE);
  const [province, setProvince] = useState(ALL_VALUE);
  const [municipality, setMunicipality] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [radiusKm, setRadiusKm] = useState("50");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [professionals, setProfessionals] = useState<SearchProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const municipalitySuggestions = useMemo(() => {
    if (province === ALL_VALUE) {
      return [];
    }

    return getAngolaMunicipalities(province);
  }, [province]);
  const neighborhoodSuggestions = useMemo(() => getAngolaNeighborhoods(municipality), [municipality]);
  const selectedProvince = province === ALL_VALUE ? null : province;
  const manualCoordinates = useMemo(
    () => getAngolaMunicipalityCenter(selectedProvince, municipality.trim()),
    [municipality, selectedProvince],
  );
  const searchCoordinates = coordinates ?? manualCoordinates;
  const neighborhoodPlaceholder = municipality.trim()
    ? neighborhoodSuggestions[0]
      ? `Ex: ${neighborhoodSuggestions[0]}`
      : "Bairro ou referencia"
    : "Escolha um municipio";

  const fetchProfessionals = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setMessage(null);

    const params = new URLSearchParams();
    if (categorySlug !== ALL_VALUE) params.set("category_slug", categorySlug);
    if (province !== ALL_VALUE) params.set("province", province);
    if (municipality.trim()) params.set("municipality", municipality.trim());
    if (neighborhood.trim()) params.set("neighborhood", neighborhood.trim());
    if (searchCoordinates) {
      params.set("latitude", searchCoordinates.latitude.toString());
      params.set("longitude", searchCoordinates.longitude.toString());
      params.set("radius_km", radiusKm);
    }

    try {
      const response = await fetch(`/api/profissionais/busca?${params}`, { signal });
      const payload = (await response.json()) as ApiEnvelope<SearchProfessional[]>;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Nao foi possivel carregar profissionais.");
      }

      setProfessionals(payload.data);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setProfessionals([]);
        setMessage((error as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, [categorySlug, province, municipality, neighborhood, radiusKm, searchCoordinates]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void fetchProfessionals(controller.signal);
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [fetchProfessionals]);

  function requestLocation() {
    if (!navigator.geolocation) {
      setMessage("Este navegador nao permite obter localizacao.");
      return;
    }

    setLocationLoading(true);
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      () => {
        setMessage("Nao foi possivel obter a sua localizacao. Pode pesquisar por provincia, municipio e bairro.");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    );
  }

  function clearLocation() {
    setCoordinates(null);
  }

  return (
    <section className="border-y bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Pesquisa nacional</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black tracking-normal">
              Encontre profissionais por provincia, municipio, bairro e distancia
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              Use a localizacao exata para ver profissionais proximos no mapa, ou pesquise manualmente em qualquer provincia de Angola.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit gap-2">
            <ShieldCheck className="size-3" />
            21 provincias de Angola
          </Badge>
        </div>

        <Card className="shadow-sm">
          <CardContent className="grid gap-5 p-5">
            <div className="grid gap-3 lg:grid-cols-6">
              <div className="grid gap-2 lg:col-span-2">
                <label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="category">
                  Categoria
                </label>
                <Select value={categorySlug} onValueChange={(value) => setCategorySlug(value ?? ALL_VALUE)}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Todas categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Todas categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="province">
                  Provincia
                </label>
                <Select value={province} onValueChange={(value) => {
                  setProvince(value ?? ALL_VALUE);
                  setMunicipality("");
                  setNeighborhood("");
                }}>
                  <SelectTrigger id="province" className="w-full">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>Todas</SelectItem>
                    {ANGOLA_PROVINCES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="municipality">
                  Municipio
                </label>
                <Input
                  id="municipality"
                  list="municipality-options"
                  placeholder="Ex: Talatona"
                  value={municipality}
                  onChange={(event) => {
                    setMunicipality(event.target.value);
                    setNeighborhood("");
                  }}
                />
                <datalist id="municipality-options">
                  {municipalitySuggestions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="neighborhood">
                  Bairro
                </label>
                <Input
                  id="neighborhood"
                  list="neighborhood-options"
                  placeholder={neighborhoodPlaceholder}
                  value={neighborhood}
                  onChange={(event) => setNeighborhood(event.target.value)}
                />
                <datalist id="neighborhood-options">
                  {neighborhoodSuggestions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="radius">
                  Raio
                </label>
                <Select value={radiusKm} onValueChange={(value) => setRadiusKm(value ?? "50")} disabled={!searchCoordinates}>
                  <SelectTrigger id="radius" className="w-full">
                    <SelectValue>{radiusKm} km</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {radiusOptions.map((radius) => (
                      <SelectItem key={radius} value={radius}>
                        {radius} km
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={requestLocation} disabled={locationLoading}>
                  <LocateFixed />
                  {locationLoading ? "A obter localizacao" : "Usar localizacao exata"}
                </Button>
                {coordinates ? (
                  <Button type="button" variant="outline" onClick={clearLocation}>
                    Remover localizacao
                  </Button>
                ) : null}
              </div>
              <span className="inline-flex items-center gap-2 text-xs leading-5 text-muted-foreground">
                <Crosshair className="size-4 text-primary" />
                {coordinates
                  ? "A permissao e pedida pelo navegador e usada apenas para ordenar a pesquisa atual."
                  : manualCoordinates
                    ? "Raio aplicado ao municipio selecionado."
                    : "Escolha um municipio mapeado ou use a localizacao exata para ativar o raio."}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <ProfessionalMap
            professionals={professionals}
            coordinates={coordinates}
            loading={loading}
            municipality={municipality.trim() || null}
            onProvinceSelect={(nextProvince) => {
              setProvince(nextProvince);
              setMunicipality("");
            }}
            radiusKm={radiusKm}
            selectedProvince={selectedProvince}
          />
          <ProfessionalResults professionals={professionals} loading={loading} message={message} />
        </div>
      </div>
    </section>
  );
}

function ProfessionalMap({
  professionals,
  coordinates,
  loading,
  municipality,
  onProvinceSelect,
  radiusKm,
  selectedProvince,
}: {
  professionals: SearchProfessional[];
  coordinates: Coordinates | null;
  loading: boolean;
  municipality: string | null;
  onProvinceSelect: (province: string) => void;
  radiusKm: string;
  selectedProvince: string | null;
}) {
  const mappedProfessionals = professionals.filter((professional) => professional.coordinates?.latitude && professional.coordinates?.longitude);

  return (
    <Card className="shadow-sm">
      <CardContent className="grid gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Mapa de proximidade</p>
            <h3 className="mt-1 text-xl font-black">Profissionais encontrados</h3>
          </div>
          <Badge variant="outline">{loading ? "A carregar" : `${mappedProfessionals.length} no mapa`}</Badge>
        </div>
        <AngolaProfessionalMap
          coordinates={coordinates}
          municipality={municipality}
          onProvinceSelect={onProvinceSelect}
          professionals={mappedProfessionals}
          radiusKm={radiusKm}
          selectedProvince={selectedProvince}
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Mapa do OpenStreetMap com foco no municipio, provincia ou localizacao autorizada.
        </p>
      </CardContent>
    </Card>
  );
}

function ProfessionalResults({
  professionals,
  loading,
  message,
}: {
  professionals: SearchProfessional[];
  loading: boolean;
  message: string | null;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="grid gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Resultados</p>
            <h3 className="mt-1 text-xl font-black">Profissionais proximos</h3>
          </div>
          <Search className="size-5 text-primary" />
        </div>

        {message ? (
          <div className="rounded-lg border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">{message}</div>
        ) : null}

        {loading ? (
          <div className="rounded-lg border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
            A pesquisar profissionais em Angola...
          </div>
        ) : null}

        {!loading && professionals.length === 0 ? (
          <div className="rounded-lg border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
            Nenhum profissional encontrado com estes filtros. Experimente remover bairro, aumentar o raio ou pesquisar outra provincia.
          </div>
        ) : null}

        <div className="grid max-h-[520px] gap-3 overflow-y-auto pr-1">
          {professionals.map((professional) => (
            <div key={professional.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-black">{professional.name}</h4>
                  <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                </div>
                <Badge variant="outline">{statusLabel(professional.status)}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                  <MapPin className="size-3 text-primary" />
                  {formatAdministrativeLocation(professional) || professional.location}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                  <Star className="size-3 text-primary" />
                  {professional.rating.toFixed(1)} rating
                </span>
                {professional.distance_km !== undefined ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                    <SlidersHorizontal className="size-3 text-primary" />
                    {professional.distance_km} km
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                <span className="text-sm text-muted-foreground">{professional.completed_jobs} servicos</span>
                <strong className="text-sm text-primary">{formatAoa(professional.hourly_rate_cents)}/h</strong>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
