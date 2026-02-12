import React, { useCallback, useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { UNASSIGNED_ID } from '../constants';
import './Constructor.css';

function DraggableCode({ id, code, sourceId, compact }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { code, sourceId: sourceId ?? id.split('-')[0] },
  });
  const display = compact ? code.slice(-12) : code.length > 40 ? code.slice(0, 20) + '…' + code.slice(-8) : code;
  return (
    <div
      ref={setNodeRef}
      className={`constructor-chip ${isDragging ? 'constructor-chip--dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <span className="constructor-chip-grip" aria-hidden />
      <span className="constructor-chip-code">{display}</span>
    </div>
  );
}

function DroppableZone({ id, children, title, emptyLabel, count }) {
  const { isOver, setNodeRef } = useDroppable({ id, data: { id } });
  return (
    <div
      ref={setNodeRef}
      className={`constructor-zone ${isOver ? 'constructor-zone--over' : ''}`}
      data-zone={id}
    >
      <div className="constructor-zone-header">
        <span className="constructor-zone-title">{title}</span>
        {count >= 0 && <span className="constructor-zone-count">{count}</span>}
      </div>
      <div className="constructor-zone-content">
        {children && children.length > 0 ? (
          children
        ) : (
          <span className="constructor-zone-empty">{emptyLabel}</span>
        )}
      </div>
    </div>
  );
}

function BoxCard({ box, boxIndex, codes, onRemoveBox, renderCode }) {
  return (
    <div className="constructor-box">
      <div className="constructor-box-header">
        <span className="constructor-box-title">Коробка {boxIndex + 1}</span>
        <button
          type="button"
          className="constructor-box-remove"
          onClick={() => onRemoveBox(box.id)}
          title="Удалить коробку"
          aria-label="Удалить коробку"
        >
          ×
        </button>
      </div>
      <DroppableZone
        id={box.id}
        title=""
        emptyLabel="Перетащите коды сюда"
        count={codes.length}
      >
        {codes.map((code) => renderCode(code, box.id))}
      </DroppableZone>
    </div>
  );
}

export function Constructor({
  unassignedCodes,
  boxes,
  onMoveCode,
  onAddBox,
  onRemoveBox,
  onAllInOne,
  onDistribute,
}) {
  const [activeCode, setActiveCode] = useState(null);
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [distributeCount, setDistributeCount] = useState(1);
  const totalToDistribute = unassignedCodes.length;
  const maxBoxes = Math.max(1, totalToDistribute);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveCode(active.data.current?.code ?? null);
  }, []);

  const resolveTargetId = useCallback((overId) => {
    if (overId == null) return null;
    const s = String(overId);
    if (s === UNASSIGNED_ID) return UNASSIGNED_ID;
    if (s.startsWith(UNASSIGNED_ID + '-')) return UNASSIGNED_ID;
    const boxMatch = s.match(/^(box-\d+)/);
    if (boxMatch) return boxMatch[1];
    return overId;
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      setActiveCode(null);
      if (!over) return;
      const code = active.data.current?.code;
      const sourceId = active.data.current?.sourceId;
      const targetId = resolveTargetId(over.id);
      if (code && targetId && sourceId !== targetId) {
        onMoveCode(code, sourceId, targetId);
      }
    },
    [onMoveCode, resolveTargetId]
  );

  const renderCodeInList = useCallback((code, containerId) => {
    return (
      <DraggableCode
        key={code}
        id={`${containerId}-${code}`}
        code={code}
        sourceId={containerId}
        compact={false}
      />
    );
  }, []);

  const handleDistributeOpen = useCallback(() => {
    setDistributeCount(Math.min(maxBoxes, Math.max(1, Math.floor(totalToDistribute / 2) || 1)));
    setDistributeOpen(true);
  }, [maxBoxes, totalToDistribute]);

  const handleDistributeApply = useCallback(() => {
    const n = Math.min(maxBoxes, Math.max(1, distributeCount));
    onDistribute?.(n);
    setDistributeOpen(false);
  }, [distributeCount, maxBoxes, onDistribute]);

  const handleDistributeKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') handleDistributeApply();
      if (e.key === 'Escape') setDistributeOpen(false);
    },
    [handleDistributeApply]
  );

  useEffect(() => {
    if (!distributeOpen) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') setDistributeOpen(false);
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [distributeOpen]);

  return (
    <section className="constructor-section">
      <div className="constructor-toolbar">
        <h3 className="constructor-heading">Конструктор паллета</h3>
        <div className="constructor-actions">
          <button
            type="button"
            className="constructor-btn constructor-btn--primary"
            onClick={onAllInOne}
            disabled={unassignedCodes.length === 0}
          >
            Все в одну коробку
          </button>
          {onDistribute && (
            <button
              type="button"
              className="constructor-btn constructor-btn--primary"
              onClick={handleDistributeOpen}
              disabled={unassignedCodes.length === 0}
            >
              Распределить
            </button>
          )}
          <button
            type="button"
            className="constructor-btn constructor-btn--secondary"
            onClick={onAddBox}
          >
            + Коробка
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="constructor-layout">
          <div className="constructor-unassigned">
            <DroppableZone
              id={UNASSIGNED_ID}
              title="Не распределено"
              emptyLabel="Добавьте коды выше и перетащите в коробки"
              count={unassignedCodes.length}
            >
              {unassignedCodes.map((code) => (
                <DraggableCode
                  key={code}
                  id={`${UNASSIGNED_ID}-${code}`}
                  code={code}
                  sourceId={UNASSIGNED_ID}
                  compact={false}
                />
              ))}
            </DroppableZone>
          </div>

          <div className="constructor-boxes">
            {boxes.length === 0 ? (
              <div className="constructor-boxes-empty">
                Нажмите «+ Коробка» или «Все в одну коробку»
              </div>
            ) : (
              boxes.map((box, idx) => (
                <BoxCard
                  key={box.id}
                  box={box}
                  boxIndex={idx}
                  codes={box.codes}
                  onRemoveBox={onRemoveBox}
                  renderCode={(code) => renderCodeInList(code, box.id)}
                />
              ))
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCode ? (
            <div className="constructor-chip constructor-chip--overlay">
              <span className="constructor-chip-grip" aria-hidden />
              <span className="constructor-chip-code">
                {activeCode.length > 40
                  ? activeCode.slice(0, 20) + '…' + activeCode.slice(-8)
                  : activeCode}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {distributeOpen && (
        <div
          className="constructor-modal-overlay"
          onClick={() => setDistributeOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="distribute-title"
        >
          <div
            className="constructor-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="distribute-title" className="constructor-modal-title">
              Распределить по коробкам
            </h4>
            <p className="constructor-modal-desc">
              Кодов: {totalToDistribute}. Максимум коробок: {maxBoxes} (в каждой — минимум 1 код).
            </p>
            <div className="constructor-modal-field">
              <label htmlFor="distribute-count">Количество коробок:</label>
              <input
                id="distribute-count"
                type="number"
                min={1}
                max={maxBoxes}
                value={distributeCount}
                onChange={(e) =>
                  setDistributeCount(Math.min(maxBoxes, Math.max(1, parseInt(e.target.value, 10) || 1)))
                }
                onKeyDown={handleDistributeKeyDown}
              />
            </div>
            <div className="constructor-modal-actions">
              <button
                type="button"
                className="constructor-btn constructor-btn--secondary"
                onClick={() => setDistributeOpen(false)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="constructor-btn constructor-btn--primary"
                onClick={handleDistributeApply}
              >
                Распределить
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
