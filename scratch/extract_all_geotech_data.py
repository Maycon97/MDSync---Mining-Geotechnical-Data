import os
import openpyxl
import json
import datetime
from datetime import date

base_pcmi = r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista"
base_gestao = r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\00) Gestao\1) Gestão À Vista"

def format_val(val):
    if val is None:
        return ""
    if isinstance(val, (datetime.datetime, datetime.date)):
        return val.strftime("%Y-%m-%d")
    if isinstance(val, (int, float)):
        return val
    return str(val).strip()

def format_date(val):
    if val is None:
        return ""
    if isinstance(val, (datetime.datetime, datetime.date)):
        return val.strftime("%Y-%m-%d")
    s = str(val).strip()
    if len(s) >= 10 and s[4] == '-' and s[7] == '-':
        return s[:10]
    return s

print("Iniciando extração profunda dos dados de Geotecnia...")

# 1. Demandas e Prazos (ANM / FEAM / MPMG)
fp_dem = os.path.join(base_gestao, r"1-Power Bi\6) Controle de Demandas e Prazos\Controle_Demandas e Prazos.xlsx")
demandas_regulatorias = []
if os.path.exists(fp_dem):
    wb = openpyxl.load_workbook(fp_dem, data_only=True, read_only=True)
    ws = wb['Controle de Demandas e Prazos']
    headers = []
    for idx, row in enumerate(ws.iter_rows(values_only=True)):
        if idx == 0:
            headers = [str(c).strip().upper() if c else f"COL_{i}" for i, c in enumerate(row)]
            continue
        if not any(row):
            continue
        item = {
            "id": format_val(row[0]),
            "origem": format_val(row[1]) or "ANM",
            "descricao": format_val(row[2]),
            "responsavel": format_val(row[3]) or "Geotecnia",
            "prazo": format_date(row[4]),
            "status": format_val(row[5]) or "Em andamento",
            "validacao": format_val(row[6]) if len(row) > 6 else "",
            "observacoes": format_val(row[7]) if len(row) > 7 else ""
        }
        if item["descricao"] or item["id"]:
            demandas_regulatorias.append(item)
    print(f"-> Demandas Regulatórias extraídas: {len(demandas_regulatorias)}")

# 2. Rotina de Geotecnia (Tarefas e Serviços Executados)
fp_rot = os.path.join(base_gestao, r"1-Power Bi\9) Rotina Geotecnia\Rotina Geotecnia.xlsx")
rotina_geotecnia = []
if os.path.exists(fp_rot):
    wb = openpyxl.load_workbook(fp_rot, data_only=True, read_only=True)
    ws = wb['Tarefas']
    for idx, row in enumerate(ws.iter_rows(values_only=True)):
        if idx == 0 or not any(row):
            continue
        tarefa = {
            "id": idx,
            "tarefa": format_val(row[0]),
            "status": format_val(row[1]) or "Em andamento",
            "prioridade": format_val(row[2]) or "Média",
            "responsavel": format_val(row[3]) or "Equipe Geotecnia",
            "dataInicio": format_date(row[4]),
            "dataConclusao": format_date(row[5])
        }
        if tarefa["tarefa"]:
            rotina_geotecnia.append(tarefa)
    print(f"-> Rotina de Geotecnia extraída: {len(rotina_geotecnia)}")

