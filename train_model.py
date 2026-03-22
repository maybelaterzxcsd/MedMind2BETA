# E:\MedMind2.0\train_model.py
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForTokenClassification, TrainingArguments, Trainer, DataCollatorForTokenClassification
import os

MODEL_NAME = "DeepPavlov/rubert-base-cased"
OUTPUT_DIR = r"E:\MedMind2.0\models\rubert_medical"
DATASET_NAME = "Rexhaif/ru-med-ner"

print("🏗 Подготовка...")
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("📥 Загрузка датасета...")
ds = load_dataset(DATASET_NAME)
print(f"✅ Примеров: {len(ds['train'])}")

# 🔑 ГЛАВНОЕ — НАХОДИМ МАКСИМАЛЬНУЮ МЕТКУ АВТОМАТИЧЕСКИ!
print("⚙️ Поиск максимальной метки в датасете...")
max_label = 0
for item in ds['train']:
    tags = item['ner_tags']
    if len(tags) > 0 and max(tags) > max_label:
        max_label = max(tags)

num_labels = max_label + 1  # Если макс метка 10, то num_labels = 11
print(f"🔢 Максимальная метка: {max_label} → Классов: {num_labels}")

print("⚙️ Токенизация...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

def preprocess_function(examples):
    results = tokenizer(
        examples["tokens"],
        is_split_into_words=True,
        truncation=True,
        padding="max_length",
        max_length=512
    )
    
    labels_list = []
    for i, tags in enumerate(examples["ner_tags"]):
        min_len = min(len(results["input_ids"][i]), len(tags))
        padded = [0] * len(results["input_ids"][i])
        padded[:min_len] = list(tags[:min_len])
        labels_list.append(padded)
    
    results["labels"] = labels_list
    return results

tokenized_datasets = ds.map(
    preprocess_function, 
    batched=True, 
    remove_columns=["tokens", "ner_tags", "idx"]
)

print(f"🧠 Оставшиеся колонки: {list(tokenized_datasets['train'].column_names)}")

print("🎯 Запуск модели...")
model = AutoModelForTokenClassification.from_pretrained(
    MODEL_NAME, 
    num_labels=num_labels  # ← ВОТ ЭТА ПЕРЕМЕННАЯ!
)

training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    eval_strategy="no",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    num_train_epochs=3,
    save_strategy="epoch",
    logging_first_step=True,
    fp16=False,
    report_to="none",
)

data_collator = DataCollatorForTokenClassification(tokenizer)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    data_collator=data_collator,
)

print("🚀 ЗАПУСК ОБУЧЕНИЯ!")
try:
    trainer.train()
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print("✅ Модель сохранена в ./models/rubert_medical")
except Exception as e:
    print(f"❌ Ошибка: {e}")
    import traceback
    traceback.print_exc()