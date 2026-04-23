import logging
from datetime import datetime
import os
from typing import Optional

LOGS_DIR = os.path.join(os.path.dirname(__file__), '..', 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOGS_DIR, 'system.log')

class MedMindLogger:
    """Централизованная система логирования для MedMind2.0"""
    
    def __init__(self):
        self.logger = logging.getLogger('medmind')
        
        if not self.logger.handlers:
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            
            file_handler = logging.FileHandler(LOG_FILE, encoding='utf-8')
            file_handler.setFormatter(formatter)
            
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            
            self.logger.addHandler(file_handler)
            self.logger.addHandler(console_handler)
            
            self.logger.setLevel(logging.INFO)
    
    def info(self, message: str):
        """Информационное сообщение"""
        self.logger.info(message)
    
    def warning(self, message: str):
        """Предупреждение"""
        self.logger.warning(message)
    
    def error(self, message: str):
        """Ошибка"""
        self.logger.error(message)
    
    def success(self, message: str):
        """Успешное действие"""
        self.logger.info(f"✅ {message}")


logger = MedMindLogger()