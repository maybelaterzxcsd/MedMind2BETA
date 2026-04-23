from typing import Dict, Optional
from datetime import datetime

def calculate_delta_analysis(
    current_data: Dict, 
    previous_data: Optional[Dict]
) -> Dict:
    """Рассчитывает изменения между текущим и предыдущим состоянием"""
    
    if not previous_data:
        return {
            "has_history": False,
            "summary": "Первый анализ пациента",
            "risk_change": "none",
            "medications_delta": [],
            "recommendations": []
        }
    
    deltas = {
        "has_history": True,
        "timestamp": datetime.now().isoformat(),
        "medications_delta": [],
        "risk_change": "neutral",
        "risk_summary": "",
        "recommendations": []
    }
    
    current_taken = set([str(x).lower() for x in current_data.get("taken", [])])
    current_cancelled = set([str(x).lower() for x in current_data.get("cancelled", [])])
    
    prev_taken = set([str(x).lower() for x in previous_data.get("taken", [])])
    prev_cancelled = set([str(x).lower() for x in previous_data.get("cancelled", [])])
    
    removed = list(prev_taken - current_taken) + list(current_cancelled)
    removed = list(set(removed)) 
    
    added = list(current_taken - prev_taken)
    
    if removed:
        deltas["medications_delta"].append({
            "type": "removed",
            "drugs": removed,
            "action": "✅ Препараты отменены"
        })
    
    if added:
        deltas["medications_delta"].append({
            "type": "added",
            "drugs": added,
            "action": "⚠️ Требует проверки на совместимость"
        })
    
    current_risks = len(current_data.get("interactions", []))
    prev_risks = len(previous_data.get("interactions", []))
    
    risk_diff = current_risks - prev_risks
    
    if risk_diff > 0:
        deltas["risk_change"] = "increased"
        deltas["risk_summary"] = f"⚠️ Уровень клинических рисков повышен (+{risk_diff} новых взаимодействий)"
        deltas["recommendations"].append("Рекомендуется пересмотреть схему лечения")
    elif risk_diff < 0:
        deltas["risk_change"] = "decreased"
        deltas["risk_summary"] = f"✅ Уровень клинических рисков снижен ({abs(risk_diff)} взаимодействий устранено)"
    else:
        deltas["risk_change"] = "stable"
        deltas["risk_summary"] = "🔹 Уровень клинических рисков остаётся стабильным"
    
    if added:
        deltas["recommendations"].append(f"Проверить дозировки: {', '.join(added)}")
    
    if removed:
        deltas["recommendations"].append(f"Убедиться в безопасности отмены: {', '.join(removed)}")
    
    return deltas