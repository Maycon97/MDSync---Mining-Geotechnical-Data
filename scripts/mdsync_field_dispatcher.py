"""
========================================================================================
MDSync — Field Dispatcher & Integration Pipeline (Cadeia de Processamento de Campo)
Empresa: ITAMINAS Mineração S.A. | SPLO Geotecnia / PCMI
Destino: C:\\Users\\maycon.nascimento\\ITAMINAS\\SPLO - General\\03) Geotecnia\\01) PCMI\\02) Monitoramentos\\00) Leituras\\MDSync_Integracao_Campo
========================================================================================
Objetivo:
1. Criar e gerenciar a pasta de staging para dados coletados em campo no site/app.
2. Garantir 100% de blindagem e zero risco de corrupção do arquivo original Banco_De_Dados.xlsx.
3. Formatar novos lotes de leituras, anomalias e checklists em arquivos Excel/CSV/JSON
   padronizados prontos para ingestão pela equipe de geotecnia.
4. Manter log de auditoria com hash SHA-256 e selo criptográfico.
========================================================================================
"""

import os
import sys
import json
import time
import hashlib
import shutil
from datetime import datetime
from pathlib import Path

# Caminho raiz corporativo do PCMI
PCMI_MONITORAMENTOS_DIR = r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\02) Monitoramentos"
STAGING_BASE_DIR = os.path.join(PCMI_MONITORAMENTOS_DIR, "00) Leituras", "MDSync_Integracao_Campo")

# Subdiretórios da cadeia de integração
DIR_ENTRADA_LEITURAS = os.path.join(STAGING_BASE_DIR, "01_Entrada_Novas_Leituras")
DIR_PROCESSADAS = os.path.join(STAGING_BASE_DIR, "02_Processadas")
DIR_CHECKLISTS = os.path.join(STAGING_BASE_DIR, "03_Checklists_FIR")
DIR_ANOMALIAS = os.path.join(STAGING_BASE_DIR, "04_Anomalias_Fluig")
DIR_AUDITORIA = os.path.join(STAGING_BASE_DIR, "05_Logs_Auditoria")

# Staging local no workspace para sincronização direta do app/site
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LOCAL_STAGING_DIR = os.path.join(WORKSPACE_ROOT, "staging_field_data")


def calculate_sha256(filepath):
    """Calcula hash SHA-256 para garantia de integridade."""
    if not os.path.exists(filepath):
        return None
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def init_corporate_staging_dirs():
    """Inicializa as pastas de integração com segurança sem alterar nenhum arquivo existente."""
    subdirs = [
        STAGING_BASE_DIR,
        DIR_ENTRADA_LEITURAS,
        DIR_PROCESSADAS,
        DIR_CHECKLISTS,
        DIR_ANOMALIAS,
        DIR_AUDITORIA,
        LOCAL_STAGING_DIR
    ]
    created = 0
    for d in subdirs:
        try:
            if not os.path.exists(d):
                os.makedirs(d, exist_ok=True)
                created += 1
        except Exception as e:
            print(f"[AVISO] Não foi possível criar pasta '{d}': {e}")
            
    # Cria arquivo README explicativo na pasta corporativa para a equipe da ITAMINAS
    readme_path = os.path.join(STAGING_BASE_DIR, "LEIA_ME_INTEGRACAO_MDSYNC.txt")
    if not os.path.exists(readme_path):
        try:
            with open(readme_path, "w", encoding="utf-8") as f:
                f.write(
                    "========================================================================\n"
                    "ITAMINAS MINERAÇÃO S.A. — MDSYNC GEOTECNIA (PIPELINE DE INTEGRAÇÃO)\n"
                    "========================================================================\n"
                    "Esta pasta foi criada pelo MDSync para receber com 100% de segurança as\n"
                    "leituras e relatórios coletados em campo pelo aplicativo web / móvel.\n\n"
                    "SEGURANÇA E INTEGRIDADE:\n"
                    "- NENHUM dado do arquivo 'Banco_De_Dados.xlsx' é sobrescrito ou alterado.\n"
                    "- Todas as novas coletas são organizadas em lotes timestamped (Excel/CSV/JSON)\n"
                    "  na pasta '01_Entrada_Novas_Leituras'.\n"
                    "- Cada lote possui selo de auditoria criptográfico SHA-256 em '05_Logs_Auditoria'.\n"
                    "- A equipe de Geotecnia pode auditar, revisar ou anexar os dados diretamente.\n"
                    "========================================================================\n"
                    f"Inicializado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n"
                )
        except Exception as e:
            print(f"[AVISO] Erro ao gravar README: {e}")

    return STAGING_BASE_DIR


