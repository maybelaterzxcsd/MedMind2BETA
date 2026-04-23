import sys
import os
import re
import random
import torch
from typing import List, Dict
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

SEED = 42
random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

MODEL_PATH = r"E:\MedMind2.0\models\rubert_medical_v2"

SYSTEM_PROMPT = """
Ты — профессиональный медицинский ИИ-ассистент.
Твоя задача: анализировать текст визита пациента и извлекать структурированные данные.

📋 ИНСТРУКЦИИ:
1. 🔍 **Пациент**: Ищи ФИО после слов "Пациент", "Пациентка".
2. 💊 **Лекарства**: Извлекай названия препаратов (торговые и МНН).
3.  **Симптомы**: Извлекай жалобы и симптомы.
4. 🩺 **Диагнозы**: Извлекай установленные диагнозы.
"""

tokenizer = None
model = None

SYMPTOMS_KEYWORDS = [
    "головная боль", "боль", "температура", "тошнота", "рвота",
    "головокружение", "слабость", "потливость", "кашель",
    "давление", "пульс", "гипертония", "одышка", "отеки",
    "боль в груди", "боль в животе", "диарея", "запор"
]

DRUGS_KEYWORDS = [
    "эналаприл", "аспирин", "парацетамол", "ибупрофен",
    "но-шпа", "анальгин", "валидол", "корвалол",
    "лизиноприл", "лозартан", "метформин", "левофлоксацин",
    "амлодипин", "аторвастатин", "варфарин", "бисопролол", "индапамид"
]

DIAGNOSES_KEYWORDS = [
    "гипертония", "астма", "сахарный диабет", "миокардит",
    "гастрит", "пневмония", "бронхит", "инфаркт", "ишемия"
]


def load_models():
    """Загружает модель один раз при первом запуске"""
    global tokenizer, model
    if tokenizer is None:
        print(f"🔄 Загрузка модели из {MODEL_PATH}...")
        try:
            from transformers import AutoTokenizer, AutoModelForTokenClassification
            tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
            
            model = AutoModelForTokenClassification.from_pretrained(
                MODEL_PATH,
                num_labels=4
            )
            print("✅ Модель успешно загружена!")
        except Exception as e:
            print(f"⚠️ Ошибка при загрузке модели: {str(e)}")
    return tokenizer, model

def get_label_name(tag_id: int) -> str:
    """Преобразует ID тега в читаемое название"""
    labels = ['O', 'SYMPTOM', 'DRUG', 'DIAGNOSIS']
    if tag_id < len(labels):
        return labels[tag_id]
    return 'O'

def extract_patient_fio(text: str) -> dict | None:
    """Отдельная функция для поиска ФИО пациента по паттернам"""
    patterns = [
        r'(?:Пациент(?:ка)?|Больной)\s*:?\s*([А-ЯЁ][а-яё]+(?:-[А-ЯЁ][а-яё]+)?\s+[А-ЯЁ]\.?\s*[А-ЯЁ]\.?)',
        r'(?:Пациент(?:ка)?|Больной)\s*:?\s*([А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+)',
        r'([А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.\s*[А-ЯЁ]\.)\s*,\s*\d{4}\s*г\.\s*р\.?',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            name = match.group(1).strip()
            name = re.sub(r'[,\(\)]', '', name).strip()
            return {
                "label": "PATIENT_NAME",
                "text": name
            }
    return None


def extract_entities(text: str) -> List[Dict]:
    """Извлекает сущности через Словари + Модель ИИ (с отладкой)"""
    entities = []
    text_lower = text.lower()
    seen_texts = set()

    def add_entity(label, text_span):
        text_key = text_span.lower().strip()
        if len(text_key) > 2 and text_key not in seen_texts:
            entities.append({"label": label, "text": text_span})
            seen_texts.add(text_key)
            print(f"   📦 [SLOVAR] Добавлено: {label} = '{text_span}'")  

    print("🔍 Поиск по словарям...")
    for keyword in DRUGS_KEYWORDS:
        if keyword in text_lower:
            idx = text_lower.find(keyword)
            add_entity("DRUG", text[idx:idx+len(keyword)])

    for keyword in SYMPTOMS_KEYWORDS:
        if keyword in text_lower:
            idx = text_lower.find(keyword)
            add_entity("SYMPTOM", text[idx:idx+len(keyword)])

    tok, mod = load_models()
    if tok and mod:
        print(f"🤖 Запуск модели... Текст: {text[:100]}")
        try:
            inputs = tok(
                text,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512
            )
            with torch.no_grad():
                outputs = mod(**inputs)
                predictions = outputs.logits.argmax(dim=-1)
            
            words = tok.convert_ids_to_tokens(inputs['input_ids'][0].cpu().numpy())
            tags = predictions[0].cpu().numpy()
            
            print(f"   🔬 Токенов: {len(words)}, Тегов: {len(tags)}")
            
            for i in range(min(20, len(words))):
                token = words[i]
                tag_id = int(tags[i])
                label = get_label_name(tag_id)
                if token not in ["[CLS]", "[SEP]", "[PAD]", "[UNK]"]:
                    print(f"   [{i}] Токен: '{token}' | ID: {tag_id} | Метка: '{label}'")
            
            current_entity = ""
            current_tag_id = -1
            
            for i, token in enumerate(words):
                tag_id = int(tags[i])  
                label = get_label_name(tag_id)
                
                if token in ["[CLS]", "[SEP]", "[PAD]", "[UNK]"]:
                    continue
                
                if token.startswith('##'):
                    current_entity += token[2:]
                else:
                    if current_entity:
                        prev_label = get_label_name(current_tag_id)
                        if prev_label != 'O':
                            add_entity(prev_label, current_entity.strip())
                            print(f"   ✅ [MODEL] Сохранено: {prev_label} = '{current_entity.strip()}'")
                    
                    current_entity = token
                    current_tag_id = tag_id
            
            if current_entity:
                last_label = get_label_name(current_tag_id)
                if last_label != 'O':
                    add_entity(last_label, current_entity.strip())

        except Exception as e:
            print(f"⚠️ Ошибка работы модели: {str(e)}")
            import traceback
            traceback.print_exc()

    print(f"🏁 Итоговый список сущностей: {entities}")
    return entities


def analyze_text(text: str) -> dict:
    """
    Главная функция, которую вызывает main.py
    """
    print(f"🔍 Анализ текста: {text[:50]}...")
    
    patient_fio = extract_patient_fio(text)
    
    entities = extract_entities(text)
    
    if patient_fio:
        entities.insert(0, patient_fio)
        print(f"✅ Пациент распознан: {patient_fio['text']}")
    else:
        print("⚠️ ФИО пациента не найдено")
    
    if not entities:
        return {"entities": [{"label": "INFO", "text": "Ничего не найдено"}]}
    
    return {"entities": entities}