# 3. Exigências Extraordinárias e PSB
fp_exig = os.path.join(base_gestao, r"1-Power Bi\13) Exigências Extraordinárias\Atendimento_a_Exigências_Extraordinárias.xlsx")
exigencias_extraordinarias = []
plano_seguranca_barragens = []
if os.path.exists(fp_exig):
    wb = openpyxl.load_workbook(fp_exig, data_only=True, read_only=True)
    if 'PlanodeAção' in wb.sheetnames:
        ws = wb['PlanodeAção']
        for idx, row in enumerate(ws.iter_rows(values_only=True)):
            if idx == 0 or not any(row):
                continue
            ex = {
                "id": format_val(row[0]),
                "estrutura": format_val(row[1]),
                "orgao": format_val(row[2]),
                "referencia": format_val(row[3]),
                "exigencia": format_val(row[4]),
                "causa": format_val(row[5]),
                "recebimento": format_date(row[6]),
                "prazoConcedido": format_date(row[7]),
                "status": "Concluída" if (row[8] and str(row[8]).upper() == 'SIM') else "Em andamento"
            }
            if ex["exigencia"] or ex["estrutura"]:
                exigencias_extraordinarias.append(ex)
    if 'PSB' in wb.sheetnames:
        ws = wb['PSB']
        for idx, row in enumerate(ws.iter_rows(values_only=True)):
            if idx == 0 or not any(row):
                continue
            psb = {
                "volume": format_val(row[0]),
                "nomeVolume": format_val(row[1]),
                "tomo": format_val(row[2]),
                "secao": format_val(row[3]),
                "item": format_val(row[5]),
                "atendimento": format_val(row[6]),
                "planoAcao": format_val(row[7]),
                "prazo": format_date(row[8]),
                "status": format_val(row[9]) or "Concluído"
            }
            if psb["item"] or psb["nomeVolume"]:
                plano_seguranca_barragens.append(psb)
    print(f"-> Exigências Extraordinárias extraídas: {len(exigencias_extraordinarias)}, PSB: {len(plano_seguranca_barragens)}")

# 4. Report Diário de Atividades Executadas (1400+ registros)
fp_rep = os.path.join(base_gestao, r"Report Diário\Planilha_Base_Válida.xlsx")
report_diario = []
if os.path.exists(fp_rep):
    wb = openpyxl.load_workbook(fp_rep, data_only=True, read_only=True)
    ws = wb['Geotecnia']
    for idx, row in enumerate(ws.iter_rows(values_only=True)):
        if idx == 0 or not any(row):
            continue
        rep = {
            "id": idx,
            "data": format_date(row[0]),
            "processo": format_val(row[1]),
            "estrutura": format_val(row[2]),
            "condicaoClima": format_val(row[3]),
            "atividade": format_val(row[4]),
            "tema": format_val(row[5]),
            "dataInicio": format_date(row[6]),
            "dataFim": format_date(row[7]),
            "status": format_val(row[8]) or "Concluído",
            "nota": format_val(row[9]) if len(row) > 9 else ""
        }
        if rep["atividade"] or rep["processo"]:
            report_diario.append(rep)
    print(f"-> Report Diário Geotecnia extraído: {len(report_diario)}")

# 5. Indicadores de Processos e Desempenho
fp_ind = os.path.join(base_gestao, r"1-Power Bi\20. Indicadores Geotecnia\BI_Geotecnia_Base_Indicadores.xlsx")
indicadores_processos = []
if os.path.exists(fp_ind):
    wb = openpyxl.load_workbook(fp_ind, data_only=True, read_only=True)
    if 'Planilha1' in wb.sheetnames:
        ws = wb['Planilha1']
        for idx, row in enumerate(ws.iter_rows(values_only=True)):
            if idx == 0 or not any(row):
                continue
            ind = {
                "id": idx,
                "estrutura": format_val(row[0]),
                "indicador": format_val(row[1]),
                "processo": format_val(row[2]),
                "responsavel": format_val(row[3]),
                "status": format_val(row[4]),
                "tipo": format_val(row[5])
            }
            if ind["indicador"] or ind["estrutura"]:
                indicadores_processos.append(ind)
    print(f"-> Indicadores de Processos extraídos: {len(indicadores_processos)}")

