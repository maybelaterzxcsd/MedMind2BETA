from abc import ABC, abstractmethod
import sqlite3

class PatientDatabase(ABC):
    @abstractmethod
    def get_patient_history(self, patient_id: str) -> list:
        pass
    
    @abstractmethod
    def save_visit_record(self, record: dict) -> bool:
        pass

class LocalSQLiteDB(PatientDatabase):
    """Локальная база для демонстрации (3 тестовых пациента)"""
    
    def __init__(self, db_path=None):
        self.db_path = db_path or "data/test_patients.db"
        
    def get_patient_history(self, patient_id: str) -> list:
        return [
            {"date": "2026-02-27", "text": "Жалобы на головную боль..."},
            {"date": "2026-03-01", "text": "Повторный осмотр..."}
        ]
    
    def save_visit_record(self, record: dict) -> bool:
        return True