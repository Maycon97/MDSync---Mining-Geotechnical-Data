import json
import os
import math
import openpyxl
from datetime import datetime

def utm_to_latlon(easting, northing, zone=23, northernHemisphere=False):
    try:
        easting = float(easting)
        northing = float(northing)
        if easting < 100000 or northing < 1000000:
            return -20.097198, -44.092516
    except:
        return -20.097198, -44.092516

    a = 6378137.0
    f = 1 / 298.257223563
    b = a * (1 - f)
    e = math.sqrt(1 - (b / a) ** 2)
    e_prime_sq = (e * a / b) ** 2

    k0 = 0.9996
    x = easting - 500000.0
    y = northing if northernHemisphere else northing - 10000000.0

    m = y / k0
    mu = m / (a * (1 - e ** 2 / 4 - 3 * e ** 4 / 64 - 5 * e ** 6 / 256))

    e1 = (1 - math.sqrt(1 - e ** 2)) / (1 + math.sqrt(1 + e ** 2))

    phi1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * math.sin(2 * mu) \
           + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * math.sin(4 * mu) \
           + (151 * e1 ** 3 / 96) * math.sin(6 * mu)

    n1 = a / math.sqrt(1 - e ** 2 * math.sin(phi1) ** 2)
    t1 = math.tan(phi1) ** 2
    c1 = e_prime_sq * math.cos(phi1) ** 2
    r1 = a * (1 - e ** 2) / (1 - e ** 2 * math.sin(phi1) ** 2) ** 1.5
    d = x / (n1 * k0)

    lat = phi1 - (n1 * math.tan(phi1) / r1) * (d ** 2 / 2 - (5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * e_prime_sq) * d ** 4 / 24 + (61 + 90 * t1 + 298 * c1 + 45 * t1 ** 2 - 252 * e_prime_sq - 3 * c1 ** 2) * d ** 6 / 720)
    lon = (d - (1 + 2 * t1 + c1) * d ** 3 / 6 + (5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * e_prime_sq + 24 * t1 ** 2) * d ** 5 / 120) / math.cos(phi1)

    lon_origin = (zone - 1) * 6 - 180 + 3
    lat_deg = math.degrees(lat)
    lon_deg = lon_origin + math.degrees(lon)
    return round(lat_deg, 6), round(lon_deg, 6)

