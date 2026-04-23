"""
Скрипт миграции: добавляет поля drugs и with_drugs в существующие записи взаимодействий
"""
import json
import sys
import os
import re

# Добавляем пути
PROJECT_ROOT = r"E:\MedMind2.0"
modules_path = os.path.join(PROJECT_ROOT, 'modules')
backend_path = os.path.join(PROJECT_ROOT, 'backend')
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, modules_path)
sys.path.insert(0, backend_path)

from db.database import SessionLocal, PatientAnalysis
from modules.recommendation_engine import decision_engine

def extract_drugs_from_text(text):
    """Извлекает названия препаратов из текста"""
    # Загружаем базу взаимодействий для получения списка всех препаратов
    db_path = r"E:\MedMind2.0\data\drug_interactions.json"
    try:
        with open(db_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except:
        return []
    
    all_drugs = []
    for conflict in data.get('conflicts', []):
        all_drugs.extend(conflict.get('drugs', []))
        all_drugs.extend(conflict.get('with_drugs', []))
    
    found_drugs = []
    text_lower = text.lower()
    for drug in all_drugs:
        if drug.lower() in text_lower:
            found_drugs.append(drug)
    
    return list(set(found_drugs))

def migrate_interactions():
    """Обновляет существующие записи с взаимодействиями"""
    db = SessionLocal()
    
    # Словарь для маппинга взаимодействий на препараты
    interaction_drugs = {
        "Высокий риск гиперкалиемии": (["эналаприл", "энап", "ренитек"], ["спиронолактон", "амилорид", "триамтерен"]),
        "Опасность массивных кровотечений": (["аспирин", "ацетилсалициловая кислота", "кардиомагнил", "тромбо асс"], ["варфарин", "клопидогрел", "нилодигитоксин"]),
        "Риск лактоацидоза": (["метформин", "глюкофаж", "сиофор"], ["йодсодержащие контрастные вещества"]),
        "Повышенный риск желудочно-кишечных кровотечений": (["ибупрофен", "найз", "нимесулид", "нурофен"], ["варфарин", "гепарин", "антикоагулянты"]),
        "Дисульфирамоподобная реакция": (["левомицетин", "левомицетина ацетат"], ["алкоголь", "спиртосодержащие препараты"]),
    }
    
    try:
        analyses = db.query(PatientAnalysis).all()
        updated_count = 0
        
        for analysis in analyses:
            if not analysis.medications_interactions:
                continue
                
            try:
                interactions = json.loads(analysis.medications_interactions)
            except:
                continue
            
            if not isinstance(interactions, list) or len(interactions) == 0:
                continue
            
            # Проверяем, есть ли уже поля drugs/with_drugs
            needs_update = False
            for int in interactions:
                if 'drugs' not in int or 'with_drugs' not in int:
                    needs_update = True
                    break
            
            if not needs_update:
                print(f"⏭️ Пропущена запись ID={analysis.id} (уже обновлена)")
                continue
            
            # Получаем список препаратов из medications_current
            drugs_list = []
            try:
                meds_current = json.loads(analysis.medications_current)
                if isinstance(meds_current, dict):
                    drugs_list = [d.lower() for d in meds_current.get('taken', []) + meds_current.get('added', [])]
                elif isinstance(meds_current, list):
                    drugs_list = [d.lower() for d in meds_current]
            except:
                pass
            
            if not drugs_list:
                print(f"⚠️ Пропущена запись ID={analysis.id} (не найдены препараты)")
                continue
            
            # Для каждого взаимодействия подбираем препараты
            for int in interactions:
                warning = int.get('warning', '')
                
                # Ищем подходящую пару препаратов
                for warning_key, (drugs_group1, drugs_group2) in interaction_drugs.items():
                    if warning_key.lower() in warning.lower():
                        # Находим препараты из первой группы
                        matched_drugs1 = [d for d in drugs_group1 if d in drugs_list]
                        # Находим препараты из второй группы
                        matched_drugs2 = [d for d in drugs_group2 if d in drugs_list]
                        
                        if matched_drugs1 and matched_drugs2:
                            int['drugs'] = matched_drugs1
                            int['with_drugs'] = matched_drugs2
                            break
            
            analysis.medications_interactions = json.dumps(interactions, ensure_ascii=False)
            updated_count += 1
            print(f"✅ Обновлена запись ID={analysis.id}: {len(interactions)} взаимодействий")
            for int in interactions:
                print(f"   - {int.get('warning', '')}: {int.get('drugs', [])} + {int.get('with_drugs', [])}")
        
        db.commit()
        print(f"\n🎉 Миграция завершена! Обновлено записей: {updated_count}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка миграции: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_interactions()
