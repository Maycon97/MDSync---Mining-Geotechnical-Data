import os
import openpyxl
import json

base_pcmi = r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista"
base_gestao = r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\00) Gestao\1) Gestão À Vista"

files = {
    "demandas_prazos": os.path.join(base_gestao, r"1-Power Bi\6) Controle de Demandas e Prazos\Controle_Demandas e Prazos.xlsx"),
    "rotina_geotecnia": os.path.join(base_gestao, r"1-Power Bi\9) Rotina Geotecnia\Rotina Geotecnia.xlsx"),
    "exigencias_extraordinarias": os.path.join(base_gestao, r"1-Power Bi\13) Exigências Extraordinárias\Atendimento_a_Exigências_Extraordinárias.xlsx"),
    "indicadores_geotecnia": os.path.join(base_gestao, r"1-Power Bi\20. Indicadores Geotecnia\BI_Geotecnia_Base_Indicadores.xlsx"),
    "report_diario": os.path.join(base_gestao, r"Report Diário\Planilha_Base_Válida.xlsx"),
    "cronograma_pcmi": os.path.join(base_pcmi, r"00) Cronograma PCMI\CronogramaPCM.xlsx"),
    "sumps_gut": os.path.join(base_pcmi, r"01) Sumps\GUT_SUMPS.xlsx"),
    "pluviometria": os.path.join(base_pcmi, r"02) Pluviometria\PLUVIOMETRIA.xlsx"),
    "chamados": os.path.join(base_pcmi, r"04) Chamados\Controle de Chamados.xlsx"),
    "fos_barragens": os.path.join(base_pcmi, r"05) FoS\BancodeDados_Barragens_BETA.xlsx"),
    "georadar": os.path.join(base_pcmi, r"06) Georadar\BancodeDados_RADAR.xlsx"),
    "pendencias_contratuais": os.path.join(base_pcmi, r"08) Controle de Pendências Contratuais\Planilha Controle de Pendências.xlsx"),
    "fos_mlf": os.path.join(base_pcmi, r"09) FoS MLF\DadosInspeçõesMLF.xlsx")
}

summary = {}
for key, fp in files.items():
    if not os.path.exists(fp):
        summary[key] = {"exists": False}
        continue
    try:
        wb = openpyxl.load_workbook(fp, data_only=True, read_only=True)
        sheets_info = {}
        for sname in wb.sheetnames:
            ws = wb[sname]
            total_rows = 0
            headers = None
            for idx, row in enumerate(ws.iter_rows(values_only=True)):
                if idx == 0:
                    headers = [str(c) if c is not None else "" for c in row]
                total_rows += 1
            sheets_info[sname] = {
                "total_rows": total_rows,
                "headers": headers[:15] if headers else []
            }
        summary[key] = {
            "exists": True,
            "sheets": sheets_info
        }
    except Exception as e:
        summary[key] = {"exists": True, "error": str(e)}

print(json.dumps(summary, indent=2, ensure_ascii=False))
