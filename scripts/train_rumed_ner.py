# scripts/train_rumed_ner.py
import os
import numpy as np
from datasets import load_dataset
from transformers import (
    AutoTokenizer, 
    AutoModelForTokenClassification, 
    TrainingArguments, 
    Trainer,
    DataCollatorForTokenClassification
)
from seqeval.metrics import f1_score

# 📍 Пути
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "rumed_ner")
OUTPUT_DIR = os.path.join(BASE_DIR, "models", "rubert_medical_v2")
BASE_MODEL_NAME = os.path.join(BASE_DIR, "models", "rubert_base")

# 🏷️ Маппинг тегов
TAG_MAPPING = {
    "B-Drug": "DRUG", "I-Drug": "DRUG",
    "B-Symptom": "SYMPTOM", "I-Symptom": "SYMPTOM",
    "B-Disease": "DIAGNOSIS", "I-Disease": "DIAGNOSIS",
    "O": "O"
}

LABELS = ["O", "SYMPTOM", "DRUG", "DIAGNOSIS"]
id2label = {str(i): label for i, label in enumerate(LABELS)}
label2id = {label: str(i) for i, label in enumerate(LABELS)}

def align_labels_with_tokens(labels, word_ids):
    """Преобразует теги для каждого токена (работает со строковыми тегами)"""
    new_labels = []
    current_word = None
    
    for word_id in word_ids:
        if word_id is None:
            new_labels.append(-100)  # Special/Padding tokens
        elif word_id != current_word:
            current_word = word_id
            tag = labels[word_id]
            mapped_tag = TAG_MAPPING.get(tag, "O")
            new_labels.append(LABELS.index(mapped_tag))
        else:
            tag = labels[word_id]
            mapped_tag = TAG_MAPPING.get(tag, "O")
            new_labels.append(LABELS.index(mapped_tag))
    
    return new_labels

def preprocess_function(examples):
    """Токенизация и подготовка лейблов"""
    tokenized_inputs = tokenizer(
        examples["tokens"],
        truncation=True,
        padding=True,          # 🔥 ИСПРАВЛЕНИЕ 1: Включаем паддинг
        is_split_into_words=True,
        max_length=512
    )
    
    all_labels = examples["ner_tags"]
    new_labels = []
    
    for i, labels in enumerate(all_labels):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        new_labels.append(align_labels_with_tokens(labels, word_ids))
    
    tokenized_inputs["labels"] = new_labels
    return tokenized_inputs

# 1. Загрузка датасета
print("📂 Загрузка датасета...")
dataset = load_dataset("json", data_files={
    "train": os.path.join(DATA_DIR, "train_v1.jsonl"),
    "validation": os.path.join(DATA_DIR, "dev_v1.jsonl"),
    "test": os.path.join(DATA_DIR, "test_v1.jsonl")
})

# 2. Токенизация
print("🔤 Токенизация...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME)
tokenized_datasets = dataset.map(preprocess_function, batched=True, remove_columns=dataset["train"].column_names)

# 3. Модель
print("🤖 Загрузка модели...")
model = AutoModelForTokenClassification.from_pretrained(
    BASE_MODEL_NAME,
    num_labels=len(LABELS),
    id2label=id2label,
    label2id=label2id,
    ignore_mismatched_sizes=True
)

# 4. Метрика
def compute_metrics(eval_pred):
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=2)
    
    true_labels = [[LABELS[l] for l in label if l != -100] for label in labels]
    true_predictions = [[LABELS[p] for p, l in zip(prediction, label) if l != -100] for prediction, label in zip(predictions, labels)]
    
    return {"f1": f1_score(true_labels, true_predictions)}

# 5. Обучение
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    eval_strategy="epoch",
    save_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    weight_decay=0.01,
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    save_total_limit=1,
)

# 🔥 ИСПРАВЛЕНИЕ 2: Явный коллатор для NER
data_collator = DataCollatorForTokenClassification(tokenizer=tokenizer)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],
    processing_class=tokenizer,
    compute_metrics=compute_metrics,
    data_collator=data_collator,
)

print("🚀 Начинаем обучение...")
trainer.train()

# 6. Сохранение
print("💾 Сохраняем лучшую модель в rubert_medical_v2...")
trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print("✅ Готово! Модель сохранена в models/rubert_medical_v2")