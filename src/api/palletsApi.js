/**
 * API паллет Planto — загрузка занятых паллет для выбора свободного номера.
 */

// Относительный URL — идёт через proxy в package.json на 192.168.66.200 (обходит CORS)
const API_BASE = '';
const TOKEN = 'eyJraWQiOiJiN2I3ODFiYS0zYTY2LTQ3ZjEtYjE5MS01N2Y4YjM4YThlMTIiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInByaXZpbGVnZXMiOlsiUkVBRF9PUkRFUiIsIlJFQURfUFJJTlRFUlMiXSwic2Nhbm5lcl9wcml2aWxlZ2VzIjpbIlNDQU5ORVJfUEFMTEVUX1BST0RVQ1RJT04iLCJTQ0FOTkVSX1BBTExFVF9QUklOVCIsIklOVEVSTkFMX0JBVENIX05VTUJFUl9QUklOVCIsIlNDQU5ORVJfT1JERVJfQVNTRU1CTFkiLCJTQ0FOTkVSX1BBTExFVF9RVUFOVElUWV9DT1JSRUNUSU9OIiwiU0NBTk5FUl9QQUxMRVRfUkVDT1ZFUlkiLCJTQ0FOTkVSX0NPTkZJUk1fREVDTEFSQVRJT04iLCJTQ0FOTkVSX1BBTExFVF9XSVRIRFJBV0FMIiwiU0NBTk5FUl9QQUxMRVRfU0VQQVJBVElPTiIsIlNDQU5ORVJfUEFMTEVUX0NIQU5HRV9TVEFUVVMiLCJTQ0FOTkVSX1BBTExFVF9QUklOVCIsIlNDQU5ORVJfUEFMTEVUX1BST0RVQ1RJT04iLCJTQ0FOTkVSX1BBTExFVF9BQ0NFUFRBTkNFIiwiU0NBTk5FUl9QQUxMRVRfTU9WRU1FTlQiLCJJTlRFUk5BTF9CQVRDSF9OVU1CRVJfUFJJTlQiLCJTQ0FOTkVSX1BST0RVQ1RTX1JFRlVORFMiLCJTQ0FOTkVSX1BBTExFVF9QUk9EVUNUSU9OIiwiU0NBTk5FUl9QQUxMRVRfUFJPRFVDVElPTiIsIlNDQU5ORVJfUEFMTEVUX0FDQ0VQVEFOQ0UiLCJTQ0FOTkVSX1BBTExFVF9NT1ZFTUVOVCIsIlNDQU5ORVJfUEFMTEVUX1FVQU5USVRZX0NPUlJFQ1RJT04iLCJTQ0FOTkVSX1BBTExFVF9SRUNPVkVSWSIsIlNDQU5ORVJfUEFMTEVUX1dJVEhEUkFXQUwiLCJTQ0FOTkVSX1BBTExFVF9TRVBBUkFUSU9OIiwiU0NBTk5FUl9QQUxMRVRfQ0hBTkdFX1NUQVRVUyIsIlNDQU5ORVJfUEFMTEVUX1BSSU5UIiwiU0NBTk5FUl9QQUxMRVRfUFJPRFVDVElPTiIsIlNDQU5ORVJfUEFMTEVUX0FDQ0VQVEFOQ0UiLCJTQ0FOTkVSX1BBTExFVF9NT1ZFTUVOVCIsIlNDQU5ORVJfUEFMTEVUX1FVQU5USVRZX0NPUlJFQ1RJT04iLCJTQ0FOTkVSX1BBTExFVF9SRUNPVkVSWSIsIlNDQU5ORVJfUEFMTEVUX1dJVEhEUkFXQUwiLCJTQ0FOTkVSX1BBTExFVF9TRVBBUkFUSU9OIiwiU0NBTk5FUl9QQUxMRVRfQ0hBTkdFX1NUQVRVUyIsIlNDQU5ORVJfUEFMTEVUX1BSSU5UIiwiU0NBTk5FUl9QUklOVF9QTEFOVE8iLCJTQ0FOTkVSX1BST0RVQ1RTX1JFRlVORFMiXSwicm9sZXMiOlsiQURNSU5JU1RSQVRPUiJdLCJpc3MiOiJodHRwOi8vYXV0aGVudGljYXRpb246ODA4MCIsInJvbGVzX2ZpbHRlcnMiOltdLCJhdWQiOiJobi1wcmQtZnJvbnRlbmQtc2VydmljZSIsInNjYW5uZXJfcm9sZXNfZmlsdGVycyI6WyJFbnRpdHlCeURlcGFydG1lbnRGaWx0ZXIiXSwibmJmIjoxNzcwOTE3NTcwLCJ1c2VyX2lkIjoxLCJkZXBhcnRtZW50cyI6WzgsMTAsMTEsMTMsMTQsMTcsMzMsMl0sImV4cCI6MTc3MTAwMzk3MCwic2Nhbm5lcl9yb2xlcyI6WyLQvtC_0LXRgNCw0YLQvtGAINC70LjQvdC40LgiLCLQndCw0Ycg0YHQvNC10L3RiyDQv9GA0L7QuNC3ICIsIlZOVVRSIiwi0J7Qv9C10YDQsNGC0L7RgCDRgdC60LvQsNC00LAiLCJURVNUT3ZheWEgIiwi0JrQvtC90YLRgNC-0LvQtdGAINC60LDRh9C10YHRgtCy0LAiXSwiaWF0IjoxNzcwOTE3NTcwLCJ1c2VyIjoiYWRtaW4iLCJqdGkiOiIyMGE5ZDZjZi02ZjJkLTQ3ZWItYWE0MS03M2ZiMWM1YzJlZmYifQ.d9Pd1Pm72UFnKe4kcKwb5sphFbKCapMEjpfW6UedUWPc74flu1qGzDZyPhQeUoVbWo5M8b9VhMqeCwgDtozLN01l5kHmhx6k7ZskIIiuMwhlJf1uzvWRebJaRLCuxa7gyAN0BBri4QfupIAIt6wsDuCN50Rl-ULPuUE_vmAaFQrWbXTN5zi6ZJvqV0l85LG_P-baI2oqHHrTdWqOYpL9W1ZKXoNqBURijpZ3bJad8Y53S83hUPv5NK64Ts51qMhrkTBYii1I6MEMAGUxCpuNLwd5XAlYlWz7bg6X09KUZAzEFn9uXGqnHSMcr4z-fnMkcnDnwFDyKhyieg1Ii9NNTg';

