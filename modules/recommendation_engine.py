import json
import os
from typing import List, Dict

class ClinicalDecisionEngine:
    """Модуль формирования врачебных рекомендаций"""
    
    def __init__(self):
        self.db_path = r"E:\MedMind2.0\data\drug_interactions.json"
        self.conflicts = self.load_database()
    
    def load_database(self) -> list:
        """Загружает базу взаимодействий из JSON"""
        try:
            if not os.path.exists(self.db_path):
                print(f"⚠️ Файл не найден: {self.db_path}")
                return []
            
            with open(self.db_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('conflicts', [])
                
        except Exception as e:
            print(f"❌ Ошибка загрузки базы: {str(e)}")
            return []
    
    def generate_recommendation(
        self,
        drugs_found: list[str],
        text: str = ""
    ) -> List[Dict]:
        """
        Формирует список рекомендаций на основе найденных лекарств

        Args:
            drugs_found: Список названий препаратов из текста
            text: Полный текст пациента (для контекста)

        Returns:
            Список клинических рекомендаций
        """
        recommendations = []

        drugs_lower = [d.lower().strip() for d in drugs_found]

        for conflict in self.conflicts:
            matched_drugs_a = [
                d for d in conflict['drugs']
                if d.lower() in drugs_lower or d.lower() in text.lower()
            ]
            
            matched_drugs_b = [
                d for d in conflict.get('with_drugs', [])
                if d.lower() in drugs_lower or d.lower() in text.lower()
            ]

            matches_a = len(matched_drugs_a) > 0
            matches_b = len(matched_drugs_b) > 0

            if matches_a and matches_b:
                rec = {
                    "type": "contraindication",
                    "warning": conflict['warning'],
                    "severity": conflict['severity'].upper(),
                    "action": conflict.get('recommendation', {}).get('action', ''),
                    "alternative_drugs": conflict.get('recommendation', {}).get('alternative', []),
                    "reason": conflict.get('recommendation', {}).get('reason', ''),
                    "monitoring": conflict.get('monitoring', ''),
                    "source": conflict.get('source', ''),
                    "drugs": matched_drugs_a,  
                    "with_drugs": matched_drugs_b  
                }
                recommendations.append(rec)

        return recommendations


decision_engine = ClinicalDecisionEngine()