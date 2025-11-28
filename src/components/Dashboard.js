import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTicketAlt, FaHistory, FaChartBar, FaSignOutAlt, FaBus, FaUser, FaComments } from 'react-icons/fa';
import { getStatistics } from '../services/api';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import ChatAssistant from './ChatAssistant';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadStatistics();
  }, [user.id]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await getStatistics(user.id, today);
      setStats(data || {});
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalTickets = stats?.totalTickets?.count || 0;
  const totalRevenue = parseFloat(stats?.totalRevenue || 0).toFixed(2);

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <FaBus /> {t('loginTitle')}
        </div>
        <div className="nav-right">
          <LanguageSwitcher />
          <div className="nav-user">
            <FaUser /> {user.name || t('notAvailable')}
          </div>
          <button onClick={onLogout} className="btn-logout">
            <FaSignOutAlt /> {t('logout')}
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>{t('welcome')}, {user.name || t('notAvailable')}!</h1>
          <p>
            {t('employeeId')}: {user.employeeId || t('notAvailable')} 
          </p>
        </div>

        <div className="dashboard-cards">
          <Link to="/ticket" className="dashboard-card card-primary">
            <FaTicketAlt className="card-icon" />
            <h2>{t('generateTicket')}</h2>
            <p>{t('createNewTicket')}</p>
          </Link>

          <Link to="/history" className="dashboard-card card-secondary">
            <FaHistory className="card-icon" />
            <h2>{t('ticketHistory')}</h2>
            <p>{t('viewAllTickets')}</p>
          </Link>

          <Link to="/statistics" className="dashboard-card card-success">
            <FaChartBar className="card-icon" />
            <h2>{t('statistics')}</h2>
            <p>{t('viewReports')}</p>
          </Link>
        </div>

        {loading ? (
          <div className="stats-loading">{t('loadingStatistics')}</div>
        ) : (
          <div className="today-stats">
            <h2>{t('todaySummary')}</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{totalTickets}</div>
                <div className="stat-label">{t('ticketsIssued')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">Rs. {totalRevenue}</div>
                <div className="stat-label">{t('totalRevenue')}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Assistant Toggle Button */}
      {!showChat && (
        <button className="chat-toggle-btn" onClick={() => setShowChat(true)}>
          <FaComments /> Chat Assistant
        </button>
      )}

      {/* Chat Assistant Component */}
      {showChat && <ChatAssistant user={user} onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default Dashboard;
