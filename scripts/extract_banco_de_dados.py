#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline de Extração e Integração Oficial do Banco de Dados Geotécnico - ITAMINAS
Extrai todos os dados cadastrais de instrumentos e suas respectivas séries temporais de leituras
(Piezômetros, Vertedouros, Medidores de Vazão, Nível d'Água e Limites Críticos)
a partir de:
C:\\Users\\maycon.nascimento\\ITAMINAS\\SPLO - General\\03) Geotecnia\\01) PCMI\\02) Monitoramentos\\00) Leituras\\Banco_De_Dados.xlsx
"""

import os
import sys
import json
import math
import time
import shutil
import tempfile
import datetime
import zipfile
import xml.etree.cElementTree as ET
from pathlib import Path

# Caminho oficial do Banco de Dados Geotécnico ITAMINAS
BANCO_DADOS_PATH = r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\02) Monitoramentos\00) Leituras\Banco_De_Dados.xlsx"

# Caminhos do projeto Web / Mobile (mdsync-geotecnia)
REPO_ROOT = Path(__file__).resolve().parent.parent
GEOTECH_MASTER_JSON = REPO_ROOT / "public" / "data" / "geotech_master.json"

STRUCTURE_SLUG_MAP = {
    "BARRAGEM B1": "BARRAGEM_B1",
    "BARRAGEM_B1": "BARRAGEM_B1",
    "B1": "BARRAGEM_B1",
    "BARRAGEM B4": "BARRAGEM_B4",
    "BARRAGEM_B4": "BARRAGEM_B4",
    "B4": "BARRAGEM_B4",
    "PILHA B2": "PILHA_B2",
    "PILHA_B2": "PILHA_B2",
    "B2": "PILHA_B2",
    "PDE ES1": "PDE_ES1",
    "PDE_ES1": "PDE_ES1",
    "ES1": "PDE_ES1",
    "PDE JACÓ": "PDE_JACÓ",
    "PDE JACO": "PDE_JACÓ",
    "PDE_JACÓ": "PDE_JACÓ",
    "JC": "PDE_JACÓ",
    "PDE MANGABA": "PDE_MANGABA",
    "PDE MANGABA ": "PDE_MANGABA",
    "PDE_MANGABA": "PDE_MANGABA",
    "MG": "PDE_MANGABA",
    "ENGENHO SECO": "ENGENHO_SECO",
    "ENGENHO_SECO": "ENGENHO_SECO",
    "ENGENHO": "ENGENHO_SECO",
    "JANGADA": "JANGADA",
    "CAVA JANGADA": "JANGADA"
}


def normalize_structure_key(raw_name):
    if not raw_name:
        return "OUTRA"
    clean = str(raw_name).strip().upper()
    return STRUCTURE_SLUG_MAP.get(clean, clean.replace(" ", "_"))


def normalize_structure_name(raw_name):
    if not raw_name:
        return "OUTRA"
    clean = str(raw_name).strip().upper()
    if "MANGABA" in clean:
        return "PDE MANGABA"
    if "JACÓ" in clean or "JACO" in clean:
        return "PDE JACÓ"
    if "ES1" in clean or "ES-1" in clean:
        return "PDE ES1"
    if "B1" in clean and "BARRAGEM" in clean:
        return "BARRAGEM B1"
    if "B4" in clean and "BARRAGEM" in clean:
        return "BARRAGEM B4"
    if "B2" in clean:
        return "PILHA B2"
    if "ENGENHO" in clean:
        return "ENGENHO SECO"
    if "JANGADA" in clean:
        return "JANGADA"
    return clean


def col_to_num(col_str):
    num = 0
    for c in col_str:
        num = num * 26 + (ord(c.upper()) - ord('A') + 1)
    return num - 1


def excel_date_to_iso(val):
    if not val:
        return None
    try:
        f = float(str(val).strip().replace(',', '.'))
        dt = datetime.date(1899, 12, 30) + datetime.timedelta(days=int(f))
        return dt.strftime('%Y-%m-%d')
    except Exception:
        clean = str(val).strip()
        for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%Y/%m/%d', '%d-%m-%Y'):
            try:
                return datetime.datetime.strptime(clean, fmt).strftime('%Y-%m-%d')
            except ValueError:
                pass
        return None


def safe_float(val):
    if val is None:
        return None
    try:
        s = str(val).strip().replace(',', '.')
        if s == '' or s.upper() in ('N/D', 'NULL', 'NONE', 'NAN', '#VALUE!', '#N/A'):
            return None
        return float(s)
    except Exception:
        return None


def utm23s_to_latlon(easting, northing):
    """Converte coordenadas UTM SIRGAS2000 Zona 23S para Latitude e Longitude WGS84."""
    if easting is None or northing is None:
        return None, None
    try:
        a = 6378137.0
        f = 1 / 298.257223563
        e2 = 2 * f - f * f
        ep2 = e2 / (1 - e2)
        k0 = 0.9996
        lon0 = (-45.0 * math.pi) / 180.0
        x = easting - 500000.0
        y = northing - 10000000.0
        M = y / k0
        mu = M / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * (e2**3)) / 256))
        e1 = (1 - math.sqrt(1 - e2)) / (1 + math.sqrt(1 - e2))
        phi1 = (
            mu +
            ((3 * e1) / 2 - (27 * (e1**3)) / 32) * math.sin(2 * mu) +
            ((21 * (e1**2)) / 16 - (55 * (e1**4)) / 32) * math.sin(4 * mu) +
            ((151 * (e1**3)) / 96) * math.sin(6 * mu) +
            ((1097 * (e1**4)) / 512) * math.sin(8 * mu)
        )
        N1 = a / math.sqrt(1 - e2 * (math.sin(phi1)**2))
        T1 = math.tan(phi1)**2
        C1 = ep2 * (math.cos(phi1)**2)
        R1 = (a * (1 - e2)) / ((1 - e2 * (math.sin(phi1)**2))**1.5)
        D = x / (N1 * k0)
        lat = phi1 - (N1 * math.tan(phi1) / R1) * (
            (D**2) / 2 -
            (5 + 3 * T1 + 10 * C1 - 4 * (C1**2) - 9 * ep2) * (D**4) / 24 +
            (61 + 90 * T1 + 298 * C1 + 45 * (T1**2) - 252 * ep2 - 3 * (C1**2)) * (D**6) / 720
        )
        lat = (lat * 180.0) / math.pi
        lon = (
            lon0 +
            (
                D -
                (1 + 2 * T1 + C1) * (D**3) / 6 +
                (5 - 2 * C1 + 28 * T1 - 3 * (C1**2) + 8 * ep2 + 24 * (T1**2)) * (D**5) / 120
            ) / math.cos(phi1)
        )
        lon = (lon * 180.0) / math.pi
        return round(lat, 6), round(lon, 6)
    except Exception:
        return None, None


def safe_copy_file(source_path):
    """Copia o arquivo Excel para uma pasta temporária para evitar travas de arquivo no Windows."""
    try:
        temp_dir = tempfile.gettempdir()
        temp_file = os.path.join(temp_dir, f"banco_sync_{os.getpid()}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx")
        shutil.copy2(source_path, temp_file)
        return temp_file
    except Exception as e:
        print(f"Aviso: Não foi possível copiar para temp ({e}), tentando ler arquivo original diretamente.")
        return source_path


def parse_fast_workbook(excel_path):
    """Lê todas as abas do Banco_De_Dados.xlsx em alta velocidade via iterparse do XML."""
    print(f"Iniciando extração rápida da base mestra: {excel_path}...")
    t0 = time.time()
    temp_path = safe_copy_file(excel_path)

    with zipfile.ZipFile(temp_path, 'r') as z:
        # 1. Carregar Shared Strings
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            with z.open('xl/sharedStrings.xml') as f:
                for event, elem in ET.iterparse(f, events=('end',)):
                    if elem.tag.endswith('si'):
                        shared_strings.append(''.join(elem.itertext()))
                        elem.clear()

        # Helper para iterar linhas de uma planilha XML
        def parse_sheet_rows(xml_path):
            rows = []
            if xml_path not in z.namelist():
                return rows
            with z.open(xml_path) as f:
                for event, elem in ET.iterparse(f, events=('end',)):
                    if elem.tag.endswith('row'):
                        r_dict = {}
                        for c in elem.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                            ref = c.attrib.get('r', '')
                            col_letters = ''.join([ch for ch in ref if ch.isalpha()])
                            col_idx = col_to_num(col_letters)
                            t_attr = c.attrib.get('t', '')
                            v_elem = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                            v_val = v_elem.text if v_elem is not None else None
                            if t_attr == 's' and v_val is not None:
                                try:
                                    val = shared_strings[int(v_val)]
                                except Exception:
                                    val = v_val
                            else:
                                val = v_val
                            r_dict[col_idx] = val
                        rows.append(r_dict)
                        elem.clear()
            return rows

        # Mapeamento oficial de arquivos no arquivo zip do Excel
        r_info = parse_sheet_rows('xl/worksheets/sheet1.xml')
        r_pz = parse_sheet_rows('xl/worksheets/sheet2.xml')
        r_vt = parse_sheet_rows('xl/worksheets/sheet3.xml')
        r_vz = parse_sheet_rows('xl/worksheets/sheet4.xml')
        r_na = parse_sheet_rows('xl/worksheets/sheet5.xml')
        r_lim = parse_sheet_rows('xl/worksheets/sheet6.xml')

    if temp_path != excel_path and os.path.exists(temp_path):
        try:
            os.remove(temp_path)
        except Exception:
            pass

    print(f"Extração XML concluída em {time.time()-t0:.2f}s!")
    return {
        "info": r_info,
        "pz": r_pz,
        "vt": r_vt,
        "vz": r_vz,
        "na": r_na,
        "lim": r_lim
    }


def process_banco_de_dados(raw_data):
    """Processa, normaliza e correlaciona todos os instrumentos e leituras."""
    print("Processando regras geotécnicas e normalizando tabelas...")

    # 1. Limites
    limites = {
        "BARRAGEM_B1": {
            "crista": 851.66,
            "berma1": 844.66,
            "berma2": 837.66,
            "berma3": 830.66,
            "pe": 823.66,
            "reservatorio": 1158.0
        },
        "BARRAGEM_B4": {
            "crista": 1166.0,
            "berma1": 1161.0,
            "berma2": 1152.0,
            "berma3": 1141.0,
            "berma4": 1133.0,
            "berma5": 1122.0,
            "berma6": 1112.0,
            "berma7": 1101.0,
            "berma8": 1092.0,
            "berma9": 1084.0,
            "pe": 1077.0
        }
    }
    if len(raw_data["lim"]) >= 2:
        val_row = raw_data["lim"][1]
        limites["BARRAGEM_B1"]["crista"] = safe_float(val_row.get(0)) or 851.66
        limites["BARRAGEM_B1"]["berma1"] = safe_float(val_row.get(1)) or 844.66
        limites["BARRAGEM_B1"]["berma2"] = safe_float(val_row.get(2)) or 837.66
        limites["BARRAGEM_B1"]["berma3"] = safe_float(val_row.get(3)) or 830.66
        limites["BARRAGEM_B1"]["pe"] = safe_float(val_row.get(4)) or 823.66
        limites["BARRAGEM_B1"]["reservatorio"] = safe_float(val_row.get(5)) or 1158.0
        limites["BARRAGEM_B4"]["crista"] = safe_float(val_row.get(6)) or 1166.0
        limites["BARRAGEM_B4"]["berma1"] = safe_float(val_row.get(7)) or 1161.0
        limites["BARRAGEM_B4"]["berma2"] = safe_float(val_row.get(8)) or 1152.0
        limites["BARRAGEM_B4"]["berma3"] = safe_float(val_row.get(9)) or 1141.0
        limites["BARRAGEM_B4"]["berma4"] = safe_float(val_row.get(10)) or 1133.0
        limites["BARRAGEM_B4"]["berma5"] = safe_float(val_row.get(11)) or 1122.0
        limites["BARRAGEM_B4"]["berma6"] = safe_float(val_row.get(12)) or 1112.0
        limites["BARRAGEM_B4"]["berma7"] = safe_float(val_row.get(13)) or 1101.0
        limites["BARRAGEM_B4"]["berma8"] = safe_float(val_row.get(14)) or 1092.0
        limites["BARRAGEM_B4"]["berma9"] = safe_float(val_row.get(15)) or 1084.0
        limites["BARRAGEM_B4"]["pe"] = safe_float(val_row.get(16)) or 1077.0

    # 2. Informações Gerais (Cadastro de Instrumentos)
    instruments = []
    instruments_by_key = {}

    # Carregar coordenadas de contingência do arquivo histórico para os 13 instrumentos sem UTM na planilha
    fallback_coords = {}
    archive_path = os.path.join(REPO_ROOT, "public", "data", "geotech_master_full_archive.json")
    if os.path.exists(archive_path):
        try:
            with open(archive_path, "r", encoding="utf-8") as af:
                arch_data = json.load(af)
                for ai in arch_data.get("instrumentos", []):
                    if ai.get("lat") and ai.get("lon"):
                        fallback_coords[ai.get("uid")] = (
                            ai.get("lat"),
                            ai.get("lon"),
                            ai.get("coordenadaNS") or ai.get("coordenadaNorte"),
                            ai.get("coordenadaEW") or ai.get("coordenadaEste")
                        )
        except Exception:
            pass

    for row in raw_data["info"][1:]:
        raw_est = row.get(0)
        raw_tipo = row.get(1)
        raw_id = row.get(2)
        if not raw_est or not raw_id:
            continue

        est_nome = normalize_structure_name(raw_est)
        est_key = normalize_structure_key(est_nome)
        tipo = str(raw_tipo).strip().upper() if raw_tipo else "PZ"
        inst_id = str(raw_id).strip()
        uid = f"{est_key}_{tipo}_{inst_id}".replace("/", "_").replace(" ", "_")

        coor_ns = safe_float(row.get(11))
        coor_ew = safe_float(row.get(12))
        lat, lon = utm23s_to_latlon(coor_ew, coor_ns)

        if (lat is None or lon is None) and uid in fallback_coords:
            lat, lon, f_ns, f_ew = fallback_coords[uid]
            if coor_ns is None:
                coor_ns = f_ns
            if coor_ew is None:
                coor_ew = f_ew

        cota_topo = safe_float(row.get(8))
        cota_base = safe_float(row.get(9))
        cota_fundo = safe_float(row.get(10))

        inst_obj = {
            "uid": uid,
            "id": inst_id,
            "tipo": tipo,
            "estrutura": est_nome,
            "secao": str(row.get(3)).strip() if row.get(3) else "",
            "dataInstalacao": excel_date_to_iso(row.get(4)),
            "diametro": str(row.get(5)).strip() if row.get(5) else None,
            "comprimentoTotal": safe_float(row.get(6)),
            "profundidadeInstalacao": safe_float(row.get(7)),
            "cotaTopo": cota_topo,
            "cotaBase": cota_base,
            "cotaFundo": cota_fundo,
            "coordenadaNS": coor_ns,
            "coordenadaEW": coor_ew,
            "lat": lat,
            "lon": lon,
            "datum": str(row.get(13)).strip() if row.get(13) else "SIRGAS2000",
            "limiteNormal": safe_float(row.get(14)),
            "limiteAtencao": safe_float(row.get(15)),
            "limiteAlerta": safe_float(row.get(16)),
            "limiteEmergencia": safe_float(row.get(17)),
            "situacao": str(row.get(18)).strip() if row.get(18) else "Ativo",
            "leituraTipo": str(row.get(19)).strip() if row.get(19) else "Manual",
            "statusCalculado": "NORMAL",
            "ultimaLeitura": None,
            "ultimaCota": None,
            "ultimaData": None,
            "origem": "BANCO_MESTRE_PCMI"
        }

        instruments.append(inst_obj)
        lookup_key = (est_nome, tipo, inst_id)
        instruments_by_key[lookup_key] = inst_obj
        # chave alternativa com chave normalizada
        instruments_by_key[(est_key, tipo, inst_id)] = inst_obj

    print(f"Instrumentos cadastrados processados: {len(instruments)}")

    # 3. Dados Piezométricos (32.881 leituras)
    leituras_piezometricas = []
    latest_reading_map = {}

    for row in raw_data["pz"][1:]:
        raw_est = row.get(0)
        raw_tipo = row.get(1)
        raw_id = row.get(2)
        raw_dt = row.get(3)
        if not raw_est or not raw_id or not raw_dt:
            continue

        iso_dt = excel_date_to_iso(raw_dt)
        if not iso_dt:
            continue

        est_nome = normalize_structure_name(raw_est)
        est_key = normalize_structure_key(est_nome)
        tipo = str(raw_tipo).strip().upper() if raw_tipo else "PZ"
        inst_id = str(raw_id).strip()

        leitura_val = safe_float(row.get(4))
        cota_val = safe_float(row.get(5))
        status_val = str(row.get(6)).strip().upper() if row.get(6) else "NORMAL"
        situacao_val = str(row.get(7)).strip().upper() if row.get(7) else "NORMAL"
        cota_topo = safe_float(row.get(8))
        cota_fundo = safe_float(row.get(9))

        r_uid = f"{est_key}_{tipo}_{inst_id}".replace("/", "_").replace(" ", "_")
        entry = {
            "uid": r_uid,
            "estrutura": est_nome,
            "tipo": tipo,
            "id": inst_id,
            "data": iso_dt,
            "leitura": leitura_val,
            "cota": cota_val,
            "cotaLeitura": cota_val,
            "status": status_val,
            "situacao": situacao_val,
            "cotaTopo": cota_topo,
            "cotaFundo": cota_fundo,
            "origem": "BANCO_MESTRE_PCMI"
        }
        leituras_piezometricas.append(entry)

        # Atualizar última leitura do instrumento
        k = (est_nome, tipo, inst_id)
        curr_latest = latest_reading_map.get(k)
        if curr_latest is None or iso_dt >= curr_latest["data"]:
            latest_reading_map[k] = {
                "data": iso_dt,
                "leitura": leitura_val,
                "cota": cota_val,
                "status": status_val
            }

    print(f"Leituras piezométricas processadas: {len(leituras_piezometricas)}")

    # 4. Dados Vertedouros (6.653 leituras)
    leituras_vertedouro = []
    for row in raw_data["vt"][1:]:
        raw_est = row.get(0)
        raw_tipo = row.get(1)
        raw_id = row.get(2)
        raw_dt = row.get(4)
        if not raw_est or not raw_id or not raw_dt:
            continue

        iso_dt = excel_date_to_iso(raw_dt)
        if not iso_dt:
            continue

        est_nome = normalize_structure_name(raw_est)
        est_key = normalize_structure_key(est_nome)
        tipo = str(raw_tipo).strip().upper() if raw_tipo else "VT"
        inst_id = str(raw_id).strip()
        r_uid = f"{est_key}_{tipo}_{inst_id}".replace("/", "_").replace(" ", "_")

        saida_val = safe_float(row.get(3))
        h_cm = safe_float(row.get(5))
        q_m3h = safe_float(row.get(6))
        obs = str(row.get(7)).strip() if row.get(7) else None

        entry = {
            "uid": r_uid,
            "estrutura": est_nome,
            "tipo": tipo,
            "id": inst_id,
            "saida": saida_val,
            "data": iso_dt,
            "hCm": h_cm,
            "leitura": h_cm,
            "vazao": q_m3h,
            "qM3h": q_m3h,
            "observacoes": obs,
            "origem": "BANCO_MESTRE_PCMI"
        }
        leituras_vertedouro.append(entry)

        k = (est_nome, tipo, inst_id)
        curr_latest = latest_reading_map.get(k)
        if curr_latest is None or iso_dt >= curr_latest["data"]:
            latest_reading_map[k] = {
                "data": iso_dt,
                "leitura": h_cm,
                "cota": None,
                "vazao": q_m3h,
                "status": "NORMAL"
            }

    print(f"Leituras de vertedouro processadas: {len(leituras_vertedouro)}")

    # 5. Dados Vazão (325 leituras)
    leituras_vazao = []
    for row in raw_data["vz"][1:]:
        raw_est = row.get(0)
        raw_tipo = row.get(1)
        raw_id = row.get(2)
        raw_dt = row.get(3)
        if not raw_est or not raw_id or not raw_dt:
            continue

        iso_dt = excel_date_to_iso(raw_dt)
        if not iso_dt:
            continue

        est_nome = normalize_structure_name(raw_est)
        est_key = normalize_structure_key(est_nome)
        tipo = str(raw_tipo).strip().upper() if raw_tipo else "MV"
        inst_id = str(raw_id).strip()
        r_uid = f"{est_key}_{tipo}_{inst_id}".replace("/", "_").replace(" ", "_")

        h_cm = safe_float(row.get(4))
        l_s = safe_float(row.get(5))
        q_m3s = safe_float(row.get(6))
        situacao_val = str(row.get(7)).strip().upper() if row.get(7) else "NORMAL"

        entry = {
            "uid": r_uid,
            "estrutura": est_nome,
            "tipo": tipo,
            "id": inst_id,
            "data": iso_dt,
            "hCm": h_cm,
            "leitura": h_cm if h_cm is not None else l_s,
            "lS": l_s,
            "vazao": q_m3s if q_m3s is not None else (l_s / 1000.0 if l_s is not None else None),
            "qM3s": q_m3s,
            "situacao": situacao_val,
            "origem": "BANCO_MESTRE_PCMI"
        }
        leituras_vazao.append(entry)

        k = (est_nome, tipo, inst_id)
        curr_latest = latest_reading_map.get(k)
        if curr_latest is None or iso_dt >= curr_latest["data"]:
            latest_reading_map[k] = {
                "data": iso_dt,
                "leitura": h_cm if h_cm is not None else l_s,
                "cota": None,
                "vazao": q_m3s,
                "status": situacao_val
            }

    print(f"Leituras de vazão processadas: {len(leituras_vazao)}")

    # 6. NA (100 medições)
    nivel_agua = []
    for row in raw_data["na"][1:]:
        raw_dt = row.get(0)
        if not raw_dt:
            continue
        iso_dt = excel_date_to_iso(raw_dt)
        if not iso_dt:
            continue

        ew = safe_float(row.get(1))
        ns = safe_float(row.get(2))
        alt = safe_float(row.get(3))
        datum = str(row.get(4)).strip() if row.get(4) else "Sirgas GG"
        dif = safe_float(row.get(5))
        sirgas = safe_float(row.get(6))
        lat, lon = utm23s_to_latlon(ew, ns)

        nivel_agua.append({
            "data": iso_dt,
            "coordenadaEW": ew,
            "coordenadaNS": ns,
            "lat": lat,
            "lon": lon,
            "cota": sirgas,
            "altimetria": alt,
            "datum": datum,
            "diferenca": dif,
            "origem": "BANCO_MESTRE_PCMI_NA"
        })

    print(f"Medições de Nível d'Água (NA) processadas: {len(nivel_agua)}")

    # 7. Sincronizar última leitura em cada instrumento
    for inst in instruments:
        k = (inst["estrutura"], inst["tipo"], inst["id"])
        latest = latest_reading_map.get(k)
        if latest:
            inst["ultimaData"] = latest["data"]
            inst["ultimaLeitura"] = latest["leitura"]
            if latest.get("cota") is not None:
                inst["ultimaCota"] = latest["cota"]
            
            # Avaliar status calculado
            cota = latest.get("cota")
            if cota is not None:
                lim_emerg = inst.get("limiteEmergencia")
                lim_alerta = inst.get("limiteAlerta")
                lim_atencao = inst.get("limiteAtencao")
                if lim_emerg is not None and cota >= lim_emerg:
                    inst["statusCalculado"] = "EMERGÊNCIA"
                elif lim_alerta is not None and cota >= lim_alerta:
                    inst["statusCalculado"] = "ALERTA"
                elif lim_atencao is not None and cota >= lim_atencao:
                    inst["statusCalculado"] = "ATENÇÃO"
                else:
                    inst["statusCalculado"] = "NORMAL"
            elif latest.get("status"):
                inst["statusCalculado"] = latest["status"]

    # 8. Estruturas (Atualizar totais e tipos) com centróides oficiais do cadastro GIS
    estruturas_base = [
        {"id": "BARRAGEM_B1", "nome": "BARRAGEM B1", "categoria": "Barragens", "tipo": "Barragem de Contenção de Rejeitos", "lat": -20.063824, "lon": -44.114686, "cotaCrista": 851.66, "cotaPe": 823.66, "cotaFundo": None, "fatorSeguranca": 1.74, "status": "NORMAL"},
        {"id": "BARRAGEM_B4", "nome": "BARRAGEM B4", "categoria": "Barragens", "tipo": "Barragem de Contenção e Vertedouro", "lat": -20.089000, "lon": -44.100584, "cotaCrista": 1166.0, "cotaPe": 1077.0, "cotaFundo": None, "fatorSeguranca": 1.68, "status": "NORMAL"},
        {"id": "ENGENHO_SECO", "nome": "ENGENHO SECO", "categoria": "Cavas", "tipo": "Cava Minerária & Diques", "lat": -20.095810, "lon": -44.111803, "cotaCrista": None, "cotaPe": None, "cotaFundo": 790.0, "fatorSeguranca": 1.85, "status": "NORMAL"},
        {"id": "JANGADA", "nome": "JANGADA", "categoria": "Cavas", "tipo": "Cava Jangada", "lat": -20.097198, "lon": -44.092516, "cotaCrista": 1123.3, "cotaPe": None, "cotaFundo": 1017.5, "fatorSeguranca": 1.82, "status": "NORMAL"},
        {"id": "PDE_ES1", "nome": "PDE ES1", "categoria": "Pilhas", "tipo": "Pilha de Disposição de Estéril", "lat": -20.091028, "lon": -44.110613, "cotaCrista": 1090.0, "cotaPe": 980.0, "cotaFundo": None, "fatorSeguranca": 1.78, "status": "NORMAL"},
        {"id": "PDE_JACÓ", "nome": "PDE JACÓ", "categoria": "Pilhas", "tipo": "Pilha de Disposição Jacó", "lat": -20.102932, "lon": -44.095021, "cotaCrista": 1105.0, "cotaPe": 1020.0, "cotaFundo": None, "fatorSeguranca": 1.80, "status": "NORMAL"},
        {"id": "PDE_MANGABA", "nome": "PDE MANGABA", "categoria": "Pilhas", "tipo": "Pilha de Disposição Mangaba", "lat": -20.088788, "lon": -44.092452, "cotaCrista": 1120.0, "cotaPe": 1040.0, "cotaFundo": None, "fatorSeguranca": 1.76, "status": "NORMAL"},
        {"id": "PILHA_B2", "nome": "PILHA B2", "categoria": "Pilhas", "tipo": "Pilha de Disposição de Estéril B2", "lat": -20.080850, "lon": -44.111500, "cotaCrista": 945.0, "cotaPe": 860.0, "cotaFundo": None, "fatorSeguranca": 1.75, "status": "NORMAL"}
    ]

    for est in estruturas_base:
        matching_insts = [i for i in instruments if normalize_structure_key(i["estrutura"]) == est["id"]]
        est["totalInstrumentos"] = len(matching_insts)
        est["tiposInstrumentos"] = sorted(list(set(i["tipo"] for i in matching_insts)))
        est["statusOperacional"] = "Normal"
        est["nivelCriticidade"] = "Baixo"
        dates = [i["ultimaData"] for i in matching_insts if i["ultimaData"]]
        est["ultimaInspecao"] = max(dates) if dates else "2026-10-31"
        est["origem"] = "PCMI_OFICIAL_ITAMINAS"

    return {
        "limites": limites,
        "estruturas": estruturas_base,
        "instrumentos": instruments,
        "leiturasPiezometricas": leituras_piezometricas,
        "leiturasVertedouro": leituras_vertedouro,
        "leiturasVazao": leituras_vazao,
        "nivelAgua": nivel_agua,
        "totalInstrumentos": len(instruments),
        "totalLeituras": len(leituras_piezometricas) + len(leituras_vertedouro) + len(leituras_vazao) + len(nivel_agua),
        "ultimaAtualizacao": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


def update_master_json(geotech_data):
    """Mescla os dados extraídos no geotech_master.json preservando os outros módulos."""
    print(f"Atualizando arquivo mestre: {GEOTECH_MASTER_JSON}...")
    if not GEOTECH_MASTER_JSON.exists():
        print(f"ERRO: {GEOTECH_MASTER_JSON} não encontrado!")
        return

    with open(GEOTECH_MASTER_JSON, "r", encoding="utf-8") as f:
        master = json.load(f)

    # Substitui os módulos alimentados pelo Banco_De_Dados.xlsx
    master["limites"] = geotech_data["limites"]
    master["estruturas"] = geotech_data["estruturas"]
    master["instrumentos"] = geotech_data["instrumentos"]
    master["leiturasPiezometricas"] = geotech_data["leiturasPiezometricas"]
    master["leiturasVertedouro"] = geotech_data["leiturasVertedouro"]
    master["leiturasVazao"] = geotech_data["leiturasVazao"]
    master["nivelAgua"] = geotech_data["nivelAgua"]

    # Atualiza metadados globais
    master["metadata"]["ultimaAtualizacao"] = geotech_data["ultimaAtualizacao"]
    master["metadata"]["bancoDadosOrigem"] = BANCO_DADOS_PATH
    master["metadata"]["totalInstrumentos"] = geotech_data["totalInstrumentos"]
    master["metadata"]["totalLeiturasGeotecnicas"] = geotech_data["totalLeituras"]
    master["metadata"]["versao"] = "4.2.0-PCMI-OFICIAL"

    with open(GEOTECH_MASTER_JSON, "w", encoding="utf-8") as f:
        json.dump(master, f, indent=2, ensure_ascii=False)

    print("-> geotech_master.json atualizado com sucesso!")


def main():
    if not os.path.exists(BANCO_DADOS_PATH):
        print(f"ERRO: Banco_De_Dados.xlsx não encontrado em: {BANCO_DADOS_PATH}")
        sys.exit(1)

    raw_sheets = parse_fast_workbook(BANCO_DADOS_PATH)
    geotech_data = process_banco_de_dados(raw_sheets)
    update_master_json(geotech_data)

    print("\n" + "=" * 70)
    print("INTEGRAÇÃO DO BANCO DE DADOS GEOTÉCNICO EXECUTADA COM ÊXITO!")
    print(f"-> Arquivo Origem: {BANCO_DADOS_PATH}")
    print(f"-> Instrumentos Cadastrados: {geotech_data['totalInstrumentos']} instrumentos")
    print(f"-> Leituras Piezométricas: {len(geotech_data['leiturasPiezometricas']):,} registros")
    print(f"-> Leituras de Vertedouro: {len(geotech_data['leiturasVertedouro']):,} registros")
    print(f"-> Leituras de Vazão: {len(geotech_data['leiturasVazao']):,} registros")
    print(f"-> Levantamentos de Nível d'Água (NA): {len(geotech_data['nivelAgua']):,} registros")
    print(f"-> Total Geral Consolidado: {geotech_data['totalLeituras']:,} leituras")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
