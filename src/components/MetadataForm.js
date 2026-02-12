import React from 'react';
import './MetadataForm.css';

const FIELDS = [
  { key: 'batchNumber', label: 'Номер партии', placeholder: 'KE04012601' },
  { key: 'productVendorCode', label: 'Артикул', placeholder: '163299' },
  { key: 'productionDate', label: 'Дата производства', placeholder: '03.02.2026' },
  { key: 'expirationDate', label: 'Срок годности', placeholder: '26.12.2027' },
  { key: 'productName', label: 'Наименование товара', placeholder: 'RASTISHKA...' },
  { key: 'productGTIN', label: 'Product GTIN', placeholder: '04600605033265' },
  { key: 'palletPrefix', label: 'Код паллета (00 + 14 + тело) или базовый префикс', placeholder: '001402651090009900005' },
  { key: 'boxPrefix', label: 'Префикс коробки', placeholder: '005602551090009900' },
  { key: 'palletStartNumber', label: 'Номер паллета (старт)', type: 'number' },
  { key: 'boxStartNumber', label: 'Номер коробки (старт)', type: 'number' },
];

export function MetadataForm({ meta, onChange, occupiedPallets = [], onFetchPallets, onSelectFirstFree, palletsLoading, palletsError }) {
  const handleChange = (key, value, isNumber) => {
    const v = isNumber ? (value === '' ? '' : Number(value)) : value;
    onChange({ ...meta, [key]: v });
  };

  const hasPalletApi = typeof onFetchPallets === 'function' && typeof onSelectFirstFree === 'function';

  return (
    <section className="metadata-section">
      {hasPalletApi && (
        <div className="metadata-pallets-block">
          <h3 className="metadata-heading">Занятые паллеты</h3>
          <p className="metadata-pallets-desc">
            Список паллет из Planto. Свободный — тот, которого нет в списке.
          </p>
          <div className="metadata-pallets-actions">
            <button
              type="button"
              className="metadata-btn metadata-btn--secondary"
              onClick={onFetchPallets}
              disabled={palletsLoading}
            >
              {palletsLoading ? 'Загрузка…' : 'Обновить список'}
            </button>
            {occupiedPallets.length > 0 && (
              <span className="metadata-pallets-count">
                Загружено: {occupiedPallets.length}
              </span>
            )}
          </div>
          {palletsError && (
            <p className="metadata-pallets-error">{palletsError}</p>
          )}
          {occupiedPallets.length > 0 && (
            <div className="metadata-pallets-list-wrap">
              <p className="metadata-pallets-list-label">Занятые паллеты (code):</p>
              <ul className="metadata-pallets-list">
                {occupiedPallets.map((code) => (
                  <li key={code} className="metadata-pallets-list-item">{code}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <h3 className="metadata-heading">Параметры агрегации</h3>
      <div className="metadata-grid">
        {FIELDS.map(({ key, label, placeholder, type }) => (
          <label key={key} className={`metadata-field ${key === 'palletPrefix' && hasPalletApi ? 'metadata-field--with-action' : ''}`}>
            <span className="metadata-label">{label}</span>
            <div className="metadata-input-wrap">
              <input
                type={type || 'text'}
                className="metadata-input"
                value={meta[key] ?? ''}
                onChange={(e) => handleChange(key, e.target.value, type === 'number')}
                placeholder={placeholder}
              />
              {key === 'palletPrefix' && hasPalletApi && (
                <button
                  type="button"
                  className="metadata-btn metadata-btn--primary metadata-btn--small"
                  onClick={onSelectFirstFree}
                  disabled={palletsLoading}
                  title="Найти первый свободный код паллета (20 символов), которого нет в списке"
                >
                  Выбрать первый свободный
                </button>
              )}
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
