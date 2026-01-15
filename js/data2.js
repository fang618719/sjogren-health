// 更多表单定义
FORM_FIELDS.essdai = {
  title: 'ESSDAI评分',
  groups: [
    { name: 'ESSDAI各域评分', fields: [
      { id: 'assessDate', label: '评估日期', type: 'date' },
      { id: 'constitutional', label: '全身症状域(0-3)', type: 'select', options: ['0', '1', '2', '3'] },
      { id: 'lymphadenopathy', label: '淋巴结域(0-4)', type: 'select', options: ['0', '1', '2', '3', '4'] },
      { id: 'glandular', label: '腺体域(0-2)', type: 'select', options: ['0', '1', '2'] },
      { id: 'articular', label: '关节域(0-3)', type: 'select', options: ['0', '1', '2', '3'] },
      { id: 'cutaneous', label: '皮肤域(0-3)', type: 'select', options: ['0', '1', '2', '3'] },
      { id: 'pulmonary', label: '肺部域(0-5)', type: 'select', options: ['0', '1', '2', '3', '4', '5'] },
      { id: 'renal', label: '肾脏域(0-5)', type: 'select', options: ['0', '1', '2', '3', '4', '5'] },
      { id: 'muscular', label: '肌肉域(0-3)', type: 'select', options: ['0', '1', '2', '3'] },
      { id: 'pns', label: '周围神经域(0-5)', type: 'select', options: ['0', '1', '2', '3', '4', '5'] },
      { id: 'cns', label: '中枢神经域(0-5)', type: 'select', options: ['0', '1', '2', '3', '4', '5'] },
      { id: 'hematological', label: '血液系统域(0-2)', type: 'select', options: ['0', '1', '2'] },
      { id: 'biological', label: '生物学域(0-2)', type: 'select', options: ['0', '1', '2'] }
    ]}
  ]
};

FORM_FIELDS.tcm_diagnosis = {
  title: '中医四诊',
  groups: [
    { name: '望诊', fields: [
      { id: 'assessDate', label: '评估日期', type: 'date' },
      { id: 'complexion', label: '面色', type: 'select', options: ['正常', '苍白', '萎黄', '潮红', '晦暗'] },
      { id: 'bodyType', label: '形体', type: 'select', options: ['正常', '消瘦', '肥胖'] },
      { id: 'tongueColor', label: '舌色', type: 'select', options: ['淡红', '淡白', '红', '绛红', '紫暗'] },
      { id: 'tongueShape', label: '舌形', type: 'select', options: ['正常', '胖大', '瘦薄', '齿痕', '裂纹'] },
      { id: 'tongueCoating', label: '舌苔', type: 'select', options: ['薄白', '白腻', '黄腻', '少苔', '无苔', '剥苔'] }
    ]},
    { name: '切诊', fields: [
      { id: 'pulseLeft', label: '左脉', type: 'select', options: ['平脉', '浮脉', '沉脉', '细脉', '弦脉', '滑脉', '数脉', '虚脉'] },
      { id: 'pulseRight', label: '右脉', type: 'select', options: ['平脉', '浮脉', '沉脉', '细脉', '弦脉', '滑脉', '数脉', '虚脉'] },
      { id: 'pulseSummary', label: '脉象综合', type: 'text' }
    ]}
  ]
};

FORM_FIELDS.tcm_syndrome = {
  title: '中医证候',
  groups: [
    { name: '证候判断', fields: [
      { id: 'assessDate', label: '评估日期', type: 'date' },
      { id: 'yinxujinkui', label: '阴虚津亏证', type: 'select', options: ['无', '有'] },
      { id: 'qiyinliangxu', label: '气阴两虚证', type: 'select', options: ['无', '有'] },
      { id: 'yinxunere', label: '阴虚内热证', type: 'select', options: ['无', '有'] },
      { id: 'zaoyuhujie', label: '燥瘀互结证', type: 'select', options: ['无', '有'] },
      { id: 'zaoshihujie', label: '燥湿互结证', type: 'select', options: ['无', '有'] },
      { id: 'mainSyndrome', label: '主证型', type: 'select', options: ['阴虚津亏证', '气阴两虚证', '阴虚内热证', '燥瘀互结证', '燥湿互结证'] },
      { id: 'complexity', label: '证候复杂度', type: 'select', options: ['单纯', '复合'] }
    ]}
  ]
};

