// 应用状态
let currentPatientId = null;
let currentModule = null;
let currentFilter = 'all';
let isAdmin = false;
const STORAGE_KEY = 'sjogren_patients';
const LOG_KEY = 'sjogren_logs';

// 预设用户
const VALID_USERS = [
  { username: 'pdd', password: '7402', role: 'user' },
  { username: 'admin', password: 'admin123', role: 'admin' }
];

// 关键必填字段定义
const REQUIRED_FIELDS = {
  basic: ['gender', 'age', 'duration'],
  diagnosis: ['diagnosis_date', 'diagnosis_basis'],
  symptoms: ['dry_eye', 'dry_mouth'],
  lab: ['ANA', 'anti_SSA', 'anti_SSB'],
  tcm: ['tongue', 'pulse']
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  checkLogin();
  checkBackupReminder();
  // 剔除原因选择监听
  document.querySelectorAll('input[name="exclude-reason"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.getElementById('other-reason-group').style.display = 
        e.target.value === 'other' ? 'block' : 'none';
    });
  });
  // 纳排筛查复选框监听
  document.querySelectorAll('#screening-modal input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', updateScreeningResult);
  });
});

// 备份提醒检查
function checkBackupReminder() {
  const lastBackup = localStorage.getItem('sjogren_last_backup');
  const today = new Date().toDateString();
  if (lastBackup !== today) {
    const patients = getPatients();
    if (patients.length > 0) {
      setTimeout(() => {
        if (confirm('建议定期备份数据以防丢失，是否现在备份？')) {
          showBackupModal();
        }
        localStorage.setItem('sjogren_last_backup', today);
      }, 1000);
    }
  }
}

// 登录检查
function checkLogin() {
  if (sessionStorage.getItem('logged_in')) {
    isAdmin = sessionStorage.getItem('is_admin') === 'true';
    showPage('patient-list-page');
    renderPatientList();
  }
}

