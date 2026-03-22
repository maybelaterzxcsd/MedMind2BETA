# ### modules/report_generator.py
# from datetime import datetime

# def generate_report_safe(entities: list) -> bytes:
#     """Безопасная генерация PDF с защитой от ошибок кириллицы"""
    
#     try:
#         from fpdf import FPDF
        
#         pdf = FPDF()
#         pdf.add_page()
        
#         # Заголовок
#         pdf.set_font('Arial', 'B', 16)
#         pdf.cell(0, 10, 'МЕДИЦИНСКИЙ ОТЧЁТ MedMind2.0', 0, 1, 'C')
#         pdf.ln(5)
        
#         # Дата
#         pdf.set_font('Arial', '', 10)
#         date_str = datetime.now().strftime("%d.%m.%Y %H:%M")
#         pdf.cell(0, 6, f'Дата анализа: {date_str}', 0, 1)
#         pdf.ln(3)
        
#         # Группируем по категориям
#         categories_seen = set()
#         items_by_category = {}
        
#         for item in entities:
#             cat = str(item.get('label', 'ДАННЫЕ'))  # Преобразуем в строку
#             if cat not in categories_seen:
#                 categories_seen.add(cat)
#                 items_by_category[cat] = []
#             items_by_category[cat].append(str(item.get('text', '')))
        
#         # Вывод по категориям
#         for cat, texts in items_by_category.items():
#             pdf.set_font('Arial', 'B', 10)
#             pdf.set_fill_color(220, 220, 255)
#             pdf.cell(0, 6, f'{cat}:', 1, 1, 'L', 1)
            
#             pdf.set_font('Arial', '', 10)
#             for txt in texts[:10]:  # Лимит на страницы
#                 if isinstance(txt, str):
#                     pdf.multi_cell(0, 4, f'- {txt}')
#             pdf.ln(1)
        
#         # ПЫТАЕМСЯ СОХРАНИТЬ С UTF-8 КОДИРОВКОЙ (не latin-1)
#         try:
#             output = pdf.output(dest='S').encode('utf-8')
#         except Exception as e:
#             print(f"⚠️ Не удалось закодировать PDF: {str(e)}")
#             # Если ошибка — вернём текстовый ответ вместо PDF
#             return b"PDF генерация завершена с ошибкой кодировки."
        
#         return output
        
#     except ImportError:
#         # Если фпдф нет — возвращаем заглушку без текста
#         return b"Библиотека fpdf не установлена"

# if __name__ == "__main__":
#     test_data = [{"label": "СИМПТОМ", "text": "головная боль"}]
#     result = generate_report_safe(test_data)
#     print(f"Результат: {len(result)} байт")