import urllib.request
import zipfile
import io
import json

url = 'https://www.arcgis.com/sharing/rest/content/items/8f6f56e94ec142af90e2ac9084ce716c/data'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req) as resp:
    z = zipfile.ZipFile(io.BytesIO(resp.read()))
    form_js = json.loads(z.read('esriinfo/form.json').decode('utf-8'))
    
    # Salvar o form.json extraído
    with open('public/data/survey123_form.json', 'w', encoding='utf-8') as f:
        json.dump(form_js, f, indent=2, ensure_ascii=False)
        
    print("Form salvo com sucesso em public/data/survey123_form.json")
    print("Título:", form_js.get("header"))
    print("Subtítulo:", form_js.get("subHeader"))
    print("Total perguntas:", len(form_js.get("questions", [])))
    
    questions_summary = []
    for q in form_js.get("questions", []):
        questions_summary.append({
            "name": q.get("name"),
            "label": q.get("label"),
            "type": q.get("type"),
            "required": q.get("required"),
            "options": [opt.get("label") for opt in q.get("options", [])] if "options" in q else []
        })
        
    with open('public/data/survey123_questions_summary.json', 'w', encoding='utf-8') as f:
        json.dump(questions_summary, f, indent=2, ensure_ascii=False)

    for q in questions_summary[:25]:
        print(f"{q['name']} | {q['label']} | Tipo: {q['type']} | Opções: {len(q['options'])}")
