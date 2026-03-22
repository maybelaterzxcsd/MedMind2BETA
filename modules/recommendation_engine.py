# backend/modules/recommendation_engine.py
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
        
        # Конвертируем названия в нижний регистр для сравнения
        drugs_lower = [d.lower().strip() for d in drugs_found]
        
        # Проверяем все пары с базой знаний
        for conflict in self.conflicts:
            matches_a = any(
                d.lower() in drugs_lower or 
                d.lower() in text.lower()
                for d in conflict['drugs']
            )
            
            matches_b = any(
                d.lower() in drugs_lower or 
                d.lower() in text.lower()
                for d in conflict.get('with_drugs', [])
            )
            
            if matches_a and matches_b:
                # Формируем рекомендации
                rec = {
                    "type": "contraindication",
                    "warning": conflict['warning'],
                    "severity": conflict['severity'].upper(),
                    "action": conflict.get('recommendation', {}).get('action', ''),
                    "alternative_drugs": conflict.get('recommendation', {}).get('alternative', []),
                    "reason": conflict.get('recommendation', {}).get('reason', ''),
                    "monitoring": conflict.get('monitoring', ''),
                    "source": conflict.get('source', '')
                }
                recommendations.append(rec)
        
        return recommendations


# Глобальный инстанс для повторного использования
decision_engine = ClinicalDecisionEngine()