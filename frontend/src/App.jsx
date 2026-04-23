import React, { useState, useEffect } from 'react';
import { logout } from './services/api';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Analytics from './pages/Analytics';
import SettingsModal from './components/SettingsModal';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('token_expiry');
    const authenticated = token && (!expiry || Date.now() < parseInt(expiry));
    setIsAuthenticated(!!authenticated);
    setCurrentPage(authenticated ? 'dashboard' : 'login');
    setIsLoading(false);
  }, []);

  const handleLogin = (success) => {
    if (success) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  if (isLoading) return <div>Загрузка...</div>;
  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div style={{display: 'flex', minHeight: '100vh', background: '#f0fdf4'}}>
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      
      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
      
      <div style={{flex: 1, marginLeft: '280px', padding: '30px'}}>
        {currentPage === 'dashboard' && <Dashboard onAnalysisComplete={(data) => console.log('Analysis complete:', data)} />}
        {currentPage === 'patients' && <Patients />}
        {currentPage === 'analytics' && <Analytics />}
      </div>
    </div>
  );
}

export default App;