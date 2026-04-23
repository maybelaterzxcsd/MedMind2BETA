import React, { useState } from 'react';
import { analysisAPI } from '../services/api';

function AnalysisResult({ data, onNewAnalysis }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await analysisAPI.downloadPDF(data.filename);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', data.filename.replace('.txt', '.pdf'));
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Ошибка скачивания PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>✅ Анализ завершён!</h2>
          <button onClick={onNewAnalysis} style={styles.newButton}>🔄 Новый анализ</button>
        </div>

        <div style={styles.section}>
          <h3>📋 Файл: {data.filename}</h3>
          <p><b>Размер:</b> {data.size_bytes} байт</p>
        </div>

        {data.entities && data.entities.length > 0 && (
          <div style={styles.section}>
            <h3>🔍 Найденные сущности</h3>
            <div style={styles.tags}>
              {data.entities.map((e, i) => (
                <span key={i} style={styles.tag}>{e.label}: {e.text}</span>
              ))}
            </div>
          </div>
        )}

        {data.drugs && (
          <div style={styles.section}>
            <h3>💊 Препараты</h3>
            <p><b>Принимает:</b> {data.drugs.taken?.join(', ') || '—'}</p>
            <p><b>Отменено:</b> {data.drugs.cancelled?.join(', ') || '—'}</p>
            <p><b>Добавлено:</b> {data.drugs.added?.join(', ') || '—'}</p>
          </div>
        )}

        {data.drugs?.interactions?.length > 0 && (
          <div style={{...styles.section, background: '#fff3f3', borderLeft: '4px solid #ef4444'}}>
            <h3 style={{color: '#ef4444'}}>⚠️ Взаимодействия</h3>
            {data.drugs.interactions.map((int, i) => (
              <div key={i} style={{margin: '12px 0', padding: '12px', background: 'white', borderRadius: '6px', borderLeft: '3px solid #ef4444'}}>
                {/* Препараты */}
                {(int.drugs?.length > 0 || int.with_drugs?.length > 0) && (
                  <div style={{marginBottom: '10px', padding: '8px', background: '#f9fafb', borderRadius: '4px'}}>
                    <p style={{margin: '0 0 6px 0', fontSize: '13px', fontWeight: '600', color: '#6b7280'}}>💊 Препараты:</p>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center'}}>
                      {int.drugs?.map((drug, idx) => (
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
                      {int.drugs?.length > 0 && int.with_drugs?.length > 0 && (
                        <span style={{color: '#9ca3af', fontSize: '14px'}}>+</span>
                      )}
                      {int.with_drugs?.map((drug, idx) => (
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
                
                <p style={{margin: '6px 0', color: '#92400e', fontWeight: '600'}}>
                  {int.warning || int.type || 'Взаимодействие препаратов'}
                </p>
                {int.severity && (
                  <p style={{margin: '4px 0', fontSize: '13px'}}>
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
                {int.action && (
                  <p style={{margin: '4px 0', fontSize: '13px', color: '#6b7280'}}>
                    <b>Рекомендация:</b> {int.action}
                  </p>
                )}
                {int.alternative_drugs && int.alternative_drugs.length > 0 && (
                  <p style={{margin: '4px 0', fontSize: '13px', color: '#6b7280'}}>
                    <b>Альтернатива:</b> {int.alternative_drugs.join(', ')}
                  </p>
                )}
                {int.monitoring && (
                  <p style={{margin: '4px 0', fontSize: '13px', color: '#6b7280'}}>
                    <b>Мониторинг:</b> {int.monitoring}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {data.delta_analysis?.has_history && (
          <div style={styles.section}>
            <h3>📊 Динамика лечения</h3>
            
            {data.delta_analysis.medications_delta && data.delta_analysis.medications_delta.length > 0 && (
              <div style={styles.deltaTable}>
                <div style={styles.deltaHeader}>
                  <span style={styles.deltaColTitle}>Тип изменения</span>
                  <span style={styles.deltaColTitle}>Препараты</span>
                </div>
                {data.delta_analysis.medications_delta.map((delta, i) => (
                  <div key={i} style={{
                    ...styles.deltaRow,
                    background: delta.type === 'added' ? '#f0fdf4' : '#fff1f2'
                  }}>
                    <span style={{
                      ...styles.deltaType,
                      color: delta.type === 'added' ? '#10b981' : '#ef4444'
                    }}>
                      {delta.type === 'added' ? '➕ Добавлено' : '❌ Отменено'}
                    </span>
                    <span style={styles.deltaDrugs}>
                      {delta.drugs?.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <p style={{
              ...styles.riskSummary,
              color: data.delta_analysis.risk_change === 'increased' ? '#ef4444' : 
                     data.delta_analysis.risk_change === 'decreased' ? '#10b981' : '#6b7280'
            }}>
              {data.delta_analysis.risk_change === 'increased' && '⚠️ '}
              {data.delta_analysis.risk_change === 'decreased' && '✅ '}
              {data.delta_analysis.risk_change === 'stable' && '🔹 '}
              {data.delta_analysis.risk_summary}
            </p>
            
            {data.delta_analysis.recommendations && data.delta_analysis.recommendations.length > 0 && (
              <div style={styles.recommendations}>
                <p style={styles.recTitle}>📝 Рекомендации:</p>
                {data.delta_analysis.recommendations.map((rec, i) => (
                  <p key={i} style={styles.rec}>• {rec}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {!data.delta_analysis?.has_history && (
          <div style={styles.section}>
            <h3>📊 Динамика лечения</h3>
            <p style={{color: '#6b7280', fontStyle: 'italic'}}>
              ℹ️ Это первый визит пациента. История отсутствует.
            </p>
          </div>
        )}

        <div style={styles.actions}>
          <button
            onClick={handleDownloadPDF}
            style={styles.pdfButton}
            disabled={downloading}
          >
            {downloading ? '⏳ Скачивание...' : '📥 Скачать PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px', maxWidth: '800px', margin: '0 auto' },
  card: { background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { color: '#10b981', margin: 0 },
  newButton: { background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' },
  section: { marginBottom: '25px', padding: '20px', background: '#f0fdf4', borderRadius: '8px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: { background: '#d1fae5', color: '#059669', padding: '6px 12px', borderRadius: '12px', fontSize: '14px' },
  deltaTable: { marginBottom: '15px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1fae5' },
  deltaHeader: { display: 'grid', gridTemplateColumns: '1fr 2fr', background: '#10b981', color: 'white', padding: '12px', fontWeight: 'bold' },
  deltaColTitle: { padding: '8px' },
  deltaRow: { display: 'grid', gridTemplateColumns: '1fr 2fr', padding: '12px', borderBottom: '1px solid #e5e7eb' },
  deltaType: { padding: '8px', fontWeight: '600' },
  deltaDrugs: { padding: '8px', color: '#374151' },
  riskSummary: { padding: '12px', background: 'white', borderRadius: '6px', fontWeight: '500', marginBottom: '10px' },
  recommendations: { background: 'white', padding: '15px', borderRadius: '6px' },
  recTitle: { fontWeight: 'bold', marginBottom: '8px', color: '#374151' },
  rec: { margin: '5px 0', color: '#6b7280' },
  actions: { textAlign: 'center', marginTop: '30px' },
  pdfButton: { background: '#ef4444', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
};

export default AnalysisResult;