/**
 * Генерация SQL UPDATE для таблицы mark (как update_mark_serial.sql).
 * Берёт полные коды (serial), обрезает первые 18 символов, экранирует кавычки для SQL.
 */
const SLICE_FROM = 18; // убираем первые 18 символов

function truncateSerial(fullCode) {
  if (typeof fullCode !== 'string') return '';
  return fullCode.length > SLICE_FROM ? fullCode.slice(SLICE_FROM) : fullCode;
}

function escapeSqlString(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/'/g, "''");
}

/**
 * @param {string[]} productCodes — полные коды (как в агрегации), порядок = порядок в UPDATE
 * @returns {string} SQL скрипт
 */
export function buildUpdateMarkSql(productCodes) {
  if (!productCodes || productCodes.length === 0) return '';

  const values = productCodes.map((code, i) => {
    const truncated = truncateSerial(code);
    const escaped = escapeSqlString(truncated);
    return `(${i + 1}, '${escaped}')`;
  });
  const valuesLine = values.join(',');

  return (
    '-- Обновление serial в таблице mark (БД: labeling_demo)\n' +
    "-- Условия: gtin_id = 405, remains IS NULL, labeling_report IS NULL, control_code <> 'dGVz'\n" +
    '-- В списке у каждого значения убраны первые 18 символов.\n' +
    '-- Порядок строк в таблице: по id (если первичного ключа нет — замените на ctid или другой стабильный порядок).\n\n' +
    'WITH serial_list AS (\n' +
    '  SELECT rn, new_serial FROM (VALUES\n' +
    valuesLine + '\n' +
    '  ) AS t(rn, new_serial)\n' +
    '),\n' +
    'targets AS (\n' +
    '  SELECT id, row_number() OVER (ORDER BY id) AS rn\n' +
    '  FROM mark\n' +
    '  WHERE gtin_id = 405\n' +
    '    AND remains IS NULL\n' +
    '    AND labeling_report IS NULL\n' +
    "    AND control_code <> 'dGVz'\n" +
    ')\n' +
    'UPDATE mark m\n' +
    'SET serial = s.new_serial,\n' +
    "    control_code = 'dGVz',\n" +
    '    status = 5\n' +
    'FROM targets t\n' +
    'JOIN serial_list s ON t.rn = s.rn\n' +
    'WHERE m.id = t.id;'
  );
}
