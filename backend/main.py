# backend/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import sys
import os
from datetime import datetime
import tempfile
import hashlib
import json

# ==========================================
# ✅ НАСТРОЙКА ПУТЕЙ (ИСПРАВЛЕНО)
# ==========================================
PROJECT_ROOT = r"E:\MedMind2.0"
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

modules_path = os.path.join(PROJECT_ROOT, 'modules')
if modules_path not in sys.path:
    sys.path.insert(0, modules_path)

DATA_DIR = os.path.join(PROJECT_ROOT, 'backend', 'data', 'temp_reports')
os.makedirs(DATA_DIR, exist_ok=True)

# --- ИМПОРТЫ ДЛЯ БАЗЫ ДАННЫХ ---
sys.path.insert(0, os.path.dirname(__file__))
from db.database import create_tables, PatientReport, SessionLocal

# ✅ ИСПРАВЛЕННЫЕ ИМПОРТЫ МОДУЛЕЙ
from modules.analyzer import analyze_text
from modules.rules_engine import filter_drugs
from modules.html_report_generator import generate_html_report
from modules.recommendation_engine import decision_engine

# Создание папок при старте
os.makedirs(os.path.join(PROJECT_ROOT, 'backend', 'data', 'temp_reports'), exist_ok=True)
# ==========================================

app = FastAPI(
    title="MedMind2.0",
    description="Система поддержки врачебных решений на базе ИИ",
    version="1.0.0"
)

# Инициализация таблиц базы данных при старте
try:
    create_tables()
    print("✅ Таблицы базы данных созданы!")
except Exception as e:
    print(f"⚠️ Ошибка инициализации БД: {e}")

@app.get("/")
async def root():
    return {
        "status": "success",
        "project": "MedMind2.0",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.post("/analyze")
async def analyze_report(file: UploadFile = File(...)):
    """Анализирует медицинский текст и возвращает результат"""
    
    try:
        # Чтение содержимого файла
        content = await file.read()
        text = content.decode('utf-8')
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Файл пустой!")
        
                # Использование реальной модели
        result = analyze_text(text)
        
        # --- ВЫЗОВ КЛИНИЧЕСКОГО РЕКОМЕНДАТЕЛЯ ---
                # Ищем лекарства сначала по ответам модели
        drugs_from_entities = [e['text'] for e in result.get('entities', []) if e.get('label') == 'ЛЕКАРСТВО']
        
        # Плюс ищем названия лекарств в тексте (сканируем всё содержание файла)
        from modules.drug_check import find_drugs_in_text
        drugs_from_text = find_drugs_in_text(text)
        
        # Объединяем два списка и убираем дубликаты
        drugs_list = list(set(drugs_from_entities + drugs_from_text))
        
        clinical_advice = []
        try:
            clinical_advice = decision_engine.generate_recommendation(drugs_list, text)
        except Exception as e:
            print(f"⚠️ Ошибка рекомендаций: {str(e)}")
            
        drug_status = {
            "taken": drugs_list,
            "interactions": clinical_advice
        }
        
        # --- ГЕНЕРАЦИЯ HTML-ОТЧЁТА ---
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
        
        # --- СОХРАНЕНИЕ В БАЗУ ДАННЫХ ---
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
        
        # Формируем ответ
        response = {
            "status": "success",
            "filename": file.filename,
            "size_bytes": len(content),
            "entities": result["entities"],
            "drugs": drug_status,
            "message": "Анализ завершён успешно!",
            "html_available": html_generated
        }
        
        if html_generated and temp_html_path:
            response["html_url"] = f"/reports/{os.path.basename(temp_html_path)}"
        
        return response
        
    except Exception as e:
        print(f"💥 Ошибка в /analyze: {str(e)}")
        return {"error": str(e), "status": "failed"}

@app.get("/reports/{filename}")
async def serve_report(filename: str):
    """Сервис для скачивания HTML отчётов"""
    try:
        path = os.path.join(DATA_DIR, filename)
        
        if os.path.exists(path):
            return FileResponse(path, media_type='text/html')
        else:
            return {"error": "Файл не найден", "expected_path": path}, 404
    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/api/reports")
async def get_report_history(limit: int = 10, skip: int = 0):
    """Получить историю последних анализов"""
    try:
        db = SessionLocal()
        
        reports = db.query(PatientReport).order_by(PatientReport.created_at.desc()).offset(skip).limit(limit).all()
        
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)