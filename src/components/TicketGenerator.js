import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint, FaTicketAlt } from 'react-icons/fa';
import { getRoutes, calculateFare, createTicket } from '../services/api';
import TicketPrintAdvanced from './TicketPrintAdvanced';
import { useTranslation } from '../hooks/useTranslation';
import './TicketGenerator.css';

const TicketGenerator = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [formData, setFormData] = useState({
    routeNumber: '',
    origin: '',
    destination: '',
    passengerName: '',
    passengerType: 'adult',
    passengerCount: 1,
    seatNumber: '',
    paymentMethod: 'cash',
  });
  const [fare, setFare] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const printRef = useRef();

  // Load routes on mount
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const data = await getRoutes();
        setRoutes(data);
        // Pre-select user route if available
        if (user.routeNumber) {
          const route = data.find(r => r.route_number === user.routeNumber);
          setFormData(prev => ({
            ...prev,
            routeNumber: user.routeNumber,
            origin: route?.origin || '',
            destination: route?.destination || ''
          }));
        }
      } catch (err) {
        console.error('Error loading routes:', err);
      }
    };
    loadRoutes();
  }, [user.routeNumber]);

  // Calculate fare when route, origin, destination, or passenger type/count changes
  useEffect(() => {
    const fetchFare = async () => {
      const { routeNumber, origin, destination, passengerType, passengerCount } = formData;
      if (!routeNumber || !origin || !destination) return;

      try {
        const result = await calculateFare(routeNumber, origin, destination, passengerType);
        setFare((result.fare || 0) * (parseInt(passengerCount) || 1));
      } catch (err) {
        console.error('Error calculating fare:', err);
        setFare(0);
      }
    };
    fetchFare();
  }, [formData.routeNumber, formData.origin, formData.destination, formData.passengerType, formData.passengerCount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRouteChange = (e) => {
    const routeNumber = e.target.value;
    const selectedRoute = routes.find(r => r.route_number === routeNumber);
    setFormData(prev => ({
      ...prev,
      routeNumber,
      origin: selectedRoute?.origin || '',
      destination: selectedRoute?.destination || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fare || !formData.routeNumber) return;

    setLoading(true);
    try {
      const ticketData = {
        conductorId: user.id,
        routeNumber: formData.routeNumber,
        origin: formData.origin,
        destination: formData.destination,
        passengerName: formData.passengerName || 'Walk-in Passenger',
        passengerType: formData.passengerType,
        passengerCount: parseInt(formData.passengerCount) || 1,
        fareAmount: fare,
        paymentMethod: formData.paymentMethod,
        seatNumber: formData.seatNumber || null,
      };

      const ticket = await createTicket(ticketData);
      setGeneratedTicket(ticket);
      setShowPrint(true);
    } catch (err) {
      alert('Error generating ticket: ' + 
        (err.response?.data?.error || err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  const handleResetForm = () => {
    setFormData({
      routeNumber: user.routeNumber || '',
      origin: '',
      destination: '',
      passengerName: '',
      passengerType: 'adult',
      passengerCount: 1,
      seatNumber: '',
      paymentMethod: 'cash',
    });
    setFare(0);
    setGeneratedTicket(null);
    setShowPrint(false);
  };

  return (
    <div className="ticket-generator">
      <div className="ticket-generator-nav">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          <FaArrowLeft /> {t('backToDashboard')}
        </button>
      </div>

      <div className="ticket-generator-container">
        <div className="ticket-generator-header">
          <FaTicketAlt className="header-icon" />
          <h1>{t('generateTicket')}</h1>
        </div>

        <div className="ticket-generator-content">
          <form onSubmit={handleSubmit} className="ticket-form card">
            <div className="form-row">
              <div className="input-group">
                <label>{t('routeNumber')} *</label>
                <select
                  name="routeNumber"
                  value={formData.routeNumber}
                  onChange={handleRouteChange}
                  required
                >
                  <option value="">{t('selectRoute')}</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.route_number}>
                      {route.route_number} - {route.origin} to {route.destination}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>{t('origin')} *</label>
                <input type="text" name="origin" value={formData.origin} readOnly />
              </div>

              <div className="input-group">
                <label>{t('destination')} *</label>
                <input type="text" name="destination" value={formData.destination} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>{t('passengerName')}</label>
                <input
                  type="text"
                  name="passengerName"
                  value={formData.passengerName}
                  onChange={handleInputChange}
                  placeholder={t('optional')}
                />
              </div>

              <div className="input-group">
                <label>{t('passengerType')} *</label>
                <select
                  name="passengerType"
                  value={formData.passengerType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="adult">{t('adult')}</option>
                  <option value="child">{t('child')}</option>
                  <option value="student">{t('student')}</option>
                  <option value="senior">{t('senior')}</option>
                </select>
              </div>

              <div className="input-group">
                <label>{t('passengerCount')} *</label>
                <input
                  type="number"
                  name="passengerCount"
                  value={formData.passengerCount}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>{t('seatNumber')}</label>
                <input
                  type="text"
                  name="seatNumber"
                  value={formData.seatNumber}
                  onChange={handleInputChange}
                  placeholder={t('optional')}
                />
              </div>

              <div className="input-group">
                <label>{t('paymentMethod')} *</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="cash">{t('cash')}</option>
                  <option value="card">{t('card')}</option>
                  <option value="mobile">{t('mobile')}</option>
                </select>
              </div>

              <div className="input-group fare-display">
                <label>{t('totalFare')}</label>
                <div className="fare-amount">Rs. {fare.toFixed(2)}</div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-generate"
              disabled={loading || fare === 0 || !formData.routeNumber}
            >
              {loading ? t('generating') : t('generate')}
            </button>
          </form>

          {showPrint && generatedTicket && (
            <div className="ticket-preview-advanced">
              <div ref={printRef} className="ticket-print-wrapper">
                <TicketPrintAdvanced
                  ticket={generatedTicket}
                  user={user}
                  format="standard"
                />
              </div>
              <div className="ticket-actions">
                <button onClick={handlePrint} className="btn btn-success">
                  <FaPrint /> {t('printTicket')}
                </button>
                <button onClick={handleResetForm} className="btn btn-secondary">
                  {t('generateNewTicket')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketGenerator;
