import React, { useState } from 'react';
import './XmlOutput.css';

export function XmlOutput({ xml, onDownload, onSend, batchNumber }) {
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const hasContent = xml && xml.length > 0;

  const handleSend = async () => {
    if (!hasContent || !onSend) return;
    setSending(true);
    setSendError(null);
    try {
      await onSend(xml, batchNumber);
    } catch (err) {
      setSendError(err?.message || 'Ошибка отправки');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="xml-output-section">
      <div className="xml-output-header">
        <h3 className="xml-output-heading">Сгенерированный XML</h3>
        <div className="xml-output-actions">
          <button
            type="button"
            className="xml-output-download"
            onClick={onDownload}
            disabled={!hasContent}
          >
            Скачать
          </button>
          {onSend && (
            <button
              type="button"
              className="xml-output-send"
              onClick={handleSend}
              disabled={!hasContent || sending}
            >
              {sending ? 'Отправка…' : 'Отправить'}
            </button>
          )}
        </div>
      </div>
      {onSend && (
        <p className="xml-output-notice">
          Отправка работает только если вы находитесь внутри сети.
        </p>
      )}
      {sendError && <p className="xml-output-send-error">{sendError}</p>}
      <pre className="xml-output-content">
        {hasContent ? xml : 'Добавьте коды и распределите по коробкам для генерации XML'}
      </pre>
    </section>
  );
}
