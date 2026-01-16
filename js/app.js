// 应用状态
let currentPatientId = null;
let currentModule = null;
const STORAGE_KEY = 'sjogren_patients';

// 预设用户
const VALID_USER = { username: 'pdd', password: '7402' };

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  checkLogin();
});

// 登录检查
function checkLogin() {
  if (sessionStorage.getItem('logged_in')) {
    showPage('patient-list-page');
    renderPatientList();
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
    showPage('patient-list-page');
    renderPatientList();
  } else {
    alert('用户名或密码错误');
  }
}

// 退出
function handleLogout() {
  sessionStorage.removeItem('logged_in');
  showPage('login-page');
}

// 页面切换
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// 获取所有患者
function getPatients() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

// 保存所有患者
function savePatients(patients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

// 获取单个患者
function getPatient(patientId) {
  const patients = getPatients();
  return patients.find(p => p.id === patientId);
}

// 渲染患者列表
function renderPatientList() {
  const container = document.getElementById('patient-list');
  const patients = getPatients();
  
  if (patients.length === 0) {
    container.innerHTML = `
      <div class="empty-list">
        <div class="empty-list-icon">📋</div>
        <div class="empty-list-text">暂无患者，点击下方按钮添加</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = patients.map(p => {
    const progress = calcProgress(p);
    const lastUpdate = p.lastUpdate ? formatDate(p.lastUpdate) : '未填写';
    return `
      <div class="patient-card" onclick="openPatient('${p.id}')">
        <div class="patient-card-header">
          <span class="patient-id">住院号: ${p.id}</span>
        </div>
        <div class="patient-name">${p.name}</div>
        <div class="patient-card-info">
          <span class="patient-progress">已完成 ${progress}/13 项</span>
          <span class="patient-time">更新: ${lastUpdate}</span>
        </div>
      </div>
    `;
  }).join('');
}

// 计算进度
function calcProgress(patient) {
  let count = 0;
  MODULES.forEach(m => {
    if (patient.data && patient.data[m.id] && Object.keys(patient.data[m.id]).length > 1) {
      count++;
    }
  });
  return count;
}

// 格式化日期
function formatDate(isoStr) {
  const d = new Date(isoStr);
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// 显示添加患者弹窗
function showAddPatient() {
  document.getElementById('add-patient-modal').classList.add('active');
  document.getElementById('new-patient-id').value = '';
  document.getElementById('new-patient-name').value = '';
}

// 隐藏添加患者弹窗
function hideAddPatient() {
  document.getElementById('add-patient-modal').classList.remove('active');
}

// 添加患者
function addPatient() {
  const id = document.getElementById('new-patient-id').value.trim();
  const name = document.getElementById('new-patient-name').value.trim();
  if (!id || !name) {
    alert('请填写住院号和姓名');
    return;
  }
  const patients = getPatients();
  if (patients.find(p => p.id === id)) {
    alert('该住院号已存在');
    return;
  }
  patients.push({ id, name, data: {}, createTime: new Date().toISOString() });
  savePatients(patients);
  hideAddPatient();
  renderPatientList();
}

// 打开患者详情
function openPatient(patientId) {
  currentPatientId = patientId;
  const patient = getPatient(patientId);
  if (!patient) return;
  
  document.getElementById('patient-name-title').textContent = patient.name;
  renderPatientOverview(patient);
  renderProgress(patient);
  renderModules(patient);
  showPage('patient-detail-page');
}

// 渲染患者概览
function renderPatientOverview(patient) {
  const basic = patient.data?.basic || {};
  const container = document.getElementById('patient-overview');
  container.innerHTML = `
    <div class="patient-overview-name">${patient.name}</div>
    <div class="patient-overview-id">住院号: ${patient.id}</div>
    <div class="patient-overview-info">
      <span>性别: ${basic.gender || '-'}</span>
      <span>年龄: ${basic.age || '-'}岁</span>
      <span>病程: ${basic.duration || '-'}月</span>
    </div>
  `;
}

// 渲染进度条
function renderProgress(patient) {
  const progress = calcProgress(patient);
  const percent = Math.round(progress / 13 * 100);
  document.getElementById('progress-bar').style.width = percent + '%';
  document.getElementById('progress-text').textContent = `${progress}/13 项已完成`;
}

// 渲染模块列表
function renderModules(patient) {
  const container = document.getElementById('module-list');
  container.innerHTML = MODULES.map(m => {
    const hasData = patient.data && patient.data[m.id] && Object.keys(patient.data[m.id]).length > 1;
    const statusClass = hasData ? 'completed' : '';
    const statusText = hasData ? '已填写' : '未填写';
    return `
      <div class="module-item ${statusClass}" onclick="openModule('${m.id}')">
        <div class="module-icon">${m.icon}</div>
        <div class="module-name">${m.name}</div>
        <div class="module-status">${statusText}</div>
      </div>
    `;
  }).join('');
}

// 返回患者列表
function backToList() {
  currentPatientId = null;
  showPage('patient-list-page');
  renderPatientList();
}

// 删除患者
function deletePatient() {
  if (!confirm('确定要删除该患者及其所有数据吗？')) return;
  let patients = getPatients();
  patients = patients.filter(p => p.id !== currentPatientId);
  savePatients(patients);
  backToList();
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
  const patient = getPatient(currentPatientId);
  const savedData = patient?.data?.[currentModule] || {};
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

// 返回患者详情
function backToDetail() {
  showPage('patient-detail-page');
  const patient = getPatient(currentPatientId);
  if (patient) {
    renderProgress(patient);
    renderModules(patient);
  }
}

// 保存表单
function saveForm() {
  saveCurrentForm();
  alert('保存成功！');
}

// 保存当前表单数据
function saveCurrentForm() {
  const data = {};
  document.querySelectorAll('[data-field]').forEach(el => {
    data[el.dataset.field] = el.value;
  });
  data.updateTime = new Date().toISOString();
  
  let patients = getPatients();
  const idx = patients.findIndex(p => p.id === currentPatientId);
  if (idx >= 0) {
    if (!patients[idx].data) patients[idx].data = {};
    patients[idx].data[currentModule] = data;
    patients[idx].lastUpdate = new Date().toISOString();
    savePatients(patients);
  }
}

// 自动保存
function autoSave() {
  saveCurrentForm();
}

// 绑定自动保存
function bindAutoSave() {
  document.querySelectorAll('[data-field]').forEach(el => {
    el.addEventListener('change', autoSave);
  });
}

// 导出患者数据
function exportPatientData() {
  const patient = getPatient(currentPatientId);
  if (!patient || !patient.data) { alert('暂无数据'); return; }
  
  let csv = '模块,字段,值\n';
  Object.keys(patient.data).forEach(module => {
    const moduleData = patient.data[module];
    Object.keys(moduleData).forEach(field => {
      if (field !== 'updateTime') {
        csv += `${module},${field},"${moduleData[field]}"\n`;
      }
    });
  });
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${patient.name}_${patient.id}_数据.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
