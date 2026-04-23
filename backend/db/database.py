from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'data', 'medmind.db')}"

os.makedirs(os.path.join(BASE_DIR, 'data'), exist_ok=True)

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ИСТОРИЯ АНАЛИЗОВ ПАЦИЕНТА (DELTA)
class PatientAnalysis(Base):
    __tablename__ = "patient_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True)
    filename = Column(String)
    
    medications_current = Column(Text)  
    diagnoses_current = Column(Text)    
    symptoms_current = Column(Text)     
    
    medications_previous = Column(Text)
    diagnoses_previous = Column(Text)
    symptoms_previous = Column(Text)
    
    medications_delta = Column(Text)          
    medications_interactions = Column(Text)   
    
    diagnosis = Column(String, nullable=True)  
    
    risk_change = Column(String)              
    risk_summary = Column(Text)
    lab_values_json = Column(Text)             
    
    size_bytes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

# ТЕКУЩИЙ АНАЛИЗ
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

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()