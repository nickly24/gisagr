import React from 'react';
import './CodeInput.css';

export function CodeInput({ value, onChange, parsedCount }) {
  return (
    <section className="code-input-section">
      <label className="code-input-label">
        Коды товаров
        {parsedCount >= 0 && (
          <span className="code-input-count"> — найдено {parsedCount}</span>
        )}
      </label>
      <textarea
        className="code-input-textarea"
        placeholder="Вставьте коды по одному на строку (строки, начинающиеся с 01 и длиной от 20 символов, будут распознаны как коды)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </section>
  );
}