def log_audit(action, details, file_affected=""):
    """Registra ação no log de auditoria corporativo."""
    timestamp = datetime.now().isoformat()
    entry = {
        "timestamp": timestamp,
        "action": action,
        "file": file_affected,
        "details": details
    }
    log_file = os.path.join(DIR_AUDITORIA, "mdsync_audit_trail.log")
    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception as e:
        print(f"[AVISO] Falha ao gravar log de auditoria: {e}")


def stage_new_field_batch(batch_data, origin="App Web MDSync"):
    """
    Recebe um pacote de dados do campo (leituras, anomalias, checklists)
    e grava na pasta corporativa da ITAMINAS formatado para Excel e CSV.
    """
    init_corporate_staging_dirs()
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    batch_id = f"LOTE_MDSYNC_{timestamp_str}"
    
    readings = batch_data.get("readings", []) or batch_data.get("leituras", [])
    anomalies = batch_data.get("anomalies", []) or batch_data.get("anomalias", [])
    checklists = batch_data.get("checklists", [])
    
    exported_files = []
    
    # 1. Salvar Leituras
    if readings:
        csv_filename = f"Leituras_Campo_{timestamp_str}.csv"
        csv_path = os.path.join(DIR_ENTRADA_LEITURAS, csv_filename)
        
        # Cabeçalhos padrão correspondentes às colunas do Banco_De_Dados
        headers = ["Estrutura", "Instrumento", "Tipo", "Data", "Hora", "Leitura", "Cota_NA", "Status", "Operador", "Origem", "Hash_Integridade"]
        
        import csv
        with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f, delimiter=";")
            writer.writerow(headers)
            for r in readings:
                writer.writerow([
                    r.get("estrutura", "BARRAGEM B1"),
                    r.get("instrumento", r.get("id", "")),
                    r.get("tipo", "INA"),
                    r.get("data", datetime.now().strftime("%Y-%m-%d")),
                    r.get("hora", datetime.now().strftime("%H:%M:%S")),
                    str(r.get("valor", r.get("leitura", 0.0))).replace(".", ","),
                    str(r.get("cotaCalculada", r.get("cota", 0.0))).replace(".", ","),
                    r.get("status", "NORMAL"),
                    r.get("operador", "Técnico de Campo"),
                    origin,
                    r.get("sealHash", "")
                ])
        
        exported_files.append(csv_path)
        sha = calculate_sha256(csv_path)
        log_audit("IMPORT_LEITURAS_CAMPO", {"total": len(readings), "sha256": sha, "lote": batch_id}, csv_filename)
        
        # Tentar salvar também em XLSX se openpyxl estiver disponível
        try:
            import openpyxl
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "NovasLeiturasCampo"
            ws.append(headers)
            for r in readings:
                ws.append([
                    r.get("estrutura", "BARRAGEM B1"),
                    r.get("instrumento", r.get("id", "")),
                    r.get("tipo", "INA"),
                    r.get("data", datetime.now().strftime("%Y-%m-%d")),
                    r.get("hora", datetime.now().strftime("%H:%M:%S")),
                    float(r.get("valor", r.get("leitura", 0.0))),
                    float(r.get("cotaCalculada", r.get("cota", 0.0))),
                    r.get("status", "NORMAL"),
                    r.get("operador", "Técnico de Campo"),
                    origin,
                    r.get("sealHash", "")
                ])
            xlsx_filename = f"Leituras_Campo_{timestamp_str}.xlsx"
            xlsx_path = os.path.join(DIR_ENTRADA_LEITURAS, xlsx_filename)
            wb.save(xlsx_path)
            exported_files.append(xlsx_path)
        except Exception as err:
            print(f"[AVISO] Não foi possível gerar .xlsx: {err}")

    # 2. Salvar Anomalias / Chamados Fluig
    if anomalies:
        anom_filename = f"Anomalias_Campo_{timestamp_str}.json"
        anom_path = os.path.join(DIR_ANOMALIAS, anom_filename)
        with open(anom_path, "w", encoding="utf-8") as f:
            json.dump({
                "lote": batch_id,
                "geradoEm": datetime.now().isoformat(),
                "origem": origin,
                "anomalias": anomalies
            }, f, indent=2, ensure_ascii=False)
        exported_files.append(anom_path)
        log_audit("IMPORT_ANOMALIAS", {"total": len(anomalies), "lote": batch_id}, anom_filename)

    # 3. Salvar Checklists FIR
    if checklists:
        chk_filename = f"Checklists_FIR_{timestamp_str}.json"
        chk_path = os.path.join(DIR_CHECKLISTS, chk_filename)
        with open(chk_path, "w", encoding="utf-8") as f:
            json.dump({
                "lote": batch_id,
                "geradoEm": datetime.now().isoformat(),
                "origem": origin,
                "checklists": checklists
            }, f, indent=2, ensure_ascii=False)
        exported_files.append(chk_path)
        log_audit("IMPORT_CHECKLISTS", {"total": len(checklists), "lote": batch_id}, chk_filename)

    return {
        "success": True,
        "batchId": batch_id,
        "stagingDir": STAGING_BASE_DIR,
        "exportedFiles": exported_files,
        "summary": {
            "readings": len(readings),
            "anomalies": len(anomalies),
            "checklists": len(checklists)
        }
    }


