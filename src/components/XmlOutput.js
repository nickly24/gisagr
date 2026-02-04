import React from 'react';
import './XmlOutput.css';

export function XmlOutput({ xml, onDownload }) {
  const hasContent = xml && xml.length > 0;
  return (
    <section className="xml-output-section">
      <div className="xml-output-header">
        <h3 className="xml-output-heading">Сгенерированный XML</h3>
        <button
          type="button"
          className="xml-output-download"
          onClick={onDownload}
          disabled={!hasContent}
        >
          Скачать
        </button>
      </div>
      <pre className="xml-output-content">
        {hasContent ? xml : 'Добавьте коды и распределите по коробкам для генерации XML'}
      </pre>
    </section>
  );
}
