function toggleFixedOptionsFields() {
  const isFixed = document.getElementById('isFixedOptions');
  if (!isFixed) return;

  const fixedGroup = document.getElementById('group-fixedOptions');
  const defaultGroup = document.getElementById('group-defaultSystemValue');
  const fixedInput = document.getElementById('fixedOptions');
  const defaultInput = document.getElementById('defaultSystemValue');

  const yes = isFixed.value === 'yes';
  fixedGroup.style.display = yes ? '' : 'none';
  defaultGroup.style.display = yes ? 'none' : '';

  fixedInput.disabled = !yes;
  defaultInput.disabled = yes;
}

function onFixedOptionsChange() {
  const isFixed = document.getElementById('isFixedOptions');
  const fixedInput = document.getElementById('fixedOptions');
  const defaultInput = document.getElementById('defaultSystemValue');
  if (!isFixed) return;
  toggleFixedOptionsFields();
  if (isFixed.value === 'yes') {
    defaultInput.value = '';
  } else {
    fixedInput.value = '';
  }
}

function validateFieldType(value, fieldType) {
  if (!value) return true;
  if (fieldType === 'integer') {
    return /^-?\d+$/.test(value.trim());
  }
  if (fieldType === 'datetime') {
    return !isNaN(Date.parse(value.replace(' ', 'T')));
  }
  return true;
}

function validateFormBeforeSave() {
  const fieldType = document.getElementById('fieldType').value;
  const isFixed = document.getElementById('isFixedOptions').value === 'yes';
  const fixedOptions = document.getElementById('fixedOptions').value.trim();
  const defaultVal = document.getElementById('defaultSystemValue').value.trim();

  if (isFixed && !fixedOptions) {
    alert('是否固定选项为「是」时，固定选项必填，多个值用逗号分隔。');
    return false;
  }
  if (!isFixed && defaultVal && !validateFieldType(defaultVal, fieldType)) {
    const hint = fieldType === 'integer' ? '整数' : fieldType === 'datetime' ? '有效时间' : '';
    alert('默认系统取值格式不正确，需为' + hint);
    return false;
  }
  return true;
}

function bindFormLogic(formId, mode, editId) {
  const form = document.getElementById(formId);
  if (!form) return;

  document.getElementById('isFixedOptions')?.addEventListener('change', onFixedOptionsChange);
  toggleFixedOptionsFields();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateFormBeforeSave()) return;

    const data = collectFormData();

    if (mode === 'add') {
      addRecord(data);
      window.location.href = 'index.html';
      return;
    }

    if (mode === 'edit' && editId) {
      updateRecord(editId, data);
      window.location.href = 'index.html';
    }
  });
}
