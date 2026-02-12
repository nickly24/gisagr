// Генерация XML агрегации по данным из конструктора (как в gen_aggregations.py)

function escapeCdata(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/\]\]>/g, ']]]]><![CDATA[>');
}

function renderProductItem(code) {
  return (
    '\t\t\t\t<Item>\n' +
    '\t\t\t\t\t<Type>Product</Type>\n' +
    `\t\t\t\t\t<Code><![CDATA[${escapeCdata(code)}]]></Code>\n` +
    '\t\t\t\t</Item>'
  );
}

function renderBox(boxCode, productCodes, unitCapacity) {
  const itemsXml = productCodes.map(renderProductItem).join('\n');
  return (
    '\t\t<Item>\n' +
    '\t\t\t<Type>Box</Type>\n' +
    `\t\t\t<Code><![CDATA[${escapeCdata(boxCode)}]]></Code>\n` +
    `\t\t\t<ItemsCount>${productCodes.length}</ItemsCount>\n` +
    `\t\t\t<UnitCapacity>${Math.max(productCodes.length, 2)}</UnitCapacity>\n` +
    '\t\t\t' + itemsXml + '\n' +
    '\t\t</Item>'
  );
}

export function buildAggregationXml(state) {
  const {
    meta,
    palletPrefix,
    boxPrefix,
    palletStartNumber,
    boxStartNumber,
    palletUnitCapacity,
    boxes,
  } = state;

  const prefix = (palletPrefix || '').startsWith('00') ? palletPrefix : '00' + palletPrefix;
  const palletCode =
    prefix.length >= 20
      ? String(prefix).slice(0, 20)
      : prefix + String(palletStartNumber || 1).padStart(Math.max(1, 20 - prefix.length), '0');
  const boxesXml = boxes.map((box, i) => {
    const boxCode = boxPrefix + String(boxStartNumber + i).padStart(3, '0');
    return renderBox(boxCode, box.codes, Math.max(box.codes.length, 2));
  });
  const boxesInner = boxesXml.join('\n\n');

  return (
    '<?xml version="1.0" encoding="utf-8"?>\n' +
    '<Result>\n' +
    `\t<TransactionId>${escapeCdata(meta.transactionId)}</TransactionId>\n` +
    '\t<ReportType>Aggregation</ReportType>\n\n' +
    `\t<BatchNumber>${escapeCdata(meta.batchNumber)}</BatchNumber>\n` +
    `\t<BatchId>${escapeCdata(meta.batchId)}</BatchId>\n` +
    `\t<ReportId>${escapeCdata(meta.reportId)}</ReportId>\n` +
    `\t<DateStart>${escapeCdata(meta.dateStart)}</DateStart>\n` +
    `\t<TimeStart>${escapeCdata(meta.timeStart)}</TimeStart>\n` +
    `\t<DateEnd>${escapeCdata(meta.dateEnd)}</DateEnd>\n` +
    `\t<TimeEnd>${escapeCdata(meta.timeEnd)}</TimeEnd>\n\n` +
    `\t<ProductionLineID>${escapeCdata(meta.productionLineID)}</ProductionLineID>\n` +
    `\t<LineID>${escapeCdata(meta.lineID)}</LineID>\n\n` +
    `\t<PlantID>${escapeCdata(meta.plantID)}</PlantID>\n` +
    `\t<PlantExternalID>${escapeCdata(meta.plantExternalID)}</PlantExternalID>\n\n` +
    `\t<ProductionDate>${escapeCdata(meta.productionDate)}</ProductionDate>\n` +
    `\t<ExpirationDate>${escapeCdata(meta.expirationDate)}</ExpirationDate>\n\n` +
    `\t<ProductGTIN>${escapeCdata(meta.productGTIN)}</ProductGTIN>\n` +
    `\t<BlockGTIN>${escapeCdata(meta.blockGTIN || '')}</BlockGTIN>\n\n` +
    `\t<ProductID>${escapeCdata(meta.productID)}</ProductID>\n` +
    `\t<ProductVendorCode>${escapeCdata(meta.productVendorCode)}</ProductVendorCode>\n` +
    `\t<ProductName>${escapeCdata(meta.productName)}</ProductName>\n\n` +
    '\t<ItemsCount>1</ItemsCount>\n' +
    '\t<Item>\n' +
    '\t\t<Type>Pallet</Type>\n' +
    `\t\t<Code><![CDATA[${escapeCdata(palletCode)}]]></Code>\n` +
    `\t\t<ItemsCount>${boxes.length}</ItemsCount>\n` +
    `\t\t<UnitCapacity>${palletUnitCapacity}</UnitCapacity>\n\n` +
    boxesInner + '\n\n' +
    '\t</Item>\n' +
    '</Result>\n'
  );
}
