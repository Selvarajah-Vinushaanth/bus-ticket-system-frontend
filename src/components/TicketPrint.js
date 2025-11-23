import React from 'react';
import { FaBus, FaTicketAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import './TicketPrint.css';

const TicketPrint = ({ ticket, user }) => {
  if (!ticket) return null;

  const passengerTypeLabels = {
    adult: 'Adult',
    child: 'Child',
    student: 'Student',
    senior: 'Senior Citizen',
  };

  return (
    <div className="ticket-print">
      <div className="ticket-header">
        <FaBus className="ticket-logo" />
        <div>
          <h2>Sri Lanka Transport Board</h2>
          <p>Bus Ticket</p>
        </div>
      </div>

      <div className="ticket-body">
        <div className="ticket-row">
          <div className="ticket-label">Ticket Number:</div>
          <div className="ticket-value ticket-number">{ticket.ticket_number}</div>
        </div>

        <div className="ticket-row">
          <div className="ticket-label">Route:</div>
          <div className="ticket-value">{ticket.route_number}</div>
        </div>

        <div className="ticket-row">
          <div className="ticket-label">From:</div>
          <div className="ticket-value">{ticket.origin}</div>
        </div>

        <div className="ticket-row">
          <div className="ticket-label">To:</div>
          <div className="ticket-value">{ticket.destination}</div>
        </div>

        {ticket.passenger_name && (
          <div className="ticket-row">
            <div className="ticket-label">Passenger:</div>
            <div className="ticket-value">{ticket.passenger_name}</div>
          </div>
        )}

        <div className="ticket-row">
          <div className="ticket-label">Type:</div>
          <div className="ticket-value">{passengerTypeLabels[ticket.passenger_type] || ticket.passenger_type}</div>
        </div>

        {ticket.seat_number && (
          <div className="ticket-row">
            <div className="ticket-label">Seat:</div>
            <div className="ticket-value">{ticket.seat_number}</div>
          </div>
        )}

        <div className="ticket-row">
          <div className="ticket-label">Payment:</div>
          <div className="ticket-value">{ticket.payment_method.toUpperCase()}</div>
        </div>

        <div className="ticket-row ticket-fare">
          <div className="ticket-label">Fare:</div>
          <div className="ticket-value fare-amount">Rs. {parseFloat(ticket.fare_amount).toFixed(2)}</div>
        </div>

        <div className="ticket-row">
          <div className="ticket-label">Date & Time:</div>
          <div className="ticket-value">
            {format(new Date(ticket.ticket_date), 'dd MMM yyyy, hh:mm a')}
          </div>
        </div>

        {user && (
          <div className="ticket-row">
            <div className="ticket-label">Conductor:</div>
            <div className="ticket-value">{user.name} ({user.employeeId})</div>
          </div>
        )}
      </div>

      <div className="ticket-footer">
        <FaTicketAlt />
        <p>Thank you for traveling with us!</p>
        <p className="ticket-warning">Please keep this ticket until the end of your journey</p>
      </div>
    </div>
  );
};

export default TicketPrint;

