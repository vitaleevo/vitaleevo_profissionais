module AngolaLocations
  PROVINCES = [
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
    "Zaire"
  ].freeze

  MUNICIPALITIES_BY_PROVINCE = {
    "Bengo" => [ "Ambriz", "Bula Atumba", "Dande", "Dembos", "Nambuangongo", "Pango Aluquem" ],
    "Benguela" => [ "Baia Farta", "Balombo", "Benguela", "Bocoio", "Caimbambo", "Catumbela", "Chongoroi", "Cubal", "Ganda", "Lobito" ],
    "Bie" => [ "Andulo", "Camacupa", "Catabola", "Chinguar", "Chitembo", "Cuemba", "Cunhinga", "Kuito", "Nharea" ],
    "Cabinda" => [ "Belize", "Buco-Zau", "Cabinda", "Cacongo" ],
    "Cuando" => [ "Calai", "Cuangar", "Dirico", "Mavinga", "Rivungo" ],
    "Cubango" => [ "Cuchi", "Cuvelai", "Menongue", "Nancova" ],
    "Cuanza Norte" => [ "Ambaca", "Banga", "Bolongongo", "Cambambe", "Cazengo", "Golungo Alto", "Lucala", "Quiculungo", "Samba Caju" ],
    "Cuanza Sul" => [ "Amboim", "Cassongue", "Cela", "Conda", "Ebo", "Libolo", "Mussende", "Porto Amboim", "Quibala", "Quilenda", "Seles", "Sumbe" ],
    "Cunene" => [ "Cahama", "Cuanhama", "Curoca", "Cuvelai", "Namacunde", "Ombadja" ],
    "Huambo" => [ "Bailundo", "Caala", "Catchiungo", "Ecunha", "Huambo", "Londuimbali", "Longonjo", "Mungo", "Tchicala-Tcholoanga", "Tchindjenje", "Ucuma" ],
    "Huila" => [ "Caconda", "Cacula", "Caluquembe", "Chibia", "Chicomba", "Chipindo", "Cuvango", "Humpata", "Jamba", "Lubango", "Matala", "Quilengues", "Quipungo" ],
    "Icolo e Bengo" => [ "Bom Jesus", "Cabo Ledo", "Catete", "Icolo e Bengo", "Quicama" ],
    "Luanda" => [ "Belas", "Cacuaco", "Cazenga", "Ingombota", "Kilamba", "Maianga", "Rangel", "Sambizanga", "Talatona", "Viana" ],
    "Lunda Norte" => [ "Cambulo", "Capenda-Camulemba", "Caungula", "Chitato", "Cuango", "Cuilo", "Lubalo", "Lucapa", "Xa-Muteba" ],
    "Lunda Sul" => [ "Cacolo", "Dala", "Muconda", "Saurimo" ],
    "Malanje" => [ "Cacuso", "Calandula", "Cambundi-Catembo", "Cangandala", "Caombo", "Kiwaba Nzoji", "Kunda dya Baze", "Luquembo", "Malanje", "Marimba", "Massango", "Mucari", "Quela", "Quirima" ],
    "Moxico" => [ "Alto Zambeze", "Bundas", "Cameia", "Leua", "Luacano", "Luau", "Luena" ],
    "Moxico Leste" => [ "Cazombo", "Lumbala Nguimbo", "Luau" ],
    "Namibe" => [ "Bibala", "Camucuio", "Mocamedes", "Tombwa", "Virei" ],
    "Uige" => [ "Alto Cauale", "Ambuila", "Bembe", "Buengas", "Bungo", "Damba", "Maquela do Zombo", "Mucaba", "Negage", "Puri", "Quimbele", "Quitexe", "Sanza Pombo", "Songo", "Uige", "Zombo" ],
    "Zaire" => [ "Cuimba", "Mbanza Kongo", "Noqui", "Nzeto", "Soyo", "Tomboco" ]
  }.freeze

  NEIGHBORHOODS_BY_MUNICIPALITY = {
    "Belas" => [ "Benfica", "Camama", "Futungo de Belas", "Morro Bento", "Patriota", "Vila Verde" ],
    "Benguela" => [ "70", "Calombotao", "Cassoco", "Centro", "Nossa Senhora da Graca" ],
    "Cabinda" => [ "Chibodo", "Centro", "Tafe", "Lombo-Lombo" ],
    "Cacuaco" => [ "Cacuaco", "Kicolo", "Mulenvos", "Sequele" ],
    "Catete" => [ "Catete", "Centro", "Maria Teresa" ],
    "Cazenga" => [ "Cazenga", "Hoji Ya Henda", "Tala Hady" ],
    "Huambo" => [ "Cidade Alta", "Sao Joao", "Sao Pedro", "Sao Luis" ],
    "Ingombota" => [ "Baixa", "Ilha do Cabo", "Ingombota", "Maculusso", "Miramar", "Mutamba" ],
    "Kilamba" => [ "KK5000", "Kilamba", "Quarteirao A", "Quarteirao B" ],
    "Lobito" => [ "Canata", "Comandante Valodia", "Restinga", "Zona Alta" ],
    "Luanda" => [ "Alvalade", "Baixa", "Ilha do Cabo", "Ingombota", "Maculusso", "Miramar", "Mutamba" ],
    "Luau" => [ "Alto Luau", "Centro", "Estacao" ],
    "Lubango" => [ "Arco Iris", "Comercial", "Mapunda", "Mitcha" ],
    "Maianga" => [ "Alvalade", "Maianga", "Prenda", "Sagrada Esperanca" ],
    "Mocamedes" => [ "Centro", "Praia Amelia", "Torre do Tombo" ],
    "Talatona" => [ "Benfica", "Cidade Financeira", "Lar do Patriota", "Talatona" ],
    "Uige" => [ "Centro", "Papel", "Popular" ],
    "Viana" => [ "Estalagem", "Viana", "Vila Flor", "Zango" ]
  }.freeze

  module_function

  def territory
    PROVINCES.map do |province|
      {
        name: province,
        municipalities: municipalities_for(province).map do |municipality|
          {
            name: municipality,
            neighborhoods: neighborhoods_for(municipality)
          }
        end
      }
    end
  end

  def municipalities_for(province)
    MUNICIPALITIES_BY_PROVINCE[canonical_province(province)] || []
  end

  def neighborhoods_for(municipality)
    NEIGHBORHOODS_BY_MUNICIPALITY[canonical_municipality(municipality)] || []
  end

  def canonical_province(value)
    find_by_normalized(PROVINCES, value)
  end

  def canonical_municipality(value)
    find_by_normalized(MUNICIPALITIES_BY_PROVINCE.values.flatten.uniq, value)
  end

  def canonical_neighborhood(value, municipality: nil)
    candidates = municipality.present? ? neighborhoods_for(municipality) : NEIGHBORHOODS_BY_MUNICIPALITY.values.flatten.uniq
    find_by_normalized(candidates, value)
  end

  def normalize_record(record)
    province = canonical_province(record.province)
    municipality = canonical_municipality(record.municipality)
    neighborhood = canonical_neighborhood(record.neighborhood, municipality: municipality)

    record.province = province if province
    record.municipality = municipality if municipality
    record.neighborhood = neighborhood if neighborhood
  end

  def normalize_params(attributes)
    normalized = attributes.to_h.deep_symbolize_keys
    province = canonical_province(normalized[:province] || normalized["province"])
    municipality = canonical_municipality(normalized[:municipality] || normalized["municipality"])
    neighborhood = canonical_neighborhood(normalized[:neighborhood] || normalized["neighborhood"], municipality: municipality)

    normalized[:province] = province if province
    normalized[:municipality] = municipality if municipality
    normalized[:neighborhood] = neighborhood if neighborhood
    normalized
  end

  def equivalent?(left, right)
    return false if left.blank? || right.blank?

    normalize(left) == normalize(right)
  end

  def province_coverage(professionals_scope:, requests_scope:)
    professional_counts = professionals_scope.group(:province).count
    request_counts = requests_scope.group(:province).count

    PROVINCES.map do |province|
      professionals_count = count_for(professional_counts, province)
      requests_count = count_for(request_counts, province)

      {
        province: province,
        professionals_count: professionals_count,
        requests_count: requests_count,
        coverage_gap: [ requests_count - professionals_count, 0 ].max,
        municipalities_count: municipalities_for(province).size
      }
    end
  end

  def normalize(value)
    I18n.transliterate(value.to_s).downcase.squish
  end

  def find_by_normalized(values, value)
    return nil if value.blank?

    normalized = normalize(value)
    values.find { |candidate| normalize(candidate) == normalized }
  end

  def count_for(counts, province)
    counts.sum { |key, count| equivalent?(key, province) ? count : 0 }
  end
end
