import React, { useState } from 'react';
import { analysisAPI } from '../services/api';
import RightSidebar from '../components/RightSidebar';

function Dashboard({ onAnalysisComplete = () => {} }) {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState('text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorData, setEditorData] = useState({
    patient_name: '',
    birth_date: '',
    visit_date: new Date().toISOString().split('T')[0],
    mo: 'Университетская клиника',
    profile: 'терапии',
    complaints: '',
    life_history: '',
    disease_history: '',
    neurological_status: {
      consciousness: '',
      cranial_nerves: '',
      motor: '',
      sensation: ''
    },
    lab_values: {},
    diagnosis: '',
    medications: [],
    recommendations: [],
    interactions: [],
  });
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    setError('');
    if (inputMode === 'file' && !file) { setError('Выберите файл'); return; }
    if (inputMode === 'text' && !textInput.trim()) { setError('Введите текст'); return; }
    
    setLoading(true);
    try {
      let data;
      if (inputMode === 'file') {
        data = await analysisAPI.uploadFile(file);
      } else {
        const blob = new Blob([textInput], { type: 'text/plain' });
        const fileFromText = new File([blob], 'manual_visit.txt', { type: 'text/plain' });
        data = await analysisAPI.uploadFile(fileFromText);
      }
      setAnalysisResult(data);
      onAnalysisComplete(data);
    } catch (err) {
      setError('Ошибка: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setFile(null);
    setTextInput('');
    setShowEditor(false);
  };

  const handleEditReport = () => {
    const aiComplaints = (analysisResult.entities || [])
      .filter(e => {
        const label = (e.label || '').toUpperCase();
        return label.includes('СИМПТОМ') || label.includes('ЖАЛОБ') || label.includes('SYMPTOM') || label.includes('COMPLAINT');
      })
      .map(e => e.text)
      .filter(Boolean);

    const complaintsText = aiComplaints.length > 0 
      ? aiComplaints.join('\n') 
      : (analysisResult.complaints || []).join('\n');

    setEditorData({
      patient_name: analysisResult.patient_name || '',
      birth_date: '',
      visit_date: new Date().toISOString().split('T')[0],
      mo: 'Университетская клиника',
      profile: 'терапии',
      complaints: complaintsText, 
      life_history: '',
      disease_history: '',
      neurological_status: {
        consciousness: '',
        cranial_nerves: '',
        motor: '',
        sensation: ''
      },
      lab_values: analysisResult.lab_values || {},
      diagnosis: '',
      medications: analysisResult.drugs?.taken?.map(d => ({ name: d, dose: '', frequency: '' })) || [],
      recommendations: analysisResult.drugs?.interactions?.map(i => i.warning) || [],
      interactions: analysisResult.drugs?.interactions || [],
    });
    setShowEditor(true);
  };

  const handleGeneratePDF = async () => {
    try {
      setGeneratingPdf(true);
      const response = await fetch('http://localhost:8000/api/reports/patient-visit/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editorData)
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Ошибка генерации');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `protocol_${editorData.patient_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      alert('✅ PDF сгенерирован!');
      setShowEditor(false);
    } catch (err) {
      alert('❌ Ошибка: ' + err.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const addMedication = () => {
    setEditorData({
      ...editorData,
      medications: [...editorData.medications, { name: '', dose: '', frequency: '' }]
    });
  };

  const updateMedication = (idx, field, val) => {
    const meds = [...editorData.medications];
    meds[idx][field] = val;
    setEditorData({ ...editorData, medications: meds });
  };

  const removeMedication = (idx) => {
    setEditorData({
      ...editorData,
      medications: editorData.medications.filter((_, i) => i !== idx)
    });
  };

  const groupEntities = () => {
    const entities = analysisResult.entities || [];
    const grouped = { symptoms: [], diagnoses: [], complaints: [], other: [] };
    
    entities.forEach(entity => {
      const label = (entity.label || '').toUpperCase();
      const text = entity.text || '';
      if (label.includes('ДИАГН') || label === 'DIAGNOSIS') {
        grouped.diagnoses.push(text);
      } else if (label.includes('ЖАЛОБ') || text.toLowerCase().includes('жалоб')) {
        grouped.complaints.push(text);
      } else if (label.includes('СИМПТ') || label === 'SYMPTOM') {
        grouped.symptoms.push(text);
      } else if (text.length > 2) {
        grouped.other.push(text);
      }
    });
    return grouped;
  };

  if (analysisResult) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <div>
              <h1 style={styles.title}>Результаты анализа</h1>
              <p style={styles.subtitle}>{analysisResult.filename || 'Визит пациента'}</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button onClick={handleNewAnalysis} style={styles.backButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Новый анализ
            </button>
            <button onClick={handleEditReport} style={styles.editButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Редактировать и скачать PDF
            </button>
          </div>
        </div>

        {/* Пациент */}
        <div style={styles.patientCard}>
          <div style={styles.patientCardHeader}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h2 style={styles.patientCardTitle}>Пациент</h2>
          </div>
          <p style={styles.patientValue}>{analysisResult.patient_name || analysisResult.filename || 'Не указан'}</p>
        </div>

        {/* Жалобы и симптомы */}
        {(() => {
          const grouped = groupEntities();
          const allComplaints = [
            ...(analysisResult.complaints || []),
            ...grouped.complaints,
            ...grouped.symptoms
          ];
          
          if (allComplaints.length === 0) return null;
          
          return (
            <div style={styles.complaintsCard}>
              <div style={styles.cardHeader}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <h3 style={{...styles.cardTitle, color: '#dc2626', fontWeight: '700'}}>Жалобы и симптомы</h3>
              </div>
              <ul style={styles.complaintsList}>
                {allComplaints.map((c, i) => (
                  <li key={i} style={styles.complaintItem}>{c}</li>
                ))}
              </ul>
            </div>
          );
        })()}

        {/* Диагнозы */}
        {(() => {
          const grouped = groupEntities();
          if (grouped.diagnoses.length === 0) return null;
          return (
            <div style={styles.diagnosisCard}>
              <div style={styles.cardHeader}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <h3 style={{...styles.cardTitle, color: '#dc2626'}}>Диагнозы</h3>
              </div>
              <div style={styles.tagContainer}>
                {grouped.diagnoses.map((d, i) => <span key={i} style={styles.diagnosisTag}>{d}</span>)}
              </div>
            </div>
          );
        })()}

        {/* Препараты + Взаимодействия */}
        <div style={styles.mainGrid}>
          <div style={styles.drugsCard}>
            <div style={styles.cardHeader}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="6" />
                <line x1="12" y1="6" x2="12" y2="18" />
              </svg>
              <h3 style={styles.cardTitle}>Препараты</h3>
            </div>
            {analysisResult.drugs?.taken?.length > 0 ? (
              <ul style={styles.drugsList}>
                {analysisResult.drugs.taken.map((d, i) => <li key={i} style={styles.drugItem}>{d}</li>)}
              </ul>
            ) : <p style={styles.emptyText}>Не найдено</p>}
          </div>

          <div style={{...styles.interactionsCard, background: analysisResult.drugs?.interactions?.length > 0 ? '#fffbeb' : '#f0fdf4'}}>
            <div style={styles.cardHeader}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={analysisResult.drugs?.interactions?.length > 0 ? '#f59e0b' : '#10b981'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h3 style={{...styles.cardTitle, color: analysisResult.drugs?.interactions?.length > 0 ? '#b45309' : '#059669'}}>
                Взаимодействия
                {analysisResult.drugs?.interactions?.length > 0 && <span style={styles.badge}>{analysisResult.drugs.interactions.length}</span>}
              </h3>
            </div>
            {analysisResult.drugs?.interactions?.length > 0 ? (
              <div style={styles.interactionsList}>
                {analysisResult.drugs.interactions.map((int, i) => (
                  <div key={i} style={styles.interactionItem}>
                    <div style={styles.interactionDrugs}>
                      {(() => {
                        const d1 = Array.isArray(int.drugs) ? int.drugs.join(', ') : (int.drugs || '');
                        const d2 = Array.isArray(int.with_drugs) ? int.with_drugs.join(', ') : (int.with_drugs || '');
                        return [d1, d2].filter(Boolean).join(' + ');
                      })()}
                    </div>
                    <p style={styles.interactionWarning}>{int.warning}</p>
                    {int.severity && (
                      <span style={{...styles.severityBadge, background: int.severity === 'CRITICAL' ? '#fee2e2' : int.severity === 'HIGH' ? '#fef3c7' : '#fef9c3', color: int.severity === 'CRITICAL' ? '#dc2626' : int.severity === 'HIGH' ? '#d97706' : '#a16207'}}>
                        {int.severity === 'CRITICAL' && '🔴 '}{int.severity === 'HIGH' && '🟠 '}{int.severity === 'MEDIUM' && '🟡 '}{int.severity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : <p style={styles.emptyText}>Взаимодействий не обнаружено ✅</p>}
          </div>
        </div>

        {/* Дельта + Лаборатория */}
        <div style={styles.bottomGrid}>
          {analysisResult.delta_analysis && (
            <div style={styles.deltaCard}>
              <div style={styles.cardHeader}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <h3 style={styles.cardTitle}>Изменения в терапии</h3>
              </div>
              {analysisResult.delta_analysis.has_history ? (
                <div style={styles.deltaContent}>
                  {analysisResult.delta_analysis.medications_delta?.map((delta, i) => {
                    const isAdded = delta.type === 'added';
                    const bgColor = isAdded ? '#f0fdf4' : '#fff1f2';
                    const borderColor = isAdded ? '#10b981' : '#ef4444';
                    const icon = isAdded ? '➕' : '❌';
                    const iconColor = isAdded ? '#10b981' : '#ef4444';
                    const textLabel = isAdded ? 'Добавлено:' : 'Отменено:';
                    return (
                      <div key={i} style={{
                        ...styles.deltaMedicationItem,
                        background: bgColor,
                        borderLeft: `4px solid ${borderColor}`,
                        marginBottom: '8px'
                      }}>
                        <span style={{ fontWeight: '700', color: iconColor, fontSize: '18px', marginRight: '8px' }}>
                          {icon}
                        </span>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '2px' }}>
                            {textLabel}
                          </div>
                          <div style={{ fontSize: '15px', color: '#1f2937', fontWeight: '500' }}>
                            {delta.drugs?.join(', ')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{...styles.riskStatus, background: analysisResult.delta_analysis.risk_change === 'increased' ? '#fee2e2' : analysisResult.delta_analysis.risk_change === 'decreased' ? '#d1fae5' : '#f3f4f6'}}>
                    <span>{analysisResult.delta_analysis.risk_change === 'increased' ? '⚠️' : analysisResult.delta_analysis.risk_change === 'decreased' ? '✅' : '🔹'}</span>
                    <span style={{color: analysisResult.delta_analysis.risk_change === 'increased' ? '#991b1b' : analysisResult.delta_analysis.risk_change === 'decreased' ? '#065f46' : '#374151', fontWeight: '500', marginLeft: '8px'}}>
                      {analysisResult.delta_analysis.risk_summary}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyDelta}>
                  <span style={{fontSize: '24px', display: 'block', marginBottom: '8px'}}>ℹ️</span>
                  <p style={{color: '#6b7280', margin: 0}}>Первый визит пациента</p>
                </div>
              )}
            </div>
          )}

          {analysisResult.lab_values && Object.keys(analysisResult.lab_values).length > 0 && (
            <div style={styles.labCard}>
              <div style={styles.cardHeader}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3h6v2H9z" />
                  <path d="M10 5v4l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V5" />
                  <line x1="10" y1="13" x2="14" y2="13" />
                </svg>
                <h3 style={styles.cardTitle}>Лаборатория</h3>
              </div>
              <div style={styles.labGrid}>
                {Object.entries(analysisResult.lab_values).map(([k, v]) => {
                  const isObj = typeof v === 'object' && v !== null;
                  const value = isObj ? v.value : String(v);
                  const unit = isObj ? v.unit || '' : '';
                  const norm = isObj ? v.norm || '' : '';
                  
                  const checkAbnormal = (val, normStr) => {
                    const numVal = parseFloat(val);
                    if (isNaN(numVal) || !normStr) return { status: 'normal', color: '#10b981', icon: '✅', bg: '#f0fdf4' };
                    
                    const cleanNorm = normStr.replace('<', '').replace('>', '').trim();
                    const parts = cleanNorm.split('-').map(n => parseFloat(n.trim()));
                    const min = parts[0];
                    const max = parts[1] !== undefined ? parts[1] : parts[0];
                    
                    if (!isNaN(min) && !isNaN(max) && min !== max) {
                      if (numVal < min) return { status: 'low', color: '#f59e0b', icon: '🔻', bg: '#fffbeb' };
                      if (numVal > max) return { status: 'high', color: '#ef4444', icon: '🔺', bg: '#fee2e2' };
                    } else if (!isNaN(max) && normStr.includes('<')) {
                      if (numVal > max) return { status: 'high', color: '#ef4444', icon: '🔺', bg: '#fee2e2' };
                    } else if (!isNaN(min) && normStr.includes('>')) {
                      if (numVal < min) return { status: 'low', color: '#f59e0b', icon: '🔻', bg: '#fffbeb' };
                    }
                    return { status: 'normal', color: '#10b981', icon: '✅', bg: '#f0fdf4' };
                  };
                  
                  const abnormal = checkAbnormal(value, norm);
                  
                  return (
                    <div key={k} style={{...styles.labItem, background: abnormal.bg}}>
                      <span style={styles.labName}>{k}</span>
                      <div style={styles.labValueContainer}>
                        <span style={{...styles.labValue, color: abnormal.color}}>
                          {abnormal.icon} {value} {unit}
                        </span>
                        {norm && <span style={styles.labNorm}>(норма: {norm})</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Модальное окно */}
        {showEditor && (
          <div style={styles.modalOverlay} onClick={() => setShowEditor(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <div style={styles.modalTitleContainer}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <h2 style={styles.modalTitle}>Официальный протокол</h2>
                </div>
                <button onClick={() => setShowEditor(false)} style={styles.closeButton}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div style={styles.modalBody}>
                {/* Шапка */}
                <div style={styles.formSection}>
                  <h3 style={styles.formSectionTitle}>📋 Шапка</h3>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Пациент:</label>
                      <input 
                        type="text" 
                        value={editorData.patient_name} 
                        onChange={(e) => setEditorData({...editorData, patient_name: e.target.value})} 
                        style={styles.input} 
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Дата рождения:</label>
                      <input 
                        type="date" 
                        value={editorData.birth_date} 
                        onChange={(e) => setEditorData({...editorData, birth_date: e.target.value})} 
                        style={styles.input} 
                      />
                    </div>
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Дата визита:</label>
                      <input 
                        type="date" 
                        value={editorData.visit_date} 
                        onChange={(e) => setEditorData({...editorData, visit_date: e.target.value})} 
                        style={styles.input} 
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>МО:</label>
                      <input 
                        type="text" 
                        value={editorData.mo} 
                        onChange={(e) => setEditorData({...editorData, mo: e.target.value})} 
                        style={styles.input} 
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Профиль:</label>
                      <input 
                        type="text" 
                        value={editorData.profile} 
                        onChange={(e) => setEditorData({...editorData, profile: e.target.value})} 
                        style={styles.input} 
                      />
                    </div>
                  </div>
                </div>

                {/* Жалобы и анамнез */}
                <div style={styles.formSection}>
                  <h3 style={styles.formSectionTitle}>🩺 Жалобы и анамнез</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Жалобы:</label>
                    <textarea 
                      value={editorData.complaints} 
                      onChange={(e) => setEditorData({...editorData, complaints: e.target.value})} 
                      style={{...styles.input, minHeight: '80px'}} 
                      rows="3" 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Анамнез заболевания:</label>
                    <textarea 
                      value={editorData.disease_history} 
                      onChange={(e) => setEditorData({...editorData, disease_history: e.target.value})} 
                      style={{...styles.input, minHeight: '80px'}} 
                      rows="3" 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Анамнез жизни:</label>
                    <textarea 
                      value={editorData.life_history} 
                      onChange={(e) => setEditorData({...editorData, life_history: e.target.value})} 
                      style={{...styles.input, minHeight: '80px'}} 
                      rows="3" 
                    />
                  </div>
                </div>

                {/* Неврологический статус */}
                <div style={styles.formSection}>
                  <h3 style={styles.formSectionTitle}>🧠 Неврологический статус</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Сознание:</label>
                    <input 
                      type="text" 
                      value={editorData.neurological_status?.consciousness || ''} 
                      onChange={(e) => setEditorData({
                        ...editorData, 
                        neurological_status: {...editorData.neurological_status, consciousness: e.target.value}
                      })} 
                      style={styles.input} 
                      placeholder="Ясное, спутанное и т.д."
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Черепные нервы:</label>
                    <textarea 
                      value={editorData.neurological_status?.cranial_nerves || ''} 
                      onChange={(e) => setEditorData({
                        ...editorData, 
                        neurological_status: {...editorData.neurological_status, cranial_nerves: e.target.value}
                      })} 
                      style={{...styles.input, minHeight: '60px'}} 
                      rows="2"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Двигательная сфера:</label>
                    <textarea 
                      value={editorData.neurological_status?.motor || ''} 
                      onChange={(e) => setEditorData({
                        ...editorData, 
                        neurological_status: {...editorData.neurological_status, motor: e.target.value}
                      })} 
                      style={{...styles.input, minHeight: '60px'}} 
                      rows="2"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Чувствительность:</label>
                    <textarea 
                      value={editorData.neurological_status?.sensation || ''} 
                      onChange={(e) => setEditorData({
                        ...editorData, 
                        neurological_status: {...editorData.neurological_status, sensation: e.target.value}
                      })} 
                      style={{...styles.input, minHeight: '60px'}} 
                      rows="2"
                    />
                  </div>
                </div>

                {/* Лабораторные данные */}
                <div style={styles.formSection}>
                  <h3 style={styles.formSectionTitle}>🔬 Лабораторные данные</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Анализы (каждый с новой строки в формате: Название: значение норма):</label>
                    <textarea 
                      value={Object.entries(editorData.lab_values || {})
                        .map(([key, val]) => `${key}: ${val.value} ${val.unit} (норма: ${val.norm})`)
                        .join('\n')} 
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(line => line.trim());
                        const newLabValues = {};
                        lines.forEach(line => {
                          const match = line.match(/([^:]+):\s*([^\(]+)\s*\(норма:\s*([^)]+)\)/);
                          if (match) {
                            const [, name, valueUnit, norm] = match;
                            const [value, unit] = valueUnit.trim().split(' ');
                            newLabValues[name.trim()] = { value: value.trim(), unit: unit || '', norm: norm.trim() };
                          }
                        });
                        setEditorData({...editorData, lab_values: newLabValues});
                      }} 
                      style={{...styles.input, minHeight: '100px', fontFamily: 'monospace'}} 
                      rows="5"
                      placeholder="Креатинин: 125 мкмоль/л (норма: 62-106)&#10;Мочевина: 9.1 ммоль/л (норма: 2.5-8.3)"
                    />
                  </div>
                </div>

                {/* Диагноз */}
                <div style={styles.formSection}>
                  <h3 style={styles.formSectionTitle}>📋 Диагноз</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Основной диагноз:</label>
                    <textarea 
                      value={editorData.diagnosis} 
                      onChange={(e) => setEditorData({...editorData, diagnosis: e.target.value})} 
                      style={{...styles.input, minHeight: '60px'}} 
                      rows="2"
                    />
                  </div>
                </div>

                {/* Препараты */}
                <div style={styles.formSection}>
                  <h3 style={styles.formSectionTitle}>💊 Препараты</h3>
                  {editorData.medications.map((med, idx) => (
                    <div key={idx} style={styles.medicationRow}>
                      <input 
                        type="text" 
                        value={med.name} 
                        onChange={(e) => updateMedication(idx, 'name', e.target.value)} 
                        placeholder="Препарат" 
                        style={{...styles.input, flex: 2}} 
                      />
                      <input 
                        type="text" 
                        value={med.dose} 
                        onChange={(e) => updateMedication(idx, 'dose', e.target.value)} 
                        placeholder="Доза" 
                        style={{...styles.input, flex: 1}} 
                      />
                      <input 
                        type="text" 
                        value={med.frequency} 
                        onChange={(e) => updateMedication(idx, 'frequency', e.target.value)} 
                        placeholder="Частота" 
                        style={{...styles.input, flex: 1}} 
                      />
                      <button onClick={() => removeMedication(idx)} style={styles.removeButton}>✕</button>
                    </div>
                  ))}
                  <button onClick={addMedication} style={styles.addButton}>+ Добавить препарат</button>
                </div>

                {/* Рекомендации */}
                <div style={styles.formSection}>
                  <h3 style={styles.formSectionTitle}>💡 Рекомендации</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Рекомендации (каждая с новой строки):</label>
                    <textarea 
                      value={editorData.recommendations.join('\n')} 
                      onChange={(e) => setEditorData({
                        ...editorData, 
                        recommendations: e.target.value.split('\n')
                      })} 
                      style={{...styles.input, minHeight: '80px', whiteSpace: 'pre-wrap', resize: 'vertical'}} 
                      rows="4"
                      placeholder="Контроль АД ежедневно&#10;Консультация кардиолога&#10;Диета с ограничением соли"
                    />
                  </div>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button onClick={() => setShowEditor(false)} style={styles.cancelButton}>Отмена</button>
                <button onClick={handleGeneratePDF} disabled={generatingPdf} style={{...styles.generateButton, opacity: generatingPdf ? 0.7 : 1}}>
                  {generatingPdf ? 'Генерация...' : 'Скачать протокол'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <div>
            <h1 style={styles.title}>Панель управления</h1>
            <p style={styles.subtitle}>Управляйте медицинскими данными, рассчитывайте параметры и анализируйте диагностику.</p>
          </div>
        </div>
      </div>

      <div style={styles.columns}>
        <div style={styles.leftColumn}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Загрузка визита</h2>
            <p style={styles.cardSubtitle}>Выберите способ ввода</p>

            <div style={styles.modeSelector}>
              <button onClick={() => setInputMode('text')} style={{...styles.modeButton, background: inputMode === 'text' ? '#10b981' : '#f3f4f6', color: inputMode === 'text' ? 'white' : '#374151'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" y1="20" x2="15" y2="20" />
                  <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
                Текст
              </button>
              <button onClick={() => setInputMode('file')} style={{...styles.modeButton, background: inputMode === 'file' ? '#10b981' : '#f3f4f6', color: inputMode === 'file' ? 'white' : '#374151'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Файл
              </button>
            </div>

            {inputMode === 'text' && (
              <div style={styles.textAreaContainer}>
                <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Введите текст визита..." style={styles.textArea} rows="12" />
                <p style={styles.hint}>💡 Система сама распознает симптомы и лекарства</p>
              </div>
            )}

            {inputMode === 'file' && (
              <div style={styles.fileInput}>
                <input type="file" accept=".txt" onChange={handleFileChange} style={styles.fileInputField} />
                {file && <p style={styles.fileName}>📄 {file.name}</p>}
              </div>
            )}

            {error && <p style={styles.error}>{error}</p>}

            <button onClick={handleUpload} style={{...styles.button, opacity: loading ? 0.7 : 1}} disabled={loading}>
              {loading ? '⏳ Анализ...' : '🚀 Запустить'}
            </button>
          </div>
        </div>

        <div style={styles.rightColumn}>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', background: '#f0fdf4', minHeight: '100vh' },
  header: { background: 'white', padding: '24px 32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginBottom: '30px' },
  headerContent: { display: 'flex', alignItems: 'center', gap: '16px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  headerActions: { display: 'flex', gap: '12px', marginBottom: '24px', marginTop: '16px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#1f2937', marginBottom: '6px', margin: '0' },
  subtitle: { fontSize: '15px', color: '#6b7280', margin: '0' },
  backButton: { background: 'white', border: '1px solid #d1d5db', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' },
  editButton: { background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  patientCard: { background: 'white', padding: '24px 30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginBottom: '24px' },
  patientCardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  patientCardTitle: { fontSize: '16px', fontWeight: '600', color: '#10b981', margin: '0' },
  patientValue: { fontSize: '20px', color: '#1e293b', margin: '0', fontWeight: '500' },
  complaintsCard: { background: '#fff7ed', border: '2px solid #ffedd5', boxShadow: '0 2px 8px rgba(249, 115, 22, 0.1)', padding: '24px', borderRadius: '12px', marginBottom: '24px' },
  complaintsList: { margin: '12px 0 0 0', paddingLeft: '24px' },
  complaintItem: { fontSize: '15px', color: '#431407', fontWeight: '500', marginBottom: '8px', lineHeight: '1.5' },
  diagnosisCard: { background: 'white', padding: '20px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #fecaca', marginBottom: '24px' },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' },
  diagnosisTag: { background: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', marginBottom: '24px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#10b981', margin: '0', display: 'flex', alignItems: 'center', gap: '8px' },
  badge: { background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  drugsCard: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
  drugsList: { margin: '0', paddingLeft: '20px' },
  drugItem: { fontSize: '14px', color: '#374151', marginBottom: '8px', padding: '4px 0' },
  interactionsCard: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
  interactionsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  interactionItem: { padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #fcd34d' },
  interactionDrugs: { fontSize: '15px', fontWeight: '700', color: '#b45309', marginBottom: '6px' },
  interactionWarning: { fontSize: '13px', color: '#92400e', margin: '0 0 8px 0', lineHeight: '1.4' },
  severityBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' },
  bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' },
  deltaCard: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
  deltaContent: { display: 'flex', flexDirection: 'column', gap: '12px' },
  deltaMedicationItem: { display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' },
  riskStatus: { display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '8px', fontSize: '14px' },
  emptyDelta: { textAlign: 'center', padding: '20px 0' },
  labCard: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
  labGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  labItem: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px', background: '#f8fafc', borderRadius: '8px' },
  labName: { fontSize: '13px', color: '#64748b', fontWeight: '500' },
  labValueContainer: { display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' },
  labValue: { fontSize: '15px', fontWeight: '700' },
  labNorm: { fontSize: '12px', color: '#94a3b8' },
  emptyText: { fontSize: '14px', color: '#9ca3af', margin: '0', fontStyle: 'italic' },
  columns: { display: 'flex', gap: '30px' },
  leftColumn: { flex: '1.5', minWidth: '0' },
  rightColumn: { flex: '1', minWidth: '0' },
  card: { background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', minHeight: '600px' },
  cardTitle: { fontSize: '22px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' },
  cardSubtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '24px' },
  modeSelector: { display: 'flex', gap: '10px', marginBottom: '24px' },
  modeButton: { flex: 1, padding: '12px', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  textArea: { width: '100%', padding: '15px', border: '2px solid #10b981', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' },
  fileInput: { marginBottom: '20px', textAlign: 'center' },
  fileInputField: { padding: '10px', border: '2px dashed #10b981', borderRadius: '8px', width: '100%', cursor: 'pointer' },
  button: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%' },
  error: { color: '#ef4444', textAlign: 'center', marginBottom: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', borderRadius: '12px', width: '95%', maxWidth: '1000px', maxHeight: '95vh', overflow: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: 'white', zIndex: 10 },
  modalTitleContainer: { display: 'flex', alignItems: 'center', gap: '12px' },
  modalTitle: { fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '0' },
  closeButton: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: '32px' },
  modalFooter: { display: 'flex', gap: '12px', justifyContent: 'flex-end', padding: '24px 32px', borderTop: '1px solid #e5e7eb', position: 'sticky', bottom: 0, background: 'white', zIndex: 10 },
  formSection: { marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' },
  formSectionTitle: { fontSize: '18px', fontWeight: '600', color: '#10b981', marginBottom: '16px' },
  formRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  formGroup: { marginBottom: '16px', flex: '1 1 200px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  medicationRow: { display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' },
  addButton: { background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  removeButton: { background: '#ef4444', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cancelButton: { background: '#f3f4f6', color: '#374151', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  generateButton: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  hint: { fontSize: '12px', color: '#9ca3af', marginTop: '4px', marginBottom: '8px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' },
};

export default Dashboard;