FORM_FIELDS.treatment = {
  title: '治疗记录',
  groups: [
    { name: '中医治疗', fields: [
      { id: 'recordDate', label: '记录日期', type: 'date' },
      { id: 'tcmHerb', label: '中药治疗', type: 'select', options: ['无', '有'] },
      { id: 'herbFormula', label: '方剂名称', type: 'text' },
      { id: 'herbDuration', label: '中药疗程(周)', type: 'number' },
      { id: 'patentMedicine', label: '中成药', type: 'select', options: ['无', '有'] },
      { id: 'patentMedicineName', label: '中成药名称', type: 'text' }
    ]},
    { name: '西医治疗', fields: [
      { id: 'hcq', label: '羟氯喹', type: 'select', options: ['无', '有'] },
      { id: 'hcqDose', label: 'HCQ剂量(mg/d)', type: 'number' },
      { id: 'steroid', label: '糖皮质激素', type: 'select', options: ['无', '有'] },
      { id: 'steroidDose', label: '激素剂量(mg/d)', type: 'number' },
      { id: 'mtx', label: '甲氨蝶呤', type: 'select', options: ['无', '有'] },
      { id: 'lef', label: '来氟米特', type: 'select', options: ['无', '有'] },
      { id: 'biologic', label: '生物制剂', type: 'select', options: ['无', '有'] },
      { id: 'biologicName', label: '生物制剂名称', type: 'text' }
    ]}
  ]
};

FORM_FIELDS.sf36 = {
  title: 'SF-36生活质量',
  groups: [
    { name: 'SF-36各维度(0-100)', fields: [
      { id: 'assessDate', label: '评估日期', type: 'date' },
      { id: 'pf', label: 'PF生理功能', type: 'number' },
      { id: 'rp', label: 'RP生理职能', type: 'number' },
      { id: 'bp', label: 'BP躯体疼痛', type: 'number' },
      { id: 'gh', label: 'GH总体健康', type: 'number' },
      { id: 'vt', label: 'VT活力', type: 'number' },
      { id: 'sf', label: 'SF社会功能', type: 'number' },
      { id: 're', label: 'RE情感职能', type: 'number' },
      { id: 'mh', label: 'MH精神健康', type: 'number' }
    ]}
  ]
};

FORM_FIELDS.psychology = {
  title: '心理评估',
  groups: [
    { name: '抑郁焦虑', fields: [
      { id: 'assessDate', label: '评估日期', type: 'date' },
      { id: 'phq9', label: 'PHQ-9总分(0-27)', type: 'number' },
      { id: 'gad7', label: 'GAD-7总分(0-21)', type: 'number' }
    ]},
    { name: '睡眠', fields: [
      { id: 'psqi', label: 'PSQI总分(0-21)', type: 'number' },
      { id: 'sleepDuration', label: '睡眠时长(小时)', type: 'number' }
    ]},
    { name: '认知', fields: [
      { id: 'moca', label: 'MoCA总分(0-30)', type: 'number' },
      { id: 'mmse', label: 'MMSE总分(0-30)', type: 'number' }
    ]}
  ]
};

FORM_FIELDS.ultrasound = {
  title: '超声检查',
  groups: [
    { name: '唾液腺超声', fields: [
      { id: 'examDate', label: '检查日期', type: 'date' },
      { id: 'leftParotidScore', label: '左腮腺Salaffi(0-4)', type: 'select', options: ['0', '1', '2', '3', '4'] },
      { id: 'rightParotidScore', label: '右腮腺Salaffi(0-4)', type: 'select', options: ['0', '1', '2', '3', '4'] },
      { id: 'leftSubmandibularScore', label: '左颌下腺Salaffi(0-4)', type: 'select', options: ['0', '1', '2', '3', '4'] },
      { id: 'rightSubmandibularScore', label: '右颌下腺Salaffi(0-4)', type: 'select', options: ['0', '1', '2', '3', '4'] }
    ]},
    { name: '泪腺超声', fields: [
      { id: 'lacrimalSwelling', label: '泪腺肿大', type: 'select', options: ['无', '有'] }
    ]},
    { name: '关节超声', fields: [
      { id: 'jointUS', label: '关节超声检查', type: 'select', options: ['无', '有'] },
      { id: 'activeSynovitis', label: '活动性滑膜炎', type: 'select', options: ['无', '有'] }
    ]}
  ]
};

FORM_FIELDS.followup = {
  title: '随访记录',
  groups: [
    { name: '随访信息', fields: [
      { id: 'followupDate', label: '随访日期', type: 'date' },
      { id: 'visitNumber', label: '随访次数', type: 'number' },
      { id: 'monthsFromBaseline', label: '距基线时间(月)', type: 'number' },
      { id: 'visitType', label: '随访方式', type: 'select', options: ['门诊', '住院', '电话'] }
    ]},
    { name: '疾病状态', fields: [
      { id: 'diseaseStatus', label: '疾病状态', type: 'select', options: ['缓解', '稳定', '活动', '复发'] },
      { id: 'essdaiScore', label: 'ESSDAI总分', type: 'number' },
      { id: 'relapse', label: '复发', type: 'select', options: ['无', '有'] }
    ]},
    { name: '不良事件', fields: [
      { id: 'adverseEvent', label: '不良事件', type: 'select', options: ['无', '有'] },
      { id: 'aeDescription', label: '事件描述', type: 'textarea' },
      { id: 'aeSeverity', label: '严重程度', type: 'select', options: ['轻', '中', '重'] }
    ]}
  ]
};
