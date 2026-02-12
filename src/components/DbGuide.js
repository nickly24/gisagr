import React from 'react';
import './DbGuide.css';

const GLOSSARY = [
  { term: 'Планто', def: 'Система прослеживаемости продукции H&N' },
  { term: 'КМ (Код маркировки)', def: 'Цифровой код единицы товара (DataMatrix)' },
  { term: 'КИТУ-К', def: 'Код коробки — агрегирует КМ' },
  { term: 'КИТУ-П / SSCC', def: 'Код паллета — агрегирует коробки' },
  { term: 'MES (Vekas)', def: 'Система производства — присылает отчёты об агрегации' },
  { term: 'L4 (Labeling)', def: 'Система обработки КМ и агрегаций' },
  { term: 'WMS Consid', def: 'Складская система — факт отбора' },
  { term: 'SAP', def: 'ERP — заказы на поставку, УПД' },
  { term: 'ГИС МТ', def: '«Честный знак» — гос. маркировка' },
];

export function DbGuide() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="db-guide">
      <p className="db-guide__intro">
        Анализ структуры БД системы прослеживаемости — как таблицы связаны, откуда приходят данные, для чего используется каждая сущность.
      </p>

      <nav className="db-guide__toc db-guide__card">
        <h3 className="db-guide__toc-title">Содержание</h3>
        <button type="button" className="db-guide__toc-link" onClick={() => scrollTo('glossary')}>Глоссарий</button>
        <button type="button" className="db-guide__toc-link" onClick={() => scrollTo('overview')}>Обзор двух БД</button>
        <button type="button" className="db-guide__toc-link" onClick={() => scrollTo('flows')}>Потоки данных</button>
        <button type="button" className="db-guide__toc-link" onClick={() => scrollTo('shipment-db')}>БД Shipment — таблицы</button>
        <button type="button" className="db-guide__toc-link" onClick={() => scrollTo('aggregation-db')}>БД Aggregation — таблицы</button>
      </nav>

      <section id="glossary" className="db-guide__section">
        <h2 className="db-guide__h2">Глоссарий</h2>
        <div className="db-guide__glossary">
          {GLOSSARY.map(({ term, def }) => (
            <div key={term} className="db-guide__glossary-item">
              <dt className="db-guide__term">{term}</dt>
              <dd className="db-guide__def">{def}</dd>
            </div>
          ))}
        </div>
      </section>

      <section id="overview" className="db-guide__section">
        <h2 className="db-guide__h2">Обзор двух баз данных</h2>
        <p>Система Planto использует <strong>две отдельные PostgreSQL-базы</strong>:</p>
        <div className="db-guide__card">
          <h3 className="db-guide__h3"><span className="db-guide__badge db-guide__badge--shipment">hn_planto_shipment_db</span></h3>
          <p><strong>Отгрузки и заказы.</strong> Сюда приходят заказы из SAP, данные от WMS о факте отбора. Здесь хранятся поставки (shipment_orders), паллеты и коробки, входящие в отгрузку, а также возвраты. Номенклатура (products, product_batches) загружается из SAP.</p>
        </div>
        <div className="db-guide__card">
          <h3 className="db-guide__h3"><span className="db-guide__badge db-guide__badge--aggregation">hn_planto_aggregation_db</span></h3>
          <p><strong>Агрегация.</strong> Сюда попадают отчёты об агрегации из MES: паллета (КИТУ-П) → коробки (КИТУ-К) → марки (КМ). Здесь же — сборочные паллеты при сборке поставки (без WMS или из WMS), десгрегация при возвратах. Статусы агрегатов синхронизируются с ГИС МТ.</p>
        </div>
        <p>Две БД используются разными частями Planto: shipment — для логистики и отгрузок, aggregation — для маркировки и агрегатов. Связь между ними — по номерам заказов, кодам коробок/паллет (КИТУ-К, SSCC).</p>
      </section>

      <section id="flows" className="db-guide__section">
        <h2 className="db-guide__h2">Потоки данных (по ТЗ)</h2>
        <div className="db-guide__card">
          <h3 className="db-guide__h3">Откуда приходят данные</h3>
          <div className="db-guide__flow">
            <span>MES</span><span className="db-guide__arrow">→</span><span>XML отчёт об агрегации</span><span className="db-guide__arrow">→</span><span>Planto (aggregation_db)</span>
          </div>
          <div className="db-guide__flow">
            <span>WMS</span><span className="db-guide__arrow">→</span><span>Шина данных</span><span className="db-guide__arrow">→</span><span>Planto (shipment_db)</span>
          </div>
          <div className="db-guide__flow">
            <span>SAP</span><span className="db-guide__arrow">→</span><span>OUTBOUND_DELIVERY XML</span><span className="db-guide__arrow">→</span><span>Planto (shipment_db)</span>
          </div>
        </div>
        <div className="db-guide__card">
          <h3 className="db-guide__h3">Куда уходят данные</h3>
          <div className="db-guide__flow">
            <span>Planto</span><span className="db-guide__arrow">→</span><span>Агрегаты</span><span className="db-guide__arrow">→</span><span>ГИС МТ (фиксация, трансформация)</span>
          </div>
          <div className="db-guide__flow">
            <span>Planto</span><span className="db-guide__arrow">→</span><span>Собранные отгрузки</span><span className="db-guide__arrow">→</span><span>SAP (УПД)</span>
          </div>
        </div>
      </section>

      <section id="shipment-db" className="db-guide__section">
        <h2 className="db-guide__h2">БД hn_planto_shipment_db — таблицы</h2>
        <h3 className="db-guide__h3">Справочники</h3>
        <TableItem name="products" desc="Номенклатура. Артикул продукта (article). Загружается при обработке заказов из SAP." />
        <TableItem name="product_batches" desc="Партии продукции. Связка продукт + номер партии. Из SAP <Batch>." />
        <TableItem name="departments" desc="Подразделения (склады). Код подразделения. Соответствует <Plant> в SAP." />
        <TableItem name="boxes" desc="Коробки (КИТУ-К). Уникальный код. Создаются при обработке агрегаций или при сборке." />
        <TableItem name="pallets" desc="Паллеты (КИТУ-П, SSCC). Производственные или сборочные." />
        <h3 className="db-guide__h3">Заказы на поставку (из SAP)</h3>
        <TableItem name="shipment_orders" desc="Заказ. order_number = DocumentNumber из SAP, грузополучатель, тип сборки." />
        <TableItem name="shipment_order_positions" desc="Позиции: артикул, партия, количество. Из <PRODUCT>." />
        <TableItem name="shipment_order_states" desc="Жизненный цикл: created → packing → packed → sent_to_sap → dispatched." />
        <h3 className="db-guide__h3">Паллеты и коробки в отгрузке</h3>
        <TableItem name="shipment_pallets" desc="Связь заказ–паллет. is_prod — производственный или сборочный." />
        <TableItem name="shipment_boxes" desc="Коробки на паллете. Данные из WMS или мобильного приложения." />
        <TableItem name="shipment_pallet_state" desc="Статус трансформации: packed → transformation → transformed." />
        <h3 className="db-guide__h3">Возвраты</h3>
        <TableItem name="shipment_returns" desc="Документ возврата. Дата, подразделение." />
        <TableItem name="shipment_return_orders, shipment_return_boxes, shipment_return_pallets" desc="Связь возврат–заказ, коробки и паллеты в возврате." />
        <h3 className="db-guide__h3">Служебные</h3>
        <TableItem name="command_entities" desc="Очередь регламентных заданий (отправка в ГИС, SAP)." />
        <TableItem name="counter_entries, application_settings, lockers" desc="Счётчики, настройки, блокировки." />
      </section>

      <section id="aggregation-db" className="db-guide__section">
        <h2 className="db-guide__h2">БД hn_planto_aggregation_db — таблицы</h2>
        <h3 className="db-guide__h3">Справочники</h3>
        <TableItem name="box" desc="Коробки (КИТУ-К). code, article, batch_number." />
        <TableItem name="pallet" desc="Паллеты. SSCC, is_production." />
        <TableItem name="pallet_boxes" desc="Связь паллет–коробки." />
        <h3 className="db-guide__h3">Агрегация (тип «Исходная» — из MES)</h3>
        <TableItem name="aggregation_pallet" desc="Паллет агрегации. Из MES." />
        <TableItem name="aggregation_box" desc="Коробки на паллете. Из MES." />
        <TableItem name="aggregation_product_unit" desc="КМ в коробке. gtin, serial, mark_id, is_valid." />
        <TableItem name="aggregation_pallet_state, aggregation_box_state" desc="Статусы фиксации в ГИС." />
        <h3 className="db-guide__h3">Сборка поставки (тип «Собранная»)</h3>
        <TableItem name="aggregation_shipment_pallet" desc="Сборочный паллет. WMS или мобильное приложение." />
        <TableItem name="aggregation_shipment_box" desc="Коробки на сборочном паллете." />
        <h3 className="db-guide__h3">Десгрегация (возвраты)</h3>
        <TableItem name="box_disaggregation" desc="Задача десгрегации коробки в ГИС (REMOVING)." />
        <TableItem name="box_marks, box_stocks_entry, pallet_stocks_entry" desc="Связь коробка–марки, учёт остатков." />
        <TableItem name="command_entities, gis_requests" desc="Очередь команд, запросы в ГИС МТ." />
      </section>

      <section className="db-guide__section">
        <h2 className="db-guide__h2">Схема связей</h2>
        <div className="db-guide__card">
          <p><strong>Shipment:</strong> shipment_orders → shipment_order_positions. shipment_orders → shipment_pallets → shipment_boxes. boxes, pallets — справочники. products, product_batches — из SAP.</p>
          <p><strong>Aggregation:</strong> aggregation_pallet → aggregation_box → aggregation_product_unit. aggregation_shipment_* — сборочные паллеты. box_disaggregation — десгрегация.</p>
        </div>
      </section>

      <footer className="db-guide__footer">BD анализ. ТЗ Planto.</footer>
    </div>
  );
}

function TableItem({ name, desc }) {
  return (
    <div className="db-guide__table-item">
      <p className="db-guide__table-name">{name}</p>
      <div className="db-guide__tbl-desc">{desc}</div>
    </div>
  );
}
