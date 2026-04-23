import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/patients');
      setPatients(response.data.patients || []);
      setError('');
    } catch (err) {
      setError('Ошибка загрузки пациентов: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = async (patient) => {
    try {
      const response = await api.get(`/api/patients/${patient.id}`);
      setSelectedPatient(response.data.patient);
    } catch (err) {
      setError('Ошибка загрузки данных пациента');
    }
  };

  const handleBack = () => {
    setSelectedPatient(null);
  };

  const getStatusBadge = (status) => {
    if (status === 'high' || status === 'increased') {
      return { background: '#fee2e2', color: '#dc2626', text: '🔺 Риск' };
    }
    if (status === 'warning') {
      return { background: '#fef3c7', color: '#d97706', text: '⚠️ Внимание' };
    }
    return { background: '#d1fae5', color: '#059669', text: '✅ Стабильно' };
  };

  const filteredPatients = patients.filter(p =>
    p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedPatient) {
    return (
      <div style={styles.container}>
        <button onClick={handleBack} style={styles.backButton}>
          {/* SVG Иконка назад */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Назад к списку
        </button>

        <div style={styles.detailCard}>
          <h2 style={styles.detailTitle}>
            {/* SVG Иконка пациента */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px', verticalAlign: 'middle'}}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {selectedPatient.patient_name || selectedPatient.filename}
          </h2>

          {/* Дата визита */}
          <div style={styles.detailSection}>
            <h3 style={styles.detailSectionTitle}>
              {/* SVG Иконка календаря */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Дата визита
            </h3>
            <p>{new Date(selectedPatient.created_at).toLocaleString('ru-RU')}</p>
          </div>

          {(() => {
            const meds = selectedPatient.medications_current;
            const medsArray = Array.isArray(meds?.taken) ? meds.taken : 
                              typeof meds === 'string' ? JSON.parse(meds).taken || [] : [];
            
            if (medsArray.length === 0) return null;
            
            return (
              <div style={styles.detailSection}>
                <h3 style={styles.detailSectionTitle}>
                  {/* SVG Иконка препаратов */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                    <rect x="2" y="6" width="20" height="12" rx="6" />
                    <line x1="12" y1="6" x2="12" y2="18" />
                  </svg>
                  Препараты
                </h3>
                <p>{medsArray.join(', ')}</p>
              </div>
            );
          })()}

          {/* Взаимодействия */}
          {(() => {
            const interactions = selectedPatient.medications_interactions;
            const interactionsArray = Array.isArray(interactions) ? interactions :
                                      typeof interactions === 'string' ? JSON.parse(interactions) : [];
            
            if (interactionsArray.length === 0) return null;
            
            return (
              <div style={{...styles.detailSection, background: '#fef3c7'}}>
                <h3 style={{color: '#d97706', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center'}}>
                  {/* SVG Иконка предупреждения */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Взаимодействия
                </h3>
                {interactionsArray.map((int, i) => {
                  const drugs = int.drugs || [];
                  const withDrugs = int.with_drugs || [];
                  const hasDrugs = drugs.length > 0 || withDrugs.length > 0;
                  
                  return (
                    <div key={i} style={{margin: '12px 0', padding: '12px', background: 'white', borderRadius: '6px', borderLeft: '4px solid #ef4444'}}>
                      {/* Препараты */}
                      {hasDrugs && (
                        <div style={{marginBottom: '10px', padding: '8px', background: '#f9fafb', borderRadius: '4px'}}>
                          <p style={{margin: '0 0 6px 0', fontSize: '13px', fontWeight: '600', color: '#6b7280'}}>💊 Препараты:</p>
                          <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center'}}>
                            {drugs.map((drug, idx) => (
                              <span key={idx} style={{
                                padding: '4px 10px',
                                background: '#dbeafe',
                                color: '#1e40af',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: '500'
                              }}>
                                {drug}
                              </span>
                            ))}
                            {drugs.length > 0 && withDrugs.length > 0 && (
                              <span style={{color: '#9ca3af', fontSize: '14px'}}>+</span>
                            )}
                            {withDrugs.map((drug, idx) => (
                              <span key={idx} style={{
                                padding: '4px 10px',
                                background: '#fee2e2',
                                color: '#991b1b',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: '500'
                              }}>
                                {drug}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Предупреждение */}
                      <p style={{margin: '8px 0', color: '#92400e', fontWeight: '600', fontSize: '14px'}}>
                        {int.warning || int.type || 'Взаимодействие препаратов'}
                      </p>
                      
                      {/* Серьёзность */}
                      {int.severity && (
                        <p style={{margin: '6px 0', fontSize: '13px'}}>
                          <b>Серьёзность:</b>{' '}
                          <span style={{
                            color: int.severity === 'CRITICAL' ? '#dc2626' :
                                  int.severity === 'HIGH' ? '#ef4444' : '#f59e0b',
                            fontWeight: 'bold'
                          }}>
                            {int.severity === 'CRITICAL' ? '🔴 CRITICAL' :
                             int.severity === 'HIGH' ? '🟠 HIGH' : '🟡 MEDIUM'}
                          </span>
                        </p>
                      )}
                      
                      {/* Рекомендация */}
                      {int.action && (
                        <p style={{margin: '4px 0', fontSize: '13px', color: '#6b7280'}}>
                          <b>Рекомендация:</b> {int.action}
                        </p>
                      )}
                      
                      {/* Альтернатива */}
                      {int.alternative_drugs && int.alternative_drugs.length > 0 && (
                        <p style={{margin: '4px 0', fontSize: '13px', color: '#6b7280'}}>
                          <b>Альтернатива:</b> {int.alternative_drugs.join(', ')}
                        </p>
                      )}
                      
                      {/* Мониторинг */}
                      {int.monitoring && (
                        <p style={{margin: '4px 0', fontSize: '13px', color: '#6b7280'}}>
                          <b>Мониторинг:</b> {int.monitoring}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Изменение рисков */}
          {selectedPatient.risk_change && (
            <div style={{
              ...styles.detailSection,
              background: selectedPatient.risk_change === 'increased' ? '#fee2e2' :
                          selectedPatient.risk_change === 'decreased' ? '#d1fae5' : '#f3f4f6'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                color: selectedPatient.risk_change === 'increased' ? '#dc2626' :
                       selectedPatient.risk_change === 'decreased' ? '#059669' : '#374151'
              }}>
                {/* SVG Иконка графика */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={selectedPatient.risk_change === 'increased' ? '#dc2626' : '#059669'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Изменение рисков
              </h3>
              <p>
                {selectedPatient.risk_change === 'increased' ? '🔺 Риски увеличились' :
                 selectedPatient.risk_change === 'decreased' ? '✅ Риски снизились' :
                 '➡️ Без изменений'}
              </p>
              {selectedPatient.risk_summary && (
                <p style={{marginTop: '8px', fontSize: '14px'}}>{selectedPatient.risk_summary}</p>
              )}
            </div>
          )}

          {/* 🔥 Лабораторные значения (ИСПРАВЛЕНО: безопасный парсинг JSON) */}
          <div style={styles.detailSection}>
            <h3 style={styles.detailSectionTitle}>
              {/* SVG Иконка лаборатории */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                <path d="M9 3h6v2H9z" />
                <path d="M10 5v4l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V5" />
                <line x1="10" y1="13" x2="14" y2="13" />
              </svg>
              Лабораторные значения
            </h3>
            {(() => {
              // ✅ Безопасный парсинг lab_values_json
              let labValues = {};
              try {
                labValues = selectedPatient.lab_values || 
                            (selectedPatient.lab_values_json ? JSON.parse(selectedPatient.lab_values_json) : {});
              } catch (e) {
                console.error('Error parsing lab values:', e);
              }
              
              if (Object.keys(labValues).length === 0) {
                return <p style={{color: '#6b7280'}}>Данные не найдены</p>;
              }

              const categories = {
                '⚡ Электролиты': ['Калий', 'Натрий', 'Хлор', 'Кальций'],
                '🫘 Почечные маркеры': ['Креатинин', 'Мочевина', 'Мочевая кислота'],
                '❤️ Липидный профиль': ['Холестерин общий', 'ЛПНП', 'ЛПВП', 'Триглицериды'],
                '🍬 Углеводный обмен': ['Глюкоза', 'HbA1c'],
                '🩸 Свертывающая система': ['МНО', 'Протромбин', 'Фибриноген'],
                '🔴 Общий анализ крови': ['Гемоглобин', 'Эритроциты', 'Лейкоциты', 'Тромбоциты', 'Гематокрит'],
                '🟡 Печёночные пробы': ['АЛТ', 'АСТ', 'Билирубин общий', 'Билирубин прямой', 'Щелочная фосфатаза'],
                '🔥 Маркеры воспаления': ['СРБ', 'СОЭ'],
                '🦋 Гормоны': ['ТТГ', 'Т4 свободный'],
              };

              const checkValue = (value, norm) => {
                const num = parseFloat(value);
                if (isNaN(num)) return { status: 'unknown', color: '#6b7280' };
                
                const cleanNorm = norm.replace('<', '').replace('>', '').trim();
                const parts = cleanNorm.split('-').map(n => parseFloat(n.trim()));
                const min = parts[0];
                const max = parts[1] !== undefined ? parts[1] : parts[0];
                
                if (!isNaN(min) && !isNaN(max) && min !== max) {
                  if (num < min) return { status: 'low', color: '#f59e0b', icon: '🔻' };
                  if (num > max) return { status: 'high', color: '#ef4444', icon: '🔺' };
                } else if (!isNaN(max) && norm.includes('<')) {
                  if (num > max) return { status: 'high', color: '#ef4444', icon: '🔺' };
                } else if (!isNaN(min) && norm.includes('>')) {
                  if (num < min) return { status: 'low', color: '#f59e0b', icon: '🔻' };
                }
                
                return { status: 'normal', color: '#10b981', icon: '✅' };
              };

              return Object.entries(categories).map(([category, tests]) => {
                const categoryLabs = Object.entries(labValues).filter(([name]) =>
                  tests.some(t => name.includes(t))
                );
                
                if (categoryLabs.length === 0) return null;
                
                return (
                  <div key={category} style={{marginBottom: '20px'}}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#6b7280',
                      marginBottom: '10px',
                      borderBottom: '1px solid #e5e7eb',
                      paddingBottom: '5px'
                    }}>
                      {category}
                    </h4>
                    {categoryLabs.map(([name, data]) => {
                      const check = checkValue(data.value, data.norm);
                      return (
                        <div key={name} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 0',
                          borderBottom: '1px solid #f3f4f6'
                        }}>
                          <span>{name}</span>
                          <span style={{
                            color: check.color,
                            fontWeight: '600',
                            textAlign: 'right'
                          }}>
                            {check.icon} {data.value} {data.unit}
                            <br />
                            <small style={{color: '#9ca3af', fontWeight: '400'}}>
                              норма: {data.norm}
                            </small>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </div>

          {/* Delta-анализ */}
          {selectedPatient.medications_delta?.length > 0 && (
            <div style={styles.detailSection}>
              <h3 style={styles.detailSectionTitle}>
                {/* SVG Иконка графика */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                Изменения в терапии
              </h3>
              <ul style={{margin: '8px 0', paddingLeft: '20px'}}>
                {selectedPatient.medications_delta.map((delta, i) => (
                  <li key={i} style={{margin: '4px 0'}}>
                    {typeof delta === 'string'
                      ? delta
                      : `${delta.action || ''} ${delta.drugs || ''}`.trim() || JSON.stringify(delta)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          {/* SVG Иконка пациентов */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div>
          <h1 style={styles.title}>Пациенты</h1>
          <p style={styles.subtitle}>Управление записями пациентов и просмотр истории</p>
        </div>
      </div>

      <div style={styles.filters}>
        <div style={styles.searchContainer}>
          {/* SVG Иконка поиска */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)'}}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Поиск пациента..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={fetchPatients} style={styles.refreshButton}>
          {/* SVG Иконка обновления */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Обновить
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={styles.loading}>⏳ Загрузка...</p>
      ) : filteredPatients.length === 0 ? (
        <p style={styles.empty}>📭 Пациентов не найдено</p>
      ) : (
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <span style={styles.colName}>Пациент</span>
            <span style={styles.colDateHeader}>Дата визита</span>
            <span style={styles.colStatus}>Статус</span>
          </div>
          {filteredPatients.map((patient) => {
            const badge = getStatusBadge(patient.risk_change);
            return (
              <div
                key={patient.id}
                style={styles.tableRow}
                onClick={() => handlePatientClick(patient)}
              >
                <span style={styles.colName}>
                  <b>{patient.patient_name || patient.filename}</b>
                  <br />
                  <small style={styles.filename}>{patient.filename}</small>
                </span>
                <span style={styles.colDate}>
                  {(() => {
                    const date = patient.created_at || patient.visit_date || patient.date || patient.timestamp;
                    return date ? new Date(date).toLocaleString('ru-RU') : '—';
                  })()}
                </span>
                <span style={styles.colStatus}>
                  <span style={{
                    ...styles.badge,
                    background: badge.background,
                    color: badge.color,
                  }}>
                    {badge.text}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    background: '#f0fdf4',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'white',
    padding: '24px 32px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '24px',
  },
  headerIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    background: 'transparent',
    borderRadius: '10px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '6px',
    margin: '0',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: '0',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  refreshButton: {
    padding: '12px 24px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  error: {
    color: '#ef4444',
    background: '#fee2e2',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#6b7280',
    padding: '40px',
  },
  empty: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#6b7280',
    padding: '40px',
  },
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    background: '#10b981',
    color: 'white',
    padding: '16px 24px',
    fontWeight: '600',
    fontSize: '14px',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    alignItems: 'center',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  filename: {
    color: '#9ca3af',
    fontSize: '12px',
  },
  colName: {
    paddingRight: '16px',
  },
  colDate: {
    color: '#6b7280',
    fontSize: '13px',
  },
  colDateHeader: {
    color: 'white',
    fontSize: '13px',
  },
  colStatus: {},
  badge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'inline-block',
  },
  backButton: {
    background: 'white',
    border: '1px solid #d1d5db',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
  },
  detailCard: {
    background: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
  },
  detailTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '24px',
    margin: '0 0 24px 0',
    display: 'flex',
    alignItems: 'center',
  },
  detailSection: {
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  detailSectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '12px',
    margin: '0 0 12px 0',
    display: 'flex',
    alignItems: 'center',
  },
};

export default Patients;