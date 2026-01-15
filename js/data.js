// 表单模块定义
const MODULES = [
  { id: 'basic', name: '1.基本信息', icon: '基' },
  { id: 'symptoms', name: '2.临床症状', icon: '症' },
  { id: 'lab', name: '3.实验室检查', icon: '检' },
  { id: 'antibody', name: '4.自身抗体', icon: '抗' },
  { id: 'organ', name: '5.器官受累', icon: '器' },
  { id: 'essdai', name: '6.ESSDAI评分', icon: '评' },
  { id: 'tcm_diagnosis', name: '7.中医四诊', icon: '诊' },
  { id: 'tcm_syndrome', name: '8.中医证候', icon: '证' },
  { id: 'treatment', name: '9.治疗记录', icon: '治' },
  { id: 'sf36', name: '10.SF-36', icon: '生' },
  { id: 'psychology', name: '11.心理评估', icon: '心' },
  { id: 'ultrasound', name: '12.超声检查', icon: '超' },
  { id: 'followup', name: '13.随访记录', icon: '访' }
];

// 表单字段定义
const FORM_FIELDS = {
  basic: {
    title: '基本信息',
    groups: [
      { name: '人口学信息', fields: [
        { id: 'inpatientNo', label: '住院号', type: 'text' },
        { id: 'name', label: '姓名', type: 'text' },
        { id: 'gender', label: '性别', type: 'select', options: ['男', '女'] },
        { id: 'birthDate', label: '出生日期', type: 'date' },
        { id: 'age', label: '年龄(岁)', type: 'number' },
        { id: 'height', label: '身高(cm)', type: 'number' },
        { id: 'weight', label: '体重(kg)', type: 'number' },
        { id: 'ethnicity', label: '民族', type: 'text' },
        { id: 'education', label: '教育程度', type: 'select', options: ['小学及以下', '初中', '高中/中专', '大专', '本科', '硕士及以上'] }
      ]},
      { name: '病史信息', fields: [
        { id: 'onsetAge', label: '发病年龄(岁)', type: 'number' },
        { id: 'diagnosisAge', label: '确诊年龄(岁)', type: 'number' },
        { id: 'duration', label: '病程(月)', type: 'number' },
        { id: 'firstVisitDate', label: '首诊日期', type: 'date' }
      ]},
      { name: '生活习惯', fields: [
        { id: 'smoking', label: '吸烟史', type: 'select', options: ['无', '有'] },
        { id: 'drinking', label: '饮酒史', type: 'select', options: ['无', '有'] },
        { id: 'familyHistory', label: '家族史(自免病)', type: 'select', options: ['无', '有'] },
        { id: 'comorbidities', label: '合并症', type: 'textarea' }
      ]}
    ]
  },
  symptoms: {
    title: '临床症状',
    groups: [
      { name: '干燥症状', fields: [
        { id: 'assessDate', label: '评估日期', type: 'date' },
        { id: 'dryMouth', label: '口干', type: 'select', options: ['无', '有'] },
        { id: 'dryMouthNRS', label: '口干NRS(0-10)', type: 'number' },
        { id: 'dryEye', label: '眼干', type: 'select', options: ['无', '有'] },
        { id: 'dryEyeNRS', label: '眼干NRS(0-10)', type: 'number' },
        { id: 'drySkin', label: '皮肤干', type: 'select', options: ['无', '有'] },
        { id: 'dryNose', label: '鼻干', type: 'select', options: ['无', '有'] }
      ]},
      { name: '全身症状', fields: [
        { id: 'fatigue', label: '乏力', type: 'select', options: ['无', '有'] },
        { id: 'fatigueNRS', label: '乏力NRS(0-10)', type: 'number' },
        { id: 'fever', label: '发热', type: 'select', options: ['无', '有'] },
        { id: 'weightLoss', label: '体重下降', type: 'select', options: ['无', '有'] },
        { id: 'nightSweats', label: '盗汗', type: 'select', options: ['无', '有'] }
      ]},
      { name: '关节肌肉', fields: [
        { id: 'jointPain', label: '关节痛', type: 'select', options: ['无', '有'] },
        { id: 'jointSwelling', label: '关节肿', type: 'select', options: ['无', '有'] },
        { id: 'morningStiffness', label: '晨僵', type: 'select', options: ['无', '有'] },
        { id: 'myalgia', label: '肌痛', type: 'select', options: ['无', '有'] }
      ]},
      { name: '皮肤', fields: [
        { id: 'purpura', label: '紫癜', type: 'select', options: ['无', '有'] },
        { id: 'raynaud', label: '雷诺现象', type: 'select', options: ['无', '有'] },
        { id: 'rash', label: '皮疹', type: 'select', options: ['无', '有'] }
      ]}
    ]
  },
  lab: {
    title: '实验室检查',
    groups: [
      { name: '血常规', fields: [
        { id: 'testDate', label: '检查日期', type: 'date' },
        { id: 'wbc', label: 'WBC(×10^9/L)', type: 'number' },
        { id: 'rbc', label: 'RBC(×10^12/L)', type: 'number' },
        { id: 'hb', label: 'Hb(g/L)', type: 'number' },
        { id: 'plt', label: 'PLT(×10^9/L)', type: 'number' }
      ]},
      { name: '炎症指标', fields: [
        { id: 'esr', label: 'ESR(mm/h)', type: 'number' },
        { id: 'crp', label: 'CRP(mg/L)', type: 'number' }
      ]},
      { name: '免疫球蛋白', fields: [
        { id: 'igg', label: 'IgG(g/L)', type: 'number' },
        { id: 'iga', label: 'IgA(g/L)', type: 'number' },
        { id: 'igm', label: 'IgM(g/L)', type: 'number' },
        { id: 'c3', label: 'C3(g/L)', type: 'number' },
        { id: 'c4', label: 'C4(g/L)', type: 'number' }
      ]},
      { name: '肝肾功能', fields: [
        { id: 'alt', label: 'ALT(U/L)', type: 'number' },
        { id: 'ast', label: 'AST(U/L)', type: 'number' },
        { id: 'cr', label: 'Cr(μmol/L)', type: 'number' },
        { id: 'egfr', label: 'eGFR', type: 'number' }
      ]}
    ]
  },
  antibody: {
    title: '自身抗体',
    groups: [
      { name: '核心抗体', fields: [
        { id: 'testDate', label: '检查日期', type: 'date' },
        { id: 'ana', label: 'ANA', type: 'select', options: ['阴性', '阳性'] },
        { id: 'anaTiter', label: 'ANA滴度', type: 'text' },
        { id: 'ssaRo52', label: '抗SSA/Ro52', type: 'select', options: ['阴性', '阳性'] },
        { id: 'ssaRo60', label: '抗SSA/Ro60', type: 'select', options: ['阴性', '阳性'] },
        { id: 'ssb', label: '抗SSB/La', type: 'select', options: ['阴性', '阳性'] },
        { id: 'rf', label: 'RF', type: 'select', options: ['阴性', '阳性'] },
        { id: 'rfValue', label: 'RF定量(IU/mL)', type: 'number' }
      ]},
      { name: '其他抗体', fields: [
        { id: 'dsdna', label: '抗dsDNA', type: 'select', options: ['阴性', '阳性'] },
        { id: 'sm', label: '抗Sm', type: 'select', options: ['阴性', '阳性'] },
        { id: 'rnp', label: '抗RNP', type: 'select', options: ['阴性', '阳性'] },
        { id: 'ama', label: '抗线粒体抗体', type: 'select', options: ['阴性', '阳性'] },
        { id: 'cryoglobulin', label: '冷球蛋白', type: 'select', options: ['阴性', '阳性'] }
      ]}
    ]
  },
  organ: {
    title: '器官受累',
    groups: [
      { name: '肺部', fields: [
        { id: 'assessDate', label: '评估日期', type: 'date' },
        { id: 'lungInvolvement', label: '肺部受累', type: 'select', options: ['无', '有'] },
        { id: 'ild', label: 'ILD', type: 'select', options: ['无', '有'] },
        { id: 'ildType', label: 'ILD类型', type: 'select', options: ['NSIP', 'UIP', '其他'] },
        { id: 'fvc', label: 'FVC(%pred)', type: 'number' },
        { id: 'dlco', label: 'DLCO(%pred)', type: 'number' }
      ]},
      { name: '肾脏', fields: [
        { id: 'kidneyInvolvement', label: '肾脏受累', type: 'select', options: ['无', '有'] },
        { id: 'rta', label: '肾小管酸中毒', type: 'select', options: ['无', '有'] },
        { id: 'glomerulonephritis', label: '肾小球肾炎', type: 'select', options: ['无', '有'] }
      ]},
      { name: '神经系统', fields: [
        { id: 'neuroInvolvement', label: '神经系统受累', type: 'select', options: ['无', '有'] },
        { id: 'peripheralNeuropathy', label: '周围神经病', type: 'select', options: ['无', '有'] },
        { id: 'cnsInvolvement', label: '中枢神经受累', type: 'select', options: ['无', '有'] }
      ]},
      { name: '血液系统', fields: [
        { id: 'hemaInvolvement', label: '血液系统受累', type: 'select', options: ['无', '有'] },
        { id: 'leukopenia', label: '白细胞减少', type: 'select', options: ['无', '有'] },
        { id: 'anemia', label: '贫血', type: 'select', options: ['无', '有'] },
        { id: 'thrombocytopenia', label: '血小板减少', type: 'select', options: ['无', '有'] }
      ]}
    ]
  }
};
