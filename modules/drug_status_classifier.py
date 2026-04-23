import re

def extract_drugs_with_status(entities, text):
    """
    Извлекает препараты со статусами
    """
    print(f"\n🔍 [CLASSIFIER] Начинаю обработку...")
    print(f"   📥 Получено entities: {len(entities)} шт.")
    
    drugs = {'taken': [], 'cancelled': [], 'added': []}
    seen = set()

    headers = {
        'taken': r'ПРИНИМАЕМЫЕ\s+ПРЕПАРАТЫ|ТЕКУЩАЯ\s+ТЕРАПИЯ|ПРИНИМАЕТ',
        'added': r'НОВЫЕ\s+НАЗНАЧЕНИЯ|ДОБАВЛЕНО|НАЗНАЧЕНО\s+ДОПОЛНИТЕЛЬНО',
        'cancelled': r'ОТМЕНЕНО|ПРЕКРАЩЕНО|ИСКЛЮЧЕНО'
    }
    
    sections = []
    for status, pattern in headers.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            sections.append((match.start(), status))
            print(f"   📍 Найден заголовок '{status}' на позиции {match.start()}")
    
    sections.sort()

    print(f"   🔬 Обрабатываю {len(entities)} сущностей...")
    for i, ent in enumerate(entities):
        label = ent.get('label', '')
        raw_name = ent.get('text', '')
        
        print(f"   [{i}] label={label}, text={raw_name}")
        
        if label not in ['DRUG', 'ЛЕКАРСТВО']:
            print(f"       ⏭️ Пропускаю (не препарат)")
            continue
            
        clean_name = raw_name.lower().strip()
        
        if len(clean_name) < 3:
            print(f"       ⏭️ Пропускаю (короткий)")
            continue
            
        if clean_name in {'терапия', 'лечение', 'препарат', 'таблетки', 'капсулы'}:
            print(f"       ⏭️ Пропускаю (стоп-слово)")
            continue
        
        status = 'taken'
        if sections:
            drug_pos = text.lower().find(raw_name.lower())
            for pos, sec_status in sections:
                if pos < drug_pos:
                    status = sec_status
                else:
                    break
            print(f"       🏷️ Статус: {status}")
        
        if clean_name not in seen:
            drugs[status].append(raw_name)
            seen.add(clean_name)
            print(f"       ✅ Добавлен в {status}: {raw_name}")

    if not sections:
        print(f"   🔄 Секций не найдено, всё в 'taken'")
        all_drugs = drugs['taken'] + drugs['added'] + drugs['cancelled']
        drugs = {'taken': list(set(all_drugs)), 'cancelled': [], 'added': []}

    print(f"\n💊 [CLASSIFIER] Итог: Принимает={drugs['taken']}, Отменено={drugs['cancelled']}, Добавлено={drugs['added']}\n")
    return drugs