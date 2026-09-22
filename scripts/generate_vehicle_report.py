import json

with open('public/data/survey123_vehicle_form.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

report = []
for i, page in enumerate(data.get('questions', [])):
    p_info = {
        'page_index': i + 1,
        'page_id': page.get('name'),
        'page_label': page.get('label'),
        'questions': []
    }
    for q in page.get('questions', []):
        choices_raw = q.get('choices', [])
        choices = []
        for c in choices_raw:
            if isinstance(c, dict):
                choices.append({'label': c.get('label'), 'value': c.get('name')})
            else:
                choices.append({'label': str(c), 'value': str(c)})

        p_info['questions'].append({
            'name': q.get('name'),
            'label': q.get('label'),
            'type': q.get('type'),
            'required': q.get('isRequired', False),
            'choices': choices,
            'description': q.get('description')
        })
    report.append(p_info)

with open('public/data/survey123_vehicle_detailed.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print('Detailed report written to public/data/survey123_vehicle_detailed.json')
