# E:\MedMind2.0\scripts\load_dataset.py
from datasets import load_dataset
import os
import json

DATASET_NAME = "Rexhaif/ru-med-ner"

print("📥 Загрузка датасета с HuggingFace...")
ds = load_dataset(DATASET_NAME, trust_remote_code=True)

# Сохраняем train часть
output_path = "data/raw_datasets/med_ner.jsonl"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, 'w', encoding='utf-8') as f:
    for item in ds['train']:
        row = {
            "tokens": item['tokens'],
            "ner_tags": item['ner_tags']
        }
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

print(f"✅ Датасет сохранён в: {output_path}")
print(f"📊 Всего примеров: {len(ds['train'])}")