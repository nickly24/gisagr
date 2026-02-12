import React, { useState } from 'react';
import './SqlOutput.css';

export function SqlOutput({ sql, onDownload }) {
  const [copied, setCopied] = useState(false);
  const hasContent = sql && sql.length > 0;

  const handleCopy = async () => {
    if (!hasContent) return;
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="sql-output-section">
      <div className="sql-output-header">
        <h3 className="sql-output-heading">Код для выполнения в БД</h3>
        <div className="sql-output-actions">
          <button
            type="button"
            className="sql-output-copy"
            onClick={handleCopy}
            disabled={!hasContent}
            title="Скопировать текст"
          >
            {copied ? 'Скопировано' : 'Копировать текст'}
          </button>
          <button
            type="button"
            className="sql-output-download"
            onClick={onDownload}
            disabled={!hasContent}
          >
            Скачать .sql
          </button>
        </div>
      </div>
      <pre className="sql-output-content">
        {hasContent ? sql : 'Добавьте коды и распределите по коробкам — SQL сгенерируется из тех же кодов (с обрезкой первых 18 символов у serial)'}
      </pre>
    </section>
  );
}
