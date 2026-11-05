#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline de Extração e Consolidação Automática de Pluviometria - ITAMINAS
Extrai todos os dados históricos e em tempo real (2018–2026) das estações pluviométricas
do Complexo Minerário Itaminas, calculando médias diárias, acumulados de 7 e 30 dias,
agregações por estação e metadados georreferenciados.
"""

import os
import sys
import json
import shutil
import tempfile
import datetime
from pathlib import Path

# Tentativa de import do openpyxl
try:
    import openpyxl
except ImportError:
    print("ERRO: openpyxl não instalado. Instale com pip install openpyxl.")
    sys.exit(1)

# Caminhos oficiais do ecossistema ITAMINAS
PRIMARY_EXCEL_PATH = r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista\02) Pluviometria\PLUVIOMETRIA.xlsx"
SECONDARY_EXCEL_PATH = r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\00) Gestao\1) Gestão À Vista\1-Power Bi\2) Pluviometria\Nova pasta\PLUVIOMETRIA.xlsx"

# Painéis HTML de Gestão à Vista para sincronização bidirecional
HTML_PANEL_PATHS = [
    r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\00) Gestao\1) Gestão À Vista\1-Power Bi\2) Pluviometria\Painel_Executivo_Pluviometria.html",
    r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista\02) Pluviometria\Painel_Executivo_Pluviometria.html"
]

# Caminhos do projeto Web / Mobile (mdsync-geotecnia)
REPO_ROOT = Path(__file__).resolve().parent.parent
PLUVIOMETRIA_DATA_JS = REPO_ROOT / "src" / "data" / "pluviometriaData.js"
GEOTECH_MASTER_JSON = REPO_ROOT / "public" / "data" / "geotech_master.json"
PLUVIOMETRIA_LIVE_JSON = REPO_ROOT / "public" / "data" / "pluviometria_live.json"
TUNNEL_STATUS_JSON = REPO_ROOT / "public" / "data" / "pluviometria_tunnel_status.json"

# Coordenadas oficiais das 5 estações pluviométricas Itaminas
OFFICIAL_COORDINATES = [
    {"loc": "PLATAFORMA", "lat": -20.038728, "lon": -44.140056},
    {"loc": "PATIO DE PRODUTOS", "lat": -20.074009, "lon": -44.107628},
    {"loc": "BARRAGEM B1", "lat": -20.063739, "lon": -44.114527},
    {"loc": "PILHA B2", "lat": -20.080627, "lon": -44.110884},
    {"loc": "BARRAGEM B4", "lat": -20.089439, "lon": -44.099646}
]

STATION_MAP = {
    "PLATAFORMA": "PLATAFORMA",
    "PATIO DE PRODUTOS": "PATIO DE PRODUTOS",
    "PÁTIO DE PRODUTOS": "PATIO DE PRODUTOS",
    "PATIO": "PATIO DE PRODUTOS",
    "BARRAGEM B1": "BARRAGEM B1",
    "B1": "BARRAGEM B1",
    "PILHA B2": "PILHA B2",
    "B2": "PILHA B2",
    "BARRAGEM B4": "BARRAGEM B4",
    "B4": "BARRAGEM B4"
}

MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']


def safe_copy_file(source_path):
    """Copia o arquivo Excel para uma pasta temporária para evitar travas de arquivo no Windows."""
    try:
        temp_dir = tempfile.gettempdir()
        temp_file = os.path.join(temp_dir, f"pluv_sync_{os.getpid()}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx")
        shutil.copy2(source_path, temp_file)
        return temp_file
    except Exception as e:
        print(f"Aviso: Não foi possível copiar para temp ({e}), tentando ler arquivo original diretamente.")
        return source_path


def parse_pluviometria_workbook(excel_path):
    """Lê todas as planilhas e registros com robustez a fórmulas de datas e tipos numéricos."""
    print(f"Lendo base Excel: {excel_path}...")
    temp_path = safe_copy_file(excel_path)
    
    try:
        wb = openpyxl.load_workbook(temp_path, data_only=True, read_only=True)
    except Exception as e:
        print(f"Erro ao abrir com data_only=True: {e}. Tentando modo normal...")
        wb = openpyxl.load_workbook(temp_path, data_only=False, read_only=True)

    readings = []
    
    # 1. Sheet 'localização' para coordenadas dinâmicas se existirem
    locs = list(OFFICIAL_COORDINATES)
    if "localização" in wb.sheetnames:
        sheet_loc = wb["localização"]
        dynamic_locs = []
        for r in sheet_loc.iter_rows(values_only=True):
            if r and len(r) >= 3 and r[0] and str(r[0]).strip().upper() != "LOCAL":
                try:
                    s_code = STATION_MAP.get(str(r[0]).strip().upper(), str(r[0]).strip().upper())
                    lat = float(str(r[1]).replace(",", "."))
                    lon = float(str(r[2]).replace(",", "."))
                    dynamic_locs.append({"loc": s_code, "lat": lat, "lon": lon})
                except Exception:
                    pass
        if len(dynamic_locs) >= 4:
            locs = dynamic_locs

    # 2. Sheet 'PLUVIOMETRIA'
    if "PLUVIOMETRIA" in wb.sheetnames:
        sheet_pluv = wb["PLUVIOMETRIA"]
        rows = list(sheet_pluv.iter_rows(values_only=True))
        if rows:
            # Identificar colunas do cabeçalho
            h = [str(c).strip().upper() if c else "" for c in rows[0]]
            col_data = h.index("DATA") if "DATA" in h else 0
            col_data_app = h.index("DATA APP") if "DATA APP" in h else 1
            col_resp = h.index("RESPONSÁVEL") if "RESPONSÁVEL" in h else 2
            col_local = h.index("LOCAL") if "LOCAL" in h else 3
            col_chuva = h.index("CHUVA (MM)") if "CHUVA (MM)" in h else 4

            for row in rows[1:]:
                if not row or len(row) <= max(col_data, col_local, col_chuva):
                    continue

                raw_data = row[col_data]
                raw_data_app = row[col_data_app] if len(row) > col_data_app else None
                raw_local = row[col_local]
                raw_chuva = row[col_chuva]
                raw_resp = row[col_resp] if len(row) > col_resp and row[col_resp] else "Geotecnia"

                # Resolver Data
                dt = None
                if isinstance(raw_data, datetime.datetime):
                    dt = raw_data.date()
                elif isinstance(raw_data, datetime.date):
                    dt = raw_data
                elif isinstance(raw_data_app, (datetime.datetime, datetime.date)):
                    # Se fórmula DATA = DATA APP - 1
                    base = raw_data_app.date() if isinstance(raw_data_app, datetime.datetime) else raw_data_app
                    dt = base - datetime.timedelta(days=1)
                elif isinstance(raw_data, str) and raw_data.strip():
                    clean_str = raw_data.strip()
                    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d", "%d-%m-%Y"):
                        try:
                            dt = datetime.datetime.strptime(clean_str, fmt).date()
                            break
                        except ValueError:
                            pass

                if not dt:
                    continue

                # Resolver Local
                if not raw_local:
                    continue
                loc_clean = str(raw_local).strip().upper()
                loc_norm = STATION_MAP.get(loc_clean, loc_clean)

                # Resolver Chuva (mm)
                mm = 0.0
                if raw_chuva is not None:
                    try:
                        mm = float(str(raw_chuva).replace(",", "."))
                        if mm < 0:
                            mm = 0.0
                    except (ValueError, TypeError):
                        mm = 0.0

                readings.append({
                    "date": dt.strftime("%Y-%m-%d"),
                    "dt": dt,
                    "loc": loc_norm,
                    "mm": mm,
                    "responsavel": str(raw_resp).strip()
                })

    wb.close()
    if temp_path != excel_path and os.path.exists(temp_path):
        try:
            os.remove(temp_path)
        except Exception:
            pass

    print(f"Total de leituras brutas válidas extraídas: {len(readings)}")
    return readings, locs


def process_pluviometria(readings, locs):
    """Calcula médias, acumulados contínuos e agregações mensais/estação."""
    if not readings:
        raise ValueError("Nenhuma leitura pluviométrica válida foi encontrada.")

    # Agrupar leituras por dia e estação
    by_day_station = {}
    distinct_years = set()
    latest_dt = None

    for r in readings:
        d_str = r["date"]
        dt = r["dt"]
        loc = r["loc"]
        mm = r["mm"]

        distinct_years.add(dt.year)
        if latest_dt is None or dt > latest_dt:
            latest_dt = dt

        if d_str not in by_day_station:
            by_day_station[d_str] = {}
        by_day_station[d_str][loc] = mm

    all_dates = sorted(by_day_station.keys())
    start_date = datetime.datetime.strptime(all_dates[0], "%Y-%m-%d").date()
    end_date = datetime.datetime.strptime(all_dates[-1], "%Y-%m-%d").date()

    print(f"Período contínuo: de {start_date} até {end_date} ({len(all_dates)} dias com dados)")

    # 1. Série diária contínua
    daily_list = []
    daily_precip_map = {}

    curr = start_date
    while curr <= end_date:
        d_str = curr.strftime("%Y-%m-%d")
        st_data = by_day_station.get(d_str, {})
        
        if st_data:
            vals = list(st_data.values())
            avg_v = sum(vals) / len(vals)
            max_v = max(vals)
            min_v = min(vals)
        else:
            avg_v = 0.0
            max_v = 0.0
            min_v = 0.0

        daily_precip_map[d_str] = avg_v
        
        # Calcular acumulado móvel de 7 dias
        accum_7d = 0.0
        for i in range(7):
            past_d = (curr - datetime.timedelta(days=i)).strftime("%Y-%m-%d")
            accum_7d += daily_precip_map.get(past_d, 0.0)

        # Calcular acumulado móvel de 30 dias
        accum_30d = 0.0
        for i in range(30):
            past_d = (curr - datetime.timedelta(days=i)).strftime("%Y-%m-%d")
            accum_30d += daily_precip_map.get(past_d, 0.0)

        daily_list.append({
            "d": d_str,
            "v": round(avg_v, 2),
            "max": round(max_v, 2),
            "min": round(min_v, 2),
            "accum7d": round(accum_7d, 2),
            "accum30d": round(accum_30d, 2),
            "estacoes": {k: round(v, 2) for k, v in st_data.items()}
        })

        curr += datetime.timedelta(days=1)

    # 2. Agregação mensal por estação (stagg)
    stagg_map = {}
    for r in readings:
        dt = r["dt"]
        ano = dt.year
        mes = dt.month
        loc = r["loc"]
        mm = r["mm"]

        key = (ano, mes, loc)
        if key not in stagg_map:
            stagg_map[key] = {"sum": 0.0, "n": 0, "max": 0.0}
        
        stagg_map[key]["sum"] += mm
        stagg_map[key]["n"] += 1
        if mm > stagg_map[key]["max"]:
            stagg_map[key]["max"] = mm

    stagg_list = []
    for (ano, mes, loc), data in sorted(stagg_map.items()):
        stagg_list.append({
            "ano": ano,
            "mes": mes,
            "loc": loc,
            "sum": round(data["sum"], 1),
            "n": data["n"],
            "max": round(data["max"], 1),
            "avg": round(data["sum"] / data["n"], 2) if data["n"] > 0 else 0.0
        })

    anos_list = sorted(list(distinct_years))

    dataset = {
        "daily": [{"d": x["d"], "v": x["v"]} for x in daily_list],
        "dailyFull": daily_list,
        "stagg": stagg_list,
        "locs": locs,
        "anos": anos_list,
        "datamax": end_date.strftime("%Y-%m-%d"),
        "nstations": len(locs),
        "totalLeituras": len(readings),
        "totalDiasMonitorados": len(daily_list),
        "ultimaAtualizacao": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    return dataset


def update_pluviometria_data_js(dataset):
    """Gera o arquivo src/data/pluviometriaData.js mantendo exports e utilitários."""
    print(f"Atualizando {PLUVIOMETRIA_DATA_JS}...")
    
    # Criar representação do dataset compatível com pluviometriaData.js
    daily_compact = [{"d": x["d"], "v": x["v"]} for x in dataset["daily"]]
    
    js_content = f"""// Dados Executivos Oficiais de Pluviometria - Complexo Minerário Itaminas (2018–2026)
