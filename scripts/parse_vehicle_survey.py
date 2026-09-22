import urllib.request
import zipfile
import io
import json

url = 'https://www.arcgis.com/sharing/rest/content/items/af6c8c59f0654638b6e566793de64618/data'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    zf = zipfile.ZipFile(io.BytesIO(response.read()))
    form_data = json.loads(zf.read('esriinfo/form.json').decode('utf-8'))

with open('public/data/survey123_vehicle_form.json', 'w', encoding='utf-8') as f:
    json.dump(form_data, f, ensure_ascii=False, indent=2)

print('Header:', form_data.get('header'))
print('SubHeader:', form_data.get('subHeader'))
questions = form_data.get('questions', [])
print(f'Total questions: {len(questions)}')

summary = []
for i, q in enumerate(questions):
    item = {
        'name': q.get('name'),
        'label': q.get('label'),
        'type': q.get('type'),
        'required': q.get('required', False),
        'choices': [c.get('label') for c in q.get('choices', [])] if 'choices' in q else []
    }
    if 'children' in q:
        item['children'] = []
        for c in q.get('children', []):
            item['children'].append({
                'name': c.get('name'),
                'label': c.get('label'),
                'type': c.get('type'),
                'required': c.get('required', False),
                'choices': [ch.get('label') for ch in c.get('choices', [])] if 'choices' in c else []
            })
    summary.append(item)

with open('public/data/survey123_vehicle_summary.json', 'w', encoding='utf-8') as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)

print('Saved survey123_vehicle_form.json and summary!')
