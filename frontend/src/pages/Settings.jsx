import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [doctorProfile, setDoctorProfile] = useState({
    fullName: '',
    specialization: '',
    email: '',
    phone: '',
  });
  const [medicalOrg, setMedicalOrg] = useState({
    name: 'Университетская клиника',
    department: 'Терапевтическое отделение консультативной поликлиники',
  });
  const [savePath, setSavePath] = useState('');
  const [language, setLanguage] = useState('ru');

  useEffect(() => {
    const savedProfile = localStorage.getItem('doctorProfile');
    const savedOrg = localStorage.getItem('medicalOrg');
    const savedPath = localStorage.getItem('savePath');
    const savedLang = localStorage.getItem('language');
    if (savedProfile) setDoctorProfile(JSON.parse(savedProfile));
    if (savedOrg) setMedicalOrg(JSON.parse(savedOrg));
    if (savedPath) setSavePath(savedPath);
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleSave = () => {
    localStorage.setItem('doctorProfile', JSON.stringify(doctorProfile));
    localStorage.setItem('medicalOrg', JSON.stringify(medicalOrg));
    localStorage.setItem('savePath', savePath);
    localStorage.setItem('language', language);
    alert('✅ Настройки сохранены!');
  };

  const handleClearCache = () => {
    const themeValue = localStorage.getItem('theme');
    const profileValue = localStorage.getItem('doctorProfile');
    const orgValue = localStorage.getItem('medicalOrg');
    localStorage.clear();
    if (themeValue) localStorage.setItem('theme', themeValue);
    if (profileValue) localStorage.setItem('doctorProfile', profileValue);
    if (orgValue) localStorage.setItem('medicalOrg', orgValue);
    alert('🗑️ Кэш очищен!');
  };

  const tabs = [
    { id: 'general', label: 'Общее', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )},
    { id: 'profile', label: 'Профиль врача', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )},
    { id: 'organization', label: 'Организация', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    )},
    { id: 'reports', label: 'Отчёты', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )},
    { id: 'system', label: 'Система', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )},
  ];

  return (
    <div style={{
      ...styles.container,
      background: theme === 'dark' ? '#111827' : '#f0fdf4',
    }}>
      {/* Заголовок */}
      <div style={{
        ...styles.header,
        background: theme === 'dark' ? '#1f2937' : 'white',
        border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
      }}>
        <div style={styles.headerContent}>
          {/* SVG Иконка настроек */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <div>
            <h1 style={{
              ...styles.title,
              color: theme === 'dark' ? '#f9fafb' : '#1f2937',
            }}>
              Настройки системы
            </h1>
            <p style={{
              ...styles.subtitle,
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            }}>
              MedMind 2.0 • v2.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Вкладки */}
      <div style={{
        ...styles.tabsContainer,
        background: theme === 'dark' ? '#1f2937' : 'white',
        borderBottom: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabButton,
              borderBottom: activeTab === tab.id ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === tab.id ? '#10b981' : (theme === 'dark' ? '#9ca3af' : '#6b7280'),
              background: activeTab === tab.id ? (theme === 'dark' ? '#1f2937' : 'white') : 'transparent',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Контент вкладок */}
      <div style={styles.content}>
        {/* Профиль врача */}
        {activeTab === 'profile' && (
          <div style={styles.section}>
            <h2 style={{
              ...styles.sectionTitle,
              color: '#10b981',
            }}>
              Информация о специалисте
            </h2>
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: theme === 'dark' ? '#f9fafb' : '#374151',
              }}>ФИО врача:</label>
              <input
                type="text"
                value={doctorProfile.fullName}
                onChange={(e) => setDoctorProfile({...doctorProfile, fullName: e.target.value})}
                style={{
                  ...styles.input,
                  background: theme === 'dark' ? '#374151' : 'white',
                  color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                }}
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: theme === 'dark' ? '#f9fafb' : '#374151',
              }}>Специализация:</label>
              <input
                type="text"
                value={doctorProfile.specialization}
                onChange={(e) => setDoctorProfile({...doctorProfile, specialization: e.target.value})}
                style={{
                  ...styles.input,
                  background: theme === 'dark' ? '#374151' : 'white',
                  color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                }}
                placeholder="терапевт"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: theme === 'dark' ? '#f9fafb' : '#374151',
              }}>Email для уведомлений:</label>
              <input
                type="email"
                value={doctorProfile.email}
                onChange={(e) => setDoctorProfile({...doctorProfile, email: e.target.value})}
                style={{
                  ...styles.input,
                  background: theme === 'dark' ? '#374151' : 'white',
                  color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                }}
                placeholder="doctor@hospital.ru"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: theme === 'dark' ? '#f9fafb' : '#374151',
              }}>Номер телефона:</label>
              <input
                type="tel"
                value={doctorProfile.phone}
                onChange={(e) => setDoctorProfile({...doctorProfile, phone: e.target.value})}
                style={{
                  ...styles.input,
                  background: theme === 'dark' ? '#374151' : 'white',
                  color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                }}
                placeholder="+7 (___) ___-__-__"
              />
            </div>
          </div>
        )}

        {/* Организация */}
        {activeTab === 'organization' && (
          <div style={styles.section}>
            <h2 style={{
              ...styles.sectionTitle,
              color: '#10b981',
            }}>
              Медицинская организация
            </h2>
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: theme === 'dark' ? '#f9fafb' : '#374151',
              }}>Название МО:</label>
              <input
                type="text"
                value={medicalOrg.name}
                onChange={(e) => setMedicalOrg({...medicalOrg, name: e.target.value})}
                style={{
                  ...styles.input,
                  background: theme === 'dark' ? '#374151' : 'white',
                  color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                }}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: theme === 'dark' ? '#f9fafb' : '#374151',
              }}>Отделение:</label>
              <input
                type="text"
                value={medicalOrg.department}
                onChange={(e) => setMedicalOrg({...medicalOrg, department: e.target.value})}
                style={{
                  ...styles.input,
                  background: theme === 'dark' ? '#374151' : 'white',
                  color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                }}
              />
            </div>
          </div>
        )}

        {/* Отчёты */}
        {activeTab === 'reports' && (
          <div style={styles.section}>
            <h2 style={{
              ...styles.sectionTitle,
              color: '#10b981',
            }}>
              Путь сохранения отчётов
            </h2>
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: theme === 'dark' ? '#f9fafb' : '#374151',
              }}>Папка для PDF:</label>
              <input
                type="text"
                value={savePath}
                onChange={(e) => setSavePath(e.target.value)}
                style={{
                  ...styles.input,
                  background: theme === 'dark' ? '#374151' : 'white',
                  color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                }}
                placeholder="C:\MedMind\Reports"
              />
              <p style={{
                ...styles.hint,
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              }}>
                По умолчанию: Загрузки
              </p>
            </div>
          </div>
        )}

        {/* Система */}
        {activeTab === 'system' && (
          <div style={styles.section}>
            <h2 style={{
              ...styles.sectionTitle,
              color: '#10b981',
            }}>
              Системные настройки
            </h2>
            
            {/* Язык */}
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: theme === 'dark' ? '#f9fafb' : '#374151',
              }}>Язык интерфейса:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  ...styles.select,
                  background: theme === 'dark' ? '#374151' : 'white',
                  color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                  border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                }}
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Тема */}
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: theme === 'dark' ? '#f9fafb' : '#374151',
              }}>Тема:</label>
              <div style={styles.themeToggle}>
                <button
                  onClick={() => theme === 'dark' && toggleTheme()}
                  style={{
                    ...styles.themeButton,
                    background: theme === 'light' ? '#10b981' : (theme === 'dark' ? '#374151' : '#f3f4f6'),
                    color: theme === 'light' ? 'white' : (theme === 'dark' ? '#9ca3af' : '#6b7280'),
                    border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  Светлая
                </button>
                <button
                  onClick={() => theme === 'light' && toggleTheme()}
                  style={{
                    ...styles.themeButton,
                    background: theme === 'dark' ? '#10b981' : (theme === 'light' ? '#374151' : '#f3f4f6'),
                    color: theme === 'dark' ? 'white' : (theme === 'light' ? '#9ca3af' : '#6b7280'),
                    border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Тёмная
                </button>
              </div>
            </div>

            {/* Очистка кэша */}
            <button onClick={handleClearCache} style={styles.dangerButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Очистить кэш
            </button>
          </div>
        )}
      </div>

      {/* Кнопки внизу */}
      <div style={styles.footer}>
        <button onClick={() => {}} style={styles.logoutButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Выйти из системы
        </button>
        <button onClick={handleSave} style={styles.saveButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Сохранить настройки
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    minHeight: '100vh',
    transition: 'background 0.3s',
  },
  header: {
    padding: '24px 32px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    transition: 'all 0.3s',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '4px',
    margin: '0',
    transition: 'color 0.3s',
  },
  subtitle: {
    fontSize: '14px',
    margin: '0',
    transition: 'color 0.3s',
  },
  tabsContainer: {
    display: 'flex',
    gap: '0',
    padding: '0 20px',
    marginBottom: '20px',
    borderBottom: '1px solid #e5e7eb',
    transition: 'all 0.3s',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 20px',
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    borderBottom: '3px solid transparent',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  section: {
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px',
    transition: 'all 0.3s',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '24px',
    margin: '0',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    transition: 'color 0.3s',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s',
  },
  select: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s',
  },
  hint: {
    fontSize: '13px',
    marginTop: '6px',
    margin: '6px 0 0 0',
    transition: 'color 0.3s',
  },
  themeToggle: {
    display: 'flex',
    gap: '10px',
  },
  themeButton: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: '800px',
    margin: '32px auto 0',
    gap: '16px',
  },
  logoutButton: {
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  saveButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
  },
};

export default Settings;