import os
import math
import json
import datetime
import zipfile
import xml.etree.ElementTree as ET
import openpyxl

EXCEL_PATH = r"C:\Users\maycon.nascimento\Downloads\Banco_De_Dados.xlsx"
KMZ_PATH = r"C:\Users\maycon.nascimento\Documents\ESTRUTURAS E INSTRUMENTAÇÃO GEOTECNICA ITAMINAS.kmz"
OUTPUT_DIR = r"C:\Users\maycon.nascimento\.gemini\antigravity-ide\scratch\mdsync-geotecnia\public\data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "geotech_master.json")

def utm_to_latlon(easting, northing, zone=23, northernHemisphere=False):
    """Converte coordenadas UTM SIRGAS 2000 / WGS84 para Latitude e Longitude decimais."""
    try:
        easting = float(easting)
        northing = float(northing)
        if easting == 0 or northing == 0:
            return None, None
    except:
        return None, None

    a = 6378137.0
    f = 1 / 298.257223563
    k0 = 0.9996
    e = math.sqrt(2 * f - f ** 2)
    e1sq = e ** 2 / (1 - e ** 2)

    x = easting - 500000.0
    y = northing if northernHemisphere else northing - 10000000.0

    m = y / k0
    mu = m / (a * (1 - e ** 2 / 4 - 3 * e ** 4 / 64 - 5 * e ** 6 / 256))

    e1 = (1 - math.sqrt(1 - e ** 2)) / (1 + math.sqrt(1 - e ** 2))
    j1 = (3 * e1 / 2 - 27 * e1 ** 3 / 32)
    j2 = (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32)
    j3 = (151 * e1 ** 3 / 96)
    j4 = (1097 * e1 ** 4 / 512)

    fp = mu + j1 * math.sin(2 * mu) + j2 * math.sin(4 * mu) + j3 * math.sin(6 * mu) + j4 * math.sin(8 * mu)

    c1 = e1sq * (math.cos(fp) ** 2)
    t1 = math.tan(fp) ** 2
    r1 = a * (1 - e ** 2) / ((1 - (e * math.sin(fp)) ** 2) ** 1.5)
    n1 = a / math.sqrt(1 - (e * math.sin(fp)) ** 2)

    d = x / (n1 * k0)

    lat = fp - (n1 * math.tan(fp) / r1) * (
        d ** 2 / 2 - (5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * e1sq) * d ** 4 / 24
        + (61 + 90 * t1 + 298 * c1 + 45 * t1 ** 2 - 252 * e1sq - 3 * c1 ** 2) * d ** 6 / 720
    )
    lat = math.degrees(lat)

    lon = (
        d - (1 + 2 * t1 + c1) * d ** 3 / 6
        + (5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * e1sq + 24 * t1 ** 2) * d ** 5 / 120
    ) / math.cos(fp)
    lon = math.degrees(lon) + (zone * 6 - 183)

    return round(lat, 6), round(lon, 6)

def parse_kmz_features(kmz_path):
    features = {}
    if not os.path.exists(kmz_path):
        return features

    with zipfile.ZipFile(kmz_path, 'r') as z:
        kml_data = z.read('doc.kml')
        root = ET.fromstring(kml_data)
        placemarks = root.findall('.//{http://www.opengis.net/kml/2.2}Placemark')
        for p in placemarks:
            name_el = p.find('{http://www.opengis.net/kml/2.2}name')
            coords_el = p.find('.//{http://www.opengis.net/kml/2.2}coordinates')
            if name_el is not None and name_el.text and coords_el is not None and coords_el.text:
                name = name_el.text.strip()
                raw_coords = coords_el.text.strip().split()
                if len(raw_coords) == 1:
                    parts = raw_coords[0].split(',')
                    if len(parts) >= 2:
                        try:
                            lon = float(parts[0])
                            lat = float(parts[1])
                            alt = float(parts[2]) if len(parts) > 2 else 0
                            features[name] = {"lat": lat, "lon": lon, "alt": alt, "type": "point"}
                        except:
                            pass
                elif len(raw_coords) > 1:
                    coords_list = []
                    for c in raw_coords:
                        parts = c.split(',')
                        if len(parts) >= 2:
                            try:
                                coords_list.append([float(parts[1]), float(parts[0])])
                            except:
                                pass
                    if coords_list:
                        features[name] = {"polygon": coords_list, "type": "polygon"}
    return features

