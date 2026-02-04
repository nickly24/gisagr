import React, { useCallback, useMemo, useState } from 'react';
import { DEFAULTS, UNASSIGNED_ID } from './constants';
import { parseProductCodes } from './utils/parseCodes';
import { buildAggregationXml } from './utils/xmlBuilder';
import { buildUpdateMarkSql } from './utils/sqlBuilder';
import { CodeInput } from './components/CodeInput';
import { Constructor } from './components/Constructor';
import { MetadataForm } from './components/MetadataForm';
import { XmlOutput } from './components/XmlOutput';
import { SqlOutput } from './components/SqlOutput';
import './App.css';

let boxIdCounter = 0;
function nextBoxId() {
  return `box-${++boxIdCounter}`;
}

const initialMeta = {
  ...DEFAULTS,
  transactionId: DEFAULTS.transactionId,
  batchId: DEFAULTS.batchId,
  reportId: DEFAULTS.reportId,
  batchNumber: DEFAULTS.batchNumber,
  dateStart: DEFAULTS.dateStart,
  timeStart: DEFAULTS.timeStart,
  dateEnd: DEFAULTS.dateEnd,
  timeEnd: DEFAULTS.timeEnd,
  productionLineID: DEFAULTS.productionLineID,
  lineID: DEFAULTS.lineID,
  plantID: DEFAULTS.plantID,
  plantExternalID: DEFAULTS.plantExternalID,
  productionDate: DEFAULTS.productionDate,
  expirationDate: DEFAULTS.expirationDate,
  productGTIN: DEFAULTS.productGTIN,
  blockGTIN: DEFAULTS.blockGTIN,
  productID: DEFAULTS.productID,
  productVendorCode: DEFAULTS.productVendorCode,
  productName: DEFAULTS.productName,
  palletPrefix: DEFAULTS.palletPrefix,
  boxPrefix: DEFAULTS.boxPrefix,
  palletStartNumber: DEFAULTS.palletStartNumber,
  boxStartNumber: DEFAULTS.boxStartNumber,
  palletUnitCapacity: DEFAULTS.palletUnitCapacity,
};

function App() {
  const [codesRaw, setCodesRaw] = useState('');
  const [unassignedCodes, setUnassignedCodes] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [meta, setMeta] = useState(initialMeta);

  const parsedCodes = useMemo(() => parseProductCodes(codesRaw), [codesRaw]);

  const applyParsedCodes = useCallback(() => {
    setUnassignedCodes(parsedCodes);
    setBoxes([]);
  }, [parsedCodes]);

  const handleCodesChange = useCallback((value) => {
    setCodesRaw(value);
    const next = parseProductCodes(value);
    setUnassignedCodes((prev) => {
      const inBoxes = boxes.flatMap((b) => b.codes);
      const kept = prev.filter((c) => next.includes(c));
      const added = next.filter((c) => !prev.includes(c) && !inBoxes.includes(c));
      return [...kept, ...added];
    });
  }, [boxes]);

  const moveCode = useCallback((code, fromId, toId) => {
    if (fromId === toId) return;
    setUnassignedCodes((prev) => {
      if (fromId === UNASSIGNED_ID) return prev.filter((c) => c !== code);
      if (toId === UNASSIGNED_ID) return [...prev, code];
      return prev;
    });
    setBoxes((prev) => {
      const next = prev.map((b) => ({ ...b, codes: [...b.codes] }));
      if (fromId !== UNASSIGNED_ID) {
        const fromBox = next.find((b) => b.id === fromId);
        if (fromBox) fromBox.codes = fromBox.codes.filter((c) => c !== code);
      }
      if (toId !== UNASSIGNED_ID) {
        const toBox = next.find((b) => b.id === toId);
        if (toBox) toBox.codes.push(code);
      }
      return next;
    });
  }, []);

  const addBox = useCallback(() => {
    setBoxes((prev) => [...prev, { id: nextBoxId(), codes: [] }]);
  }, []);

  const removeBox = useCallback((id) => {
    setBoxes((prev) => {
      const box = prev.find((b) => b.id === id);
      if (!box) return prev;
      setUnassignedCodes((u) => [...u, ...box.codes]);
      return prev.filter((b) => b.id !== id);
    });
  }, []);

  const allInOne = useCallback(() => {
    if (unassignedCodes.length === 0) return;
    setBoxes((prev) => [...prev, { id: nextBoxId(), codes: [...unassignedCodes] }]);
    setUnassignedCodes([]);
  }, [unassignedCodes]);

  const xmlState = useMemo(
    () => ({
      meta,
      palletPrefix: meta.palletPrefix ?? DEFAULTS.palletPrefix,
      boxPrefix: meta.boxPrefix ?? DEFAULTS.boxPrefix,
      palletStartNumber: Number(meta.palletStartNumber) || 1,
      boxStartNumber: Number(meta.boxStartNumber) || 1,
      palletUnitCapacity: Number(meta.palletUnitCapacity) || 50,
      boxes,
    }),
    [meta, boxes]
  );

  const generatedXml = useMemo(() => {
    if (boxes.length === 0) return '';
    const totalInBoxes = boxes.reduce((s, b) => s + b.codes.length, 0);
    if (totalInBoxes === 0) return '';
    return buildAggregationXml(xmlState);
  }, [boxes, xmlState]);

  const handleDownload = useCallback(() => {
    if (!generatedXml) return;
    const blob = new Blob([generatedXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aggregation_${meta.batchNumber || 'export'}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedXml, meta.batchNumber]);

  const codesForSql = useMemo(
    () => boxes.flatMap((b) => b.codes),
    [boxes]
  );
  const generatedSql = useMemo(
    () => buildUpdateMarkSql(codesForSql),
    [codesForSql]
  );

  const handleDownloadSql = useCallback(() => {
    if (!generatedSql) return;
    const blob = new Blob([generatedSql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `update_mark_serial_${meta.batchNumber || 'export'}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedSql, meta.batchNumber]);

  const handleMetaChange = useCallback((nextMeta) => {
    setMeta(nextMeta);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Конструктор агрегаций</h1>
        <p className="app-subtitle">Введите коды, распределите по коробкам и скачайте XML</p>
      </header>

      <main className="app-main">
        <div className="app-block">
          <CodeInput
            value={codesRaw}
            onChange={handleCodesChange}
            parsedCount={parsedCodes.length}
          />
          <button
            type="button"
            className="app-apply-codes"
            onClick={applyParsedCodes}
            disabled={parsedCodes.length === 0}
          >
            Применить коды
          </button>
        </div>

        <div className="app-block">
          <Constructor
            unassignedCodes={unassignedCodes}
            boxes={boxes}
            onMoveCode={moveCode}
            onAddBox={addBox}
            onRemoveBox={removeBox}
            onAllInOne={allInOne}
          />
        </div>

        <div className="app-block app-block--meta">
          <MetadataForm meta={meta} onChange={handleMetaChange} />
        </div>

        <div className="app-block">
          <XmlOutput xml={generatedXml} onDownload={handleDownload} />
        </div>

        <div className="app-block">
          <SqlOutput sql={generatedSql} onDownload={handleDownloadSql} />
        </div>
      </main>
    </div>
  );
}

export default App;
