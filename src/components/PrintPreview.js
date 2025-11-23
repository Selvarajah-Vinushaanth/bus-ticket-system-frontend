import React from 'react';
import { FaTimes } from 'react-icons/fa';
import TicketPrintAdvanced from './TicketPrintAdvanced';
import { useTranslation } from '../hooks/useTranslation';
import './PrintPreview.css';

const PrintPreview = ({ ticket, user, settings, onClose, onPrint }) => {
  const { t } = useTranslation();
  
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  return (
    <div className="print-preview-overlay">
      <div className="print-preview-container">
        <div className="print-preview-header">
          <h2>{t('preview')}</h2>
          <div className="preview-actions">
            <button onClick={handlePrint} className="btn-print-preview">
              {t('print')}
            </button>
            <button onClick={onClose} className="btn-close-preview">
              <FaTimes /> {t('close')}
            </button>
          </div>
        </div>
        <div className="print-preview-content">
          <div className="preview-paper" data-format="standard">
            <TicketPrintAdvanced
              ticket={ticket}
              user={user}
              format="standard"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;

