#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serviço de Monitoramento Full-Time da Base Geotécnica & Pluviométrica - ITAMINAS
Monitora continuamente as planilhas oficiais:
1. PLUVIOMETRIA.xlsx e Pluviometria.pbix (Série Pluviométrica)
2. Banco_De_Dados.xlsx (Cadastro Geral de Instrumentos e Séries Temporais de Leituras)

Ao detectar qualquer inserção ou alteração de arquivo, executa a extração atômica em lote,
normaliza os dados, recalcula métricas móveis, atualiza o geotech_master.json,
gera o feed em tempo real e atualiza os painéis corporativos.
"""

import os
import sys
import time
import json
import logging
import datetime
from pathlib import Path

# Adiciona o diretório do script ao path para importar as rotinas de extração
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

try:
    from extract_pluviometria import (
        PRIMARY_EXCEL_PATH,
        SECONDARY_EXCEL_PATH,
        parse_pluviometria_workbook,
        process_pluviometria,
        update_pluviometria_data_js,
        update_geotech_master_json,
        update_pluviometria_live_json,
        update_tunnel_status_json,
        sync_html_panels,
        TUNNEL_STATUS_JSON
    )
except ImportError as e:
    print(f"Erro ao importar módulos de pluviometria: {e}")
    sys.exit(1)

try:
    from extract_banco_de_dados import (
        BANCO_DADOS_PATH,
        parse_fast_workbook,
        process_banco_de_dados,
        update_master_json
    )
except ImportError as e:
    print(f"Erro ao importar módulos de banco de dados: {e}")
    sys.exit(1)

LOG_DIR = SCRIPT_DIR.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / "geotech_watcher.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

PBIX_PATH = r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\00) Gestao\1) Gestão À Vista\1-Power Bi\2) Pluviometria\Pluviometria.pbix"

WATCH_TARGETS = [
    PRIMARY_EXCEL_PATH,
    SECONDARY_EXCEL_PATH,
    PBIX_PATH,
    BANCO_DADOS_PATH
]

CHECK_INTERVAL_SECONDS = 5
HEARTBEAT_INTERVAL_SECONDS = 30


class GeotechWatcher:
    def __init__(self):
        self.file_states = {}
        self.last_sync_time = None
        self.last_heartbeat_time = 0
        self.total_syncs = 0
        self.latest_dataset = None
        self.latest_banco_stats = None

    def get_file_fingerprint(self, filepath):
        if not os.path.exists(filepath):
            return None
        try:
            stat = os.stat(filepath)
            return (stat.st_mtime, stat.st_size)
        except Exception:
            return None

    def check_for_changes(self):
        changed_files = []
        for target in WATCH_TARGETS:
            if not os.path.exists(target):
                continue
            current_fp = self.get_file_fingerprint(target)
            last_fp = self.file_states.get(target)

            if last_fp is None:
                # Primeira checagem
                self.file_states[target] = current_fp
            elif current_fp != last_fp:
                logging.info(f"Alteração detectada no arquivo: {target}")
                self.file_states[target] = current_fp
                changed_files.append(target)

        return changed_files

    def sync_pluviometria(self, reason="Inicialização do serviço"):
        logging.info(f"Iniciando ciclo de sincronização de pluviometria ({reason})...")
        target_excel = PRIMARY_EXCEL_PATH if os.path.exists(PRIMARY_EXCEL_PATH) else SECONDARY_EXCEL_PATH
        if not os.path.exists(target_excel):
            logging.error(f"Nenhum arquivo Excel de pluviometria encontrado em {PRIMARY_EXCEL_PATH} ou {SECONDARY_EXCEL_PATH}")
            return False

        try:
            time.sleep(1)
            readings, locs = parse_pluviometria_workbook(target_excel)
            dataset = process_pluviometria(readings, locs)

            update_pluviometria_data_js(dataset)
            update_geotech_master_json(dataset)
            update_pluviometria_live_json(dataset)
            sync_html_panels(dataset)

            self.latest_dataset = dataset
            self.last_sync_time = datetime.datetime.now()
            self.total_syncs += 1

            status = {
                "status": "ONLINE",
                "monitoramentoFullTime": True,
                "motivoUltimaSincronizacao": reason,
                "arquivoOrigemPluviometria": target_excel,
                "arquivoOrigemBancoGeotecnico": BANCO_DADOS_PATH,
                "ultimaSincronizacao": self.last_sync_time.strftime("%Y-%m-%d %H:%M:%S"),
                "totalSincronizacoes": self.total_syncs,
                "dataMaximaPluviometria": dataset["datamax"],
                "totalLeiturasPluviometria": dataset["totalLeituras"],
                "totalDiasPluviometria": dataset["totalDiasMonitorados"],
                "estacoes": [l["loc"] for l in dataset["locs"]],
                "totalInstrumentos": self.latest_banco_stats["totalInstrumentos"] if self.latest_banco_stats else 218,
                "totalLeiturasGeotecnicas": self.latest_banco_stats["totalLeituras"] if self.latest_banco_stats else 39959,
                "heartbeat": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            update_tunnel_status_json(status)

            logging.info(f"Sincronização de pluviometria concluída! {dataset['totalLeituras']} leituras até {dataset['datamax']}.")
            return True

        except Exception as e:
            logging.error(f"Falha durante a sincronização de pluviometria: {e}", exc_info=True)
            return False

    def sync_banco_geotecnico(self, reason="Inicialização do serviço"):
        logging.info(f"Iniciando ciclo de sincronização do Banco_De_Dados.xlsx ({reason})...")
        if not os.path.exists(BANCO_DADOS_PATH):
            logging.error(f"Banco_De_Dados.xlsx não encontrado em: {BANCO_DADOS_PATH}")
            return False

        try:
            time.sleep(1)
            raw_sheets = parse_fast_workbook(BANCO_DADOS_PATH)
            geotech_data = process_banco_de_dados(raw_sheets)
            update_master_json(geotech_data)

            self.latest_banco_stats = {
                "totalInstrumentos": geotech_data["totalInstrumentos"],
                "totalLeituras": geotech_data["totalLeituras"],
                "ultimaAtualizacao": geotech_data["ultimaAtualizacao"]
            }
            self.last_sync_time = datetime.datetime.now()
            self.total_syncs += 1

            status = {
                "status": "ONLINE",
                "monitoramentoFullTime": True,
                "motivoUltimaSincronizacao": reason,
                "arquivoOrigemBancoGeotecnico": BANCO_DADOS_PATH,
                "ultimaSincronizacao": self.last_sync_time.strftime("%Y-%m-%d %H:%M:%S"),
                "totalSincronizacoes": self.total_syncs,
                "totalInstrumentos": geotech_data["totalInstrumentos"],
                "totalLeiturasGeotecnicas": geotech_data["totalLeituras"],
                "dataMaximaPluviometria": self.latest_dataset["datamax"] if self.latest_dataset else "2026-11-02",
                "totalLeiturasPluviometria": self.latest_dataset["totalLeituras"] if self.latest_dataset else 14371,
                "heartbeat": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            update_tunnel_status_json(status)

            logging.info(f"Sincronização do Banco_De_Dados.xlsx concluída! {geotech_data['totalInstrumentos']} instrumentos e {geotech_data['totalLeituras']:,} leituras consolidadas.")
            return True

        except Exception as e:
            logging.error(f"Falha na sincronização do Banco_De_Dados.xlsx: {e}", exc_info=True)
            return False

    def emit_heartbeat(self):
        now = time.time()
        if now - self.last_heartbeat_time >= HEARTBEAT_INTERVAL_SECONDS:
            self.last_heartbeat_time = now
            try:
                target_excel = PRIMARY_EXCEL_PATH if os.path.exists(PRIMARY_EXCEL_PATH) else SECONDARY_EXCEL_PATH
                status = {
                    "status": "ONLINE",
                    "monitoramentoFullTime": True,
                    "arquivoOrigemPluviometria": target_excel,
                    "arquivoOrigemBancoGeotecnico": BANCO_DADOS_PATH,
                    "ultimaSincronizacao": self.last_sync_time.strftime("%Y-%m-%d %H:%M:%S") if self.last_sync_time else None,
                    "totalSincronizacoes": self.total_syncs,
                    "dataMaximaPluviometria": self.latest_dataset["datamax"] if self.latest_dataset else "2026-11-02",
                    "totalLeiturasPluviometria": self.latest_dataset["totalLeituras"] if self.latest_dataset else 14371,
                    "totalInstrumentos": self.latest_banco_stats["totalInstrumentos"] if self.latest_banco_stats else 218,
                    "totalLeiturasGeotecnicas": self.latest_banco_stats["totalLeituras"] if self.latest_banco_stats else 39959,
                    "heartbeat": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                update_tunnel_status_json(status)
            except Exception:
                pass

    def run_forever(self):
        logging.info("=" * 70)
        logging.info("TÚNEL ITAMINAS: MONITORAMENTO FULL-TIME GEOTÉCNICO & PLUVIOMÉTRICO")
        logging.info(f"Diretório de logs: {LOG_FILE}")
        logging.info(f"Bases monitoradas full-time:")
        for t in WATCH_TARGETS:
            exists = "EXISTE" if os.path.exists(t) else "NÃO ENCONTRADO"
            logging.info(f"  - [{exists}] {t}")
        logging.info(f"Intervalo de verificação: {CHECK_INTERVAL_SECONDS}s")
        logging.info("=" * 70)

        # Sincronização inicial na subida do serviço
        self.sync_banco_geotecnico("Inicialização do daemon de monitoramento")
        self.sync_pluviometria("Inicialização do daemon de monitoramento")

        # Loop contínuo de monitoramento full-time
        try:
            while True:
                time.sleep(CHECK_INTERVAL_SECONDS)
                changed = self.check_for_changes()
                if changed:
                    banco_changed = any(f == BANCO_DADOS_PATH for f in changed)
                    pluv_changed = any(f in (PRIMARY_EXCEL_PATH, SECONDARY_EXCEL_PATH, PBIX_PATH) for f in changed)

                    if banco_changed:
                        self.sync_banco_geotecnico("Alteração detectada em Banco_De_Dados.xlsx")
                    if pluv_changed:
                        self.sync_pluviometria("Alteração detectada em PLUVIOMETRIA.xlsx/PBIX")
                
                self.emit_heartbeat()

        except KeyboardInterrupt:
            logging.info("Interrupção pelo usuário. Encerrando monitoramento full-time.")
        except Exception as e:
            logging.error(f"Erro fatal no loop do watcher: {e}", exc_info=True)


def main():
    watcher = GeotechWatcher()
    watcher.run_forever()


if __name__ == "__main__":
    main()
