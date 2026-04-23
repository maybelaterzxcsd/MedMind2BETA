from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
import io
import os

def generate_pdf_report(entities: list, drugs: dict, delta_analysis: dict, patient_name: str = "Неизвестен") -> bytes:
    """Генерирует PDF отчёт по шаблону официального протокола"""
    
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
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=1.5*cm,
        bottomMargin=1.5*cm
    )
    
    elements = []
    
    header_style = ParagraphStyle(
        'Header',
        fontName='Arial',
        fontSize=10,
        textColor=colors.black,
        leading=12,
        alignment=TA_LEFT
    )
    
    title_center_style = ParagraphStyle(
        'TitleCenter',
        fontName='Arial-Bold',
        fontSize=12,
        textColor=colors.black,
        leading=14,
        alignment=TA_CENTER,
        spaceAfter=6
    )
    
    section_style = ParagraphStyle(
        'Section',
        fontName='Arial-Bold',
        fontSize=11,
        textColor=colors.black,
        leading=13,
        spaceAfter=6,
        spaceBefore=12
    )
    
    normal_style = ParagraphStyle(
        'Normal',
        fontName='Arial',
        fontSize=10,
        textColor=colors.black,
        leading=12,
        alignment=TA_JUSTIFY
    )

    visit_date = delta_analysis.get('visit_date', datetime.now().strftime('%d.%m.%Y %H:%M')) if delta_analysis else datetime.now().strftime('%d.%m.%Y %H:%M')
    
    header_text = f"Пациент: {patient_name}   Дата рождения: {delta_analysis.get('birth_date', '')}   Дата и время посещения: {visit_date}   МО: {delta_analysis.get('mo', 'Университетская клиника')}   Профиль: {delta_analysis.get('profile', 'терапии')}"
    elements.append(Paragraph(header_text, header_style))
    elements.append(Spacer(1, 0.5*cm))

    elements.append(Paragraph("УНИВЕРСИТЕТСКАЯ КЛИНИКА", title_center_style))
    elements.append(Paragraph("Терапевтическое отделение консультативной поликлиники", 
                             ParagraphStyle('SubTitle', fontName='Arial', fontSize=10, 
                                          textColor=colors.black, leading=12, alignment=TA_CENTER)))
    elements.append(Paragraph("Протокол осмотра Врач-терапевт", 
                             ParagraphStyle('SubTitle2', fontName='Arial', fontSize=10, 
                                          textColor=colors.black, leading=12, alignment=TA_CENTER, spaceAfter=1*cm)))

    elements.append(Paragraph("Жалобы:", section_style))
    complaints = delta_analysis.get('complaints', '') if delta_analysis else ''
    elements.append(Paragraph(complaints if complaints else "_______________________________________________", normal_style))

    elements.append(Paragraph("Анамнез жизни:", section_style))
    life_history = delta_analysis.get('life_history', '') if delta_analysis else ''
    elements.append(Paragraph(life_history if life_history else "_______________________________________________", normal_style))

    elements.append(Paragraph("Анамнез заболевания:", section_style))
    disease_history = delta_analysis.get('disease_history', '') if delta_analysis else ''
    elements.append(Paragraph(disease_history if disease_history else "_______________________________________________", normal_style))
    
    elements.append(Paragraph("Локальный статус:", section_style))
    
    neurological_status = delta_analysis.get('neurological_status', {}) if delta_analysis else {}
    
    neuro_parts = []
    if neurological_status.get('eye_slits'): 
        neuro_parts.append(f"Глазные щели {neurological_status['eye_slits']} .")
    if neurological_status.get('pupils'): 
        neuro_parts.append(f"Зрачки {neurological_status['pupils']} ,")
    if neurological_status.get('light_reaction'): 
        neuro_parts.append(f"реакция на свет: {neurological_status['light_reaction']} .")
    if neurological_status.get('convergence'): 
        neuro_parts.append(f"Конвергенция {neurological_status['convergence']} .")
    if neurological_status.get('reflexes'): 
        neuro_parts.append(f"Сухожильные рефлексы с рук и ног {neurological_status['reflexes']} .")
    if neurological_status.get('pathological_reflexes'): 
        neuro_parts.append(f"Патологические рефлексы {neurological_status['pathological_reflexes']} .")
    if neurological_status.get('meningeal_signs'): 
        neuro_parts.append(f"Менингеальные знаки: {neurological_status['meningeal_signs']} .")
    if neurological_status.get('sensitivity'): 
        neuro_parts.append(f"Чувствительность {neurological_status['sensitivity']} .")
    if neurological_status.get('movements'): 
        neuro_parts.append(f"Движения {neurological_status['movements']} .")
    if neurological_status.get('romberg'): 
        neuro_parts.append(f"В позе Ромберга {neurological_status['romberg']} .")
    if neurological_status.get('vasomotor'): 
        neuro_parts.append(f"Вазомоторных и вегетативных расстройств {neurological_status['vasomotor']} .")
    if neurological_status.get('speech'): 
        neuro_parts.append(f"Речь: {neurological_status['speech']} .")
    if neurological_status.get('paralysis'): 
        neuro_parts.append(f"Параличи и парезы {neurological_status['paralysis']} .")
    if neurological_status.get('handwriting'): 
        neuro_parts.append(f"Расстройства почерка, счета, чтения {neurological_status['handwriting']} .")
    if neurological_status.get('space_time'): 
        neuro_parts.append(f"В пространстве и времени {neurological_status['space_time']} .")
    if neurological_status.get('answers'): 
        neuro_parts.append(f"На вопросы отвечает {neurological_status['answers']} .")
    if neurological_status.get('symbolism'): 
        neuro_parts.append(f"Символизм, неологизмы, бредовые идеи, резонёрство, детализация, застреваемость: {neurological_status['symbolism']} .")
    if neurological_status.get('proverbs'): 
        neuro_parts.append(f"Переносный смысл пословиц и поговорок воспринимает {neurological_status['proverbs']} .")
    if neurological_status.get('generalization'): 
        neuro_parts.append(f"Пробы на обобщение и различение понятий выполняет {neurological_status['generalization']} .")
    
    if neuro_parts:
        neuro_text = " ".join(neuro_parts)
        elements.append(Paragraph(neuro_text, normal_style))
    else:
        elements.append(Paragraph("_______________________________________________", normal_style))
    
    elements.append(Paragraph("Лабораторные значения:", section_style))
    lab_values = delta_analysis.get('lab_values', {}) if delta_analysis else {}
    
    if lab_values:
        def format_lab(val):
            if isinstance(val, dict):
                v = val.get('value', '')
                u = val.get('unit', '')
                n = val.get('norm', '')
                return f"{v} {u} (норма: {n})".strip()
            return str(val)

        lab_data = [['Показатель', 'Значение']] + [[k, format_lab(v)] for k, v in lab_values.items()]
        lab_table = Table(lab_data, colWidths=[8*cm, 6*cm])
        lab_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Arial-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Arial'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(lab_table)
    else:
        elements.append(Paragraph("_______________________________________________", normal_style))
    
    elements.append(Spacer(1, 0.5*cm))

    elements.append(Paragraph("Основной диагноз (расшифровка):", section_style))
    diagnosis = delta_analysis.get('diagnosis', '') if delta_analysis else ''
    elements.append(Paragraph(diagnosis if diagnosis else "_______________________________________________", normal_style))
    
    elements.append(Paragraph("Назначенные препараты:", section_style))
    
    if drugs and drugs.get('taken'):
        meds_data = [['Препарат', 'Доза', 'Частота']]
        for med in drugs.get('taken', []):
            if isinstance(med, dict):
                meds_data.append([
                    med.get('name', ''),
                    med.get('dose', ''),
                    med.get('frequency', '')
                ])
            else:
                meds_data.append([str(med), '', ''])
        
        meds_table = Table(meds_data, colWidths=[7*cm, 3.5*cm, 3.5*cm])
        meds_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Arial-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Arial'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(meds_table)
    else:
        elements.append(Paragraph("_______________________________________________", normal_style))

    elements.append(Paragraph("Рекомендации:", section_style))
    recommendations = delta_analysis.get('recommendations', []) if delta_analysis else []
    
    if recommendations:
        for i, rec in enumerate(recommendations, 1):
            elements.append(Paragraph(f"{i}. {rec}", normal_style))
    else:
        elements.append(Paragraph("_______________________________________________", normal_style))

    try:
        doc.build(elements)
    except Exception as e:
        print(f"⚠️ Ошибка при генерации PDF: {e}")
        elements_backup = [Paragraph("Ошибка генерации отчёта", normal_style)]
        doc.build(elements_backup)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes