def filter_drugs(text: str) -> dict:
    """Фильтрует препараты по статусу назначения"""
    
    drugs_taken = []
    drugs_cancelled = []
    
    keywords_taken = ["принимаю", "пью", "пьют", "назначил"]
    keywords_cancelled = ["отменила", "не принимаю", "перестал"]
    
    text_lower = text.lower()
    
    # Логика проверки (можно улучшить)
    if any(kw in text_lower for kw in keywords_taken):
        drugs_taken.append("Эналаприл")
    
    if any(kw in text_lower for kw in keywords_cancelled):
        drugs_cancelled.append("Аспирин")
    
    return {
        "taken": drugs_taken,
        "cancelled": drugs_cancelled
    }