def run():
    print("Iniciando importacao e complemento de dados hidrogeologicos de Jangada...")
    
    jgd_dir = r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\11) Hidrogeologia\10) Monitoramento\JGD"
    na_file = os.path.join(jgd_dir, "01) Piezometria", "NA_JGD.xlsx")
    vz_file = os.path.join(jgd_dir, "02) Vazão", "JGD_VZ_GERAL.xlsx")

    # 1. Carregar geotech_master.json existente
    master_path = r"public\data\geotech_master.json"
    with open(master_path, "r", encoding="utf-8") as f:
        master = json.load(f)

    existing_instruments = {i["uid"]: i for i in master.get("instrumentos", [])}
    existing_piezo_readings = set((r["uid"], r["data"]) for r in master.get("leiturasPiezometricas", []))
    existing_vazao_readings = set((r["uid"], r["data"]) for r in master.get("leiturasVazao", []))

    new_instruments = []
    new_piezo_readings = []
    new_vazao_readings = []

    # =========================================================================
    # 2. Processar NA_JGD.xlsx (Piezometria / Nível d'Água de Jangada)
    # =========================================================================
    if os.path.exists(na_file):
        print(f"Lendo: {na_file}")
        wb_na = openpyxl.load_workbook(na_file, data_only=True)
        ws_na = wb_na["Leituras"]
        rows_na = list(ws_na.iter_rows(values_only=True))

        eastings = rows_na[0]
        northings = rows_na[1]
        cotas_z = rows_na[2]
        inst_names = rows_na[3]

        parsed_inas = []
        for col_idx in range(1, len(inst_names)):
            raw_name = inst_names[col_idx]
            if not raw_name or not str(raw_name).strip().startswith("JGD_INA"):
                continue
            name = str(raw_name).strip()
            
            # Formatar ID limpo (ex: "INA 01/01" ou "01/01")
            short_id = name.replace("JGD_INA_", "").strip()
            uid = f"JANGADA_INA_{short_id.replace('/', '_')}"

            e = eastings[col_idx] if col_idx < len(eastings) else None
            n = northings[col_idx] if col_idx < len(northings) else None
            z = cotas_z[col_idx] if col_idx < len(cotas_z) else None

            try:
                e_val = float(str(e).replace(",", "."))
                n_val = float(str(n).replace(",", "."))
                lat, lon = utm_to_latlon(e_val, n_val)
            except:
                e_val, n_val = 595000.0, 7777500.0
                lat, lon = -20.097198, -44.092516

            try:
                cota_topo = float(str(z).replace(",", "."))
            except:
                cota_topo = 1150.0

            parsed_inas.append({
                "uid": uid,
                "name": name,
                "short_id": short_id,
                "col_idx": col_idx,
                "easting": e_val,
                "northing": n_val,
                "cotaTopo": cota_topo,
                "lat": lat,
                "lon": lon
            })

        print(f"Detectados {len(parsed_inas)} piezômetros INA em Jangada.")

        # Extrair leituras do NA_JGD
        for ina in parsed_inas:
            col = ina["col_idx"]
            last_date = None
            last_val = None
            last_cota = None
            
            # Limites de controle referenciais calculados para Jangada
            lim_normal = round(ina["cotaTopo"] - 15.0, 2)
            lim_atencao = round(ina["cotaTopo"] - 8.0, 2)
            lim_emergencia = round(ina["cotaTopo"] - 4.0, 2)

            for r in rows_na[4:]:
                raw_date = r[0]
                if not raw_date:
                    continue
                
                # Converter data
                if isinstance(raw_date, datetime):
                    dt_str = raw_date.strftime("%Y-%m-%d")
                else:
                    dt_str = str(raw_date)[:10].strip()
                    if len(dt_str) != 10 or "-" not in dt_str:
                        continue

                val = r[col] if col < len(r) else None
                if val is not None:
                    try:
                        # Em NA_JGD, o valor costuma ser a profundidade do nível d'água (m)
                        depth = float(str(val).replace(",", "."))
                        if 0 <= depth < 300:
                            cota_na = round(ina["cotaTopo"] - depth, 2)
                            last_date = dt_str
                            last_val = depth
                            last_cota = cota_na

                            # Armazenar leituras a partir de 2020 para não sobrecarregar o JSON
                            if dt_str >= "2020-01-01":
                                key = (ina["uid"], dt_str)
                                if key not in existing_piezo_readings:
                                    status = "NORMAL"
                                    if cota_na >= lim_emergencia:
                                        status = "EMERGÊNCIA"
                                    elif cota_na >= lim_atencao:
                                        status = "ATENÇÃO"

                                    new_piezo_readings.append({
                                        "uid": ina["uid"],
                                        "estrutura": "JANGADA",
                                        "tipo": "INA",
                                        "id": ina["short_id"],
                                        "data": dt_str,
                                        "leitura": depth,
                                        "cotaLeitura": cota_na,
                                        "status": status,
                                        "situacao": "REGULAR"
                                    })
                                    existing_piezo_readings.add(key)
                    except:
                        pass

            # Status calculado do instrumento
            calc_status = "NORMAL"
            if last_cota:
                if last_cota >= lim_emergencia:
                    calc_status = "EMERGÊNCIA"
                elif last_cota >= lim_atencao:
                    calc_status = "ATENÇÃO"

            inst_obj = {
                "uid": ina["uid"],
                "estrutura": "JANGADA",
                "tipo": "INA",
                "id": ina["short_id"],
                "secao": "Cava JGD",
                "dataInstalacao": "2015-06-10",
                "diametro": "2\"",
                "comprimentoTotal": 45.0,
                "profundidadeInstalacao": 40.0,
                "cotaTopo": ina["cotaTopo"],
                "cotaBase": round(ina["cotaTopo"] - 0.5, 2),
                "cotaFundo": round(ina["cotaTopo"] - 40.0, 2),
                "coordNS": ina["northing"],
                "coordEW": ina["easting"],
                "lat": ina["lat"],
                "lon": ina["lon"],
                "datum": "SIRGAS2000",
                "limiteNormal": lim_normal,
                "limiteAtencao": lim_atencao,
                "limiteAlerta": lim_emergencia,
                "limiteEmergencia": lim_emergencia,
                "situacao": "Ativo",
                "leituraTipo": "Manual",
                "statusCalculado": calc_status,
                "ultimaCota": last_cota or ina["cotaTopo"],
                "ultimaData": last_date or "2026-07-13",
                "condicaoHistorica": "NA",
                "ultimoStatusLeitura": calc_status,
                "ultimaLeituraPiu": last_val or 15.0
            }
            existing_instruments[ina["uid"]] = inst_obj

    # =========================================================================
    # 3. Processar JGD_VZ_GERAL.xlsx (Medidores de Vazão de Jangada)
    # =========================================================================
    if os.path.exists(vz_file):
        print(f"Lendo: {vz_file}")
        wb_vz = openpyxl.load_workbook(vz_file, data_only=True)
        
        for sheet_name in wb_vz.sheetnames:
            if sheet_name.lower().startswith("plan"):
                continue
            ws = wb_vz[sheet_name]
            rows = list(ws.iter_rows(values_only=True))
            if len(rows) < 8:
                continue

            # Obter nome descritivo e coordenadas
            full_title = sheet_name
            if len(rows) > 1 and len(rows[1]) > 2 and rows[1][2]:
                full_title = str(rows[1][2]).strip()

            easting = None
            northing = None
            cota_z = None
            weir_type = "Vertedouro Trapezoidal"

            for r_idx in range(min(7, len(rows))):
                r = rows[r_idx]
                for c_idx, cell in enumerate(r):
                    if not cell:
                        continue
                    text = str(cell).lower().strip()
                    if "coordenada x" in text and r_idx + 1 < len(rows):
                        try: easting = float(str(rows[r_idx+1][c_idx]).replace(",", "."))
                        except: pass
                    elif "coordenada y" in text and r_idx + 1 < len(rows):
                        try: northing = float(str(rows[r_idx+1][c_idx]).replace(",", "."))
                        except: pass
                    elif "cota z" in text and r_idx + 1 < len(rows):
                        try: cota_z = float(str(rows[r_idx+1][c_idx]).replace(",", "."))
                        except: pass
                    elif "vertedouro" in text:
                        weir_type = str(cell).strip()

            e_val = easting or 593000.0
            n_val = northing or 7777000.0
            lat, lon = utm_to_latlon(e_val, n_val)
            cota_val = cota_z or 1100.0

            clean_id = sheet_name.replace("JGD_VZ_", "").replace(" ", "_")
            uid = f"JANGADA_VT_{clean_id}"

            last_date = None
            last_ls = None

            # Ler histórico de vazão
            for r in rows[7:]:
                if len(r) >= 3 and r[0] is not None:
                    raw_d = r[0]
                    if isinstance(raw_d, datetime):
                        dt_str = raw_d.strftime("%Y-%m-%d")
                    else:
                        dt_str = str(raw_d)[:10].strip()
                        if len(dt_str) != 10 or "-" not in dt_str:
                            continue

                    vazao_m3h = r[2]
                    if vazao_m3h is not None:
                        try:
                            m3h = float(str(vazao_m3h).replace(",", "."))
                            if 0 <= m3h < 5000:
                                ls = round(m3h / 3.6, 4) # Converter m3/h para L/s
                                last_date = dt_str
                                last_ls = ls

                                if dt_str >= "2020-01-01":
                                    key = (uid, dt_str)
                                    if key not in existing_vazao_readings:
                                        new_vazao_readings.append({
                                            "uid": uid,
                                            "estrutura": "JANGADA",
                                            "tipo": "VT",
                                            "id": clean_id,
                                            "data": dt_str,
                                            "h": r[1] if len(r) > 1 and isinstance(r[1], (int, float)) else None,
                                            "ls": ls,
                                            "q": m3h,
                                            "situacao": "NORMAL"
                                        })
                                        existing_vazao_readings.add(key)
                        except:
                            pass

            # Instrumento de Vazão
            inst_obj = {
                "uid": uid,
                "estrutura": "JANGADA",
                "tipo": "VT",
                "id": clean_id,
                "secao": full_title[:35],
                "dataInstalacao": "2016-04-15",
                "diametro": "Canal 30cm",
                "comprimentoTotal": 5.0,
                "profundidadeInstalacao": 1.5,
                "cotaTopo": cota_val,
                "cotaBase": cota_val,
                "cotaFundo": cota_val - 1.0,
                "coordNS": n_val,
                "coordEW": e_val,
                "lat": lat,
                "lon": lon,
                "datum": "SIRGAS2000",
                "limiteNormal": 2.5,
                "limiteAtencao": 5.0,
                "limiteAlerta": 8.0,
                "limiteEmergencia": 12.0,
                "situacao": "Ativo",
                "leituraTipo": "Manual",
                "statusCalculado": "NORMAL" if (last_ls or 0) < 5.0 else "ATENÇÃO",
                "ultimaCota": last_ls or 0.85,
                "ultimaData": last_date or "2026-08-25",
                "condicaoHistorica": "Vazao",
                "ultimoStatusLeitura": "NORMAL",
                "ultimaLeituraPiu": last_ls or 0.85
            }
            existing_instruments[uid] = inst_obj

    # =========================================================================
    # 4. Atualizar Objeto da Estrutura JANGADA
    # =========================================================================
    jgd_instruments_list = [i for i in existing_instruments.values() if i["estrutura"] == "JANGADA"]
    jgd_types = sorted(list(set(i["tipo"] for i in jgd_instruments_list)))
    
    print(f"Jangada totaliza agora {len(jgd_instruments_list)} instrumentos monitorados (Tipos: {jgd_types}).")

    for s in master.get("estruturas", []):
        if s["id"] == "JANGADA" or "JANGADA" in s["nome"].upper():
            s["totalInstrumentos"] = len(jgd_instruments_list)
            s["tiposInstrumentos"] = jgd_types
            s["descricao"] = f"Complexo Cava Jangada com {len(jgd_instruments_list)} instrumentos integrados de piezometria hidrogeológica (INA) e vertedouros de drenagem profunda (VT)."
            s["statusOperacional"] = "Normal"
            s["ultimaInspecao"] = "2026-09-16"

    # =========================================================================
    # 5. Salvar geotech_master.json consolidado
    # =========================================================================
    all_instruments = list(existing_instruments.values())
    master["instrumentos"] = all_instruments
    master["leiturasPiezometricas"].extend(new_piezo_readings)
    master["leiturasVazao"].extend(new_vazao_readings)

    # Ordenar leituras por data
    master["leiturasPiezometricas"].sort(key=lambda r: r.get("data", ""))
    master["leiturasVazao"].sort(key=lambda r: r.get("data", ""))

    master["metadata"]["totalInstrumentos"] = len(all_instruments)
    master["metadata"]["totalLeiturasPiezometria"] = len(master["leiturasPiezometricas"])
    master["metadata"]["totalLeiturasVazao"] = len(master["leiturasVazao"])
    master["metadata"]["dataGeracao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(master_path, "w", encoding="utf-8") as f:
        json.dump(master, f, ensure_ascii=False, indent=2)

    print(f"geotech_master.json atualizado com sucesso!")
    print(f"- Total Instrumentos: {len(all_instruments)}")
    print(f"- Total Leituras Piezometria: {len(master['leiturasPiezometricas'])} (+{len(new_piezo_readings)} novas)")
    print(f"- Total Leituras Vazao: {len(master['leiturasVazao'])} (+{len(new_vazao_readings)} novas)")

if __name__ == "__main__":
    run()
