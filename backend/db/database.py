# E:\MedMind2.0\backend\db\database.py
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Создание пути к базе данных (в папке проекта)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'data', 'medmind.db')}"

# Создаём папку data, если её нет
os.makedirs(os.path.join(BASE_DIR, 'data'), exist_ok=True)

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class PatientReport(Base):
    __tablename__ = "patient_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    content_hash = Column(String(64))
    raw_text = Column(Text, nullable=False)
    entities_json = Column(Text, nullable=False)
    drugs_taken = Column(String(500), default="")
    drugs_cancelled = Column(String(500), default="")
    analysis_status = Column(String(20), default="success")
    created_at = Column(DateTime, default=datetime.utcnow)

# Создание таблиц при запуске
def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()