const BODY = {
  page: 0,
  size: 100,
  searchCriteria: {
    positions: [{ key: 'isDeleted', operation: 'EQUALS', value: false, javaType: 'boolean' }],
  },
  sortingOrder: { sortingPositions: [{ key: 'id', order: 'DESC' }] },
};

/**
 * Извлекает код паллета из элемента ответа (поддержка разных структур API).
 */
function getPalletCode(item) {
  return item?.code ?? item?.sscc ?? item?.palletCode ?? item?.id?.toString?.() ?? '';
}

/**
 * Загружает все паллеты постранично.
 * @returns {Promise<string[]>} массив кодов паллет
 */
export async function fetchAllPallets() {
  const url = `${API_BASE}/bff/planto/api/v1/aggregation/pallets/list`;
  const codes = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ ...BODY, page }),
    });

    if (!res.ok) {
      throw new Error(`Ошибка API: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const content = data?.rows ?? data?.content ?? data?.data ?? data?.items ?? [];
    content.forEach((item) => {
      const code = getPalletCode(item);
      if (code) codes.push(code);
    });

    const totalPages = data?.totalPages ?? data?.total_pages ?? 1;
    page++;
    hasMore = page < totalPages && content.length > 0;
  }

  return codes;
}

/** Референс по длине: 00460255109060226005 = 20 символов, обязательно начинается с 00 */
const REFERENCE_LENGTH = 20;

/**
 * Проверяет, что код паллета подходит под референс (длина 20, начинается с 00).
 */
export function isPalletCodeValid(code) {
  return typeof code === 'string' && code.length === REFERENCE_LENGTH && code.startsWith('00');
}

/**
 * Нормализует префикс: обязательно начинается с 00.
 */
function normalizePrefix(prefix) {
  const s = String(prefix || '').trim();
  return s.startsWith('00') ? s : '00' + s;
}

/**
 * Находит первый свободный полный код паллета (20 символов, 00…).
 * По базовому префиксу перебирает суффиксы, пока не найдёт код, которого нет в usedCodes.
 * @param {string} basePrefix — базовый префикс (напр. 00460255109060226)
 * @param {string[]} usedCodes — коды занятых паллет из API (поле code)
 * @param {number} startFrom — с какого номера начать перебор суффикса
 * @returns {string} полный 20-символьный код (00460255109060226005)
 */
export function findFirstFreePalletCode(basePrefix, usedCodes, startFrom = 1) {
  const p = normalizePrefix(basePrefix);
  if (p.length >= REFERENCE_LENGTH) return p;
  const suffixLen = REFERENCE_LENGTH - p.length;

  const usedSet = new Set(
    usedCodes
      .filter((c) => isPalletCodeValid(c) && c.startsWith(p))
      .map((c) => c.slice(p.length))
  );

  let n = Math.max(1, Math.floor(startFrom));
  while (usedSet.has(String(n).padStart(suffixLen, '0'))) n++;
  const suffix = String(n).padStart(suffixLen, '0');
  return p + suffix;
}

/**
 * Отправляет XML агрегации на сервер Planto.
 * Endpoint: http://192.168.66.200/bff/planto/api/v1/aggregation/pallets/load
 * Работает только внутри сети (через proxy).
 * @param {string} xml — содержимое XML
 * @param {string} filename — имя файла (напр. agr03022601.xml)
 */
export async function uploadAggregationXml(xml, filename) {
  const url = `${API_BASE}/bff/planto/api/v1/aggregation/pallets/load`;
  const formData = new FormData();
  formData.append('filename', filename);
  formData.append('file', new Blob([xml], { type: 'text/xml' }), filename);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'text/plain, text/html, */*',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка отправки: ${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ''}`);
  }

  return res;
}
