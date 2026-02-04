import React from 'react';
import './MetadataForm.css';

const FIELDS = [
  { key: 'batchNumber', label: 'Номер партии', placeholder: 'KE04012601' },
  { key: 'productVendorCode', label: 'Артикул', placeholder: '163299' },
  { key: 'productionDate', label: 'Дата производства', placeholder: '03.02.2026' },
  { key: 'expirationDate', label: 'Срок годности', placeholder: '26.12.2027' },
  { key: 'productName', label: 'Наименование товара', placeholder: 'RASTISHKA...' },
  { key: 'productGTIN', label: 'Product GTIN', placeholder: '04600605033265' },
  { key: 'palletPrefix', label: 'Префикс паллета', placeholder: '004602551090009900' },
  { key: 'boxPrefix', label: 'Префикс коробки', placeholder: '005602551090009900' },
  { key: 'palletStartNumber', label: 'Номер паллета (старт)', type: 'number' },
  { key: 'boxStartNumber', label: 'Номер коробки (старт)', type: 'number' },
];

export function MetadataForm({ meta, onChange }) {
  const handleChange = (key, value, isNumber) => {
    const v = isNumber ? (value === '' ? '' : Number(value)) : value;
    onChange({ ...meta, [key]: v });
  };

  return (
    <section className="metadata-section">
      <h3 className="metadata-heading">Параметры агрегации</h3>
      <div className="metadata-grid">
        {FIELDS.map(({ key, label, placeholder, type }) => (
          <label key={key} className="metadata-field">
            <span className="metadata-label">{label}</span>
            <input
              type={type || 'text'}
              className="metadata-input"
              value={meta[key] ?? ''}
              onChange={(e) => handleChange(key, e.target.value, type === 'number')}
              placeholder={placeholder}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
