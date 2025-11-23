import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaPrint, FaFileExport, FaDownload } from 'react-icons/fa';
import { getTickets } from '../services/api';
import { format } from 'date-fns';
import PrintPreview from './PrintPreview';
import AdvancedSearch from './AdvancedSearch';
import { exportTicketsToPDF, exportTicketsToExcel } from '../utils/exportUtils';
import { useTranslation } from '../hooks/useTranslation';
import './TicketHistory.css';

const TicketHistory = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [searchDate, user.id]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getTickets(user.id, searchDate);
      setTickets(data || []);
      setFilteredTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = (filters) => {
    let filtered = [...tickets];

    if (filters.ticketNumber) {
      filtered = filtered.filter(t =>
        t.ticket_number?.toLowerCase().includes(filters.ticketNumber.toLowerCase())
      );
    }
    if (filters.routeNumber) {
      filtered = filtered.filter(t =>
        t.route_number?.includes(filters.routeNumber)
      );
    }
    if (filters.passengerName) {
      filtered = filtered.filter(t =>
        t.passenger_name?.toLowerCase().includes(filters.passengerName.toLowerCase())
      );
    }
    if (filters.passengerType) {
      filtered = filtered.filter(t => t.passenger_type === filters.passengerType);
    }
    if (filters.paymentMethod) {
      filtered = filtered.filter(t => t.payment_method === filters.paymentMethod);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.ticket_date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.ticket_date) <= new Date(filters.dateTo + 'T23:59:59'));
    }
    if (filters.minFare) {
      filtered = filtered.filter(t => (parseFloat(t.fare_amount) || 0) >= parseFloat(filters.minFare));
    }
    if (filters.maxFare) {
      filtered = filtered.filter(t => (parseFloat(t.fare_amount) || 0) <= parseFloat(filters.maxFare));
    }

    setFilteredTickets(filtered);
  };

  const handleResetSearch = () => {
    setFilteredTickets(tickets);
  };

  const handleExportPDF = () => {
    exportTicketsToPDF(filteredTickets, `tickets-${searchDate}`);
  };

  const handleExportExcel = () => {
    exportTicketsToExcel(filteredTickets, `tickets-${searchDate}`);
  };

  const handlePrint = (ticket) => {
    setSelectedTicket(ticket);
    setShowPreview(true);
  };

  const passengerTypeLabels = {
    adult: t('adult'),
    child: t('child'),
    student: t('student'),
    senior: t('senior'),
  };

  const totalRevenue = filteredTickets.reduce((sum, t) => sum + (parseFloat(t.fare_amount) || 0), 0);

  return (
    <div className="ticket-history">
      <div className="ticket-history-nav">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          <FaArrowLeft /> {t('backToDashboard')}
        </button>
      </div>

      <div className="ticket-history-container">
        <div className="ticket-history-header">
          <h1>{t('ticketHistoryTitle')}</h1>
          <div className="header-actions">
            <div className="search-box">
              <FaSearch />
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="export-buttons">
              <button onClick={handleExportPDF} className="btn-export" title={t('exportToPDF')}>
                <FaFileExport /> PDF
              </button>
              <button onClick={handleExportExcel} className="btn-export" title={t('exportToExcel')}>
                <FaDownload /> Excel
              </button>
            </div>
          </div>
        </div>

        <AdvancedSearch onSearch={handleAdvancedSearch} onReset={handleResetSearch} />

        {loading ? (
          <div className="loading">{t('loadingTickets')}</div>
        ) : filteredTickets?.length === 0 ? (
          <div className="no-tickets">
            <p>{t('noTicketsFound')}</p>
          </div>
        ) : (
          <>
            <div className="tickets-summary">
              <div className="summary-card">
                <div className="summary-value">{filteredTickets.length}</div>
                <div className="summary-label">
                  {t('total')} {t('ticketsIssued')} {filteredTickets.length !== tickets.length && `(${t('filtered')})`}
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-value">Rs. {totalRevenue.toFixed(2)}</div>
                <div className="summary-label">{t('totalRevenue')}</div>
              </div>
            </div>

            <div className="tickets-table">
              <table>
                <thead>
                  <tr>
                    <th>{t('ticketNumber')}</th>
                    <th>{t('route')}</th>
                    <th>{t('from')} - {t('to')}</th>
                    <th>{t('passenger')}</th>
                    <th>{t('type')}</th>
                    <th>{t('fare')}</th>
                    <th>{t('dateTime')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets?.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="ticket-number-cell">{ticket.ticket_number || '-'}</td>
                      <td>{ticket.route_number || '-'}</td>
                      <td>{ticket.origin || '-'} → {ticket.destination || '-'}</td>
                      <td>{ticket.passenger_name || t('notAvailable')}</td>
                      <td>
                        <span className={`badge badge-${ticket.passenger_type || 'unknown'}`}>
                          {passengerTypeLabels[ticket.passenger_type] || ticket.passenger_type || t('unknown')}
                        </span>
                      </td>
                      <td className="fare-cell">Rs. {(parseFloat(ticket.fare_amount) || 0).toFixed(2)}</td>
                      <td>{ticket.ticket_date ? format(new Date(ticket.ticket_date), 'dd MMM, hh:mm a') : '-'}</td>
                      <td>
                        <button onClick={() => handlePrint(ticket)} className="btn-print">
                          <FaPrint /> {t('viewPrint')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showPreview && selectedTicket && (
          <PrintPreview
            ticket={selectedTicket}
            user={user}
            settings={{ format: 'standard' }}
            onClose={() => setShowPreview(false)}
            onPrint={() => window.print()}
          />
        )}
      </div>
    </div>
  );
};

export default TicketHistory;