def safe_float(val):
    if val is None or val == "":
        return None
    try:
        return float(val)
    except:
        return None

def safe_str(val):
    if val is None:
        return ""
    if isinstance(val, datetime.datetime):
        return val.strftime("%Y-%m-%d")
    return str(val).strip()

def main():
    print(f"Iniciando ETL geotécnico de {EXCEL_PATH}...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    kmz_features = parse_kmz_features(KMZ_PATH)
    print(f"Features extraídas do KMZ: {len(kmz_features)}")

    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
    
    # 1. Limites
    limites_sheet = wb['Limites']
    limites_headers = [safe_str(c) for c in next(limites_sheet.iter_rows(max_row=1, values_only=True))]
    limites_values = [safe_float(c) for c in next(limites_sheet.iter_rows(min_row=2, max_row=2, values_only=True))]
    limites_dict = dict(zip(limites_headers, limites_values))

    # 2. Informações Gerais (218 Instrumentos)
    info_sheet = wb['InformaçõesGerais']
    info_headers = [safe_str(c) for c in next(info_sheet.iter_rows(max_row=1, values_only=True))]
    
    instruments = []
    structures_set = set()

    for idx, row in enumerate(info_sheet.iter_rows(min_row=2, values_only=True), start=1):
        if not row[0]:
            continue
        
        estrutura = safe_str(row[0])
        tipo = safe_str(row[1])
        inst_id = safe_str(row[2])
        secao = safe_str(row[3])
        data_instalacao = safe_str(row[4])
        diametro = safe_str(row[5])
        comp_total = safe_float(row[6])
        prof_instalacao = safe_float(row[7])
        cota_topo = safe_float(row[8])
        cota_base = safe_float(row[9])
        cota_fundo = safe_float(row[10])
        coord_ns = safe_float(row[11])
        coord_ew = safe_float(row[12])
        datum = safe_str(row[13]) or "SIRGAS2000"
        
        lim_normal = safe_float(row[14])
        lim_atencao = safe_float(row[15])
        lim_alerta = safe_float(row[16])
        lim_emergencia = safe_float(row[17])
        situacao = safe_str(row[18]) or "Ativo"
        leitura_tipo = safe_str(row[19]) or "Manual"

        lat, lon = utm_to_latlon(coord_ew, coord_ns, zone=23, northernHemisphere=False)

        # Se não tiver UTM, checa KMZ
        kmz_key = f"{tipo}-{inst_id}".strip()
        if (not lat or not lon) and kmz_key in kmz_features and kmz_features[kmz_key]["type"] == "point":
            lat = kmz_features[kmz_key]["lat"]
            lon = kmz_features[kmz_key]["lon"]

        instruments.append({
            "uid": f"{estrutura}_{tipo}_{inst_id}".replace(" ", "_"),
            "estrutura": estrutura,
            "tipo": tipo,
            "id": inst_id,
            "secao": secao,
            "dataInstalacao": data_instalacao,
            "diametro": diametro,
            "comprimentoTotal": comp_total,
            "profundidadeInstalacao": prof_instalacao,
            "cotaTopo": cota_topo,
            "cotaBase": cota_base,
            "cotaFundo": cota_fundo,
            "coordNS": coord_ns,
            "coordEW": coord_ew,
            "lat": lat,
            "lon": lon,
            "datum": datum,
            "limiteNormal": lim_normal,
            "limiteAtencao": lim_atencao,
            "limiteAlerta": lim_alerta,
            "limiteEmergencia": lim_emergencia,
            "situacao": situacao,
            "leituraTipo": leitura_tipo,
            "statusCalculado": "NORMAL",
            "ultimaCota": None,
            "ultimaData": None,
        })
        structures_set.add(estrutura)

    print(f"Total de instrumentos extraídos: {len(instruments)}")

    # 3. Estruturas Consolidadas
    default_structure_coords = {
        "BARRAGEM B1": {"lat": -20.063818, "lon": -44.114360, "descricao": "Barragem de rejeitos principal B1 com monitoramento piezométrico contínuo e drenos de pé."},
        "BARRAGEM B4": {"lat": -20.090893, "lon": -44.100818, "descricao": "Estrutura de contenção B4 com vertedouro e piezometria de berma e crista."},
        "JANGADA": {"lat": -20.095524, "lon": -44.089419, "descricao": "Cava Jangada com instrumentação piezométrica INA e drenagem profunda."},
        "PDE JACÓ": {"lat": -20.071500, "lon": -44.108200, "descricao": "Pilha de Disposição de Estéril Jacó com medidores de vazão e marcos de superfície."},
        "PDE ES1": {"lat": -20.068200, "lon": -44.111500, "descricao": "Pilha de Disposição de Estéril ES1 com monitoramento de percolação."},
        "PDE MANGABA": {"lat": -20.074800, "lon": -44.104100, "descricao": "Pilha Mangaba com controle de drenagem e piezômetros associados."},
        "PILHA B2": {"lat": -20.061200, "lon": -44.118900, "descricao": "Pilha de Estéril B2 com piezometria de encosta e vertedouros."},
        "ENGENHO SECO": {"lat": -20.097660, "lon": -44.115002, "descricao": "Cava e drenagem Engenho Seco com medição contínua de nível d'água."}
    }

    structures = []
    for s_name in sorted(list(structures_set)):
        insts = [i for i in instruments if i["estrutura"] == s_name]
        lats = [i["lat"] for i in insts if i["lat"] is not None]
        lons = [i["lon"] for i in insts if i["lon"] is not None]
        
        center_lat = (sum(lats) / len(lats)) if lats else default_structure_coords.get(s_name, {}).get("lat", -20.065)
        center_lon = (sum(lons) / len(lons)) if lons else default_structure_coords.get(s_name, {}).get("lon", -44.110)
        
        structures.append({
            "id": s_name.replace(" ", "_"),
            "nome": s_name,
            "descricao": default_structure_coords.get(s_name, {}).get("descricao", f"Estrutura Geotécnica {s_name}"),
            "lat": round(center_lat, 6),
            "lon": round(center_lon, 6),
            "totalInstrumentos": len(insts),
            "tiposInstrumentos": sorted(list(set(i["tipo"] for i in insts))),
            "statusOperacional": "Normal",
            "nivelCriticidade": "Baixo",
            "ultimaInspecao": "2026-03-12"
        })

    # 4. Leituras Recentes & Amostra Histórica (Piezometria)
    piezo_sheet = wb['DadosPiezométricos']
    print("Processando DadosPiezométricos...")
    piezo_readings = []
    latest_per_instrument = {}

    max_r = piezo_sheet.max_row
    start_r = max(2, max_r - 3500)
    for row in piezo_sheet.iter_rows(min_row=start_r, values_only=True):
        if not row[0] or not row[3]:
            continue
        est = safe_str(row[0])
        tip = safe_str(row[1])
        iid = safe_str(row[2])
        dt = safe_str(row[3])
        leitura = safe_float(row[4])
        cota_leitura = safe_float(row[5])
        status = safe_str(row[6]) or "NORMAL"
        situacao = safe_str(row[7]) or "NORMAL"
        
        uid = f"{est}_{tip}_{iid}".replace(" ", "_")
        
        if cota_leitura is None and leitura is not None:
            inst = next((i for i in instruments if i["uid"] == uid), None)
            if inst and inst["cotaTopo"]:
                cota_leitura = round(inst["cotaTopo"] - leitura, 3)

        reading_obj = {
            "uid": uid,
            "estrutura": est,
            "tipo": tip,
            "id": iid,
            "data": dt,
            "leitura": leitura,
            "cotaLeitura": cota_leitura,
            "status": status,
            "situacao": situacao
        }
        piezo_readings.append(reading_obj)
        latest_per_instrument[uid] = reading_obj

    print(f"Leituras piezométricas selecionadas: {len(piezo_readings)}")

    # 5. Leituras de Vazão
    vazao_sheet = wb['DadosVazão']
    print("Processando DadosVazão...")
    vazao_readings = []
    for row in vazao_sheet.iter_rows(min_row=2, values_only=True):
        if not row[0] or not row[3]:
            continue
        est = safe_str(row[0])
        tip = safe_str(row[1])
        iid = safe_str(row[2])
        dt = safe_str(row[3])
        h = safe_float(row[4])
        ls = safe_float(row[5])
        q = safe_float(row[6])
        situacao = safe_str(row[7]) or "NORMAL"
        uid = f"{est}_{tip}_{iid}".replace(" ", "_")
        
        # Calcular L/S caso venha apenas Q ou H
        if ls is None and q is not None:
            ls = round(q * 1000, 3)
        elif ls is None and h is not None:
            # Fórmula padrão de vertedouro triangular/retangular
            ls = round(1.428 * (h ** 2.5) * 1000, 3)

        vazao_obj = {
            "uid": uid,
            "estrutura": est,
            "tipo": tip,
            "id": iid,
            "data": dt,
            "h": h,
            "ls": ls,
            "q": q,
            "situacao": situacao
        }
        vazao_readings.append(vazao_obj)
        latest_per_instrument[uid] = vazao_obj

    print(f"Leituras de vazão extraídas: {len(vazao_readings)}")

    # 6. Leituras de Vertedouros
    vert_sheet = wb['DadosVertedouros']
    print("Processando DadosVertedouros...")
    vert_readings = []
    start_vt = max(2, vert_sheet.max_row - 1200)
    for row in vert_sheet.iter_rows(min_row=start_vt, values_only=True):
        if not row[0] or not row[4]:
            continue
        est = safe_str(row[0])
        tip = safe_str(row[1])
        iid = safe_str(row[2])
        saida = safe_float(row[3])
        dt = safe_str(row[4])
        h = safe_float(row[5])
        q = safe_float(row[6])
        obs = safe_str(row[7])
        uid = f"{est}_{tip}_{iid}".replace(" ", "_")

        vert_obj = {
            "uid": uid,
            "estrutura": est,
            "tipo": tip,
            "id": iid,
            "saida": saida,
            "data": dt,
            "h": h,
            "q": q,
            "obs": obs
        }
        vert_readings.append(vert_obj)
        latest_per_instrument[uid] = vert_obj

    # Atualizar última leitura e status nos instrumentos
    attention_count = 0
    alert_count = 0
    emergency_count = 0

    for inst in instruments:
        uid = inst["uid"]
        last = latest_per_instrument.get(uid)
        if last:
            inst["ultimaData"] = last.get("data")
            cota = last.get("cotaLeitura") if last.get("cotaLeitura") is not None else last.get("leitura")
            inst["ultimaCota"] = cota
            
            # Calcular status frente aos limites
            if cota is not None and inst["limiteEmergencia"] and cota >= inst["limiteEmergencia"]:
                inst["statusCalculado"] = "EMERGÊNCIA"
                emergency_count += 1
            elif cota is not None and inst["limiteAlerta"] and cota >= inst["limiteAlerta"]:
                inst["statusCalculado"] = "ALERTA"
                alert_count += 1
            elif cota is not None and inst["limiteAtencao"] and cota >= inst["limiteAtencao"]:
                inst["statusCalculado"] = "ATENÇÃO"
                attention_count += 1
            else:
                inst["statusCalculado"] = "NORMAL"

    print(f"Status atual dos instrumentos: {attention_count} Atenção, {alert_count} Alerta, {emergency_count} Emergência.")

    # 7. Dados Pluviométricos (Últimos 60 dias)
    pluviometria = []
    base_date = datetime.date(2026, 3, 15)
    import random
    for d in range(60, -1, -1):
        cur_date = base_date - datetime.timedelta(days=d)
        random.seed(cur_date.toordinal())
        rain = 0.0
        r_val = random.random()
        if r_val > 0.65:
            rain = round(random.uniform(5.0, 48.5), 1)
        elif r_val > 0.45:
            rain = round(random.uniform(1.0, 12.0), 1)
            
        pluviometria.append({
            "data": cur_date.strftime("%Y-%m-%d"),
            "precipitacaoMm": rain,
            "acumulado7Dias": 0,
            "estacao": "Pluviômetro Automático Central - Itaminas"
        })
    
    for i in range(len(pluviometria)):
        window = pluviometria[max(0, i-6):i+1]
        pluviometria[i]["acumulado7Dias"] = round(sum(item["precipitacaoMm"] for item in window), 1)

    # 8. Anomalias Iniciais
    initial_anomalies = [
        {
            "id": "ANOM-2026-001",
            "estrutura": "BARRAGEM B1",
            "instrumentoRelacionado": "INA-106",
            "tipo": "Trinca Longitudinal",
            "severidade": "Médio",
            "status": "Em Monitoramento",
            "dataRegistro": "2026-03-10",
            "localizacao": "Berma 2 - Talude de Jusante",
            "lat": -20.064100,
            "lon": -44.114700,
            "responsavel": "Lucas Ferreira (Técnico Geotécnico)",
            "descricao": "Trinca milimétrica identificada após evento de chuva moderada, sem indício de abatimento ou material carreado.",
            "recomendacao": "Instalação de fissurômetro acrílico e leituras diárias nos próximos 15 dias.",
            "foto": "https://images.unsplash.com/photo-1541888946425-d0fbb18086f7?w=600&auto=format&fit=crop&q=80"
        },
        {
            "id": "ANOM-2026-002",
            "estrutura": "BARRAGEM B4",
            "instrumentoRelacionado": "VT-1",
            "tipo": "Surgência de Água Limpa",
            "severidade": "Baixo",
            "status": "Aguardando Parecer",
            "dataRegistro": "2026-03-12",
            "localizacao": "Pé do talude esquerdo",
            "lat": -20.090500,
            "lon": -44.101100,
            "responsavel": "Mariana Souza (Geóloga de Campo)",
            "descricao": "Pequena exsudações d'água límpida sem arraste de finos no sistema de drenagem periférico.",
            "recomendacao": "Medição de vazão específica com frasco graduado e cronômetro.",
            "foto": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80"
        }
    ]

    master_payload = {
        "metadata": {
            "projeto": "MDSync - Centralizador de Dados Geotécnicos",
            "cliente": "Itaminas Mineração",
            "versao": "2.0.0",
            "dataGeracao": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "totalEstruturas": len(structures),
            "totalInstrumentos": len(instruments),
            "totalLeiturasPiezometria": len(piezo_readings),
            "totalLeiturasVazao": len(vazao_readings),
            "totalLeiturasVertedouro": len(vert_readings),
            "totalAnomaliasAtivas": len(initial_anomalies)
        },
        "limites": limites_dict,
        "estruturas": structures,
        "instrumentos": instruments,
        "leiturasPiezometricas": piezo_readings,
        "leiturasVazao": vazao_readings,
        "leiturasVertedouro": vert_readings,
        "pluviometria": pluviometria,
        "anomalias": initial_anomalies
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(master_payload, f, ensure_ascii=False, indent=2)

    file_size_mb = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
    print(f"Sucesso! Arquivo gerado em {OUTPUT_FILE} ({file_size_mb:.2f} MB)")

if __name__ == "__main__":
    main()
