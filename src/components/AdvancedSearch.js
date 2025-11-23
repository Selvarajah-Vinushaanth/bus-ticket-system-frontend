import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';
import './AdvancedSearch.css';

const AdvancedSearch = ({ onSearch, onReset }) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ticketNumber: '',
    routeNumber: '',
    passengerName: '',
    passengerType: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
    minFare: '',
    maxFare: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      ticketNumber: '',
      routeNumber: '',
      passengerName: '',
      passengerType: '',
      paymentMethod: '',
      dateFrom: '',
      dateTo: '',
      minFare: '',
      maxFare: '',
    });
    if (onReset) onReset();
  };

  return (
    <div className="advanced-search">
      <div className="search-header">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-toggle-filters"
        >
          <FaFilter /> {showFilters ? t('hideAdvancedFilters') : t('showAdvancedFilters')}
        </button>
        <div className="quick-search">
          <input
            type="text"
            placeholder={t('quickSearch')}
            value={filters.ticketNumber}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, ticketNumber: e.target.value }));
              if (e.target.value) {
                onSearch({ ...filters, ticketNumber: e.target.value });
              } else {
                if (onReset) onReset();
              }
            }}
            className="quick-search-input"
          />
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>{t('ticketNumber')}</label>
              <input
                type="text"
                name="ticketNumber"
                value={filters.ticketNumber}
                onChange={handleFilterChange}
                placeholder={t('ticketNumberSearch')}
              />
            </div>

            <div className="filter-group">
              <label>{t('routeNumber')}</label>
              <input
                type="text"
                name="routeNumber"
                value={filters.routeNumber}
                onChange={handleFilterChange}
                placeholder={t('routeNumberSearch')}
              />
            </div>

            <div className="filter-group">
              <label>{t('passengerName')}</label>
              <input
                type="text"
                name="passengerName"
                value={filters.passengerName}
                onChange={handleFilterChange}
                placeholder={t('passengerNameSearch')}
              />
            </div>

            <div className="filter-group">
              <label>{t('passengerType')}</label>
              <select
                name="passengerType"
                value={filters.passengerType}
                onChange={handleFilterChange}
              >
                <option value="">{t('allTypes')}</option>
                <option value="adult">{t('adult')}</option>
                <option value="child">{t('child')}</option>
                <option value="student">{t('student')}</option>
                <option value="senior">{t('senior')}</option>
              </select>
            </div>

            <div className="filter-group">
              <label>{t('paymentMethod')}</label>
              <select
                name="paymentMethod"
                value={filters.paymentMethod}
                onChange={handleFilterChange}
              >
                <option value="">{t('allMethods')}</option>
                <option value="cash">{t('cash')}</option>
                <option value="card">{t('card')}</option>
                <option value="mobile">{t('mobile')}</option>
              </select>
            </div>

            <div className="filter-group">
              <label>{t('dateFrom')}</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>{t('dateTo')}</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>{t('minFare')}</label>
              <input
                type="number"
                name="minFare"
                value={filters.minFare}
                onChange={handleFilterChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label>{t('maxFare')}</label>
              <input
                type="number"
                name="maxFare"
                value={filters.maxFare}
                onChange={handleFilterChange}
                placeholder="10000"
                min="0"
              />
            </div>
          </div>

          <div className="filters-actions">
            <button onClick={handleSearch} className="btn-search">
              <FaSearch /> {t('search')}
            </button>
            <button onClick={handleReset} className="btn-reset">
              <FaTimes /> {t('reset')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

