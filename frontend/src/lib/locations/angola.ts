export const ANGOLA_PROVINCES = [
  "Bengo",
  "Benguela",
  "Bie",
  "Cabinda",
  "Cuando",
  "Cubango",
  "Cuanza Norte",
  "Cuanza Sul",
  "Cunene",
  "Huambo",
  "Huila",
  "Icolo e Bengo",
  "Luanda",
  "Lunda Norte",
  "Lunda Sul",
  "Malanje",
  "Moxico",
  "Moxico Leste",
  "Namibe",
  "Uige",
  "Zaire",
];

export const ANGOLA_MUNICIPALITIES_BY_PROVINCE: Record<string, string[]> = {
  Bengo: ["Ambriz", "Bula Atumba", "Dande", "Dembos", "Nambuangongo", "Pango Aluquem"],
  Benguela: ["Baia Farta", "Balombo", "Benguela", "Bocoio", "Caimbambo", "Catumbela", "Chongoroi", "Cubal", "Ganda", "Lobito"],
  Bie: ["Andulo", "Camacupa", "Catabola", "Chinguar", "Chitembo", "Cuemba", "Cunhinga", "Kuito", "Nharêa"],
  Cabinda: ["Belize", "Buco-Zau", "Cabinda", "Cacongo"],
  Cuando: ["Calai", "Cuangar", "Dirico", "Mavinga", "Rivungo"],
  Cubango: ["Cuchi", "Cuvelai", "Menongue", "Nancova"],
  "Cuanza Norte": ["Ambaca", "Banga", "Bolongongo", "Cambambe", "Cazengo", "Golungo Alto", "Lucala", "Quiculungo", "Samba Caju"],
  "Cuanza Sul": ["Amboim", "Cassongue", "Cela", "Conda", "Ebo", "Libolo", "Mussende", "Porto Amboim", "Quibala", "Quilenda", "Seles", "Sumbe"],
  Cunene: ["Cahama", "Cuanhama", "Curoca", "Cuvelai", "Namacunde", "Ombadja"],
  Huambo: ["Bailundo", "Caala", "Catchiungo", "Ecunha", "Huambo", "Londuimbali", "Longonjo", "Mungo", "Tchicala-Tcholoanga", "Tchindjenje", "Ucuma"],
  Huila: ["Caconda", "Cacula", "Caluquembe", "Chibia", "Chicomba", "Chipindo", "Cuvango", "Humpata", "Jamba", "Lubango", "Matala", "Quilengues", "Quipungo"],
  "Icolo e Bengo": ["Bom Jesus", "Cabo Ledo", "Catete", "Icolo e Bengo", "Quiçama"],
  Luanda: ["Belas", "Cacuaco", "Cazenga", "Ingombota", "Kilamba", "Maianga", "Rangel", "Sambizanga", "Talatona", "Viana"],
  "Lunda Norte": ["Cambulo", "Capenda-Camulemba", "Caungula", "Chitato", "Cuango", "Cuilo", "Lubalo", "Lucapa", "Xá-Muteba"],
  "Lunda Sul": ["Cacolo", "Dala", "Muconda", "Saurimo"],
  Malanje: ["Cacuso", "Calandula", "Cambundi-Catembo", "Cangandala", "Caombo", "Kiwaba Nzoji", "Kunda dya Baze", "Luquembo", "Malanje", "Marimba", "Massango", "Mucari", "Quela", "Quirima"],
  Moxico: ["Alto Zambeze", "Bundas", "Cameia", "Leua", "Luacano", "Luau", "Luena"],
  "Moxico Leste": ["Cazombo", "Lumbala Nguimbo", "Luau"],
  Namibe: ["Bibala", "Camucuio", "Mocamedes", "Tombwa", "Virei"],
  Uige: ["Alto Cauale", "Ambuila", "Bembe", "Buengas", "Bungo", "Damba", "Maquela do Zombo", "Mucaba", "Negage", "Puri", "Quimbele", "Quitexe", "Sanza Pombo", "Songo", "Uige", "Zombo"],
  Zaire: ["Cuimba", "Mbanza Kongo", "Noqui", "Nzeto", "Soyo", "Tomboco"],
};

