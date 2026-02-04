import React from 'react';
import './SqlOutput.css';

export function SqlOutput({ sql, onDownload }) {
  const hasContent = sql && sql.length > 0;
  return (
    <section className="sql-output-section">
      <div className="sql-output-header">
        <h3 className="sql-output-heading">Код для выполнения в БД</h3>
        <button
          type="button"
          className="sql-output-download"
          onClick={onDownload}
          disabled={!hasContent}
        >
          Скачать .sql
        </button>
      </div>
      <pre className="sql-output-content">
        {hasContent ? sql : 'Добавьте коды и распределите по коробкам — SQL сгенерируется из тех же кодов (с обрезкой первых 18 символов у serial)'}
      </pre>
    </section>
  );
}
