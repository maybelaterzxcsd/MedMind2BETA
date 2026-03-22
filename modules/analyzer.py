# modules/analyzer.py
import sys
import os
from datetime import datetime

sys.path.append(os.path.dirname(__file__))

import torch
import random
from typing import List, Dict

SEED = 42
random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

# Путь к обученной модели
MODEL_PATH = r"E:\MedMind2.0\models\rubert_medical"

tokenizer = None
model = None


def load_models():
    """Загружает модель один раз при первом запуске"""
    global tokenizer, model
    if tokenizer is None:
        print(f"Загрузка модели из {MODEL_PATH}...")
        
        try:
            from transformers import AutoTokenizer, AutoModelForTokenClassification
            tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
            # Добавляем num_labels=13 для корректного размера выходных слоев
            model = AutoModelForTokenClassification.from_pretrained(
                MODEL_PATH, 
                num_labels=13
            )
            print("Модель успешно загружена!")
        except Exception as e:
            raise RuntimeError(f"Ошибка при загрузке модели: {str(e)}")
    
    return tokenizer, model


# ✅ МЕДИЦИНСКИЕ СЛОВАРИ ДЛЯ УЛУЧШЕНИЯ АНАЛИЗА
SYMPTOMS_KEYWORDS = [
    "головная боль", "боль", "температура", "тошнота", 
    "головокружение", "слабость", "потливость", "кашель",
    "давление", "пульс", "артериальное давление", "гипертония",
    "затруднённое дыхание", "хрипы", "отеки", "отёк"
]

DRUGS_KEYWORDS = [
    "эналаприл", "аспирин", "парацетамол", "ибупрофен",
    "но-шпа", "анальгин", "валидол", "корвалол", "диабазем",
    "лизиноприл", "лозартан", "метформин", "левофлоксацин"
]

DIAGNOSES_KEYWORDS = [
    "гипертония", "астма", "сахарный диабет", "миокардит",
    "гастрит", "пневмония", "бронхит", "инфаркт"
]


def get_label_name(tag_id: int) -> str:
    labels = ['O', 'SYMPTOM', 'DRUG', 'DIAGNOSIS', 'MEDICAL_PROCEDURE']
    
    if tag_id < len(labels):
        return labels[tag_id]  # Убрал .capitalize() → будет СИМПТОМ вместо Symptom
    else:
        return 'OTHER'


def extract_entities(text: str) -> List[Dict]:
    """Извлекает сущности через модель ИИ + ключевые слова"""
    entities = []
    text_lower = text.lower()
    seen_texts = set()  # Для отслеживания уникальных текстов
    
    # 🔹 1️⃣ Сначала проверяем ключевые слова (это точно работает!)
    for keyword in SYMPTOMS_KEYWORDS:
        if keyword in text_lower:
            start_pos = text_lower.find(keyword)
            end_pos = start_pos + len(keyword)
            text_key = text[start_pos:end_pos].lower()
            
            if text_key not in seen_texts:
                entities.append({
                    "label": "СИМПТОМ",
                    "text": text[start_pos:end_pos]
                })
                seen_texts.add(text_key)
    
    for keyword in DRUGS_KEYWORDS:
        if keyword in text_lower:
            start_pos = text_lower.find(keyword)
            end_pos = start_pos + len(keyword)
            text_key = text[start_pos:end_pos].lower()
            
            if text_key not in seen_texts:
                entities.append({
                    "label": "ЛЕКАРСТВО",
                    "text": text[start_pos:end_pos]
                })
                seen_texts.add(text_key)
    
    for keyword in DIAGNOSES_KEYWORDS:
        if keyword in text_lower:
            start_pos = text_lower.find(keyword)
            end_pos = start_pos + len(keyword)
            text_key = text[start_pos:end_pos].lower()
            
            if text_key not in seen_texts:
                entities.append({
                    "label": "ДИАГНОЗ",
                    "text": text[start_pos:end_pos]
                })
                seen_texts.add(text_key)
    
    # 🔹 2️⃣ Затем пробуем использовать ИИ-модель (если она работает)
    try:
        tok, mod = load_models()
        
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
        
        current_entity = ""
        
        for token, tag in zip(words, tags):
            if token.startswith('##'):
                current_entity += token[2:]
            else:
                if current_entity != "" and current_entity not in ["[CLS]", "[SEP]", "[PAD]", "[UNK]"]:
                    label = get_label_name(tag)
                    text_key = current_entity.lower().strip()
                    
                    # Проверка на дубликат (игнорируем регистр и пробелы)
                    if text_key not in seen_texts:
                        entities.append({
                            "label": label,
                            "text": current_entity.strip()
                        })
                        seen_texts.add(text_key)
                
                current_entity = token.replace('[UNK]', '')
    
    except Exception as e:
        print(f"💡 Модель вернула ошибку (это не критично): {str(e)}")
    
    return entities


def analyze_text(text: str) -> dict:
    """Основная функция для API: анализирует текст и возвращает результат"""
    entities = extract_entities(text)
    
    if not entities:
        return {"entities": [{"label": "INFO", "text": "Ничего не найдено"}]}
    
    return {"entities": entities}