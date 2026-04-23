import hashlib
import io
import json
import os
import re
import sys
import tempfile
from datetime import datetime, timedelta
from urllib.parse import quote

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from utils.logger import logger

PROJECT_ROOT = r"E:\MedMind2.0"
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

modules_path = os.path.join(PROJECT_ROOT, 'modules')
if modules_path not in sys.path:
    sys.path.insert(0, modules_path)

DATA_DIR = os.path.join(PROJECT_ROOT, 'backend', 'data', 'temp_reports')
os.makedirs(DATA_DIR, exist_ok=True)
sys.path.insert(0, os.path.dirname(__file__))

from db.database import PatientAnalysis, PatientReport, SessionLocal, create_tables
from modules.analyzer import analyze_text
from modules.delta_analysis import calculate_delta_analysis
from modules.drug_status_classifier import extract_drugs_with_status
from modules.html_report_generator import generate_html_report
from modules.patient_extractor import extract_patient_name
from modules.recommendation_engine import decision_engine
from modules.rules_engine import filter_drugs
from modules.pdf_report_generator import generate_pdf_report
from backend.auth import (
    FAKE_USERS_DB,
    Token,
    TokenData,
    create_access_token,
    get_current_active_user,
)

app = FastAPI(
    title="MedMind2.0",
    description="Система поддержки врачебных решений на базе ИИ",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    create_tables()
    print("✅ Таблицы базы данных созданы!")
except Exception as e:
    print(f"⚠️ Ошибка инициализации БД: {e}")

def extract_lab_values(text):
    lab_values = {}
    patterns = [
        # Электролиты
        (r'([Кк]алий)\s*(?:\(|\s*:?)\s*([\d.]+)\s*ммоль/л', 'Калий', '3.5-5.0', 'ммоль/л'),
        (r'([Нн]атрий)\s*(?:\(|\s*:?)\s*([\d.]+)\s*ммоль/л', 'Натрий', '135-145', 'ммоль/л'),
        (r'([Хх]лор)\s*(?:\(|\s*:?)\s*([\d.]+)\s*ммоль/л', 'Хлор', '98-107', 'ммоль/л'),
        (r'([Кк]альций)\s*(?:\(|\s*:?)\s*([\d.]+)\s*ммоль/л', 'Кальций', '2.1-2.6', 'ммоль/л'),
        # Почечные маркеры
        (r'([Кк]реатинин)\s*[:\s]*([\d.]+)\s*мкмоль/л', 'Креатинин', '62-106', 'мкмоль/л'),
        (r'([Мм]очевина)\s*[:\s]*([\d.]+)\s*ммоль/л', 'Мочевина', '2.5-8.3', 'ммоль/л'),
        (r'([Мм]очевая\s*[Кк]ислота)\s*[:\s]*([\d.]+)\s*мкмоль/л', 'Мочевая кислота', '210-420', 'мкмоль/л'),
        # Липидный профиль
        (r'([Хх]олестерин\s*общий)\s*[:\s]*([\d.]+)\s*ммоль/л', 'Холестерин общий', '<5.2', 'ммоль/л'),
        (r'([Лл]ПНП)\s*[:\s]*([\d.]+)\s*ммоль/л', 'ЛПНП', '<3.0', 'ммоль/л'),
        (r'([Лл]ПВП)\s*[:\s]*([\d.]+)\s*ммоль/л', 'ЛПВП', '>1.0', 'ммоль/л'),
        (r'([Тт]риглицериды)\s*[:\s]*([\d.]+)\s*ммоль/л', 'Триглицериды', '<1.7', 'ммоль/л'),
        # Углеводный обмен
        (r'([Гг]люкоза)\s*[:\s]*([\d.]+)\s*ммоль/л', 'Глюкоза', '3.9-5.5', 'ммоль/л'),
        (r'([Гг]ликированный\s*[Гг]емоглобин|HbA1c)\s*[:\s]*([\d.]+)\s*%', 'HbA1c', '<5.7', '%'),
        # Свертывающая система
        (r'([Мм]НО)\s*[:\s]*([\d.]+)', 'МНО', '0.8-1.2', ''),
        (r'([Пп]ротромбин)\s*[:\s]*([\d.]+)\s*%', 'Протромбин', '70-120', '%'),
        (r'([Фф]ибриноген)\s*[:\s]*([\d.]+)\s*г/л', 'Фибриноген', '2.0-4.0', 'г/л'),
        # Общий анализ крови
        (r'([Гг]емоглобин)\s*[:\s]*([\d.]+)\s*г/л', 'Гемоглобин', '120-160', 'г/л'),
        (r'([Ээ]ритроциты)\s*[:\s]*([\d.]+)\s*10\^12/л', 'Эритроциты', '4.0-5.5', '10^12/л'),
        (r'([Лл]ейкоциты)\s*[:\s]*([\d.]+)\s*10\^9/л', 'Лейкоциты', '4.0-9.0', '10^9/л'),
        (r'([Тт]ромбоциты)\s*[:\s]*([\d.]+)\s*10\^9/л', 'Тромбоциты', '180-320', '10^9/л'),
        (r'([Гг]ематокрит)\s*[:\s]*([\d.]+)\s*%', 'Гематокрит', '35-45', '%'),
        # Печёночные пробы
        (r'([Аа]ЛТ|Аланинаминотрансфераза)\s*[:\s]*([\d.]+)\s*Ед/л', 'АЛТ', '<35', 'Ед/л'),
        (r'([Аа]СТ|Аспартатаминотрансфераза)\s*[:\s]*([\d.]+)\s*Ед/л', 'АСТ', '<35', 'Ед/л'),
        (r'([Бб]илирубин\s*общий)\s*[:\s]*([\d.]+)\s*мкмоль/л', 'Билирубин общий', '3.4-20.5', 'мкмоль/л'),
        (r'([Бб]илирубин\s*прямой)\s*[:\s]*([\d.]+)\s*мкмоль/л', 'Билирубин прямой', '<5.1', 'мкмоль/л'),
        (r'([Щщ]елочная\s*[Фф]осфатаза)\s*[:\s]*([\d.]+)\s*Ед/л', 'Щелочная фосфатаза', '30-120', 'Ед/л'),
        # Маркеры воспаления
        (r'([Сс]-?[Рр]еактивный\s*[Бб]елок|СРБ)\s*[:\s]*([\d.]+)\s*мг/л', 'СРБ', '<5.0', 'мг/л'),
        (r'([Сс]корость\s*оседания\s*[Ээ]ритроцитов|СОЭ)\s*[:\s]*([\d.]+)\s*мм/ч', 'СОЭ', '2-15', 'мм/ч'),
        # Гормоны
        (r'([Тт]ТГ|Тиреотропный\s*гормон)\s*[:\s]*([\d.]+)\s*мЕд/л', 'ТТГ', '0.4-4.0', 'мЕд/л'),
        (r'([Тт]4\s*свободный)\s*[:\s]*([\d.]+)\s*пмоль/л', 'Т4 свободный', '9-19', 'пмоль/л'),
    ]
    for pattern, name, norm, unit in patterns:
        match = re.search(pattern, text)
        if match:
            lab_values[name] = {
                'value': match.group(2).strip(),
                'unit': unit,
                'norm': norm
            }
    print(f"🧪 Найдено лабораторных значений: {len(lab_values)}")
    return lab_values

@app.get("/api/warmup")
async def warmup():
    """Прогрев сервера — инициализация БД и модулей"""
    try:
        db = SessionLocal()
        db.query(PatientAnalysis).first()
        db.close()
        return {"status": "warmed_up", "message": "Сервер готов к работе"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
async def root():
    return {
        "status": "success",
        "project": "MedMind2.0",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Вход врача в систему"""
    user = FAKE_USERS_DB.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]}
    )
    refresh_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=timedelta(days=30)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 86400,
        "refresh_token": refresh_token
    }

@app.post("/analyze")
async def analyze_report(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_active_user)
):
    try:
        content = await file.read()
        text = content.decode('utf-8')
        if not text.strip():
            raise HTTPException(status_code=400, detail="Файл пустой!")
        
        result = analyze_text(text)
        print(f"📤 ОТ main.py: entities = {result.get('entities', [])}")

        label_map = {
            'PATIENT_NAME': 'ПАЦИЕНТ',
            'DRUG': 'ЛЕКАРСТВО',
            'SYMPTOM': 'СИМПТОМ',
            'DIAGNOSIS': 'ДИАГНОЗ',
            'PROCEDURE': 'ПРОЦЕДУРА',
            'DOSAGE': 'ДОЗА',
            'LAB_TEST': 'АНАЛИЗ',
            'LAB_VALUE': 'ЗНАЧЕНИЕ'
        }
        
        normalized_entities = []
        for entity in result.get("entities", []):
            label = entity.get("label", "")
            if label in label_map:
                entity["label"] = label_map[label]
            normalized_entities.append(entity)
        
        result["entities"] = normalized_entities

        skip_words = {
            "ЖАЛОБЫ", "СИМПТОМЫ", "АНАМНЕЗ", "ДИАГНОЗ",
            "ОБЪЕКТИВНЫЙ СТАТУС", "СТАТУС", "ЛЕЧЕНИЕ",
            "РЕКОМЕНДАЦИИ", "ЗАКЛЮЧЕНИЕ", "ЖАЛОБЫ И СИМПТОМЫ",
            "ЖАЛОБАМИ", "ЖАЛУЕТСЯ", "ОТМЕЧАЕТ", "ОТМЕЧАЕТСЯ", "БОЛИТ"
        }
        result["entities"] = [
            entity for entity in result.get("entities", [])
            if entity.get("text", "").strip().upper() not in skip_words
        ]

        patient_name = extract_patient_name(result.get("entities", []), text)
        
        print(f"\n🔍 [ПЕРЕД CLASSIFIER]")
        print(f"   result.get('entities') = {result.get('entities')}")
        print(f"   Тип: {type(result.get('entities'))}")
        print(f"   Количество: {len(result.get('entities', []))}\n")

        drugs_with_status = extract_drugs_with_status(result.get("entities", []), text)
        drugs_list = drugs_with_status["taken"] + drugs_with_status["added"]
        
        print(f"💊 Принимает: {drugs_with_status['taken']}")
        print(f"❌ Отменено: {drugs_with_status['cancelled']}")
        print(f"➕ Добавлено: {drugs_with_status['added']}")

        clinical_advice = []
        try:
            clinical_advice = decision_engine.generate_recommendation(drugs_list, text)
        except Exception as e:
            print(f"⚠️ Ошибка рекомендаций: {str(e)}")

        drug_status = {
            "taken": drugs_list,
            "interactions": clinical_advice
        }

        if patient_name:
            patient_id = patient_name.strip().upper()
            if patient_id.startswith("ПАЦИЕНТ "):
                patient_id = patient_id[9:].strip()
            print(f"✅ Пациент распознан: {patient_id}")
        else:
            patient_id = file.filename.split("_")[0] if "_" in file.filename else file.filename
            print(f"⚠️ ФИО не найдено, используем: {patient_id}")

        delta_result = None
        try:
            current_data = {
                "taken": drugs_with_status["taken"] + drugs_with_status["added"],
                "cancelled": drugs_with_status["cancelled"],
                "interactions": [i.get("warning", "") for i in clinical_advice]
            }
            db_old = SessionLocal()
            previous_analysis = db_old.query(PatientAnalysis).filter(
                PatientAnalysis.patient_id == patient_id.strip().upper()
            ).order_by(PatientAnalysis.created_at.desc()).first()
            
            if previous_analysis:
                print(f"✅ Найдена история! ID в БД: [{previous_analysis.patient_id}]")
            else:
                print(f"❌ История не найдена в БД")
                
            previous_data = None
            if previous_analysis:
                previous_data = json.loads(previous_analysis.medications_current) if previous_analysis.medications_current else {}
            
            delta_result = calculate_delta_analysis(current_data, previous_data)
            
            new_record = PatientAnalysis(
                patient_id=patient_id,
                filename=file.filename,
                diagnosis="",
                medications_current=json.dumps(drugs_with_status),
                diagnoses_current=json.dumps(result["entities"]),
                symptoms_current=json.dumps(result["entities"]),
                medications_previous=json.dumps(previous_data) if previous_data else json.dumps({}),
                diagnoses_previous=json.dumps(previous_data.get("diagnoses", [])) if previous_data else json.dumps([]),
                symptoms_previous=json.dumps(previous_data.get("symptoms", [])) if previous_data else json.dumps([]),
                medications_delta=json.dumps(delta_result.get("medications_delta", [])),
                medications_interactions=json.dumps(clinical_advice),
                risk_change=delta_result.get("risk_change", "neutral"),
                risk_summary=delta_result.get("risk_summary", ""),
                lab_values_json=json.dumps(extract_lab_values(text)),
                size_bytes=len(content),
                created_at=datetime.utcnow()
            )
            db_old.add(new_record)
            db_old.commit()
            db_old.close()
        except Exception as e:
            print(f"⚠️ Ошибка Delta-анализа: {str(e)}")
            delta_result = {"error": str(e), "note": "Delta-анализ временно недоступен"}

        html_generated = False
        temp_html_path = None
        try:
            report_content = generate_html_report(result["entities"])
            html_filename = f"medmind_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            file_path = os.path.join(DATA_DIR, html_filename)
            with open(file_path, 'w', encoding='utf-8') as f:
                content_to_write = report_content.decode('utf-8') if isinstance(report_content, bytes) else report_content
                f.write(content_to_write)
            temp_html_path = file_path
            html_generated = True
        except ImportError:
            print("⚠️ Формат HTML временно недоступен")
        except Exception as e:
            print(f"⚠️ Ошибка HTML: {str(e)}")

        try:
            db = SessionLocal()
            content_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
            entities_str = json.dumps(result["entities"], ensure_ascii=False)
            drugs_taken = ', '.join(drug_status.get('taken', []))
            drugs_cancelled = ', '.join(drug_status.get('cancelled', []))
            report = PatientReport(
                filename=file.filename,
                content_hash=content_hash,
                raw_text=text[:2000],
                entities_json=entities_str,
                drugs_taken=drugs_taken,
                drugs_cancelled=drugs_cancelled,
                analysis_status="success"
            )
            db.add(report)
            db.commit()
            db.close()
            print("✅ Отчёт успешно сохранён в базу данных!")
        except Exception as e:
            print(f"⚠️ Не удалось сохранить в БД: {str(e)}")

        response = {
            "status": "success",
            "filename": file.filename,
            "patient_name": patient_name,
            "size_bytes": len(content),
            "entities": result["entities"],
            "drugs": drug_status,
            "lab_values": extract_lab_values(text),
            "risk_change": delta_result.get("risk_change", "none") if delta_result else "none",
            "message": "Анализ завершён успешно!",
            "html_available": html_generated
        }
        if delta_result:
            response["delta_analysis"] = delta_result
        if html_generated and temp_html_path:
            response["html_url"] = f"/reports/{os.path.basename(temp_html_path)}"

        logger.success(f"Анализ завершён успешно | Файл: {file.filename} | Пациент: {patient_id}")
        if drugs_list:
            logger.info(f"Лекарства найдены: {', '.join(drugs_list)}")
        if drug_status.get('interactions'):
            logger.warning(f"Обнаружено взаимодействий: {len(drug_status['interactions'])}")

        return response

    except Exception as e:
        print(f"💥 Ошибка в /analyze: {str(e)}")
        return {"error": str(e), "status": "failed"}

@app.get("/api/patients")
async def get_patient_history(current_user: TokenData = Depends(get_current_active_user)):
    try:
        db = SessionLocal()
        analyses = db.query(PatientAnalysis).order_by(
            PatientAnalysis.created_at.desc()
        ).all()
        result = []
        for analysis in analyses:
            patient_name = analysis.patient_id if hasattr(analysis, 'patient_id') and analysis.patient_id else analysis.filename.replace(".txt", "").upper()
            result.append({
                "id": analysis.id,
                "filename": analysis.filename,
                "patient_name": patient_name,
                "created_at": analysis.created_at.isoformat(),
                "size_bytes": analysis.size_bytes,
                "has_interactions": bool(analysis.medications_interactions),
                "risk_change": analysis.risk_change,
                "diagnosis": analysis.diagnosis or "",
                "diagnoses_current": analysis.diagnoses_current,
            })
        db.close()
        return {"status": "success", "patients": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения истории: {str(e)}")

@app.get("/api/patients/by-name/{patient_name}")
async def get_patient_all_visits(
    patient_name: str,
    current_user: TokenData = Depends(get_current_active_user)
):
    try:
        db = SessionLocal()
        analyses = db.query(PatientAnalysis).filter(
            PatientAnalysis.patient_id == patient_name.strip().upper()
        ).order_by(PatientAnalysis.created_at.desc()).all()
        
        if not analyses:
            db.close()
            raise HTTPException(status_code=404, detail="Пациент не найден")

        def safe_load_json(field):
            try:
                return json.loads(field) if field else {}
            except:
                return {}

        visits = []
        for analysis in analyses:
            visits.append({
                "id": analysis.id,
                "filename": analysis.filename,
                "created_at": analysis.created_at.isoformat(),
                "size_bytes": analysis.size_bytes,
                "diagnoses_current": safe_load_json(analysis.diagnoses_current),
                "medications_current": safe_load_json(analysis.medications_current),
                "medications_delta": safe_load_json(analysis.medications_delta),
                "medications_interactions": safe_load_json(analysis.medications_interactions),
                "risk_change": analysis.risk_change,
                "risk_summary": analysis.risk_summary,
            })
        db.close()
        return {
            "status": "success",
            "patient_name": patient_name,
            "total_visits": len(visits),
            "visits": visits
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения визитов: {str(e)}")

@app.get("/api/patients/{patient_id}")
async def get_patient_details(
    patient_id: int,
    current_user: TokenData = Depends(get_current_active_user)
):
    try:
        db = SessionLocal()
        analysis = db.query(PatientAnalysis).filter(
            PatientAnalysis.id == patient_id
        ).first()
        
        if not analysis:
            db.close()
            raise HTTPException(status_code=404, detail="Пациент не найден")

        def safe_load_json(field):
            try:
                return json.loads(field) if field else {}
            except:
                return {}

        result = {
            "id": analysis.id,
            "patient_name": analysis.patient_id,
            "filename": analysis.filename,
            "created_at": analysis.created_at.isoformat(),
            "size_bytes": analysis.size_bytes,
            "diagnosis": analysis.diagnosis or "",
            "diagnoses_current": safe_load_json(analysis.diagnoses_current),
            "medications_current": safe_load_json(analysis.medications_current),
            "medications_delta": safe_load_json(analysis.medications_delta),
            "medications_interactions": safe_load_json(analysis.medications_interactions),
            "risk_change": analysis.risk_change,
            "risk_summary": analysis.risk_summary,
            "lab_values": safe_load_json(analysis.lab_values_json),
        }
        db.close()
        return {"status": "success", "patient": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения деталей: {str(e)}")

@app.post("/api/patients/{patient_id}/update-diagnosis")
async def update_patient_diagnosis(
    patient_id: int,
    request: dict,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Сохранение диагноза, введённого врачом вручную"""
    try:
        db = SessionLocal()
        analysis = db.query(PatientAnalysis).filter(
            PatientAnalysis.id == patient_id
        ).first()
        
        if not analysis:
            db.close()
            raise HTTPException(status_code=404, detail="Пациент не найден")

        analysis.diagnosis = request.get('diagnosis', '').strip()
        db.commit()
        db.close()
        return {"status": "success", "message": "Диагноз сохранён"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сохранения: {str(e)}")

@app.get("/reports/{filename}")
async def serve_report(filename: str):
    try:
        path = os.path.join(DATA_DIR, filename)
        if os.path.exists(path):
            return FileResponse(path, media_type='text/html')
        else:
            return {"error": "Файл не найден", "expected_path": path}, 404
    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/reports/{filename}/pdf")
async def generate_report_pdf(
    filename: str,
    current_user: TokenData = Depends(get_current_active_user)
):
    try:
        db = SessionLocal()
        analysis = db.query(PatientAnalysis).filter(
            PatientAnalysis.filename == filename
        ).order_by(PatientAnalysis.created_at.desc()).first()
        
        if not analysis:
            db.close()
            raise HTTPException(status_code=404, detail="Анализ не найден")

        entities = json.loads(analysis.diagnoses_current) if analysis.diagnoses_current else []
        drugs = json.loads(analysis.medications_current) if analysis.medications_current else {}
        medications_delta_list = json.loads(analysis.medications_delta) if analysis.medications_delta else []
        
        delta_analysis = {
            "has_history": len(medications_delta_list) > 0,
            "medications_delta": medications_delta_list,
            "risk_change": analysis.risk_change if hasattr(analysis, 'risk_change') and analysis.risk_change else "stable",
            "risk_summary": analysis.risk_summary if hasattr(analysis, 'risk_summary') and analysis.risk_summary else "",
            "recommendations": []
        }
        db.close()
        
        pdf_bytes = generate_pdf_report(entities, drugs, delta_analysis, filename.replace(".txt", "").upper())
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename.replace('.txt', '.pdf')}"}
        )
    except Exception as e:
        print(f"⚠️ Ошибка генерации PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ошибка генерации PDF: {str(e)}")

@app.get("/api/reports")
async def get_report_history(limit: int = 10, skip: int = 0):
    try:
        db = SessionLocal()
        reports = db.query(PatientReport).order_by(
            PatientReport.created_at.desc()
        ).offset(skip).limit(limit).all()
        result = []
        for r in reports:
            result.append({
                "id": r.id,
                "filename": r.filename,
                "status": r.analysis_status,
                "created_at": r.created_at.isoformat(),
                "preview": r.raw_text[:100] + "..." if len(r.raw_text) > 100 else r.raw_text
            })
        db.close()
        return {"reports": result, "total": db.query(PatientReport).count()}
    except Exception as e:
        print(f"Ошибка получения истории: {str(e)}")
        return {"error": str(e), "total": 0}

@app.post("/api/reports/patient-visit/generate")
async def generate_patient_visit_report(
    request: dict,
    current_user: TokenData = Depends(get_current_active_user)
):
    try:
        patient_name = request.get('patient_name', 'Не указан')
        visit_date = request.get('visit_date', '')
        medications = request.get('medications', [])
        lab_values = request.get('lab_values', {})
        diagnosis = request.get('diagnosis', '')
        recommendations = request.get('recommendations', [])
        interactions = request.get('interactions', [])
        neurological_status = request.get('neurological_status', {})

        try:
            db_save = SessionLocal()
            target_analysis = db_save.query(PatientAnalysis).filter(
                PatientAnalysis.patient_id == patient_name.strip().upper()
            ).order_by(PatientAnalysis.created_at.desc()).first()
            if target_analysis:
                target_analysis.diagnosis = diagnosis
                db_save.commit()
                print(f"✅ Диагноз сохранён в БД для: {patient_name}")
            else:
                print(f"⚠️ Запись пациента не найдена в БД: {patient_name}")
            db_save.close()
        except Exception as db_err:
            print(f"⚠️ Ошибка сохранения диагноза: {db_err}")

        entities = []
        drugs = {
            'taken': [m.get('name', '') if isinstance(m, dict) else str(m) for m in medications],
            'cancelled': [],
            'added': [],
            'interactions': interactions
        }
        delta_analysis = {
            'has_history': False,
            'medications_delta': [],
            'risk_change': 'stable',
            'risk_summary': '',
            'recommendations': recommendations,
            'neurological_status': neurological_status,
            'visit_date': visit_date,
            'birth_date': request.get('birth_date', ''),
            'mo': request.get('mo', 'Университетская клиника'),
            'profile': request.get('profile', 'терапии'),
            'complaints': request.get('complaints', ''),
            'life_history': request.get('life_history', ''),
            'disease_history': request.get('disease_history', ''),
            'diagnosis': diagnosis,
            'lab_values': lab_values
        }
        pdf_bytes = generate_pdf_report(entities, drugs, delta_analysis, patient_name)
        safe_filename = f"protocol_{patient_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf"
        encoded_filename = quote(safe_filename)
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
            }
        )
    except Exception as e:
        print(f"⚠️ Ошибка: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ошибка PDF: {str(e)}")

