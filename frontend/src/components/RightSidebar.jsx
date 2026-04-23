import React, { useState } from 'react';

function RightSidebar() {
  const [activeTab, setActiveTab] = useState('calculators');
  const [labValues, setLabValues] = useState({});
  const [drugSearch, setDrugSearch] = useState('');
  const [calculatorSearch, setCalculatorSearch] = useState('');
  const [labSearch, setLabSearch] = useState('');
  const [expandedCalc, setExpandedCalc] = useState(null);
  
  const [bmiResult, setBmiResult] = useState(null);
  const [egfr, setEgfr] = useState(null);
  const [crClearance, setCrClearance] = useState(null);
  const [idealWeight, setIdealWeight] = useState(null);
  const [chaScore, setChaScore] = useState(null);
  const [hasBledScore, setHasBledScore] = useState(null);
  const [graceScore, setGraceScore] = useState(null);
  const [lvMass, setLvMass] = useState(null);
  const [bmr, setBmr] = useState(null);

  const checkLabValue = (value, min, max, isMaxOnly = false, isMinOnly = false) => {
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    if (isMaxOnly && num > max) return { color: '#ef4444', text: '🔺 Выше нормы' };
    if (isMinOnly && num < min) return { color: '#f59e0b', text: '🔻 Ниже нормы' };
    if (num < min) return { color: '#f59e0b', text: '🔻 Ниже нормы' };
    if (num > max) return { color: '#ef4444', text: '🔺 Выше нормы' };
    return { color: '#10b981', text: '✅ В норме' };
  };

  const filteredLabValues = {
    electrolytes: [
      { id: 'k', name: 'K⁺ (Калий)', norm: '3.5-5.0 ммоль/л', min: 3.5, max: 5.0 },
      { id: 'na', name: 'Na⁺ (Натрий)', norm: '135-145 ммоль/л', min: 135, max: 145 },
    ].filter(item => 
      item.name.toLowerCase().includes(labSearch.toLowerCase()) ||
      item.norm.toLowerCase().includes(labSearch.toLowerCase())
    ),
    kidney: [
      { id: 'creatinine', name: 'Креатинин', norm: '62-106 мкмоль/л', min: 62, max: 106 },
      { id: 'urea', name: 'Мочевина', norm: '2.5-8.3 ммоль/л', min: 2.5, max: 8.3 },
      { id: 'uricAcid', name: 'Мочевая кислота', norm: '210-420 мкмоль/л', min: 210, max: 420 },
    ].filter(item => 
      item.name.toLowerCase().includes(labSearch.toLowerCase()) ||
      item.norm.toLowerCase().includes(labSearch.toLowerCase())
    ),
    lipids: [
      { id: 'cholesterol', name: 'Холестерин общий', norm: '<5.2 ммоль/л', max: 5.2, isMaxOnly: true },
      { id: 'ldl', name: 'ЛПНП', norm: '<3.0 ммоль/л', max: 3.0, isMaxOnly: true },
      { id: 'hdl', name: 'ЛПВП', norm: '>1.0 ммоль/л', min: 1.0, isMinOnly: true },
      { id: 'triglycerides', name: 'Триглицериды', norm: '<1.7 ммоль/л', max: 1.7, isMaxOnly: true },
    ].filter(item => 
      item.name.toLowerCase().includes(labSearch.toLowerCase()) ||
      item.norm.toLowerCase().includes(labSearch.toLowerCase())
    ),
    blood: [
      { id: 'hemoglobin', name: 'Гемоглобин', norm: '120-160 г/л', min: 120, max: 160 },
      { id: 'leukocytes', name: 'Лейкоциты', norm: '4.0-9.0 ×10⁹/л', min: 4.0, max: 9.0 },
      { id: 'platelets', name: 'Тромбоциты', norm: '180-320 ×10⁹/л', min: 180, max: 320 },
    ].filter(item => 
      item.name.toLowerCase().includes(labSearch.toLowerCase()) ||
      item.norm.toLowerCase().includes(labSearch.toLowerCase())
    ),
    liver: [
      { id: 'alt', name: 'АЛТ', norm: '<35 Ед/л', max: 35, isMaxOnly: true },
      { id: 'ast', name: 'АСТ', norm: '<35 Ед/л', max: 35, isMaxOnly: true },
      { id: 'bilirubin', name: 'Билирубин общий', norm: '3.4-20.5 мкмоль/л', min: 3.4, max: 20.5 },
    ].filter(item => 
      item.name.toLowerCase().includes(labSearch.toLowerCase()) ||
      item.norm.toLowerCase().includes(labSearch.toLowerCase())
    ),
    inflammation: [
      { id: 'crp', name: 'СРБ', norm: '<5.0 мг/л', max: 5.0, isMaxOnly: true },
      { id: 'esr', name: 'СОЭ', norm: '2-15 мм/ч', min: 2, max: 15 },
    ].filter(item => 
      item.name.toLowerCase().includes(labSearch.toLowerCase()) ||
      item.norm.toLowerCase().includes(labSearch.toLowerCase())
    ),
  };

  const drugs = [
    { name: 'Эналаприл', dose: '5-20 мг 2 раза в день', group: 'АПФ ингибитор' },
    { name: 'Лизиноприл', dose: '5-40 мг 1 раз в день', group: 'АПФ ингибитор' },
    { name: 'Лозартан', dose: '25-100 мг 1 раз в день', group: 'БРА (сартан)' },
    { name: 'Валсартан', dose: '80-160 мг 1 раз в день', group: 'БРА (сартан)' },
    { name: 'Метопролол', dose: '25-100 мг 2 раза в день', group: 'Бета-блокатор' },
    { name: 'Бисопролол', dose: '2.5-10 мг 1 раз в день', group: 'Бета-блокатор' },
    { name: 'Амлодипин', dose: '5-10 мг 1 раз в день', group: 'Антагонист кальция' },
    { name: 'Спиронолактон', dose: '25-50 мг 1 раз в день', group: 'Диуретик' },
    { name: 'Фуросемид', dose: '20-80 мг 1 раз в день', group: 'Диуретик' },
    { name: 'Аторвастатин', dose: '10-80 мг 1 раз в день', group: 'Статин' },
    { name: 'Розувастатин', dose: '5-40 мг 1 раз в день', group: 'Статин' },
    { name: 'Варфарин', dose: 'по МНО', group: 'Антикоагулянт' },
    { name: 'Апиксабан', dose: '2.5-5 мг 2 раза в день', group: 'Антикоагулянт' },
    { name: 'Ривароксабан', dose: '15-20 мг 1 раз в день', group: 'Антикоагулянт' },
    { name: 'Аспирин', dose: '75-100 мг 1 раз в день', group: 'Антиагрегант' },
    { name: 'Клопидогрел', dose: '75 мг 1 раз в день', group: 'Антиагрегант' },
  ];

  const filteredDrugs = drugs.filter(drug =>
    drug.name.toLowerCase().includes(drugSearch.toLowerCase()) ||
    drug.group.toLowerCase().includes(drugSearch.toLowerCase())
  );

  const calculators = [
    {
      id: 'bmi',
      name: 'ИМТ',
      desc: 'Индекс массы тела',
      category: 'Антропометрия',
      render: () => (
        <div style={styles.calcContent}>
          <div style={styles.inputGroup}>
            <label>Рост (см):</label>
            <input type="number" placeholder="170" style={styles.input} id="bmi-h" />
          </div>
          <div style={styles.inputGroup}>
            <label>Вес (кг):</label>
            <input type="number" placeholder="70" style={styles.input} id="bmi-w" />
          </div>
          <button style={styles.calcButton} onClick={() => {
            const h = parseFloat(document.getElementById('bmi-h')?.value);
            const w = parseFloat(document.getElementById('bmi-w')?.value);
            if (h && w) {
              const bmi = (w / ((h/100)**2)).toFixed(1);
              setBmiResult({
                value: bmi,
                status: bmi < 18.5 ? '🔻 Недостаточный' : bmi < 25 ? '✅ Норма' : bmi < 30 ? '⚠️ Избыточный' : '🔺 Ожирение',
                bg: bmi < 18.5 ? '#fef3c7' : bmi < 25 ? '#d1fae5' : '#fee2e2'
              });
            }
          }}>Рассчитать</button>
          {bmiResult && (
            <div style={{...styles.result, background: bmiResult.bg}}>
              <strong>ИМТ: {bmiResult.value}</strong><br/>{bmiResult.status}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'egfr',
      name: 'СКФ (eGFR)',
      desc: 'Скорость клубочковой фильтрации (CKD-EPI)',
      category: 'Почки',
      render: () => (
        <div style={styles.calcContent}>
          <div style={styles.inputGroup}>
            <label>Креатинин (мкмоль/л):</label>
            <input type="number" placeholder="80" style={styles.input} id="egfr-creat" />
          </div>
          <div style={styles.inputGroup}>
            <label>Возраст (лет):</label>
            <input type="number" placeholder="65" style={styles.input} id="egfr-age" />
          </div>
          <div style={styles.inputGroup}>
            <label>Пол:</label>
            <select style={styles.input} id="egfr-gender">
              <option value="female">Женский</option>
              <option value="male">Мужской</option>
            </select>
          </div>
          <button style={styles.calcButton} onClick={() => {
            const creat = parseFloat(document.getElementById('egfr-creat')?.value);
            const age = parseFloat(document.getElementById('egfr-age')?.value);
            const gender = document.getElementById('egfr-gender')?.value;
            if (creat && age) {
              const creatMg = creat / 88.4;
              const k = gender === 'female' ? 0.7 : 0.9;
              const a = gender === 'female' ? -0.241 : -0.302;
              let egfrVal = 142 * Math.pow(Math.min(creatMg/k, 1), a) * Math.pow(Math.max(creatMg/k, 1), -1.2) * Math.pow(0.9938, age);
              if (gender === 'female') egfrVal *= 1.012;
              setEgfr(egfrVal.toFixed(1));
            }
          }}>Рассчитать</button>
          {egfr && (
            <div style={{...styles.result, background: egfr < 30 ? '#fee2e2' : egfr < 60 ? '#fef3c7' : '#d1fae5'}}>
              <strong>СКФ: {egfr} мл/мин/1.73м²</strong><br/>
              {egfr >= 90 ? '✅ Норма' : egfr >= 60 ? '⚠️ Умеренное снижение' : egfr >= 30 ? '🔺 Тяжёлое' : '🔴 Терминальное'}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'cr_clearance',
      name: 'Клиренс креатинина',
      desc: 'Формула Cockcroft-Gault',
      category: 'Почки',
      render: () => (
        <div style={styles.calcContent}>
          <div style={styles.inputGroup}>
            <label>Креатинин (мкмоль/л):</label>
            <input type="number" placeholder="80" style={styles.input} id="cr-creat" />
          </div>
          <div style={styles.inputGroup}>
            <label>Возраст (лет):</label>
            <input type="number" placeholder="65" style={styles.input} id="cr-age" />
          </div>
          <div style={styles.inputGroup}>
            <label>Вес (кг):</label>
            <input type="number" placeholder="70" style={styles.input} id="cr-weight" />
          </div>
          <div style={styles.inputGroup}>
            <label>Пол:</label>
            <select style={styles.input} id="cr-gender">
              <option value="1">Мужской</option>
              <option value="0.85">Женский</option>
            </select>
          </div>
          <button style={styles.calcButton} onClick={() => {
            const creat = parseFloat(document.getElementById('cr-creat')?.value);
            const age = parseFloat(document.getElementById('cr-age')?.value);
            const weight = parseFloat(document.getElementById('cr-weight')?.value);
            const gender = parseFloat(document.getElementById('cr-gender')?.value);
            if (creat && age && weight) {
              const creatMg = creat / 88.4;
              const clearance = ((140 - age) * weight * gender) / (72 * creatMg);
              setCrClearance(clearance.toFixed(1));
            }
          }}>Рассчитать</button>
          {crClearance && (
            <div style={{...styles.result, background: crClearance < 30 ? '#fee2e2' : crClearance < 60 ? '#fef3c7' : '#d1fae5'}}>
              <strong>Клиренс: {crClearance} мл/мин</strong><br/>
              {crClearance >= 90 ? '✅ Норма' : crClearance >= 60 ? '⚠️ Лёгкое снижение' : crClearance >= 30 ? '🔺 Умеренное' : '🔴 Тяжёлое'}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'ideal_weight',
      name: 'Идеальный вес',
      desc: 'Формула Брока',
      category: 'Антропометрия',
      render: () => (
        <div style={styles.calcContent}>
          <div style={styles.inputGroup}>
            <label>Рост (см):</label>
            <input type="number" placeholder="170" style={styles.input} id="iw-height" />
          </div>
          <div style={styles.inputGroup}>
            <label>Пол:</label>
            <select style={styles.input} id="iw-gender">
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>
          <button style={styles.calcButton} onClick={() => {
            const height = parseFloat(document.getElementById('iw-height')?.value);
            const gender = document.getElementById('iw-gender')?.value;
            if (height) {
              let ideal = height - 100;
              if (gender === 'female') ideal *= 0.9;
              setIdealWeight(ideal.toFixed(1));
            }
          }}>Рассчитать</button>
          {idealWeight && (
            <div style={{...styles.result, background: '#d1fae5'}}>
              <strong>Идеальный вес: {idealWeight} кг</strong><br/>
              Диапазон: {(idealWeight * 0.9).toFixed(1)} - {(idealWeight * 1.1).toFixed(1)} кг
            </div>
          )}
        </div>
      )
    },
    {
      id: 'cha2ds2vasc',
      name: 'CHA₂DS₂-VASc',
      desc: 'Риск инсульта при ФП',
      category: 'Кардиология',
      render: () => (
        <div style={styles.calcContent}>
          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}><input type="checkbox" id="cha-chf" /> ЗСН (1)</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="cha-htn" /> Гипертония (1)</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="cha-age75" /> Возраст ≥75 (2)</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="cha-dm" /> Диабет (1)</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="cha-stroke" /> Инсульт/ТИА (2)</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="cha-vascular" /> Сосудистые заболевания (1)</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="cha-age65" /> Возраст 65-74 (1)</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="cha-female" /> Женский пол (1)</label>
          </div>
          <button style={styles.calcButton} onClick={() => {
            let score = 0;
            if (document.getElementById('cha-chf')?.checked) score += 1;
            if (document.getElementById('cha-htn')?.checked) score += 1;
            if (document.getElementById('cha-age75')?.checked) score += 2;
            if (document.getElementById('cha-dm')?.checked) score += 1;
            if (document.getElementById('cha-stroke')?.checked) score += 2;
            if (document.getElementById('cha-vascular')?.checked) score += 1;
            if (document.getElementById('cha-age65')?.checked) score += 1;
            if (document.getElementById('cha-female')?.checked) score += 1;
            setChaScore(score);
          }}>Рассчитать</button>
          {chaScore !== null && (
            <div style={{...styles.result, background: chaScore >= 2 ? '#fee2e2' : chaScore === 1 ? '#fef3c7' : '#d1fae5'}}>
              <strong>CHA₂DS₂-VASc: {chaScore} баллов</strong><br/>
              {chaScore === 0 ? '✅ Низкий риск' : chaScore === 1 ? '⚠️ Средний' : '🔺 Высокий — антикоагулянты'}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'hasbled',
      name: 'HAS-BLED',
      desc: 'Риск кровотечений',
      category: 'Кардиология',
      render: () => (
        <div style={styles.calcContent}>
          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}><input type="checkbox" id="hb-htn" /> Гипертония</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="hb-renal" /> Почечная недостаточность</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="hb-liver" /> Заболевания печени</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="hb-stroke" /> Инсульт в анамнезе</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="hb-bleed" /> Кровотечения в анамнезе</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="hb-labile" /> Лабильное МНО</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="hb-elderly" /> Возраст &gt;65</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="hb-drugs" /> Препараты/алкоголь</label>
          </div>
          <button style={styles.calcButton} onClick={() => {
            let score = 0;
            ['hb-htn','hb-renal','hb-liver','hb-stroke','hb-bleed','hb-labile','hb-elderly','hb-drugs'].forEach(id => {
              if (document.getElementById(id)?.checked) score += 1;
            });
            setHasBledScore(score);
          }}>Рассчитать</button>
          {hasBledScore !== null && (
            <div style={{...styles.result, background: hasBledScore >= 3 ? '#fee2e2' : '#d1fae5'}}>
              <strong>HAS-BLED: {hasBledScore} баллов</strong><br/>
              {hasBledScore <= 2 ? '✅ Приемлемый риск' : '🔺 Высокий риск'}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'grace',
      name: 'Шкала GRACE',
      desc: 'Риск смерти при ОКС',
      category: 'Кардиология',
      render: () => (
        <div style={styles.calcContent}>
          <div style={styles.inputGroup}>
            <label>Возраст (лет):</label>
            <input type="number" placeholder="65" style={styles.input} id="grace-age" />
          </div>
          <div style={styles.inputGroup}>
            <label>ЧСС (уд/мин):</label>
            <input type="number" placeholder="80" style={styles.input} id="grace-hr" />
          </div>
          <div style={styles.inputGroup}>
            <label>САД (мм рт.ст.):</label>
            <input type="number" placeholder="120" style={styles.input} id="grace-sbp" />
          </div>
          <div style={styles.inputGroup}>
            <label>Креатинин (мкмоль/л):</label>
            <input type="number" placeholder="80" style={styles.input} id="grace-creat" />
          </div>
          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}><input type="checkbox" id="grace-chf" /> ЗСН</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="grace-st" /> Подъём ST</label>
            <label style={styles.checkboxLabel}><input type="checkbox" id="grace-arrest" /> Остановка сердца</label>
          </div>
          <button style={styles.calcButton} onClick={() => {
            const age = parseFloat(document.getElementById('grace-age')?.value) || 0;
            const hr = parseFloat(document.getElementById('grace-hr')?.value) || 0;
            const sbp = parseFloat(document.getElementById('grace-sbp')?.value) || 0;
            const creat = parseFloat(document.getElementById('grace-creat')?.value) || 0;
            let score = 0;
            score += age > 0 ? (age - 30) * 0.5 : 0;
            score += hr > 0 ? (hr - 70) * 0.3 : 0;
            score += sbp > 0 ? (140 - sbp) * 0.2 : 0;
            score += creat > 0 ? (creat - 70) * 0.05 : 0;
            if (document.getElementById('grace-chf')?.checked) score += 20;
            if (document.getElementById('grace-st')?.checked) score += 15;
            if (document.getElementById('grace-arrest')?.checked) score += 25;
            setGraceScore(Math.round(score));
          }}>Рассчитать</button>
          {graceScore && (
            <div style={{...styles.result, background: graceScore > 140 ? '#fee2e2' : graceScore > 100 ? '#fef3c7' : '#d1fae5'}}>
              <strong>GRACE: {graceScore} баллов</strong><br/>
              {graceScore <= 100 ? '✅ Низкий риск' : graceScore <= 140 ? '⚠️ Средний' : '🔺 Высокий'}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'lv_mass',
      name: 'Масса миокарда ЛЖ',
      desc: 'Расчёт по данным ЭхоКГ',
      category: 'Кардиология',
      render: () => (
        <div style={styles.calcContent}>
          <div style={styles.inputGroup}>
            <label>ТЗСЛЖ (мм):</label>
            <input type="number" placeholder="10" style={styles.input} id="lv-pw" />
          </div>
          <div style={styles.inputGroup}>
            <label>МЖП (мм):</label>
            <input type="number" placeholder="10" style={styles.input} id="lv-ivs" />
          </div>
          <div style={styles.inputGroup}>
            <label>КДР ЛЖ (мм):</label>
            <input type="number" placeholder="50" style={styles.input} id="lv-lvedd" />
          </div>
          <button style={styles.calcButton} onClick={() => {
            const pw = parseFloat(document.getElementById('lv-pw')?.value) || 0;
            const ivs = parseFloat(document.getElementById('lv-ivs')?.value) || 0;
            const lvedd = parseFloat(document.getElementById('lv-lvedd')?.value) || 0;
            if (pw && ivs && lvedd) {
              const mass = 0.8 * (1.04 * Math.pow(lvedd + pw + ivs, 3) - Math.pow(lvedd, 3)) + 0.6;
              setLvMass(mass.toFixed(1));
            }
          }}>Рассчитать</button>
          {lvMass && (
            <div style={{...styles.result, background: lvMass > 200 ? '#fee2e2' : lvMass > 150 ? '#fef3c7' : '#d1fae5'}}>
              <strong>Масса ЛЖ: {lvMass} г</strong><br/>
              {lvMass <= 150 ? '✅ Норма' : lvMass <= 200 ? '⚠️ Гипертрофия I ст.' : '🔺 Выраженная'}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'bmr',
      name: 'Базальный обмен',
      desc: 'Формула Миффлина-Сан Жеора',
      category: 'Антропометрия',
      render: () => (
        <div style={styles.calcContent}>
          <div style={styles.inputGroup}>
            <label>Вес (кг):</label>
            <input type="number" placeholder="70" style={styles.input} id="bmr-weight" />
          </div>
          <div style={styles.inputGroup}>
            <label>Рост (см):</label>
            <input type="number" placeholder="170" style={styles.input} id="bmr-height" />
          </div>
          <div style={styles.inputGroup}>
            <label>Возраст (лет):</label>
            <input type="number" placeholder="40" style={styles.input} id="bmr-age" />
          </div>
          <div style={styles.inputGroup}>
            <label>Пол:</label>
            <select style={styles.input} id="bmr-gender">
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>
          <button style={styles.calcButton} onClick={() => {
            const weight = parseFloat(document.getElementById('bmr-weight')?.value);
            const height = parseFloat(document.getElementById('bmr-height')?.value);
            const age = parseFloat(document.getElementById('bmr-age')?.value);
            const gender = document.getElementById('bmr-gender')?.value;
            if (weight && height && age) {
              let bmrVal = 10 * weight + 6.25 * height - 5 * age;
              bmrVal += gender === 'male' ? 5 : -161;
              setBmr(Math.round(bmrVal));
            }
          }}>Рассчитать</button>
          {bmr && (
            <div style={{...styles.result, background: '#d1fae5'}}>
              <strong>Базальный обмен: {bmr} ккал/сут</strong><br/>
              Низкая активность: {Math.round(bmr * 1.2)} ккал | Средняя: {Math.round(bmr * 1.55)} ккал
            </div>
          )}
        </div>
      )
    },
  ];

  const filteredCalculators = calculators.filter(calc =>
    calc.name.toLowerCase().includes(calculatorSearch.toLowerCase()) ||
    calc.desc.toLowerCase().includes(calculatorSearch.toLowerCase()) ||
    calc.category.toLowerCase().includes(calculatorSearch.toLowerCase())
  );

  const groupedCalculators = {};
  filteredCalculators.forEach(calc => {
    if (!groupedCalculators[calc.category]) groupedCalculators[calc.category] = [];
    groupedCalculators[calc.category].push(calc);
  });

  return (
    <div style={styles.sidebar}>
      <div style={styles.tabs}>
        <button onClick={() => setActiveTab('calculators')} style={{...styles.tab, borderBottom: activeTab === 'calculators' ? '2px solid #10b981' : 'none', color: activeTab === 'calculators' ? '#10b981' : '#6b7280'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'calculators' ? '#10b981' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="12" y2="14" />
            <line x1="8" y1="18" x2="12" y2="18" />
          </svg>
          <span>Калькуляторы</span>
        </button>

        {/* Лаборатория */}
        <button onClick={() => setActiveTab('laboratory')} style={{...styles.tab, borderBottom: activeTab === 'laboratory' ? '2px solid #10b981' : 'none', color: activeTab === 'laboratory' ? '#10b981' : '#6b7280'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'laboratory' ? '#10b981' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3h6v2H9z" />
            <path d="M10 5v4l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V5" />
            <line x1="10" y1="13" x2="14" y2="13" />
          </svg>
          <span>Лаборатория</span>
        </button>

        {/* Препараты */}
        <button onClick={() => setActiveTab('drugs')} style={{...styles.tab, borderBottom: activeTab === 'drugs' ? '2px solid #10b981' : 'none', color: activeTab === 'drugs' ? '#10b981' : '#6b7280'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'drugs' ? '#10b981' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="6" />
            <line x1="12" y1="6" x2="12" y2="18" />
          </svg>
          <span>Препараты</span>
        </button>
      </div>

      {/* Контент */}
      <div style={styles.tabContent}>
        {/* КАЛЬКУЛЯТОРЫ */}
        {activeTab === 'calculators' && (
          <div>
            <h3 style={styles.sectionTitle}>Медицинские калькуляторы</h3>
            <input type="text" placeholder="Поиск калькулятора..." value={calculatorSearch} onChange={(e) => setCalculatorSearch(e.target.value)} style={styles.searchInput} />
            
            {Object.entries(groupedCalculators).map(([category, calcs]) => (
              <div key={category} style={styles.categoryGroup}>
                <h4 style={styles.categoryHeader}>{category}</h4>
                {calcs.map((calc) => (
                  <div key={calc.id} style={styles.calcItem}>
                    <div style={styles.calcHeader} onClick={() => setExpandedCalc(expandedCalc === calc.id ? null : calc.id)}>
                      <span style={styles.calcName}>{calc.name}</span>
                      <span style={styles.calcArrow}>{expandedCalc === calc.id ? '▲' : '▼'}</span>
                    </div>
                    <p style={styles.calcDesc}>{calc.desc}</p>
                    {expandedCalc === calc.id && calc.render()}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ЛАБОРАТОРИЯ — ВСЕ КАТЕГОРИИ С ПОИСКОМ */}
        {activeTab === 'laboratory' && (
          <div>
            <h3 style={styles.sectionTitle}>Лабораторные референсы</h3>
            
            {/* ПОЛЕ ПОИСКА */}
            <input 
              type="text" 
              placeholder="Поиск анализа..." 
              value={labSearch} 
              onChange={(e) => setLabSearch(e.target.value)} 
              style={styles.searchInput} 
            />
            
            {/* Электролиты */}
            {filteredLabValues.electrolytes.length > 0 && (
              <div style={styles.labCategory}>
                <h4 style={styles.categoryTitle}>Электролиты</h4>
                {filteredLabValues.electrolytes.map(item => (
                  <div key={item.id} style={styles.labValue}>
                    <div style={styles.labHeader}><span>{item.name}</span><span style={styles.labNorm}>{item.norm}</span></div>
                    <input 
                      type="number" 
                      step="0.1" 
                      placeholder="Введите значение" 
                      style={styles.inputSmall} 
                      value={labValues[item.id] || ''} 
                      onChange={(e) => setLabValues({...labValues, [item.id]: e.target.value})} 
                    />
                    {labValues[item.id] && checkLabValue(
                      labValues[item.id], 
                      item.min, 
                      item.max, 
                      item.isMaxOnly, 
                      item.isMinOnly
                    ) && (
                      <p style={{color: checkLabValue(labValues[item.id], item.min, item.max, item.isMaxOnly, item.isMinOnly).color, fontSize: '12px', marginTop: '4px', fontWeight: '600'}}>
                        {checkLabValue(labValues[item.id], item.min, item.max, item.isMaxOnly, item.isMinOnly).text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Почечные маркеры */}
            {filteredLabValues.kidney.length > 0 && (
              <div style={styles.labCategory}>
                <h4 style={styles.categoryTitle}>Почечные маркеры</h4>
                {filteredLabValues.kidney.map(item => (
                  <div key={item.id} style={styles.labValue}>
                    <div style={styles.labHeader}><span>{item.name}</span><span style={styles.labNorm}>{item.norm}</span></div>
                    <input 
                      type="number" 
                      step="0.1" 
                      placeholder="Введите значение" 
                      style={styles.inputSmall} 
                      value={labValues[item.id] || ''} 
                      onChange={(e) => setLabValues({...labValues, [item.id]: e.target.value})} 
                    />
                    {labValues[item.id] && checkLabValue(
                      labValues[item.id], 
                      item.min, 
                      item.max, 
                      item.isMaxOnly, 
                      item.isMinOnly
                    ) && (
                      <p style={{color: checkLabValue(labValues[item.id], item.min, item.max, item.isMaxOnly, item.isMinOnly).color, fontSize: '12px', marginTop: '4px', fontWeight: '600'}}>
                        {checkLabValue(labValues[item.id], item.min, item.max, item.isMaxOnly, item.isMinOnly).text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Липидный профиль */}
            {filteredLabValues.lipids.length > 0 && (
              <div style={styles.labCategory}>
                <h4 style={styles.categoryTitle}>Липидный профиль</h4>
                {filteredLabValues.lipids.map(item => (
                  <div key={item.id} style={styles.labValue}>
                    <div style={styles.labHeader}><span>{item.name}</span><span style={styles.labNorm}>{item.norm}</span></div>
                    <input 
                      type="number" 
                      step="0.1" 
                      placeholder="Введите значение" 
                      style={styles.inputSmall} 
                      value={labValues[item.id] || ''} 
                      onChange={(e) => setLabValues({...labValues, [item.id]: e.target.value})} 
                    />
                    {labValues[item.id] && checkLabValue(
                      labValues[item.id], 
                      item.min, 
                      item.max, 
                      item.isMaxOnly, 
                      item.isMinOnly
                    ) && (
                      <p style={{color: checkLabValue(labValues[item.id], item.min, item.max, item.isMaxOnly, item.isMinOnly).color, fontSize: '12px', marginTop: '4px', fontWeight: '600'}}>
                        {checkLabValue(labValues[item.id], item.min, item.max, item.isMaxOnly, item.isMinOnly).text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Общий анализ крови */}
            {filteredLabValues.blood.length > 0 && (
              <div style={styles.labCategory}>
                <h4 style={styles.categoryTitle}>Общий анализ крови</h4>
                {filteredLabValues.blood.map(item => (
                  <div key={item.id} style={styles.labValue}>
                    <div style={styles.labHeader}><span>{item.name}</span><span style={styles.labNorm}>{item.norm}</span></div>
                    <input 
                      type="number" 
                      step={item.id === 'hemoglobin' || item.id === 'platelets' ? '1' : '0.1'}
                      placeholder="Введите значение" 
                      style={styles.inputSmall} 
                      value={labValues[item.id] || ''} 
                      onChange={(e) => setLabValues({...labValues, [item.id]: e.target.value})} 
                    />
                    {labValues[item.id] && checkLabValue(
                      labValues[item.id], 
                      item.min, 
                      item.max, 
                      item.isMaxOnly, 
                      item.isMinOnly
                    ) && (
                      <p style={{color: checkLabValue(labValues[item.id], item.min, item.max, item.isMaxOnly, item.isMinOnly).color, fontSize: '12px', marginTop: '4px', fontWeight: '600'}}>
                        {checkLabValue(labValues[item.id], item.min, item.max, item.isMaxOnly, item.isMinOnly).text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Печёночные пробы */}
            {filteredLabValues.liver.length > 0 && (
              <div style={styles.labCategory}>
                <h4 style={styles.categoryTitle}>Печёночные пробы</h4>
                {filteredLabValues.liver.map(item => (
                  <div key={item.id} style={styles.labValue}>
                    <div style={styles.labHeader}><span>{item.name}</span><span style={styles.labNorm}>{item.norm}</span></div>
                    <input 
                      type="number" 
                      step={item.id === 'alt' || item.id === 'ast' ? '1' : '0.1'}
                      placeholder="Введите значение" 
                      style={styles.inputSmall} 
                      value={labValues[item.id] || ''} 
                      onChange={(e) => setLabValues({...labValues, [item.id]: e.target.value})} 
                    />
                    {labValues[item.id] && checkLabValue(
                      labValues[item.id], 
                      item.min, 
                      item.max, 
                      item.isMaxOnly, 
                      item.isMinOnly
                    ) && (
                      <p style={{color: checkLabValue(labValues[item.id], item.min, item.max, item.isMaxOnly, item.isMinOnly).color, fontSize: '12px', marginTop: '4px', fontWeight: '600'}}>
                        {checkLabValue(labValues[item.id], item.min, item.max, item.isMaxOnly, item.isMinOnly).text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Маркеры воспаления */}
            {filteredLabValues.inflammation.length > 0 && (
              <div style={styles.labCategory}>
                <h4 style={styles.categoryTitle}>Маркеры воспаления</h4>
                {filteredLabValues.inflammation.map(item => (
                  <div key={item.id} style={styles.labValue}>
                    <div style={styles.labHeader}><span>{item.name}</span><span style={styles.labNorm}>{item.norm}</span></div>
                    <input 
                      type="number" 
                      step={item.id === 'esr' ? '1' : '0.1'}
                      placeholder="Введите значение" 
                      style={styles.inputSmall} 
                      value={labValues[item.id] || ''} 
                      onChange={(e) => setLabValues({...labValues, [item.id]: e.target.value})} 
                    />
                    {labValues[item.id] && checkLabValue(
                      labValues[item.id], 
                      item.min, 
                      item.max, 
                      item.isMaxOnly, 
                      item.isMinOnly
                    ) && (
                      <p style={{color: checkLabValue(labValues[item.id], item.min, item.max, item.isMaxOnly, item.isMinOnly).color, fontSize: '12px', marginTop: '4px', fontWeight: '600'}}>
                        {checkLabValue(labValues[item.id], item.min, item.max, item.isMaxOnly, item.isMinOnly).text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ПРЕПАРАТЫ */}
        {activeTab === 'drugs' && (
          <div>
            <h3 style={styles.sectionTitle}>Справочник препаратов</h3>
            <input type="text" placeholder="Поиск препарата..." value={drugSearch} onChange={(e) => setDrugSearch(e.target.value)} style={styles.searchInput} />
            <div style={styles.drugList}>
              {filteredDrugs.length === 0 ? <p style={styles.empty}>Препарат не найден</p> : filteredDrugs.map((drug, i) => (
                <div key={i} style={styles.drugItem}>
                  <h4 style={styles.drugName}>{drug.name}</h4>
                  <p style={styles.drugDosage}>{drug.dose}</p>
                  <p style={styles.drugGroup}>{drug.group}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  sidebar: { background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', height: '100%', overflow: 'hidden' },
  tabs: { display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  tab: { flex: 1, padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.3s' },
  tabContent: { padding: '16px', maxHeight: '650px', overflowY: 'auto' },
  sectionTitle: { fontSize: '15px', fontWeight: '600', color: '#10b981', marginBottom: '12px', marginTop: '0' },
  searchInput: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' },
  categoryGroup: { marginBottom: '16px' },
  categoryHeader: { fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  calcItem: { background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '8px', overflow: 'hidden' },
  calcHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', cursor: 'pointer', background: 'white' },
  calcName: { fontSize: '14px', fontWeight: '600', color: '#374151' },
  calcArrow: { fontSize: '12px', color: '#9ca3af' },
  calcDesc: { fontSize: '12px', color: '#6b7280', margin: '0 0 0 12px', padding: '0 12px 12px 12px' },
  calcContent: { padding: '12px', background: '#f0fdf4', borderTop: '1px solid #e5e7eb' },
  inputGroup: { marginBottom: '10px' },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  inputSmall: { width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' },
  calcButton: { width: '100%', padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  result: { marginTop: '12px', padding: '12px', borderRadius: '6px', fontSize: '13px' },
  checkboxGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' },
  checkboxLabel: { fontSize: '12px', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' },
  labCategory: { background: '#f9fafb', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '12px' },
  categoryTitle: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px', margin: '0' },
  labValue: { padding: '10px', background: 'white', borderRadius: '4px', marginBottom: '8px', border: '1px solid #f3f4f6' },
  labHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' },
  labNorm: { color: '#6b7280', fontSize: '11px', fontWeight: '400' },
  drugList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  drugItem: { padding: '10px', background: '#f9fafb', borderRadius: '4px', border: '1px solid #e5e7eb' },
  drugName: { margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#10b981' },
  drugDosage: { margin: '0 0 4px 0', fontSize: '12px', color: '#374151' },
  drugGroup: { margin: 0, fontSize: '11px', color: '#6b7280' },
  empty: { textAlign: 'center', fontSize: '13px', color: '#6b7280', padding: '20px' },
};

export default RightSidebar;