export const ANGOLA_NEIGHBORHOODS_BY_MUNICIPALITY: Record<string, string[]> = {
  Belas: ["Benfica", "Camama", "Futungo de Belas", "Morro Bento", "Patriota", "Vila Verde"],
  Benguela: ["70", "Calombotao", "Cassoco", "Centro", "Nossa Senhora da Graca"],
  Cabinda: ["Chibodo", "Centro", "Tafe", "Lombo-Lombo"],
  Cacuaco: ["Cacuaco", "Kicolo", "Mulenvos", "Sequele"],
  Catete: ["Catete", "Centro", "Maria Teresa"],
  Cazenga: ["Cazenga", "Hoji Ya Henda", "Tala Hady"],
  Huambo: ["Cidade Alta", "Sao Joao", "Sao Pedro", "Sao Luis"],
  Ingombota: ["Baixa", "Ilha do Cabo", "Ingombota", "Maculusso", "Miramar", "Mutamba"],
  Kilamba: ["KK5000", "Kilamba", "Quarteirao A", "Quarteirao B"],
  Lobito: ["Canata", "Comandante Valodia", "Restinga", "Zona Alta"],
  Luanda: ["Alvalade", "Baixa", "Ilha do Cabo", "Ingombota", "Maculusso", "Miramar", "Mutamba"],
  Luau: ["Alto Luau", "Centro", "Estacao"],
  Lubango: ["Arco Iris", "Comercial", "Mapunda", "Mitcha"],
  Maianga: ["Alvalade", "Maianga", "Prenda", "Sagrada Esperanca"],
  Mocamedes: ["Centro", "Praia Amelia", "Torre do Tombo"],
  Talatona: ["Benfica", "Cidade Financeira", "Lar do Patriota", "Talatona"],
  Uige: ["Centro", "Papel", "Popular"],
  Viana: ["Estalagem", "Viana", "Vila Flor", "Zango"],
};

export type AngolaTerritoryMunicipality = {
  name: string;
  neighborhoods: string[];
};

export type AngolaTerritoryProvince = {
  center?: { latitude: number; longitude: number };
  municipalities: AngolaTerritoryMunicipality[];
  name: string;
};

export const ANGOLA_BOUNDS = {
  minLatitude: -18.1,
  maxLatitude: -4.2,
  minLongitude: 11.3,
  maxLongitude: 24.2,
};

export const ANGOLA_PROVINCE_CENTERS: Record<string, { latitude: number; longitude: number }> = {
  Bengo: { latitude: -8.85, longitude: 13.72 },
  Benguela: { latitude: -12.58, longitude: 13.4 },
  Bie: { latitude: -12.48, longitude: 17.65 },
  Cabinda: { latitude: -5.56, longitude: 12.19 },
  Cuando: { latitude: -15.65, longitude: 20.35 },
  Cubango: { latitude: -14.65, longitude: 17.75 },
  "Cuanza Norte": { latitude: -9.28, longitude: 14.9 },
  "Cuanza Sul": { latitude: -11.3, longitude: 14.55 },
  Cunene: { latitude: -16.3, longitude: 15.85 },
  Huambo: { latitude: -12.78, longitude: 15.75 },
  Huila: { latitude: -14.9, longitude: 14.7 },
  "Icolo e Bengo": { latitude: -9.05, longitude: 13.75 },
  Luanda: { latitude: -8.84, longitude: 13.23 },
  "Lunda Norte": { latitude: -8.8, longitude: 19.6 },
  "Lunda Sul": { latitude: -10.7, longitude: 20.35 },
  Malanje: { latitude: -9.6, longitude: 16.4 },
  Moxico: { latitude: -12.8, longitude: 20.9 },
  "Moxico Leste": { latitude: -11.9, longitude: 23 },
  Namibe: { latitude: -15.2, longitude: 12.2 },
  Uige: { latitude: -7.6, longitude: 15 },
  Zaire: { latitude: -6.1, longitude: 13.7 },
};