@app.get("/api/analytics/export/pdf")
async def export_analytics_pdf(current_user: TokenData = Depends(get_current_active_user)):
    try:
        try:
            font_path = r"C:\Windows\Fonts\arial.ttf"
            font_bold_path = r"C:\Windows\Fonts\arialbd.ttf"
            if os.path.exists(font_path) and os.path.exists(font_bold_path):
                pdfmetrics.registerFont(TTFont('Arial', font_path))
                pdfmetrics.registerFont(TTFont('Arial-Bold', font_bold_path))
                print("✅ Шрифт Arial зарегистрирован!")
            else:
                print("⚠️ Шрифт Arial не найден")
        except Exception as e:
            print(f"⚠️ Ошибка регистрации шрифта: {e}")

        db = SessionLocal()
        analyses = db.query(PatientAnalysis).order_by(
            PatientAnalysis.created_at.desc()
        ).all()

        total_patients = len(set(a.patient_id for a in analyses))
        total_visits = len(analyses)
        high_risk = len([a for a in analyses if a.risk_change == 'increased'])
        with_interactions = len([a for a in analyses if a.medications_interactions and a.medications_interactions != '[]'])

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        elements = []

        title_style = ParagraphStyle(
            'CustomTitle',
            fontName='Arial-Bold',
            fontSize=18,
            textColor=colors.darkblue,
            spaceAfter=1*cm,
            alignment=TA_CENTER,
            leading=22
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            fontName='Arial-Bold',
            fontSize=14,
            textColor=colors.black,
            spaceAfter=0.5*cm,
            spaceBefore=0.5*cm,
            leading=18
        )
        normal_style = ParagraphStyle(
            'CustomNormal',
            fontName='Arial',
            fontSize=10,
            textColor=colors.black,
            leading=14,
            alignment=TA_LEFT
        )

        elements.append(Paragraph("MedMind 2.0 - Аналитика и отчёты", title_style))
        elements.append(Spacer(1, 0.5*cm))
        elements.append(Paragraph("📊 Общая статистика", heading_style))
        
        stats_data = [
            ['Показатель', 'Значение'],
            ['Всего пациентов', str(total_patients)],
            ['Всего визитов', str(total_visits)],
            ['С взаимодействиями', str(with_interactions)],
            ['Высокий риск', str(high_risk)],
        ]
        stats_table = Table(stats_data, colWidths=[8*cm, 4*cm])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Arial-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('FONTNAME', (0, 1), (-1, -1), 'Arial'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(stats_table)
        elements.append(Spacer(1, 0.5*cm))
        
        elements.append(Paragraph("📋 Последние визиты", heading_style))
        visits_data = [['Пациент', 'Дата', 'Препараты', 'Риски']]
        for analysis in analyses[:20]:
            drugs = json.loads(analysis.medications_current) if analysis.medications_current else {}
            drug_count = len(drugs.get('taken', []))
            risk_text = '🔺 Высокий' if analysis.risk_change == 'increased' else '✅ Низкий' if analysis.risk_change == 'decreased' else '➡️ Средний'
            visits_data.append([
                analysis.patient_id[:25],
                analysis.created_at.strftime('%d.%m.%Y'),
                str(drug_count),
                risk_text
            ])
        visits_table = Table(visits_data, colWidths=[6*cm, 3*cm, 2*cm, 3*cm])
        visits_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Arial-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Arial'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
        ]))
        elements.append(visits_table)
        doc.build(elements)
        buffer.seek(0)
        db.close()
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=medmind_analytics_{datetime.now().strftime('%Y-%m-%d')}.pdf"}
        )
    except Exception as e:
        print(f"⚠️ Ошибка генерации PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ошибка генерации PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)