// 切换密码显示
function togglePassword() {
  const input = document.getElementById('password-input');
  const toggle = document.querySelector('.toggle-password');
  if (input.type === 'password') {
    input.type = 'text';
    toggle.textContent = '隐藏';
  } else {
    input.type = 'password';
    toggle.textContent = '显示';
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
  const user = VALID_USERS.find(u => u.username === username && u.password === password);
  if (user) {
    sessionStorage.setItem('logged_in', 'true');
    sessionStorage.setItem('is_admin', user.role === 'admin' ? 'true' : 'false');
    sessionStorage.setItem('current_user', username);
    isAdmin = user.role === 'admin';
    showPage('patient-list-page');
    renderPatientList();
    addLog('登录', `用户 ${username} 登录系统`);
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
function renderPatientList(filterText = '') {
  const container = document.getElementById('patient-list');
  let patients = getPatients();
  
  // 搜索过滤
  if (filterText) {
    const keyword = filterText.toLowerCase();
    patients = patients.filter(p => 
      p.id.toLowerCase().includes(keyword) || 
      p.name.toLowerCase().includes(keyword)
    );
  }
  
  // 状态筛选
  if (currentFilter !== 'all') {
    patients = patients.filter(p => {
      const status = getPatientStatus(p);
      return status === currentFilter;
    });
  }
  
  if (patients.length === 0) {
    container.innerHTML = `
      <div class="empty-list">
        <div class="empty-list-icon">📋</div>
        <div class="empty-list-text">${filterText ? '未找到匹配的患者' : (currentFilter !== 'all' ? '该分类暂无患者' : '暂无患者，点击下方按钮添加')}</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = patients.map(p => {
    const progress = calcProgress(p);
    const lastUpdate = p.lastUpdate ? formatDate(p.lastUpdate) : '未填写';
    const percent = Math.round(progress / 13 * 100);
    const status = getPatientStatus(p);
    const statusText = getStatusText(status);
    const isExcluded = p.excluded;
    
    return `
      <div class="patient-card ${isExcluded ? 'excluded' : ''}" onclick="openPatient('${p.id}')">
        <div class="patient-card-header">
          <span class="patient-id">${p.id}</span>
          <span class="patient-status ${status}">${statusText}</span>
        </div>
        <div class="patient-name">${p.name}</div>
        <div class="patient-card-info">
          <span class="patient-progress">${progress}/13 项</span>
          <span class="patient-time">${lastUpdate}</span>
        </div>
        <div class="patient-progress-bar">
          <div class="patient-progress-bar-fill ${status}" style="width: ${isExcluded ? 100 : percent}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// 获取患者状态
function getPatientStatus(patient) {
  if (patient.excluded) return 'excluded';
  const progress = calcProgress(patient);
  if (progress === 0) return 'not-started';
  if (progress === 13) return 'completed';
  return 'in-progress';
}

// 获取状态文本
function getStatusText(status) {
  const map = {
    'not-started': '未开始',
    'in-progress': '进行中',
    'completed': '已完成',
    'excluded': '已剔除'
  };
  return map[status] || status;
}

// 筛选患者
function filterPatients(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  const keyword = document.getElementById('search-input').value;
  renderPatientList(keyword);
}

// 搜索患者
function searchPatients() {
  const keyword = document.getElementById('search-input').value;
  renderPatientList(keyword);
}

// 导出所有患者数据
function exportAllPatients() {
  const patients = getPatients();
  if (patients.length === 0) { alert('暂无患者数据'); return; }
  
  // 构建CSV表头
  let csv = '住院号,姓名,模块,字段,值,更新时间\n';
  
  patients.forEach(patient => {
    if (patient.data) {
      Object.keys(patient.data).forEach(module => {
        const moduleData = patient.data[module];
        Object.keys(moduleData).forEach(field => {
          if (field !== 'updateTime') {
            const value = String(moduleData[field]).replace(/"/g, '""');
            csv += `"${patient.id}","${patient.name}","${module}","${field}","${value}","${moduleData.updateTime || ''}"\n`;
          }
        });
      });
    }
  });
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `全部患者数据_${new Date().toLocaleDateString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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

// 进入纳排筛查
function goToScreening() {
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
  // 隐藏添加弹窗，显示筛查弹窗
  document.getElementById('add-patient-modal').classList.remove('active');
  document.getElementById('screening-modal').classList.add('active');
  // 重置筛查表单
  document.querySelectorAll('#screening-modal input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.getElementById('screening-result').innerHTML = '';
  document.getElementById('screening-result').className = 'screening-result';
  updateScreeningResult();
}

// 返回添加患者弹窗
function backToAddPatient() {
  document.getElementById('screening-modal').classList.remove('active');
  document.getElementById('add-patient-modal').classList.add('active');
}

// 更新筛查结果
function updateScreeningResult() {
  const inc1 = document.getElementById('inc1').checked;
  const inc2 = document.getElementById('inc2').checked;
  const inc3 = document.getElementById('inc3').checked;
  const inc4 = document.getElementById('inc4').checked;
  const inc5 = document.getElementById('inc5').checked;
  const exc1 = document.getElementById('exc1').checked;
  const exc2 = document.getElementById('exc2').checked;
  const exc3 = document.getElementById('exc3').checked;
  const exc4 = document.getElementById('exc4').checked;
  
  const allIncluded = inc1 && inc2 && inc3 && inc4 && inc5;
  const anyExcluded = exc1 || exc2 || exc3 || exc4;
  
  const resultDiv = document.getElementById('screening-result');
  const confirmBtn = document.getElementById('screening-confirm-btn');
  
  if (anyExcluded) {
    resultDiv.innerHTML = '❌ 不符合纳入条件：存在排除标准';
    resultDiv.className = 'screening-result fail';
    confirmBtn.textContent = '标记为不纳入';
    confirmBtn.style.background = 'linear-gradient(135deg, #ef4444, #f87171)';
  } else if (!allIncluded) {
    resultDiv.innerHTML = '⚠️ 请确认所有纳入标准';
    resultDiv.className = 'screening-result';
    confirmBtn.textContent = '确认添加';
    confirmBtn.style.background = '';
  } else {
    resultDiv.innerHTML = '✓ 符合纳入条件，可进行数据采集';
    resultDiv.className = 'screening-result pass';
    confirmBtn.textContent = '确认添加';
    confirmBtn.style.background = '';
  }
}

// 确认筛查结果并添加患者
function confirmScreening() {
  const id = document.getElementById('new-patient-id').value.trim();
  const name = document.getElementById('new-patient-name').value.trim();
  
  const inc1 = document.getElementById('inc1').checked;
  const inc2 = document.getElementById('inc2').checked;
  const inc3 = document.getElementById('inc3').checked;
  const inc4 = document.getElementById('inc4').checked;
  const inc5 = document.getElementById('inc5').checked;
  const exc1 = document.getElementById('exc1').checked;
  const exc2 = document.getElementById('exc2').checked;
  const exc3 = document.getElementById('exc3').checked;
  const exc4 = document.getElementById('exc4').checked;
  
  const allIncluded = inc1 && inc2 && inc3 && inc4 && inc5;
  const anyExcluded = exc1 || exc2 || exc3 || exc4;
  
  // 构建排除原因
  let excludeReason = '';
  if (exc1) excludeReason = '继发性干燥综合征';
  else if (exc2) excludeReason = '严重恶性肿瘤晚期';
  else if (exc3) excludeReason = '关键变量严重缺失';
  else if (exc4) excludeReason = '中医四诊资料缺失';
  
  const patients = getPatients();
  const newPatient = {
    id,
    name,
    data: {},
    createTime: new Date().toISOString(),
    screening: { inc1, inc2, inc3, inc4, inc5, exc1, exc2, exc3, exc4 }
  };
  
  if (anyExcluded) {
    newPatient.excluded = true;
    newPatient.excludeReason = excludeReason;
    newPatient.excludeTime = new Date().toISOString();
  }
  
  patients.push(newPatient);
  savePatients(patients);
  
  document.getElementById('screening-modal').classList.remove('active');
  renderPatientList();
  
  if (anyExcluded) {
    alert('患者已添加并标记为不纳入');
  } else {
    alert('患者添加成功，可开始数据采集');
  }
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
  
  // 管理员显示删除按钮
  const deleteBtn = document.getElementById('delete-btn');
  if (deleteBtn) {
    deleteBtn.classList.toggle('show', isAdmin);
  }
  
  showPage('patient-detail-page');
}

// 渲染患者概览
function renderPatientOverview(patient) {
  const basic = patient.data?.basic || {};
  const container = document.getElementById('patient-overview');
  
  let excludeInfo = '';
  if (patient.excluded) {
    excludeInfo = `
      <div class="exclude-info">
        <span class="exclude-badge">已剔除</span>
        <span class="exclude-reason">原因: ${patient.excludeReason}</span>
        <button class="restore-btn" onclick="restorePatient()">恢复</button>
      </div>
    `;
  }
  
  container.innerHTML = `
    <div class="patient-overview-name">${patient.name}</div>
    <div class="patient-overview-id">住院号: ${patient.id}</div>
    <div class="patient-overview-info">
      <span>性别: ${basic.gender || '-'}</span>
      <span>年龄: ${basic.age || '-'}岁</span>
      <span>病程: ${basic.duration || '-'}月</span>
    </div>
    ${excludeInfo}
  `;
}

// 渲染进度条
function renderProgress(patient) {
  const moduleProgress = calcProgress(patient);
  const modulePercent = Math.round(moduleProgress / 13 * 100);
  const fieldProgress = calcFieldProgress(patient);
  
  document.getElementById('progress-bar').style.width = modulePercent + '%';
  document.getElementById('progress-text').textContent = `${moduleProgress}/13 模块已填写`;
  document.getElementById('progress-percent').textContent = `关键字段 ${fieldProgress.percent}%`;
  
  // 显示缺失提示
  const missingHint = document.getElementById('missing-hint');
  const missingCount = fieldProgress.total - fieldProgress.filled;
  if (missingCount > 0) {
    missingHint.textContent = `⚠️ ${missingCount}个关键字段待填写，点击查看`;
    missingHint.classList.add('show');
  } else {
    missingHint.classList.remove('show');
  }
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
  if (!isAdmin) {
    alert('只有管理员可以删除患者');
    return;
  }
  if (!confirm('确定要永久删除该患者及其所有数据吗？此操作不可恢复！')) return;
  const patient = getPatient(currentPatientId);
  let patients = getPatients();
  patients = patients.filter(p => p.id !== currentPatientId);
  savePatients(patients);
  addLog('永久删除', `删除患者 ${patient?.name}(${currentPatientId})`);
  backToList();
}

// 显示剔除弹窗
function showExcludeModal() {
  document.getElementById('exclude-patient-modal').classList.add('active');
  document.querySelectorAll('input[name="exclude-reason"]').forEach(r => r.checked = false);
  document.getElementById('other-reason-group').style.display = 'none';
  document.getElementById('other-reason-input').value = '';
}

// 隐藏剔除弹窗
function hideExcludeModal() {
  document.getElementById('exclude-patient-modal').classList.remove('active');
}

// 确认剔除
function confirmExclude() {
  const selected = document.querySelector('input[name="exclude-reason"]:checked');
  if (!selected) {
    alert('请选择剔除原因');
    return;
  }
  let reason = selected.value;
  if (reason === 'other') {
    reason = document.getElementById('other-reason-input').value.trim();
    if (!reason) {
      alert('请输入其他原因');
      return;
    }
  }
  
  const patient = getPatient(currentPatientId);
  let patients = getPatients();
  const idx = patients.findIndex(p => p.id === currentPatientId);
  if (idx >= 0) {
    patients[idx].excluded = true;
    patients[idx].excludeReason = reason;
    patients[idx].excludeTime = new Date().toISOString();
    savePatients(patients);
    addLog('剔除患者', `剔除 ${patient?.name}(${currentPatientId})，原因：${reason}`);
  }
  hideExcludeModal();
  backToList();
}

// 恢复患者（取消剔除）
function restorePatient() {
  if (!confirm('确定要恢复该患者吗？')) return;
  const patient = getPatient(currentPatientId);
  let patients = getPatients();
  const idx = patients.findIndex(p => p.id === currentPatientId);
  if (idx >= 0) {
    delete patients[idx].excluded;
    delete patients[idx].excludeReason;
    delete patients[idx].excludeTime;
    savePatients(patients);
    addLog('恢复患者', `恢复 ${patient?.name}(${currentPatientId})`);
  }
  const updatedPatient = getPatient(currentPatientId);
  renderPatientOverview(updatedPatient);
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

// ========== 备份/恢复功能 ==========
function showBackupModal() {
  document.getElementById('backup-modal').classList.add('active');
}

function hideBackupModal() {
  document.getElementById('backup-modal').classList.remove('active');
}

function exportBackup() {
  const patients = getPatients();
  const logs = getLogs();
  const backup = {
    version: '1.0',
    exportTime: new Date().toISOString(),
    patients: patients,
    logs: logs
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `干燥综合征数据备份_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem('sjogren_last_backup', new Date().toDateString());
  addLog('导出备份', `导出${patients.length}位患者数据`);
  alert('备份导出成功！');
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const backup = JSON.parse(e.target.result);
      if (!backup.patients || !Array.isArray(backup.patients)) {
        throw new Error('无效的备份文件');
      }
      const existingPatients = getPatients();
      const existingIds = existingPatients.map(p => p.id);
      let newCount = 0, updateCount = 0;
      
      backup.patients.forEach(p => {
        const idx = existingPatients.findIndex(ep => ep.id === p.id);
        if (idx >= 0) {
          // 合并：保留较新的数据
          if (new Date(p.lastUpdate || p.createTime) > new Date(existingPatients[idx].lastUpdate || existingPatients[idx].createTime)) {
            existingPatients[idx] = p;
            updateCount++;
          }
        } else {
          existingPatients.push(p);
          newCount++;
        }
      });
      
      savePatients(existingPatients);
      if (backup.logs) {
        localStorage.setItem(LOG_KEY, JSON.stringify(backup.logs));
      }
      addLog('导入备份', `新增${newCount}位，更新${updateCount}位患者`);
      hideBackupModal();
      renderPatientList();
      alert(`导入成功！新增${newCount}位患者，更新${updateCount}位患者`);
    } catch (err) {
      alert('备份文件格式错误：' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ========== 导出选项功能 ==========
function showExportOptions() {
  document.getElementById('export-options-modal').classList.add('active');
}

function hideExportOptions() {
  document.getElementById('export-options-modal').classList.remove('active');
}

function doExportAll() {
  const includeExcluded = document.getElementById('export-include-excluded').checked;
  const anonymize = document.getElementById('export-anonymize').checked;
  const format = document.querySelector('input[name="export-format"]:checked').value;
  
  let patients = getPatients();
  if (!includeExcluded) {
    patients = patients.filter(p => !p.excluded);
  }
  if (patients.length === 0) { alert('暂无可导出的患者数据'); return; }
  
  let csv = '';
  if (format === 'long') {
    csv = exportLongFormat(patients, anonymize);
  } else {
    csv = exportWideFormat(patients, anonymize);
  }
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `患者数据_${format === 'long' ? '长表' : '宽表'}_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  addLog('导出数据', `导出${patients.length}位患者，格式：${format === 'long' ? '长表' : '宽表'}，脱敏：${anonymize ? '是' : '否'}`);
  hideExportOptions();
}

function exportLongFormat(patients, anonymize) {
  let csv = '研究ID,住院号,姓名,状态,模块,字段,值,更新时间\n';
  patients.forEach((patient, idx) => {
    const researchId = 'SS' + String(idx + 1).padStart(4, '0');
    const pid = anonymize ? researchId : patient.id;
    const pname = anonymize ? '***' : patient.name;
    const status = patient.excluded ? '已剔除' : '纳入';
    if (patient.data) {
      Object.keys(patient.data).forEach(module => {
        const moduleData = patient.data[module];
        Object.keys(moduleData).forEach(field => {
          if (field !== 'updateTime') {
            const value = String(moduleData[field]).replace(/"/g, '""');
            csv += `"${researchId}","${pid}","${pname}","${status}","${module}","${field}","${value}","${moduleData.updateTime || ''}"\n`;
          }
        });
      });
    }
  });
  return csv;
}

function exportWideFormat(patients, anonymize) {
  // 收集所有字段
  const allFields = new Set();
  patients.forEach(p => {
    if (p.data) {
      Object.keys(p.data).forEach(module => {
        Object.keys(p.data[module]).forEach(field => {
          if (field !== 'updateTime') {
            allFields.add(`${module}_${field}`);
          }
        });
      });
    }
  });
  const fieldList = Array.from(allFields).sort();
  
  // 表头
  let csv = '研究ID,住院号,姓名,状态,创建时间,最后更新,' + fieldList.join(',') + '\n';
  
  // 数据行
  patients.forEach((patient, idx) => {
    const researchId = 'SS' + String(idx + 1).padStart(4, '0');
    const pid = anonymize ? researchId : patient.id;
    const pname = anonymize ? '***' : patient.name;
    const status = patient.excluded ? '已剔除' : '纳入';
    const createTime = patient.createTime || '';
    const lastUpdate = patient.lastUpdate || '';
    
    let row = `"${researchId}","${pid}","${pname}","${status}","${createTime}","${lastUpdate}"`;
    fieldList.forEach(f => {
      const [module, ...fieldParts] = f.split('_');
      const field = fieldParts.join('_');
      const value = patient.data?.[module]?.[field] || '';
      row += `,"${String(value).replace(/"/g, '""')}"`;
    });
    csv += row + '\n';
  });
  return csv;
}

// ========== 缺失字段检查 ==========
function calcFieldProgress(patient) {
  let totalRequired = 0;
  let filledRequired = 0;
  const missingByModule = {};
  
  Object.keys(REQUIRED_FIELDS).forEach(moduleId => {
    const fields = REQUIRED_FIELDS[moduleId];
    const moduleData = patient.data?.[moduleId] || {};
    const missing = [];
    
    fields.forEach(field => {
      totalRequired++;
      if (moduleData[field] && moduleData[field] !== '') {
        filledRequired++;
      } else {
        missing.push(field);
      }
    });
    
    if (missing.length > 0) {
      missingByModule[moduleId] = missing;
    }
  });
  
  return {
    total: totalRequired,
    filled: filledRequired,
    percent: totalRequired > 0 ? Math.round(filledRequired / totalRequired * 100) : 0,
    missingByModule
  };
}

function showMissingFields() {
  const patient = getPatient(currentPatientId);
  if (!patient) return;
  
  const progress = calcFieldProgress(patient);
  const container = document.getElementById('missing-fields-list');
  
  const moduleNames = {
    basic: '基本信息',
    diagnosis: '诊断信息',
    symptoms: '症状体征',
    lab: '实验室检查',
    tcm: '中医四诊'
  };
  
  if (Object.keys(progress.missingByModule).length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#10b981;padding:20px;">✓ 所有关键字段已填写完整</div>';
  } else {
    let html = '';
    Object.keys(progress.missingByModule).forEach(moduleId => {
      const fields = progress.missingByModule[moduleId];
      html += `<div class="missing-module">
        <div class="missing-module-title">${moduleNames[moduleId] || moduleId}</div>
        ${fields.map(f => `<div class="missing-field-item">${f}</div>`).join('')}
      </div>`;
    });
    container.innerHTML = html;
  }
  
  document.getElementById('missing-fields-modal').classList.add('active');
}

function hideMissingFields() {
  document.getElementById('missing-fields-modal').classList.remove('active');
}

// ========== 纳排复核功能 ==========
function showReviewScreening() {
  const patient = getPatient(currentPatientId);
  if (!patient) return;
  
  const screening = patient.screening || {};
  const container = document.getElementById('review-screening-content');
  
  container.innerHTML = `
    <p class="screening-hint">复核并修改纳入排除标准：</p>
    <div class="screening-section">
      <div class="screening-title inclusion">✓ 纳入标准</div>
      <label class="screening-item"><input type="checkbox" id="review-inc1" ${screening.inc1 ? 'checked' : ''}> 2014-2024年在中大医院首次确诊原发性干燥综合征</label>
      <label class="screening-item"><input type="checkbox" id="review-inc2" ${screening.inc2 ? 'checked' : ''}> 符合2016 ACR/EULAR分类标准</label>
      <label class="screening-item"><input type="checkbox" id="review-inc3" ${screening.inc3 ? 'checked' : ''}> 有较完整的电子病历记录</label>
      <label class="screening-item"><input type="checkbox" id="review-inc4" ${screening.inc4 ? 'checked' : ''}> 至少有一次随访记录</label>
      <label class="screening-item"><input type="checkbox" id="review-inc5" ${screening.inc5 ? 'checked' : ''}> 有中医四诊资料</label>
    </div>
    <div class="screening-section">
      <div class="screening-title exclusion">✗ 排除标准</div>
      <label class="screening-item"><input type="checkbox" id="review-exc1" ${screening.exc1 ? 'checked' : ''}> 继发性干燥综合征</label>
      <label class="screening-item"><input type="checkbox" id="review-exc2" ${screening.exc2 ? 'checked' : ''}> 严重恶性肿瘤晚期</label>
      <label class="screening-item"><input type="checkbox" id="review-exc3" ${screening.exc3 ? 'checked' : ''}> 关键研究变量严重缺失</label>
      <label class="screening-item"><input type="checkbox" id="review-exc4" ${screening.exc4 ? 'checked' : ''}> 中医四诊资料严重缺失</label>
    </div>
  `;
  
  document.getElementById('review-reason').value = '';
  document.getElementById('review-screening-modal').classList.add('active');
}

function hideReviewScreening() {
  document.getElementById('review-screening-modal').classList.remove('active');
}

function saveReviewScreening() {
  const reason = document.getElementById('review-reason').value.trim();
  if (!reason) {
    alert('请填写复核原因');
    return;
  }
  
  const newScreening = {
    inc1: document.getElementById('review-inc1').checked,
    inc2: document.getElementById('review-inc2').checked,
    inc3: document.getElementById('review-inc3').checked,
    inc4: document.getElementById('review-inc4').checked,
    inc5: document.getElementById('review-inc5').checked,
    exc1: document.getElementById('review-exc1').checked,
    exc2: document.getElementById('review-exc2').checked,
    exc3: document.getElementById('review-exc3').checked,
    exc4: document.getElementById('review-exc4').checked
  };
  
  const allIncluded = newScreening.inc1 && newScreening.inc2 && newScreening.inc3 && newScreening.inc4 && newScreening.inc5;
  const anyExcluded = newScreening.exc1 || newScreening.exc2 || newScreening.exc3 || newScreening.exc4;
  
  let patients = getPatients();
  const idx = patients.findIndex(p => p.id === currentPatientId);
  if (idx >= 0) {
    patients[idx].screening = newScreening;
    patients[idx].screeningReviewTime = new Date().toISOString();
    patients[idx].screeningReviewReason = reason;
    
    if (anyExcluded) {
      patients[idx].excluded = true;
      let excludeReason = '';
      if (newScreening.exc1) excludeReason = '继发性干燥综合征';
      else if (newScreening.exc2) excludeReason = '严重恶性肿瘤晚期';
      else if (newScreening.exc3) excludeReason = '关键变量严重缺失';
      else if (newScreening.exc4) excludeReason = '中医四诊资料缺失';
      patients[idx].excludeReason = excludeReason;
      patients[idx].excludeTime = new Date().toISOString();
    } else if (allIncluded) {
      delete patients[idx].excluded;
      delete patients[idx].excludeReason;
      delete patients[idx].excludeTime;
    }
    
    savePatients(patients);
    addLog('纳排复核', `患者${currentPatientId}，原因：${reason}`);
  }
  
  hideReviewScreening();
  const patient = getPatient(currentPatientId);
  renderPatientOverview(patient);
  alert('纳排复核已保存');
}

// ========== 操作日志功能 ==========
function getLogs() {
  return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
}

function addLog(action, detail) {
  const logs = getLogs();
  logs.unshift({
    time: new Date().toISOString(),
    user: sessionStorage.getItem('current_user') || 'unknown',
    action,
    detail
  });
  if (logs.length > 100) logs.length = 100;
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}
