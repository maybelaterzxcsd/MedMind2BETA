import React, { useState, useEffect } from 'react';
import { logout } from '../services/api';

function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // Общие настройки
    language: 'ru',
    timezone: 'Europe/Moscow',
    notifications: true,
    // Профиль врача
    doctorName: '',
    specialization: '',
    email: '',
    phone: '',
    // Медицинская организация
    organizationName: 'Университетская клиника',
    department: '',
    address: '',
    licenseNumber: '',
    // Отчёты
    savePath: '',
    autoGeneratePDF: true,
    includePatientPhoto: false,
    // Система
    cacheSize: 'medium',
    dataRetentionDays: 365,
  });

  // Загрузка настроек при открытии
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('medmind_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...settings, ...parsed });
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('medmind_settings', JSON.stringify(settings));
    alert('✅ Все настройки сохранены успешно!');
    setTimeout(() => onClose(), 500);
  };

  const handleClearCache = () => {
    if (confirm('⚠️ Вы уверены? Это очистит все временные данные.')) {
      localStorage.clear();
      localStorage.setItem('medmind_settings', JSON.stringify(settings));
      alert('🗑️ Кэш очищен! Перезагрузите страницу.');
      window.location.reload();
    }
  };

  const handleLogout = () => {
    if (confirm('🚪 Выйти из системы MedMind 2.0?')) {
      logout();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Шапка */}
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.titleContainer}>
              {/* SVG Иконка настроек */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <div>
                <h2 style={styles.modalTitle}>Настройки системы</h2>
                <span style={styles.subtitle}>MedMind 2.0 • v2.0.0</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            {/* SVG Иконка закрытия */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Табы */}
        <div style={styles.tabsContainer}>
          <button
            onClick={() => setActiveTab('general')}
            style={{
              ...styles.tab,
              borderBottom: activeTab === 'general' ? '3px solid #10b981' : 'transparent',
              color: activeTab === 'general' ? '#10b981' : '#6b7280',
              fontWeight: activeTab === 'general' ? '700' : '600',
            }}
          >
            {/* SVG Иконка документа */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Общее
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              ...styles.tab,
              borderBottom: activeTab === 'profile' ? '3px solid #10b981' : 'transparent',
              color: activeTab === 'profile' ? '#10b981' : '#6b7280',
              fontWeight: activeTab === 'profile' ? '700' : '600',
            }}
          >
            {/* SVG Иконка врача */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Профиль врача
          </button>
          <button
            onClick={() => setActiveTab('organization')}
            style={{
              ...styles.tab,
              borderBottom: activeTab === 'organization' ? '3px solid #10b981' : 'transparent',
              color: activeTab === 'organization' ? '#10b981' : '#6b7280',
              fontWeight: activeTab === 'organization' ? '700' : '600',
            }}
          >
            {/* SVG Иконка здания */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            Организация
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            style={{
              ...styles.tab,
              borderBottom: activeTab === 'reports' ? '3px solid #10b981' : 'transparent',
              color: activeTab === 'reports' ? '#10b981' : '#6b7280',
              fontWeight: activeTab === 'reports' ? '700' : '600',
            }}
          >
            {/* SVG Иконка отчёта */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Отчёты
          </button>
          <button
            onClick={() => setActiveTab('system')}
            style={{
              ...styles.tab,
              borderBottom: activeTab === 'system' ? '3px solid #10b981' : 'transparent',
              color: activeTab === 'system' ? '#10b981' : '#6b7280',
              fontWeight: activeTab === 'system' ? '700' : '600',
            }}
          >
            {/* SVG Иконка компьютера */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Система
          </button>
        </div>

        {/* Контент */}
        <div style={styles.modalContent}>
          {/* ОБЩЕЕ */}
          {activeTab === 'general' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Основные параметры</h3>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Язык интерфейса</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  style={styles.select}
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Часовой пояс</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  style={styles.select}
                >
                  <option value="Europe/Moscow">Москва (+3)</option>
                  <option value="Europe/Samara">Самара (+4)</option>
                  <option value="Asia/Yekaterinburg">Екатеринбург (+5)</option>
                  <option value="Asia/Omsk">Омск (+6)</option>
                  <option value="Asia/Krasnoyarsk">Красноярск (+7)</option>
                  <option value="Asia/Irkutsk">Иркутск (+8)</option>
                  <option value="Asia/Vladivostok">Владивосток (+10)</option>
                </select>
              </div>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Уведомления</label>
                <div style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  />
                  <span>{settings.notifications ? 'Включено' : 'Выключено'}</span>
                </div>
              </div>
            </div>
          )}

          {/* ПРОФИЛЬ ВРАЧА */}
          {activeTab === 'profile' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Информация о специалисте</h3>
              <div style={styles.settingGroup}>
                <label style={styles.label}>ФИО врача</label>
                <input
                  type="text"
                  value={settings.doctorName}
                  onChange={(e) => setSettings({...settings, doctorName: e.target.value})}
                  style={styles.input}
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Специализация</label>
                <select
                  value={settings.specialization}
                  onChange={(e) => setSettings({...settings, specialization: e.target.value})}
                  style={styles.select}
                >
                  <option value="">Выберите специализацию...</option>
                  <option value="терапия">Терапия</option>
                  <option value="хирургия">Хирургия</option>
                  <option value="кардиология">Кардиология</option>
                  <option value="неврология">Неврология</option>
                  <option value="педиатрия">Педиатрия</option>
                  <option value="онкология">Онкология</option>
                  <option value="эндокринология">Эндокринология</option>
                  <option value="гастроэнтерология">Гастроэнтерология</option>
                </select>
              </div>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Email для уведомлений</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  style={styles.input}
                  placeholder="doctor@hospital.ru"
                />
              </div>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Номер телефона</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  style={styles.input}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
            </div>
          )}

          {/* ОРГАНИЗАЦИЯ */}
          {activeTab === 'organization' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Данные медицинской организации</h3>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Название МО</label>
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) => setSettings({...settings, organizationName: e.target.value})}
                  style={styles.input}
                  placeholder="Университетская клиника"
                />
              </div>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Отделение / Кабинет</label>
                <input
                  type="text"
                  value={settings.department}
                  onChange={(e) => setSettings({...settings, department: e.target.value})}
                  style={styles.input}
                  placeholder="Терапевтическое отделение №1"
                />
              </div>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Адрес клиники</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  style={styles.input}
                  placeholder="г. Москва, ул. Примерная, д. 1"
                />
              </div>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Лицензионный номер МО</label>
                <input
                  type="text"
                  value={settings.licenseNumber}
                  onChange={(e) => setSettings({...settings, licenseNumber: e.target.value})}
                  style={styles.input}
                  placeholder="Л001-00000-00/000000"
                />
              </div>
            </div>
          )}

          {/* ОТЧЁТЫ */}
          {activeTab === 'reports' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Параметры генерации отчётов</h3>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Папка для сохранения PDF</label>
                <div style={{display: 'flex', gap: '8px'}}>
                  <input
                    type="text"
                    value={settings.savePath}
                    onChange={(e) => setSettings({...settings, savePath: e.target.value})}
                    style={{...styles.input, flex: 1}}
                    placeholder="C:\Users\Doctor\Documents\MedReports"
                  />
                  <button style={styles.browseButton} type="button">
                    {/* SVG Иконка папки */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Автоматическая генерация PDF</label>
                <div style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={settings.autoGeneratePDF}
                    onChange={(e) => setSettings({...settings, autoGeneratePDF: e.target.checked})}
                  />
                  <span>{settings.autoGeneratePDF ? 'Включено' : 'Выключено'}</span>
                </div>
              </div>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Включать фото пациента</label>
                <div style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={settings.includePatientPhoto}
                    onChange={(e) => setSettings({...settings, includePatientPhoto: e.target.checked})}
                  />
                  <span>{settings.includePatientPhoto ? 'Включено' : 'Выключено'}</span>
                </div>
              </div>
            </div>
          )}

          {/* СИСТЕМА */}
          {activeTab === 'system' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Управление данными системы</h3>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Размер кэша</label>
                <select
                  value={settings.cacheSize}
                  onChange={(e) => setSettings({...settings, cacheSize: e.target.value})}
                  style={styles.select}
                >
                  <option value="small">Малый (~100 МБ)</option>
                  <option value="medium">Средний (~500 МБ)</option>
                  <option value="large">Большой (~1 ГБ)</option>
                  <option value="max">Максимальный (~5 ГБ)</option>
                </select>
              </div>
              <div style={styles.settingGroup}>
                <label style={styles.label}>Срок хранения данных (дней)</label>
                <input
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => setSettings({...settings, dataRetentionDays: parseInt(e.target.value)})}
                  style={styles.input}
                  min="30"
                  max="3650"
                />
              </div>
              <div style={styles.divider} />
              {/* Опасные действия */}
              <div style={styles.dangerZone}>
                <h4 style={styles.dangerZoneTitle}>
                  {/* SVG Иконка предупреждения */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Опасные действия
                </h4>
                <div style={styles.dangerItem}>
                  <div style={styles.dangerInfo}>
                    <strong>Очистить кэш системы</strong>
                    <p style={styles.dangerDescription}>Удаляет все временные файлы и локальные данные</p>
                  </div>
                  <button onClick={handleClearCache} style={styles.dangerButton}>Очистить</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Футер */}
        <div style={styles.modalFooter}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            {/* SVG Иконка выхода */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Выйти из системы
          </button>
          <button onClick={handleSave} style={styles.saveButton}>
            {/* SVG Иконка сохранения */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    width: '850px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '2px solid #f1f5f9',
    background: 'linear-gradient(to right, #f0fdf4, white)',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  modalTitle: {
    margin: '0',
    fontSize: '22px',
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    marginLeft: '8px',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    transition: 'color 0.2s',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    display: 'flex',
    gap: '4px',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 24px',
    background: '#f9fafb',
  },
  tab: {
    flex: 1,
    padding: '14px 16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s',
    textAlign: 'center',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    background: '#ffffff',
    maxHeight: '50vh',
  },
  section: {
    marginBottom: '0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '20px',
    margin: '0 0 20px 0',
    paddingBottom: '8px',
    borderBottom: '1px solid #f1f5f9',
  },
  settingGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  toggleSwitch: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(to right, transparent, #e5e7eb, transparent)',
    margin: '24px 0',
  },
  browseButton: {
    padding: '10px 16px',
    background: '#e5e7eb',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerZone: {
    marginTop: '24px',
    padding: '16px',
    background: '#fef2f2',
    borderRadius: '12px',
    border: '1px solid #fecaca',
  },
  dangerZoneTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#dc2626',
    margin: '0 0 12px 0',
    display: 'flex',
    alignItems: 'center',
  },
  dangerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: '16px',
  },
  dangerInfo: {
    flex: 1,
  },
  dangerDescription: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  dangerButton: {
    padding: '8px 16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    background: '#f9fafb',
  },
  saveButton: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
  },
  logoutButton: {
    padding: '12px 24px',
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
  },
};

export default SettingsModal;