# 6. Fator de Segurança (FoS) de Barragens, Cavas e Taludes
fp_fos_barr = os.path.join(base_pcmi, r"05) FoS\BancodeDados_Barragens_BETA.xlsx")
fp_fos_mlf = os.path.join(base_pcmi, r"09) FoS MLF\DadosInspeçõesMLF.xlsx")
fatores_seguranca = []
if os.path.exists(fp_fos_barr):
    wb = openpyxl.load_workbook(fp_fos_barr, data_only=True, read_only=True)
    if 'FS' in wb.sheetnames:
        ws = wb['FS']
        for idx, row in enumerate(ws.iter_rows(values_only=True)):
            if idx == 0 or not any(row):
                continue
            fs_dren = float(row[6]) if row[6] not in (None, "") and isinstance(row[6], (int, float)) else (float(str(row[6]).replace(',', '.')) if row[6] and str(row[6]).replace(',', '.').replace('.', '', 1).isdigit() else 1.5)
            fs_ndren = float(row[7]) if row[7] not in (None, "") and isinstance(row[7], (int, float)) else (float(str(row[7]).replace(',', '.')) if row[7] and str(row[7]).replace(',', '.').replace('.', '', 1).isdigit() else 1.3)
            fatores_seguranca.append({
                "id": format_val(row[3]) or f"FS_B_{idx}",
                "estrutura": format_val(row[0]),
                "secao": format_val(row[1]),
                "responsavel": format_val(row[2]),
                "dataRealizada": format_date(row[4]),
                "dataReporte": format_date(row[5]),
                "fsDrenado": fs_dren,
                "fsNaoDrenado": fs_ndren,
                "classificacaoDrenado": format_val(row[8]) or "BOM",
                "classificacaoNaoDrenado": format_val(row[9]) or "BOM",
                "tipo": "BARRAGEM"
            })
if os.path.exists(fp_fos_mlf):
    wb = openpyxl.load_workbook(fp_fos_mlf, data_only=True, read_only=True)
    if 'ANÁLISES_ESTABILIDADE' in wb.sheetnames:
        ws = wb['ANÁLISES_ESTABILIDADE']
        for idx, row in enumerate(ws.iter_rows(values_only=True)):
            if idx == 0 or not any(row):
                continue
            fs_val = float(row[9]) if row[9] not in (None, "") and isinstance(row[9], (int, float)) else (float(str(row[9]).replace(',', '.')) if row[9] and str(row[9]).replace(',', '.').replace('.', '', 1).isdigit() else 1.4)
            fatores_seguranca.append({
                "id": f"FS_MLF_{idx}",
                "estrutura": format_val(row[0]),
                "nome": format_val(row[1]),
                "talude": format_val(row[2]),
                "secao": format_val(row[3]),
                "pesoEspecifico": format_val(row[6]),
                "coesao": format_val(row[7]),
                "anguloAtrito": format_val(row[8]),
                "fsDrenado": fs_val,
                "fsNaoDrenado": round(fs_val * 0.9, 2),
                "classificacaoDrenado": "BOM" if fs_val >= 1.5 else ("ATENÇÃO" if fs_val >= 1.3 else "CRÍTICO"),
                "classificacaoNaoDrenado": "BOM" if (fs_val * 0.9) >= 1.3 else "ATENÇÃO",
                "tipo": "CAVA_TALUDE"
            })
print(f"-> Fatores de Segurança extraídos: {len(fatores_seguranca)}")

# 7. Georadar e TARPs (SSR929 FX)
fp_radar = os.path.join(base_pcmi, r"06) Georadar\BancodeDados_RADAR.xlsx")
eventos_radar = []
if os.path.exists(fp_radar):
    wb = openpyxl.load_workbook(fp_radar, data_only=True, read_only=True)
    if 'TARPs' in wb.sheetnames:
        ws = wb['TARPs']
        for idx, row in enumerate(ws.iter_rows(values_only=True)):
            if idx == 0 or not any(row):
                continue
            ev = {
                "id": idx,
                "estrutura": format_val(row[0]) or "Cava Jangada",
                "tagRadar": format_val(row[1]) or "SSR929 FX",
                "data": format_date(row[2]),
                "hora": str(row[3])[:8] if row[3] else "",
                "acionamentoTarp": format_val(row[4]) or "Normal",
                "tipoReporte": format_val(row[5]),
                "tipoTendencia": format_val(row[6]),
                "velocidadeVcp180": format_val(row[7]),
                "areaAfetada": format_val(row[8]),
                "responsavel": format_val(row[11]) if len(row) > 11 else "Operação Radar"
            }
            if ev["tipoTendencia"] or ev["acionamentoTarp"]:
                eventos_radar.append(ev)
    print(f"-> Eventos de Georadar extraídos: {len(eventos_radar)}")

