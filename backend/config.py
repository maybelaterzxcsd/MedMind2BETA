# config.py
import os

# Путь к папке с обученными моделями
MODELS_PATH = os.path.join(os.path.dirname(__file__), '..', 'models')

# Путь к файлу тестовых данных
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'test_patients.db')

# Seed для воспроизводимости результатов
SEED = 42