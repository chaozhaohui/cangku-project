document.addEventListener('DOMContentLoaded', function () {
  renderListTable();

  document.getElementById('pagination')?.addEventListener('change', function (e) {
    if (e.target.id !== 'pageSizeSelect') return;
    const params = new URLSearchParams(location.search);
    const warehouse = (params.get('warehouse') || '').trim();
    const fieldName = (params.get('fieldName') || '').trim();
    const pageSize = parseInt(e.target.value, 10);
    location.href = buildListUrl(1, warehouse, fieldName, pageSize);
  });
});