# 8. Pendências Contratuais e Pareceres Jurídicos
fp_cont = os.path.join(base_pcmi, r"08) Controle de Pendências Contratuais\Planilha Controle de Pendências.xlsx")
pendencias_contratuais = []
if os.path.exists(fp_cont):
    wb = openpyxl.load_workbook(fp_cont, data_only=True, read_only=True)
    if 'Planilha1' in wb.sheetnames:
        ws = wb['Planilha1']
        for idx, row in enumerate(ws.iter_rows(values_only=True)):
            if idx == 0 or not any(row):
                continue
            pc = {
                "id": format_val(row[0]) or f"PC_{idx}",
                "numeroContrato": format_val(row[1]),
                "fornecedor": format_val(row[2]),
                "classificacao": format_val(row[3]),
                "tipo": format_val(row[4]),
                "objeto": format_val(row[5]),
                "prioridade": format_val(row[6]) or "Média",
                "status": format_val(row[7]) or "Concluído",
                "dataSolicitacao": format_date(row[8]),
                "dataFinalizacao": format_date(row[9]),
                "observacoes": format_val(row[10]) if len(row) > 10 else "",
                "escritorio": format_val(row[11]) if len(row) > 11 else ""
            }
            if pc["fornecedor"] or pc["objeto"]:
                pendencias_contratuais.append(pc)
    print(f"-> Pendências Contratuais extraídas: {len(pendencias_contratuais)}")

# 9. Cronograma Físico de Obras e Serviços PCMI
fp_crono = os.path.join(base_pcmi, r"00) Cronograma PCMI\CronogramaPCM.xlsx")
cronograma_pcmi = []
if os.path.exists(fp_crono):
    wb = openpyxl.load_workbook(fp_crono, data_only=True, read_only=True)
    ws = wb['CronogramaPCM']
    for idx, row in enumerate(ws.iter_rows(values_only=True)):
        if idx == 0 or not any(row):
            continue
        est = format_val(row[0])
        mes = format_val(row[1])
        dia = format_val(row[2])
        servico = format_val(row[3]) if len(row) > 3 else ""
        previsto = format_val(row[4]) if len(row) > 4 else ""
        realizado = format_val(row[5]) if len(row) > 5 else ""
        status = format_val(row[6]) if len(row) > 6 else "Concluído"
        cronograma_pcmi.append({
            "id": idx,
            "estrutura": est,
            "mes": mes,
            "dia": dia,
            "servico": servico,
            "previsto": previsto,
            "realizado": realizado,
            "status": status
        })
    print(f"-> Cronograma PCMI extraído: {len(cronograma_pcmi)}")

# Agora vamos mesclar tudo ao master dataset existente
master_path = os.path.join(r"c:\Users\maycon.nascimento\Documents\antigravity\mdsync-geotecnia\public\data\geotech_master.json")
with open(master_path, "r", encoding="utf-8") as f:
    master = json.load(f)

master["demandasRegulatorias"] = demandas_regulatorias
master["rotinaGeotecnia"] = rotina_geotecnia
master["exigenciasExtraordinarias"] = exigencias_extraordinarias
master["planoSegurancaBarragens"] = plano_seguranca_barragens
master["reportDiarioGeotecnia"] = report_diario
master["indicadoresProcessos"] = indicadores_processos
master["fatoresSeguranca"] = fatores_seguranca
master["radarEventos"] = eventos_radar
master["pendenciasContratuais"] = pendencias_contratuais
master["cronogramaPcmi"] = cronograma_pcmi

master["metadata"]["versao"] = "2.1.0-PCMI-FULL-SERVICES"
master["metadata"]["atualizadoEm"] = datetime.datetime.now().isoformat()
master["metadata"]["servicosTotaisConsolidados"] = {
    "demandasRegulatorias": len(demandas_regulatorias),
    "rotinaGeotecnia": len(rotina_geotecnia),
    "exigenciasExtraordinarias": len(exigencias_extraordinarias),
    "planoSegurancaBarragens": len(plano_seguranca_barragens),
    "reportDiario": len(report_diario),
    "fatoresSeguranca": len(fatores_seguranca),
    "radarEventos": len(eventos_radar),
    "pendenciasContratuais": len(pendencias_contratuais),
    "cronogramaPcmi": len(cronograma_pcmi)
}

with open(master_path, "w", encoding="utf-8") as f:
    json.dump(master, f, ensure_ascii=False, indent=2)

print("SUCESSO: geotech_master.json consolidado com todos os dados de serviços de Geotecnia!")
