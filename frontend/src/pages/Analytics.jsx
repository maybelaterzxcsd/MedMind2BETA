import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Analytics() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalVisits: 0,
    highRisk: 0,
    withInteractions: 0,
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/patients');
      const patientsData = response.data.patients || [];
      setPatients(patientsData);
      
      const totalPatients = new Set(patientsData.map(p => p.patient_name)).size;
      const totalVisits = patientsData.length;
      const highRisk = patientsData.filter(p => p.risk_change === 'increased').length;
      
      const withInteractions = patientsData.filter(p => {
        try {
          const interactions = typeof p.medications_interactions === 'string'
            ? JSON.parse(p.medications_interactions)
            : p.medications_interactions || [];
          return Array.isArray(interactions) && interactions.length > 0;
        } catch {
          return false;
        }
      }).length;

      setStats({ totalPatients, totalVisits, highRisk, withInteractions });
      setError('');
    } catch (err) {
      setError('Ошибка загрузки аналитики: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getDiagnosis = (patient) => {
    if (patient.diagnosis?.trim()) {
      return patient.diagnosis;
    }
    
    try {
      const entities = typeof patient.diagnoses_current === 'string'
        ? JSON.parse(patient.diagnoses_current)
        : patient.diagnoses_current || [];
      
      const result = entities
        .filter(e => (e.label || '').toUpperCase().includes('DIAGN'))
        .map(e => e.text)
        .slice(0, 2)
        .join(', ');
      
      return result || '—';
    } catch (e) {
      console.error('Error parsing diagnosis:', e);
      return '—';
    }
  };

  const getVisitType = (patient, allPatients) => {
    const name = patient.patient_name || patient.filename;
    const count = allPatients.filter(p => (p.patient_name || p.filename) === name).length;
    return count === 1 ? '🆕 Первичный' : '🔁 Повторный';
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get('/api/analytics/export/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medmind_report_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      alert('✅ Отчёт PDF успешно экспортирован!');
    } catch (err) {
      console.error('PDF export error:', err);
      alert('❌ Ошибка экспорта PDF: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleExportExcel = () => {
    try {
      const headers = ['Пациент', 'Диагноз', 'Риски', 'Визит', 'Дата'];
      const rows = patients.map(p => [
        p.patient_name || p.filename,
        getDiagnosis(p),
        p.risk_change === 'increased' ? 'Высокий' : p.risk_change === 'decreased' ? 'Низкий' : 'Средний',
        getVisitType(p, patients) === '🆕 Первичный' ? 'Первичный' : 'Повторный',
        new Date(p.created_at).toLocaleString('ru-RU')
      ]);

      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
      ].join('\n');  

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medmind_analytics_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      alert('✅ Отчёт Excel (CSV) успешно экспортирован!');
    } catch (err) {
      alert('❌ Ошибка экспорта Excel: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <div>
            <h1 style={styles.title}>Аналитика и отчёты</h1>
            <p style={styles.subtitle}>Статистика пациентов и экспорты данных</p>
          </div>
        </div>
        <p style={styles.loading}>⏳ Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <div>
          <h1 style={styles.title}>Аналитика и отчёты</h1>
          <p style={styles.subtitle}>Статистика пациентов и экспорты данных</p>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {/* Карточки статистики */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconContainer}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.totalPatients}</div>
            <div style={styles.statLabel}>Всего пациентов</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconContainer}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.totalVisits}</div>
            <div style={styles.statLabel}>Всего визитов</div>
          </div>
        </div>
        <div style={styles.statCardWarning}>
          <div style={styles.statIconContainer}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div style={styles.statContent}>
            <div style={{...styles.statValue, color: '#f59e0b'}}>{stats.withInteractions}</div>
            <div style={styles.statLabel}>Взаимодействий</div>
          </div>
        </div>
        <div style={styles.statCardDanger}>
          <div style={styles.statIconContainer}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div style={styles.statContent}>
            <div style={{...styles.statValue, color: '#ef4444'}}>{stats.highRisk}</div>
            <div style={styles.statLabel}>Высоких рисков</div>
          </div>
        </div>
      </div>

      {/* Последние пациенты */}
      <div style={styles.recentSection}>
        <h3 style={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle'}}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Последние визиты
        </h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Пациент</th>
                <th style={styles.th}>Диагноз</th>
                <th style={styles.th}>Риски</th>
                <th style={styles.th}>Визит</th>
                <th style={styles.th}>Дата</th>
              </tr>
            </thead>
            <tbody>
              {patients.slice(0, 10).map((patient, index) => (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{patient.patient_name || patient.filename}</strong>
                  </td>
                  <td style={styles.td}>{getDiagnosis(patient)}</td>
                  <td style={styles.td}>
                    {patient.risk_change === 'increased' ? (
                      <span style={styles.badgeDanger}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', verticalAlign: 'middle'}}>
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        Высокий
                      </span>
                    ) : patient.risk_change === 'decreased' ? (
                      <span style={styles.badgeSuccess}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', verticalAlign: 'middle'}}>
                          <polyline points="23 18 13.5 8.5 8.5 13.5 1 21" />
                          <polyline points="17 18 23 18 23 12" />
                        </svg>
                        Низкий
                      </span>
                    ) : (
                      <span style={styles.badgeNeutral}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', verticalAlign: 'middle'}}>
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Средний
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>{getVisitType(patient, patients)}</td>
                  <td style={styles.td}>{new Date(patient.created_at).toLocaleString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Кнопки экспорта */}
      <div style={styles.exportButtons}>
        <button onClick={handleExportPDF} style={styles.exportButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Экспорт PDF
        </button>
        <button onClick={handleExportExcel} style={styles.exportButtonSecondary}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="8 9 12 13 16 9" />
          </svg>
          Экспорт Excel
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', background: '#f8fafc', minHeight: '100vh' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '24px 32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: '0' },
  loading: { fontSize: '16px', color: '#64748b', textAlign: 'center', padding: '40px' },
  error: { background: '#fee2e2', color: '#991b1b', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' },
  statCard: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #10b981' },
  statCardWarning: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #f59e0b' },
  statCardDanger: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #ef4444' },
  statIconContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: '#f0fdf4', borderRadius: '12px' },
  statContent: { display: 'flex', flexDirection: 'column' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#1e293b' },
  statLabel: { fontSize: '13px', color: '#64748b', marginTop: '4px' },
  recentSection: { background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#10b981', marginBottom: '16px', display: 'flex', alignItems: 'center' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },
  th: { textAlign: 'left', padding: '14px 20px', background: '#f8fafc', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '14px 20px', fontSize: '14px', color: '#334155' },
  badgeWarning: { background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center' },
  badgeSuccess: { background: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center' },
  badgeDanger: { background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center' },
  badgeNeutral: { background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center' },
  exportButtons: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  exportButton: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  exportButtonSecondary: { background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' },
};

export default Analytics;