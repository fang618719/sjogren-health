// 应用状态
let currentModule = null;
const STORAGE_KEY = 'sjogren_data';
const USER_KEY = 'sjogren_user';

// 预设用户
const VALID_USER = { username: 'pdd', password: '7402' };

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  checkLogin();
});

// 登录检查
function checkLogin() {
  if (sessionStorage.getItem('logged_in')) {
    showPage('main-page');
    renderModules();
  }
}

// 登录处理
function handleLogin() {
  const username = document.getElementById('username-input').value;
  const password = document.getElementById('password-input').value;
  if (!username || !password) {
    alert('请输入用户名和密码');
    return;
  }
  if (username === VALID_USER.username && password === VALID_USER.password) {
    sessionStorage.setItem('logged_in', 'true');
    showPage('main-page');
    renderModules();
  } else {
    alert('用户名或密码错误');
  }
}

// 退出
function handleLogout() {
  sessionStorage.removeItem('logged_in');
  showPage('login-page');
  document.getElementById('pin-input').value = '';
}

// 页面切换
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// 渲染模块列表
function renderModules() {
  const container = document.getElementById('module-list');
  container.innerHTML = MODULES.map(m => `
    <div class="module-item" onclick="openModule('${m.id}')">
      <div class="module-icon">${m.icon}</div>
      <div class="module-name">${m.name}</div>
    </div>
  `).join('');
}

// 打开表单模块
function openModule(moduleId) {
  currentModule = moduleId;
  const formDef = FORM_FIELDS[moduleId];
  if (!formDef) { alert('表单开发中'); return; }
  document.getElementById('form-title').textContent = formDef.title;
  renderForm(formDef);
  showPage('form-page');
}

// 渲染表单
function renderForm(formDef) {
  const container = document.getElementById('form-container');
  const savedData = getData(currentModule) || {};
  let html = '';
  formDef.groups.forEach(group => {
    html += `<div class="form-group"><div class="form-group-title">${group.name}</div>`;
    group.fields.forEach(field => {
      const value = savedData[field.id] || '';
      html += `<div class="form-item"><label class="form-label">${field.label}</label>`;
      if (field.type === 'select') {
        html += `<select class="form-select" data-field="${field.id}">
          <option value="">请选择</option>
          ${field.options.map(o => `<option value="${o}" ${value === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>`;
      } else if (field.type === 'textarea') {
        html += `<textarea class="form-textarea" data-field="${field.id}">${value}</textarea>`;
      } else {
        html += `<input class="form-input" type="${field.type}" data-field="${field.id}" value="${value}">`;
      }
      html += '</div>';
    });
    html += '</div>';
  });
  container.innerHTML = html;
  bindAutoSave();
}

// 返回
function goBack() {
  showPage('main-page');
}

// 保存表单
function saveForm() {
  const data = {};
  document.querySelectorAll('[data-field]').forEach(el => {
    data[el.dataset.field] = el.value;
  });
  data.updateTime = new Date().toISOString();
  setData(currentModule, data);
  alert('保存成功！数据已存储在本地');
}

// 自动保存（输入变化时）
function autoSave() {
  const data = {};
  document.querySelectorAll('[data-field]').forEach(el => {
    data[el.dataset.field] = el.value;
  });
  data.updateTime = new Date().toISOString();
  setData(currentModule, data);
}

// 绑定自动保存
function bindAutoSave() {
  document.querySelectorAll('[data-field]').forEach(el => {
    el.addEventListener('change', autoSave);
  });
}

// 数据存储
function getData(key) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return all[key];
}

function setData(key, value) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  all[key] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// 导出数据
function exportData() {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (Object.keys(all).length === 0) { alert('暂无数据'); return; }
  let csv = '模块,字段,值,更新时间\n';
  Object.keys(all).forEach(module => {
    const moduleData = all[module];
    Object.keys(moduleData).forEach(field => {
      csv += `${module},${field},"${moduleData[field]}",${moduleData.updateTime || ''}\n`;
    });
  });
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `健康数据_${new Date().toLocaleDateString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