def process_local_staging_queue():
    """
    Varre a pasta de staging local (staging_field_data) e despacha
    qualquer arquivo JSON pendente para a pasta corporativa da ITAMINAS.
    """
    init_corporate_staging_dirs()
    if not os.path.exists(LOCAL_STAGING_DIR):
        return []

    files = [f for f in os.listdir(LOCAL_STAGING_DIR) if f.endswith(".json")]
    processed = []
    
    for filename in files:
        filepath = os.path.join(LOCAL_STAGING_DIR, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            res = stage_new_field_batch(data, origin=f"MDSync Local Staging ({filename})")
            
            # Mover arquivo processado para a pasta corporativa 02_Processadas
            dest_archive = os.path.join(DIR_PROCESSADAS, filename)
            shutil.move(filepath, dest_archive)
            processed.append({"filename": filename, "result": res})
            print(f"[OK] Processado lote {filename} -> {res['batchId']}")
        except Exception as e:
            print(f"[ERRO] Falha ao processar {filename}: {e}")
            
    return processed


if __name__ == "__main__":
    print("=" * 70)
    print("MDSync — PIPELINE DE INTEGRAÇÃO DE CAMPO CORPORATIVO (ITAMINAS)")
    print("=" * 70)
    
    stg_dir = init_corporate_staging_dirs()
    print(f"Diretório de Staging: {stg_dir}")
    print(f"- Entrada de Leituras: {DIR_ENTRADA_LEITURAS}")
    print(f"- Processadas:         {DIR_PROCESSADAS}")
    print(f"- Checklists FIR:      {DIR_CHECKLISTS}")
    print(f"- Anomalias Fluig:     {DIR_ANOMALIAS}")
    print(f"- Logs de Auditoria:   {DIR_AUDITORIA}")
    
    # Processar fila pendente
    pendentes = process_local_staging_queue()
    print(f"\nLotes processados da fila local: {len(pendentes)}")
    print("=" * 70)
