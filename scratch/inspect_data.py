import os
import openpyxl

files_to_check = [
    r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\00) Gestao\1) Gestão À Vista\1-Power Bi\6) Controle de Demandas e Prazos\Controle_Demandas e Prazos.xlsx",
    r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\00) Gestao\1) Gestão À Vista\1-Power Bi\9) Rotina Geotecnia\Rotina Geotecnia.xlsx",
    r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\00) Gestao\1) Gestão À Vista\1-Power Bi\13) Exigências Extraordinárias\Atendimento_a_Exigências_Extraordinárias.xlsx",
    r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\00) Gestao\1) Gestão À Vista\1-Power Bi\20. Indicadores Geotecnia\BI_Geotecnia_Base_Indicadores.xlsx",
    r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\00) Gestao\1) Gestão À Vista\Report Diário\Planilha_Base_Válida.xlsx",
    r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista\00) Cronograma PCMI\CronogramaPCM.xlsx",
    r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista\04) Chamados\Controle de Chamados.xlsx",
    r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista\05) FoS\BancodeDados_Barragens_BETA.xlsx",
    r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista\06) Georadar\BancodeDados_RADAR.xlsx",
    r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista\07) Dados Piezométricos\CARTA DE RISCO.xlsx",
    r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista\08) Controle de Pendências Contratuais\Planilha Controle de Pendências.xlsx",
    r"c:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista\09) FoS MLF\DadosInspeçõesMLF.xlsx"
]

for fp in files_to_check:
    print("="*60)
    print("ARQUIVO:", os.path.basename(fp))
    if not os.path.exists(fp):
        print("ARQUIVO NÃO ENCONTRADO")
        continue
    try:
        wb = openpyxl.load_workbook(fp, data_only=True, read_only=True)
        sheet_names = wb.sheetnames
        print("Abas:", sheet_names)
        for sname in sheet_names[:3]:
            ws = wb[sname]
            rows = list(ws.iter_rows(values_only=True, max_row=5))
            if rows:
                print(f"  Aba '{sname}' ({len(rows)} linhas amostra):")
                for r in rows[:3]:
                    print("   ", [str(c)[:30] if c is not None else "" for c in r[:10]])
    except Exception as e:
        print("Erro ao ler:", e)
