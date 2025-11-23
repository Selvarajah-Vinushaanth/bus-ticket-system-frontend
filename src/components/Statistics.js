import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartBar, FaTicketAlt, FaMoneyBillWave, FaRoute, FaFileExport, FaPrint } from 'react-icons/fa';
import { getStatistics } from '../services/api';
import { exportStatisticsToPDF } from '../utils/exportUtils';
import { useTranslation } from '../hooks/useTranslation';
import './Statistics.css';

const Statistics = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadStatistics();
  }, [selectedDate]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await getStatistics(user.id, selectedDate);
      console.log(data);
      

      // Convert API response to plain numbers/arrays for React rendering
      setStats({
        totalTickets: data.totalTickets?.count || 0,      // number
        totalRevenue: data.totalRevenue || 0,      // number
        ticketsByType: Object.entries(data.ticketsByType || {}).map(([type, count]) => ({
          passenger_type: type,
          count
        })),
        ticketsByRoute: Object.entries(data.ticketsByRoute || {}).map(([route, count]) => ({
          route_number: route,
          count
        })),
      });
      
    } catch (error) {
      console.error('Error loading statistics:', error);
      setStats({
        totalTickets: 0,
        totalRevenue: 0,
        ticketsByType: [],
        ticketsByRoute: []
      });
    } finally {
      setLoading(false);
    }
  };

  const passengerTypeLabels = {
    adult: t('adult'),
    child: t('child'),
    student: t('student'),
    senior: t('senior'),
  };

  const handleExportPDF = () => {
    if (stats) exportStatisticsToPDF(stats, selectedDate, `statistics-${selectedDate}`);
  };

  const handlePrint = () => window.print();

  return (
    <div className="statistics">
      <div className="statistics-nav">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          <FaArrowLeft /> {t('backToDashboard')}
        </button>
      </div>

      <div className="statistics-container">
        <div className="statistics-header">
          <h1>
            <FaChartBar /> {t('statisticsTitle')}
          </h1>
          <div className="header-actions-stats">
            <div className="date-filter">
              <label>{t('selectDate')}</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="export-buttons">
              <button onClick={handleExportPDF} className="btn-export" title={t('exportPDF')}>
                <FaFileExport /> {t('exportPDF')}
              </button>
              {/* <button onClick={handlePrint} className="btn-export" title={t('printReport')}>
                <FaPrint /> {t('printReport')}
              </button> */}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">{t('loadingStatistics')}</div>
        ) : (
          <div className="statistics-content">
            <div className="stats-overview">
              <div className="stat-card primary">
                <FaTicketAlt className="stat-icon" />
                <div className="stat-info">
                  <div className="stat-value">{stats.totalTickets}</div>
                  <div className="stat-label">{t('ticketsIssued')}</div>
                </div>
              </div>

              <div className="stat-card success">
                <FaMoneyBillWave className="stat-icon" />
                <div className="stat-info">
                  <div className="stat-value">Rs. {parseFloat(stats.totalRevenue).toFixed(2)}</div>
                  <div className="stat-label">{t('totalRevenue')}</div>
                </div>
              </div>

              {stats.totalTickets > 0 && (
                <div className="stat-card info">
                  <div className="stat-info">
                    <div className="stat-value">
                      Rs. {(parseFloat(stats.totalRevenue) / stats.totalTickets).toFixed(2)}
                    </div>
                    <div className="stat-label">{t('averageFare')}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="stats-details">
              {stats.ticketsByType.length > 0 && (
                <div className="detail-card">
                  <h3>
                    <FaTicketAlt /> {t('ticketsByType')}
                  </h3>
                  <div className="type-stats">
                    {stats.ticketsByType.map(item => (
                      <div key={item.passenger_type} className="type-item">
                        <div className="type-label">{passengerTypeLabels[item.passenger_type] || item.passenger_type}</div>
                        <div className="type-bar">
                          <div
                            className="type-bar-fill"
                            style={{ width: `${(item.count / stats.totalTickets) * 100}%` }}
                          ></div>
                        </div>
                        <div className="type-count">{item.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.ticketsByRoute.length > 0 && (
                <div className="detail-card">
                  <h3>
                    <FaRoute /> {t('ticketsByRoute')}
                  </h3>
                  <div className="route-stats">
                    {stats.ticketsByRoute.map(item => (
                      <div key={item.route_number} className="route-item">
                        <div className="route-info">
                          <div className="route-number">Route {item.route_number}</div>
                          <div className="route-count">{item.count} tickets</div>
                        </div>
                        <div className="route-bar">
                          <div
                            className="route-bar-fill"
                            style={{ width: `${(item.count / stats.totalTickets) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && stats.totalTickets === 0 && (
          <div className="no-data">{t('noStatisticsAvailable')}</div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
