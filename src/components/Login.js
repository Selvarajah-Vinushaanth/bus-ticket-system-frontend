import React, { useState } from 'react';
import { FaBus, FaUser, FaLock } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';
import { login } from '../services/api';
import './Login.css';

const Login = ({ onLogin }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const data = await login(username, password); // <-- call your backend URL
      onLogin(data); // save user info in app state
    } catch (err) {
      setError(err.response?.data?.error || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FaBus className="login-icon" />
          <h1>{t('loginTitle')}</h1>
          <p>{t('loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>
              <FaUser /> {t('username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('enterUsername')}
              required
            />
          </div>

          <div className="input-group">
            <label>
              <FaLock /> {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('enterPassword')}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? t('loggingIn') : t('login')}
          </button>

          <div className="login-info">
            <p>{t('defaultCredentials')}</p>
            <p>{t('username')}: <strong>admin</strong> | {t('password')}: <strong>admin123</strong></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

