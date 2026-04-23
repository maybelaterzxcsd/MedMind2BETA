import React, { useState } from 'react';
import { authAPI } from '../services/api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authAPI.login(username, password);
      
      if (result.access_token) {
        onLogin(true);
      } else {
        setError('❌ Ошибка входа');
      }
    } catch (err) {
      setError(err.message || 'Неверное имя пользователя или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Логотип */}
        <div style={styles.logo}>
          <span style={styles.logoText}>MedMind</span>
          <span style={styles.logoSub}>2.0</span>
        </div>

        <h1 style={styles.title}>Вход в систему</h1>
        <p style={styles.subtitle}>Система поддержки врачебных решений</p>

        {/* Форма */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Имя пользователя</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="doctor"
              required
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button 
            type="submit" 
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? '⏳ Вход...' : '🚀 Войти'}
          </button>
        </form>

        {/* Демо-учётки */}
        <div style={styles.demo}>
          <p style={styles.demoTitle}>🔑 Демо-учётки:</p>
          <div style={styles.demoItem}>
            <span style={styles.demoUser}>doctor</span>
            <span style={styles.demoPass}>password123</span>
          </div>
          <div style={styles.demoItem}>
            <span style={styles.demoUser}>admin</span>
            <span style={styles.demoPass}>admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e5e7eb',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
  },
  logoSub: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#10b981',
    background: '#d1fae5',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
    margin: '0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '32px',
    margin: '0',
  },
  form: {
    marginBottom: '24px',
  },
  formGroup: {
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
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
  error: {
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  demo: {
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px dashed #d1d5db',
  },
  demoTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '12px',
    margin: '0',
  },
  demoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#374151',
    marginBottom: '6px',
  },
  demoUser: {
    fontWeight: '600',
    color: '#10b981',
  },
  demoPass: {
    color: '#6b7280',
    fontFamily: 'monospace',
  },
};

export default Login;