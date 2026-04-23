import os

def find_drugs_in_text(text: str):
    """Извлекает названия лекарств из текста (простой поиск)"""
    drugs_found = set()
    patterns = [
        "эналаприл", "энап", "ренитек", "спиронолактон", "амилорид", "триамтерен",
        "аспирин", "кардиомагнил", "варфарин", "клопидогрел",
        "метформин", "глюкофаж", "сиофор", "парацетамол", "ибупрофен", 
        "найз", "нимесулид", "нурофен", "дибазем", "лизиноприл", "лозартан"
    ]
    
    text_lower = text.lower()
    for drug in patterns:
        if drug in text_lower:
            drugs_found.add(drug)
    return list(drugs_found)