export const ANGOLA_MUNICIPALITY_CENTERS_BY_PROVINCE: Record<string, Record<string, { latitude: number; longitude: number }>> = {
  Benguela: {
    Benguela: { latitude: -12.5790048, longitude: 13.4037117 },
    Ganda: { latitude: -13.0172603, longitude: 14.6358601 },
    Lobito: { latitude: -12.3644, longitude: 13.536 },
  },
  Huambo: {
    Huambo: { latitude: -12.7761, longitude: 15.7392 },
  },
  Huila: {
    Lubango: { latitude: -14.9172, longitude: 13.4925 },
  },
  Luanda: {
    Ingombota: { latitude: -8.8147, longitude: 13.2302 },
    Kilamba: { latitude: -8.9957, longitude: 13.2644 },
    Maianga: { latitude: -8.8273, longitude: 13.245 },
    Talatona: { latitude: -8.9166, longitude: 13.1829 },
    Viana: { latitude: -8.904, longitude: 13.3718 },
  },
  "Lunda Sul": {
    Saurimo: { latitude: -10.7073, longitude: 22.2312 },
  },
  Namibe: {
    Mocamedes: { latitude: -15.1961, longitude: 12.1522 },
  },
  Uige: {
    Uige: { latitude: -7.6087, longitude: 15.0613 },
  },
};

export const ANGOLA_TERRITORY: AngolaTerritoryProvince[] = ANGOLA_PROVINCES.map((province) => ({
  center: ANGOLA_PROVINCE_CENTERS[province],
  municipalities: (ANGOLA_MUNICIPALITIES_BY_PROVINCE[province] ?? []).map((municipality) => ({
    name: municipality,
    neighborhoods: ANGOLA_NEIGHBORHOODS_BY_MUNICIPALITY[municipality] ?? [],
  })),
  name: province,
}));

export function getAngolaMunicipalities(province: string | null | undefined) {
  if (!province) return [];

  return ANGOLA_MUNICIPALITIES_BY_PROVINCE[province] ?? [];
}

export function getAngolaNeighborhoods(municipality: string | null | undefined) {
  if (!municipality) return [];

  return ANGOLA_NEIGHBORHOODS_BY_MUNICIPALITY[municipality] ?? [];
}

export function getAngolaMunicipalityCenter(province: string | null | undefined, municipality: string | null | undefined) {
  if (!province || !municipality) return null;

  const provinceCenters = ANGOLA_MUNICIPALITY_CENTERS_BY_PROVINCE[province];
  if (!provinceCenters) return null;

  const normalizedMunicipality = normalizeAdministrativeName(municipality);
  const match = Object.entries(provinceCenters).find(
    ([name]) => normalizeAdministrativeName(name) === normalizedMunicipality,
  );

  return match?.[1] ?? null;
}

export function findAngolaProvinceForMunicipality(municipality: string | null | undefined) {
  if (!municipality) return null;

  const normalizedMunicipality = normalizeAdministrativeName(municipality);
  const entry = Object.entries(ANGOLA_MUNICIPALITIES_BY_PROVINCE).find(([, municipalities]) =>
    municipalities.some((item) => normalizeAdministrativeName(item) === normalizedMunicipality),
  );

  return entry?.[0] ?? null;
}

export function normalizeAdministrativeName(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatAdministrativeLocation(parts: {
  municipality?: string | null;
  neighborhood?: string | null;
  province?: string | null;
}) {
  return [parts.province, parts.municipality, parts.neighborhood].filter(Boolean).join(" / ");
}
