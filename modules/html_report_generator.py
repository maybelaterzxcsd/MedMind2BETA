# modules/html_report_generator.py
from datetime import datetime
import html
import re

def generate_html_report(entities: list):
    """Генерирует официальный медицинский отчёт с фильтрацией мусора"""
    
    # Список слов, которые ИИ может спутать с симптомами (стоп-слова)
    NOISE_WORDS = {
        ',', '.', 'и', 'или', 'но', 'не', 'в', 'на', 'без', 'за', 
        'под', 'над', 'при', 'по', 'о', 'с', 'у', 'к', 'от', 'для'
    }
    
    # Фильтрация данных
    categories = {
        'СИМПТОМЫ': set(),
        'ЛЕКАРСТВА': set(),
        'ДИАГНОЗЫ': set()
    }
    
    keywords_map = {
        'СИМПТОМЫ': ['СИМПТОМ', 'SYMPATOM', 'SYMPTOM', 'СИБПТОМ'],
        'ЛЕКАРСТВА': ['ЛЕКАРСТВО', 'DRUG', 'MEDICATION', 'DRUGS'],
        'ДИАГНОЗЫ': ['ДИАГНОЗ', 'DIAGNOSIS', 'DISEASE']
    }
    
    cleaned_entities = []
    
    for item in entities:
        label = str(item.get('label', '')).upper().strip()
        text = str(item.get('text', ''))
        
        # 1️⃣ Исключаем категорию O и пустые значения
        if text.strip() == 'o' or len(text.strip()) < 2:
            continue
            
        # 2️⃣ Исключаем стоп-слова
        if text.strip().lower() in NOISE_WORDS:
            continue
            
        # Добавляем в нужную категорию
        matched = False
        for key, vals in keywords_map.items():
            if label in vals:
                categories[key].add(text.lower().capitalize()) # Приводим к нормальном виду
                matched = True
                break
        
        if matched:
            cleaned_entities.append(item)
    
    # Форматируем списки для отображения
    def format_items(items):
        if not items:
            return '<i>Не выявлено</i>'
        return ''.join([f'<li>{html.escape(item)}</li>' for item in sorted(list(items))])
    
    date_str = datetime.now().strftime("%d.%m.%Y %H:%M")
    
    html_content = f'''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Медицинский Отчёт MedMind2.0</title>
    <style>
        {{
            body {{ font-family: Arial, Helvetica, sans-serif; background: #f4f7f6; padding: 40px; }}
            .container {{ max-width: 900px; margin: auto; background: white; border: 1px solid #ccc; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding: 40px; position: relative; }}
            .header {{ border-bottom: 2px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px; }}
            h1 {{ color: #0056b3; margin: 0; font-size: 24px; }}
            .subtitle {{ font-size: 14px; color: #666; margin-top: 5px; }}
            
            .meta-info {{ display: flex; justify-content: space-between; font-size: 12px; color: #777; margin-bottom: 30px; }}
            
            table {{ width: 100%; border-collapse: collapse; margin-bottom: 30px; }}
            th {{ text-align: left; background: #eef4fa; color: #333; padding: 12px; border-bottom: 1px solid #ddd; vertical-align: top; }}
            td {{ padding: 12px; vertical-align: top; border-bottom: 1px solid #eee; }}
            
            ul {{ list-style: none; padding: 0; margin: 0; }}
            li {{ margin-bottom: 8px; position: relative; padding-left: 20px; color: #333; }}
            li::before {{ content: "•"; color: #0056b3; position: absolute; left: 0; font-weight: bold; }}
            
            .diagnosis-section {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; }}
            .drugs-section {{ background: #d4edda; border-left: 4px solid #28a745; padding: 15px; }}
            .symptom-section {{ background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; }}
            
            footer {{ font-size: 12px; color: #999; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🩺 Система поддержки принятия врачебных решений MedMind2.0</h1>
            <div class="subtitle">Автономный анализ медицинских записей и формирование предварительного диагноза</div>
        </div>
        
        <div class="meta-info">
            <span><strong>Дата анализа:</strong> {date_str}</span>
            <span><strong>ID отчёта:</strong> {datetime.now().strftime('%Y%m%d%H%M%S')}</span>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th style="width: 45%;">Жалобы пациента</th>
                    <th style="width: 45%;">Лекарственная терапия</th>
                    <th style="width: 10%;">Диагноз</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="symptom-section">
                            <ul>{format_items(categories['СИМПТОМЫ'])}</ul>
                        </div>
                    </td>
                    <td>
                        <div class="drugs-section">
                            <ul>{format_items(categories['ЛЕКАРСТВА'])}</ul>
                        </div>
                    </td>
                    <td>
                        <div class="diagnosis-section">
                            <ul>{format_items(categories['ДИАГНОЗЫ'])}</ul>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <footer>
            Этот документ является результатом работы программного обеспечения.<br>
            Не является заменой консультации квалифицированного специалиста.
        </footer>
    </div>
</body>
</html>'''
    
    return html_content.encode('utf-8')