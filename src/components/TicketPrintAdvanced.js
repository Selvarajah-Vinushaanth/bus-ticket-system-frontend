import React from 'react';
import { FaBus, FaTicketAlt, FaQrcode } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { useTranslation } from '../hooks/useTranslation';
import './TicketPrintAdvanced.css';

const TicketPrintAdvanced = ({ ticket, user, format: printFormat = 'standard' }) => {
  const { t } = useTranslation();
  
  if (!ticket) return null;

  const passengerTypeLabels = {
    adult: t('adult'),
    child: t('child'),
    student: t('student'),
    senior: t('senior'),
  };

  // Generate QR code data
  const qrData = JSON.stringify({
    ticketNumber: ticket.ticket_number,
    route: ticket.route_number,
    origin: ticket.origin,
    destination: ticket.destination,
    fare: ticket.fare_amount,
    date: ticket.ticket_date,
    conductor: user?.employeeId,
  });

  // Compact format for thermal printers
  if (printFormat === 'compact') {
    return (
      <div className="ticket-compact">
        <div className="compact-header">
          <FaBus className="compact-logo" />
          <div className="compact-title">
            <h3>{t('sriLankaTransport').toUpperCase()}</h3>
            <p>{t('busTicket').toUpperCase()}</p>
          </div>
        </div>
        <div className="compact-body">
          <div className="compact-row">
            <span className="compact-label">{t('ticketNumber').toUpperCase()}:</span>
            <span className="compact-value">{ticket.ticket_number}</span>
          </div>
          <div className="compact-row">
            <span className="compact-label">{t('routeNumber').toUpperCase()}:</span>
            <span className="compact-value">{ticket.route_number}</span>
          </div>
          <div className="compact-row">
            <span className="compact-label">{t('from').toUpperCase()}:</span>
            <span className="compact-value">{ticket.origin}</span>
          </div>
          <div className="compact-row">
            <span className="compact-label">{t('to').toUpperCase()}:</span>
            <span className="compact-value">{ticket.destination}</span>
          </div>
          <div className="compact-row">
            <span className="compact-label">{t('passengerCount').toUpperCase()}:</span>
            <span className="compact-value">{ticket.passenger_count || 1}</span>
          </div>
          <div className="compact-row">
            <span className="compact-label">{t('fare').toUpperCase()}:</span>
            <span className="compact-value fare-bold">Rs. {parseFloat(ticket.fare_amount).toFixed(2)}</span>
          </div>
          <div className="compact-row">
            <span className="compact-label">{t('date').toUpperCase()}:</span>
            <span className="compact-value">{format(new Date(ticket.ticket_date), 'dd/MM/yy HH:mm')}</span>
          </div>
          <div className="compact-qr">
            <QRCodeSVG value={qrData} size={80} level="M" />
          </div>
        </div>
        <div className="compact-footer">
          <p>{t('thankYou')}</p>
        </div>
      </div>
    );
  }

  // Receipt format
  if (printFormat === 'receipt') {
    return (
      <div className="ticket-receipt">
        <div className="receipt-header">
          <FaBus className="receipt-logo" />
          <div>
            <h2>{t('sriLankaTransport')}</h2>
            <p>{t('officialReceipt')}</p>
          </div>
        </div>
        <div className="receipt-body">
          <div className="receipt-section">
            <h4>{t('ticketInformation')}</h4>
            <div className="receipt-row">
              <span>{t('ticketNumber')}:</span>
              <strong>{ticket.ticket_number}</strong>
            </div>
            <div className="receipt-row">
              <span>{t('routeNumber')}:</span>
              <strong>{ticket.route_number}</strong>
            </div>
            <div className="receipt-row">
              <span>{t('journey')}:</span>
              <strong>{ticket.origin} → {ticket.destination}</strong>
            </div>
          </div>

          <div className="receipt-section">
            <h4>{t('passengerDetails')}</h4>
            {ticket.passenger_name && (
              <div className="receipt-row">
                <span>{t('passengerName')}:</span>
                <strong>{ticket.passenger_name}</strong>
              </div>
            )}
            <div className="receipt-row">
              <span>{t('type')}:</span>
              <strong>{passengerTypeLabels[ticket.passenger_type] || ticket.passenger_type}</strong>
            </div>
            {ticket.seat_number && (
              <div className="receipt-row">
                <span>{t('seatNumber')}:</span>
                <strong>{ticket.seat_number}</strong>
              </div>
            )}
            <div className="receipt-row">
              <span>{t('passengerCount')}:</span>
              <strong>{ticket.passenger_count || 1}</strong>
            </div>
          </div>

          <div className="receipt-section">
            <h4>{t('paymentDetails')}</h4>
            <div className="receipt-row">
              <span>{t('paymentMethod')}:</span>
              <strong>{ticket.payment_method.toUpperCase()}</strong>
            </div>
            <div className="receipt-row receipt-total">
              <span>{t('totalAmount')}:</span>
              <strong className="receipt-amount">Rs. {parseFloat(ticket.fare_amount).toFixed(2)}</strong>
            </div>
          </div>

          <div className="receipt-section">
            <h4>{t('transactionDetails')}</h4>
            <div className="receipt-row">
              <span>{t('dateTime')}:</span>
              <strong>{format(new Date(ticket.ticket_date), 'dd MMMM yyyy, hh:mm a')}</strong>
            </div>
            {user && (
              <div className="receipt-row">
                <span>{t('issuedBy')}:</span>
                <strong>{user.name} ({user.employeeId})</strong>
              </div>
            )}
          </div>

          <div className="receipt-qr">
            <QRCodeSVG value={qrData} size={120} level="M" />
            <p>{t('scanToVerify')}</p>
          </div>
        </div>
        <div className="receipt-footer">
          <p>{t('officialReceiptNote')}</p>
          <p>{t('forInquiries')}</p>
        </div>
      </div>
    );
  }

  // Standard format with QR code
  return (
    <div className="ticket-print-advanced">
      <div className="ticket-header-advanced">
        <FaBus className="ticket-logo-advanced" />
        <div className="ticket-title-section">
          <h2>{t('sriLankaTransport')}</h2>
          <p>{t('officialBusTicket')}</p>
        </div>
        <div className="ticket-qr-section">
          <QRCodeSVG value={qrData} size={100} level="M" />
          <p className="qr-label">{t('scanToVerify')}</p>
        </div>
      </div>

      <div className="ticket-body-advanced">
        <div className="ticket-grid">
          <div className="ticket-item">
            <div className="ticket-label-advanced">{t('ticketNumber')}</div>
            <div className="ticket-value-advanced ticket-number-advanced">{ticket.ticket_number}</div>
          </div>

          <div className="ticket-item">
            <div className="ticket-label-advanced">{t('routeNumber')}</div>
            <div className="ticket-value-advanced">{ticket.route_number}</div>
          </div>

          <div className="ticket-item full-width">
            <div className="ticket-label-advanced">{t('journey')}</div>
            <div className="ticket-value-advanced journey-route">
              <span className="origin">{ticket.origin}</span>
              <span className="arrow">→</span>
              <span className="destination">{ticket.destination}</span>
            </div>
          </div>

          {ticket.passenger_name && (
            <div className="ticket-item">
              <div className="ticket-label-advanced">{t('passengerName')}</div>
              <div className="ticket-value-advanced">{ticket.passenger_name}</div>
            </div>
          )}

          <div className="ticket-item">
            <div className="ticket-label-advanced">{t('passengerType')}</div>
            <div className="ticket-value-advanced">
              <span className={`badge-type badge-${ticket.passenger_type}`}>
                {passengerTypeLabels[ticket.passenger_type] || ticket.passenger_type}
              </span>
            </div>
          </div>

          <div className="ticket-item">
            <div className="ticket-label-advanced">{t('passengerCount')}</div>
            <div className="ticket-value-advanced">{ticket.passenger_count || 1}</div>
          </div>

          {ticket.seat_number && (
            <div className="ticket-item">
              <div className="ticket-label-advanced">{t('seatNumber')}</div>
              <div className="ticket-value-advanced seat-badge">{ticket.seat_number}</div>
            </div>
          )}

          <div className="ticket-item">
            <div className="ticket-label-advanced">{t('paymentMethod')}</div>
            <div className="ticket-value-advanced payment-badge">{ticket.payment_method.toUpperCase()}</div>
          </div>

          <div className="ticket-item">
            <div className="ticket-label-advanced">{t('dateTime')}</div>
            <div className="ticket-value-advanced">{format(new Date(ticket.ticket_date), 'dd MMM yyyy, hh:mm a')}</div>
          </div>

          {user && (
            <div className="ticket-item">
              <div className="ticket-label-advanced">{t('conductor')}</div>
              <div className="ticket-value-advanced">{user.name} ({user.employeeId})</div>
            </div>
          )}

          <div className="ticket-item full-width fare-section">
            <div className="ticket-label-advanced">{t('totalFare')}</div>
            <div className="ticket-value-advanced fare-amount-advanced">Rs. {parseFloat(ticket.fare_amount).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="ticket-footer-advanced">
        <FaTicketAlt className="footer-icon" />
        <p className="footer-message">{t('thankYou')}</p>
        <p className="footer-warning">{t('keepTicket')}</p>
        <div className="footer-security">
          <FaQrcode /> <span>{t('qrProtected')}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketPrintAdvanced;

