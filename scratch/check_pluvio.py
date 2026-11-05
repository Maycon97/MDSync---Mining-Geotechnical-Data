import openpyxl
import os

paths = [
    r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista\02) Pluviometria\PLUVIOMETRIA.xlsx",
    r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\00) Gestao\1) Gestão À Vista\1-Power Bi\2) Pluviometria\Nova pasta\PLUVIOMETRIA.xlsx",
    r"C:\Users\maycon.nascimento\ITAMINAS\SPLO - General\03) Geotecnia\01) PCMI\00) Gestão à Vista\02) Pluviometria\Nova pasta\COORDENADAS.xlsx"
]

for p in paths:
    print("="*60)
    print("PATH:", p)
    if not os.path.exists(p):
        print("NOT FOUND")
        continue
    try:
        wb = openpyxl.load_workbook(p, data_only=True, read_only=True)
        print("Sheets:", wb.sheetnames)
        for s in wb.sheetnames:
            ws = wb[s]
            rows = []
            for idx, r in enumerate(ws.iter_rows(values_only=True)):
                if idx < 10:
                    rows.append(r)
                else:
                    break
            print(f"Sheet {s} first rows:")
            for r in rows[:6]:
                print("  ", [str(x)[:25] if x is not None else "" for x in r[:12]])
    except Exception as e:
        print("Error:", e)

