import re

def extract_patient_name(entities, text):
    """
    Извлекает имя пациента из entities модели ИЛИ из текста
    """
    if entities:
        for entity in entities:
            entity_label = entity.get('label', '').upper()
            entity_text = entity.get('text', '').strip()
            if entity_label in ['ПАЦИЕНТ', 'PERSON', 'PATIENT', 'NAME', 'ФИО']:
                return entity_text.upper()
    
    match = re.search(r'Пациент:\s*([А-Яа-я]+\s+[А-Яа-я]+\s+[А-Яа-я]+)', text)
    if match:
        name = match.group(1).strip().upper()
        print(f"✅ Нашла ФИО в тексте: {name}")
        return name
    
    match = re.search(r'Пациент\s+([А-Яа-я]+\s+[А-Яа-я]+\s+[А-Яа-я]+),\s*\d+', text)
    if match:
        name = match.group(1).strip().upper()
        print(f"✅ Нашла ФИО в тексте (паттерн 2): {name}")
        return name
    
    print("⚠️ ФИО не найдено")
    return None