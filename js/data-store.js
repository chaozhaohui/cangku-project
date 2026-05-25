const STORAGE_KEY = 'customFieldList';

const FIELD_TYPE_LABEL = {
  integer: '整数型',
  string: '字符串',
  datetime: '时间格式'
};

const STATUS_LABEL = {
  active: '激活',
  disabled: '禁用'
};

function getSeedRecords() {
  return [
    { id: '1', warehouse: '美西仓', fieldName: '优先级', fieldType: 'integer', isFixed: 'yes', fixedOptions: '1,2,3,5', defaultSystemValue: '', sortOrder: 10, status: 'active', createdBy: '张三', createdAt: '2026-05-20 09:15:00' },
    { id: '2', warehouse: '美西仓', fieldName: '备注说明', fieldType: 'string', isFixed: 'no', fixedOptions: '', defaultSystemValue: '无特殊要求', sortOrder: 20, status: 'active', createdBy: '张三', createdAt: '2026-05-20 09:16:30' },
    { id: '3', warehouse: '欧洲仓', fieldName: '到货日期', fieldType: 'datetime', isFixed: 'no', fixedOptions: '', defaultSystemValue: '2026-05-25', sortOrder: 10, status: 'active', createdBy: '李四', createdAt: '2026-05-21 14:00:00' },
    { id: '4', warehouse: '欧洲仓', fieldName: '运输方式', fieldType: 'string', isFixed: 'yes', fixedOptions: '空运,海运,铁路', defaultSystemValue: '', sortOrder: 20, status: 'disabled', createdBy: '李四', createdAt: '2026-05-21 14:05:00' }
  ];
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = getSeedRecords();
      saveRecords(seed);
      return seed.slice();
    }
    return JSON.parse(raw);
  } catch {
    return getSeedRecords();
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getRecordById(id) {
  return loadRecords().find(r => r.id === String(id)) || null;
}

function nextId(records) {
  const max = records.reduce((n, r) => Math.max(n, parseInt(r.id, 10) || 0), 0);
  return String(max + 1);
}

function formatNow() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function addRecord(data) {
  const records = loadRecords();
  const record = {
    id: nextId(records),
    warehouse: data.warehouse,
    fieldName: data.fieldName,
    fieldType: data.fieldType,
    isFixed: data.isFixed,
    fixedOptions: data.isFixed === 'yes' ? data.fixedOptions : '',
    defaultSystemValue: data.isFixed === 'no' ? data.defaultSystemValue : '',
    sortOrder: Number(data.sortOrder),
    status: data.status,
    createdBy: data.createdBy || '当前用户',
    createdAt: formatNow()
  };
  records.push(record);
  saveRecords(records);
  return record;
}

function updateRecord(id, data) {
  const records = loadRecords();
  const idx = records.findIndex(r => r.id === String(id));
  if (idx < 0) return null;
  records[idx] = {
    ...records[idx],
    warehouse: data.warehouse,
    fieldName: data.fieldName,
    fieldType: data.fieldType,
    isFixed: data.isFixed,
    fixedOptions: data.isFixed === 'yes' ? data.fixedOptions : '',
    defaultSystemValue: data.isFixed === 'no' ? data.defaultSystemValue : '',
    sortOrder: Number(data.sortOrder),
    status: data.status
  };
  saveRecords(records);
  return records[idx];
}

function collectFormData() {
  return {
    warehouse: document.getElementById('warehouse').value,
    fieldName: document.getElementById('fieldName').value.trim(),
    fieldType: document.getElementById('fieldType').value,
    isFixed: document.getElementById('isFixedOptions').value,
    fixedOptions: document.getElementById('fixedOptions').value.trim(),
    defaultSystemValue: document.getElementById('defaultSystemValue').value.trim(),
    sortOrder: document.getElementById('sortOrder').value,
    status: document.getElementById('status').value
  };
}

function fillFormFromRecord(record) {
  document.getElementById('warehouse').value = record.warehouse;
  document.getElementById('fieldName').value = record.fieldName;
  document.getElementById('fieldType').value = record.fieldType;
  document.getElementById('isFixedOptions').value = record.isFixed;
  document.getElementById('fixedOptions').value = record.fixedOptions || '';
  document.getElementById('defaultSystemValue').value = record.defaultSystemValue || '';
  document.getElementById('sortOrder').value = record.sortOrder;
  document.getElementById('status').value = record.status;
  const createdBy = document.getElementById('createdBy');
  const createdAt = document.getElementById('createdAt');
  if (createdBy) createdBy.value = record.createdBy;
  if (createdAt) createdAt.value = record.createdAt;
  toggleFixedOptionsFields();
}

function renderDefaultCell(record) {
  if (record.isFixed === 'yes') {
    return '<td class="text-muted">—</td>';
  }
  const val = record.defaultSystemValue || '';
  return `<td>${val ? escapeHtml(val) : '<span class="text-muted">—</span>'}</td>`;
}

function renderFixedCell(record) {
  if (record.isFixed === 'no') {
    return '<td class="text-muted">—</td>';
  }
  return `<td>${escapeHtml(record.fixedOptions || '')}</td>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderTableRow(record) {
  const statusClass = record.status === 'active' ? 'tag-active' : 'tag-disabled';
  const isFixedLabel = record.isFixed === 'yes' ? '是' : '否';
  return `<tr>
    <td>${escapeHtml(record.warehouse)}</td>
    <td>${escapeHtml(record.fieldName)}</td>
    <td>${FIELD_TYPE_LABEL[record.fieldType] || record.fieldType}</td>
    <td>${isFixedLabel}</td>
    ${renderFixedCell(record)}
    ${renderDefaultCell(record)}
    <td>${record.sortOrder}</td>
    <td><span class="tag ${statusClass}">${STATUS_LABEL[record.status]}</span></td>
    <td>${escapeHtml(record.createdBy)}</td>
    <td>${escapeHtml(record.createdAt)}</td>
    <td><a href="edit.html?id=${record.id}" class="btn-link">修改</a></td>
  </tr>`;
}

function filterRecords(records, warehouse, fieldName) {
  return records.filter(r => {
    if (warehouse && !r.warehouse.includes(warehouse)) return false;
    if (fieldName && !r.fieldName.includes(fieldName)) return false;
    return true;
  });
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

function parsePageSize(params) {
  const n = parseInt(params.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10);
  return PAGE_SIZE_OPTIONS.includes(n) ? n : DEFAULT_PAGE_SIZE;
}

function buildListUrl(page, warehouse, fieldName, pageSize) {
  const p = new URLSearchParams();
  if (warehouse) p.set('warehouse', warehouse);
  if (fieldName) p.set('fieldName', fieldName);
  const size = pageSize || DEFAULT_PAGE_SIZE;
  if (size !== DEFAULT_PAGE_SIZE) p.set('pageSize', String(size));
  if (page > 1) p.set('page', String(page));
  const q = p.toString();
  return 'index.html' + (q ? '?' + q : '');
}

function renderPageSizeSelect(pageSize) {
  const opts = PAGE_SIZE_OPTIONS.map(n =>
    `<option value="${n}"${n === pageSize ? ' selected' : ''}>${n} 条/页</option>`
  ).join('');
  return `
    <label class="page-size-label">
      <span>每页</span>
      <select id="pageSizeSelect" class="page-size-select">${opts}</select>
    </label>
  `;
}

function renderPagination(total, currentPage, warehouse, fieldName, pageSize) {
  const el = document.getElementById('pagination');
  if (!el) return;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(page * pageSize, total);

  let pagesHtml = '';
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - page) > 1) {
      if (i === 3 || i === totalPages - 2) pagesHtml += '<span class="page-ellipsis">...</span>';
      continue;
    }
    const cls = i === page ? 'page-num active' : 'page-num';
    pagesHtml += `<a class="${cls}" href="${buildListUrl(i, warehouse, fieldName, pageSize)}">${i}</a>`;
  }

  const prevDisabled = page <= 1 ? ' disabled' : '';
  const nextDisabled = page >= totalPages ? ' disabled' : '';
  const prevHref = page > 1 ? buildListUrl(page - 1, warehouse, fieldName, pageSize) : 'javascript:void(0)';
  const nextHref = page < totalPages ? buildListUrl(page + 1, warehouse, fieldName, pageSize) : 'javascript:void(0)';

  el.innerHTML = `
    ${renderPageSizeSelect(pageSize)}
    <span class="page-total">共 ${total} 条</span>
    <span class="page-range">${start}-${end}</span>
    <a class="page-btn${prevDisabled}" href="${prevHref}" aria-label="上一页">‹</a>
    ${pagesHtml}
    <a class="page-btn${nextDisabled}" href="${nextHref}" aria-label="下一页">›</a>
  `;
}

function renderListTable() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;

  const params = new URLSearchParams(location.search);
  const warehouse = (params.get('warehouse') || '').trim();
  const fieldName = (params.get('fieldName') || '').trim();
  const pageSize = parsePageSize(params);
  let page = parseInt(params.get('page') || '1', 10);
  if (isNaN(page) || page < 1) page = 1;

  const searchWarehouse = document.querySelector('input[name="warehouse"]');
  const searchFieldName = document.querySelector('input[name="fieldName"]');
  const searchPageSize = document.getElementById('searchPageSize');
  if (searchWarehouse) searchWarehouse.value = warehouse;
  if (searchFieldName) searchFieldName.value = fieldName;
  if (searchPageSize) searchPageSize.value = String(pageSize);

  let records = loadRecords();
  records = filterRecords(records, warehouse, fieldName);
  records.sort((a, b) => a.sortOrder - b.sortOrder || parseInt(a.id, 10) - parseInt(b.id, 10));

  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages) page = totalPages;

  if (total === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="empty">暂无数据</td></tr>';
    renderPagination(0, 1, warehouse, fieldName, pageSize);
    return;
  }

  const pageRecords = records.slice((page - 1) * pageSize, page * pageSize);
  tbody.innerHTML = pageRecords.map(renderTableRow).join('');
  renderPagination(total, page, warehouse, fieldName, pageSize);
}