// Sincronização Automática via Túnel Full-Time de Monitoramento
// Fonte: Gerência de Geotecnia · Estações Pluviométricas
// Atualizado em: {dataset["ultimaAtualizacao"]} | Total de leituras: {dataset["totalLeituras"]}

export const PLUVIOMETRIA_DATA = {json.dumps({
    "daily": daily_compact,
    "stagg": dataset["stagg"],
    "locs": dataset["locs"],
    "anos": dataset["anos"],
    "datamax": dataset["datamax"],
    "nstations": dataset["nstations"],
    "totalLeituras": dataset["totalLeituras"],
    "ultimaAtualizacao": dataset["ultimaAtualizacao"]
}, indent=2, ensure_ascii=False)};

export const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const STATION_NAMES = {{
  'BARRAGEM B1': 'Barragem B1',
  'BARRAGEM B4': 'Barragem B4',
  'PILHA B2': 'Pilha B2',
  'PLATAFORMA': 'Plataforma',
  'PATIO DE PRODUTOS': 'Pátio de Produtos'
}};

export const getStationName = (code) => STATION_NAMES[code] || code;

export const formatNumber = (num, decimals = 1) => {{
  if (num === null || num === undefined || isNaN(num)) return '0,0';
  return Number(num).toLocaleString('pt-BR', {{
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }});
}};
"""
    PLUVIOMETRIA_DATA_JS.parent.mkdir(parents=True, exist_ok=True)
    with open(PLUVIOMETRIA_DATA_JS, "w", encoding="utf-8") as f:
        f.write(js_content)
    print("-> pluviometriaData.js atualizado com sucesso!")


def update_geotech_master_json(dataset):
    """Atualiza a chave 'pluviometria' e 'estacoesPluviometricas' em geotech_master.json."""
    print(f"Atualizando {GEOTECH_MASTER_JSON}...")
    if not GEOTECH_MASTER_JSON.exists():
        print(f"Aviso: {GEOTECH_MASTER_JSON} não encontrado!")
        return

    with open(GEOTECH_MASTER_JSON, "r", encoding="utf-8") as f:
        master = json.load(f)

    # Formatar array de pluviometria compatível com DashboardTab e relatórios geotécnicos
    # Cada elemento tem: { data, mm, precipitacaoMm, acumulado7Dias, acumulado30Dias, max, min, estacoes }
    pluv_entries = []
    for item in dataset["dailyFull"]:
        pluv_entries.append({
            "data": item["d"],
            "mm": item["v"],
            "precipitacaoMm": item["v"],
            "acumulado7Dias": item["accum7d"],
            "acumulado30Dias": item["accum30d"],
            "max": item["max"],
            "min": item["min"],
            "estacoes": item["estacoes"]
        })

    master["pluviometria"] = pluv_entries
    master["estacoesPluviometricas"] = dataset["locs"]
    master["pluviometriaMetadata"] = {
        "ultimaAtualizacao": dataset["ultimaAtualizacao"],
        "datamax": dataset["datamax"],
        "totalLeituras": dataset["totalLeituras"],
        "totalDias": len(pluv_entries),
        "anos": dataset["anos"],
        "fonte": "Base Master Excel PLUVIOMETRIA.xlsx - Gerência de Geotecnia Itaminas"
    }

    with open(GEOTECH_MASTER_JSON, "w", encoding="utf-8") as f:
        json.dump(master, f, indent=2, ensure_ascii=False)
    print("-> geotech_master.json atualizado com sucesso!")


def update_pluviometria_live_json(dataset):
    """Salva public/data/pluviometria_live.json para consulta via fetch pelo app em tempo real."""
    print(f"Atualizando {PLUVIOMETRIA_LIVE_JSON}...")
    PLUVIOMETRIA_LIVE_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(PLUVIOMETRIA_LIVE_JSON, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
    print("-> pluviometria_live.json atualizado com sucesso!")


def update_tunnel_status_json(status_info):
    """Salva o heartbeat e status do túnel de monitoramento contínuo."""
    TUNNEL_STATUS_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(TUNNEL_STATUS_JSON, "w", encoding="utf-8") as f:
        json.dump(status_info, f, indent=2, ensure_ascii=False)


def sync_html_panels(dataset):
    """Atualiza o objeto const P no Painel_Executivo_Pluviometria.html nas pastas ITAMINAS."""
    compact_p = {
        "daily": [{"d": x["d"], "v": x["v"]} for x in dataset["daily"]],
        "stagg": dataset["stagg"],
        "locs": dataset["locs"],
        "anos": dataset["anos"],
        "datamax": dataset["datamax"],
        "nstations": dataset["nstations"]
    }
    json_str = json.dumps(compact_p, separators=(',', ':'), ensure_ascii=False)

    for p_path in HTML_PANEL_PATHS:
        if os.path.exists(p_path):
            try:
                print(f"Sincronizando painel HTML corporativo: {p_path}...")
                with open(p_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                target_start = "const P="
                idx_start = content.find(target_start)
                if idx_start != -1:
                    idx_end = content.find(";\n", idx_start)
                    if idx_end != -1:
                        new_content = content[:idx_start + len(target_start)] + json_str + content[idx_end:]
                        with open(p_path, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"-> Painel HTML {p_path} sincronizado com sucesso!")
            except Exception as e:
                print(f"Aviso ao sincronizar {p_path}: {e}")


def main():
    target_excel = PRIMARY_EXCEL_PATH if os.path.exists(PRIMARY_EXCEL_PATH) else SECONDARY_EXCEL_PATH
    if not os.path.exists(target_excel):
        print(f"ERRO: Nenhuma base de dados encontrada em {PRIMARY_EXCEL_PATH} ou {SECONDARY_EXCEL_PATH}")
        sys.exit(1)

    readings, locs = parse_pluviometria_workbook(target_excel)
    dataset = process_pluviometria(readings, locs)

    update_pluviometria_data_js(dataset)
    update_geotech_master_json(dataset)
    update_pluviometria_live_json(dataset)
    sync_html_panels(dataset)

    status = {
        "status": "ONLINE",
        "monitoramentoFullTime": True,
        "arquivoOrigem": target_excel,
        "tamanhoArquivoBytes": os.path.getsize(target_excel),
        "ultimaModificacaoArquivo": datetime.datetime.fromtimestamp(os.path.getmtime(target_excel)).strftime("%Y-%m-%d %H:%M:%S"),
        "ultimaSincronizacao": dataset["ultimaAtualizacao"],
        "dataMaxima": dataset["datamax"],
        "totalLeituras": dataset["totalLeituras"],
        "totalDias": dataset["totalDiasMonitorados"],
        "anos": dataset["anos"],
        "estacoes": [l["loc"] for l in dataset["locs"]]
    }
    update_tunnel_status_json(status)

    print("\n" + "="*70)
    print("CONSOLIDAÇÃO DE PLUVIOMETRIA EXECUTADA COM ÊXITO!")
    print(f"-> Total de Leituras: {dataset['totalLeituras']:,} registros")
    print(f"-> Período Coberto: {dataset['anos'][0]} até {dataset['datamax']}")
    print(f"-> Dias Contínuos: {dataset['totalDiasMonitorados']} dias")
    print(f"-> Estações: {', '.join([l['loc'] for l in dataset['locs']])}")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()

