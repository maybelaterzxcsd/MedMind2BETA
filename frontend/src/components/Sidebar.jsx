// src/components/Sidebar.jsx
import React from 'react';

function Sidebar({ currentPage, setCurrentPage, onSettingsClick }) {
  return (
    <div style={styles.sidebar}>
      {/* Логотип */}
      <div style={styles.logo}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span style={styles.logoText}>MedMind</span>
      </div>

      {/* Навигация */}
      <nav style={styles.nav}>
        {/* Панель управления */}
        <button
          onClick={() => setCurrentPage('dashboard')}
          style={{
            ...styles.navButton,
            background: currentPage === 'dashboard' ? '#d1fae5' : 'transparent',
            color: currentPage === 'dashboard' ? '#10b981' : '#374151',
          }}
        >
          {/* Иконка Dashboard */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={currentPage === 'dashboard' ? '#10b981' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Панель управления</span>
        </button>

        {/* Пациенты */}
        <button
          onClick={() => setCurrentPage('patients')}
          style={{
            ...styles.navButton,
            background: currentPage === 'patients' ? '#d1fae5' : 'transparent',
            color: currentPage === 'patients' ? '#10b981' : '#374151',
          }}
        >
          {/* Иконка Patients */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={currentPage === 'patients' ? '#10b981' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Пациенты</span>
        </button>

        {/* Аналитика */}
        <button
          onClick={() => setCurrentPage('analytics')}
          style={{
            ...styles.navButton,
            background: currentPage === 'analytics' ? '#d1fae5' : 'transparent',
            color: currentPage === 'analytics' ? '#10b981' : '#374151',
          }}
        >
          {/* Иконка Analytics */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={currentPage === 'analytics' ? '#10b981' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span>Аналитика</span>
        </button>
      </nav>

      {/* Кнопка настроек внизу */}
      <div style={styles.settings}>
        <button onClick={onSettingsClick} style={styles.settingsButton}>
          {/* Иконка Settings */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Настройки</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '280px',
    height: '100vh',
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    position: 'fixed',
    left: 0,
    top: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    marginBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  settings: {
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
  },
  settingsButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '14px 16px',
    border: 'none',
    borderRadius: '10px',
    background: 'transparent',
    color: '#6b7280',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
};

export default Sidebar;