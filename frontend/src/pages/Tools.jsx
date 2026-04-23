import React, { useState } from 'react';

function Tools() {
  const [activeTab, setActiveTab] = useState('calculators');
  const [labValues, setLabValues] = useState({});
  const [searchDrug, setSearchDrug] = useState('');
  const [bmiResult, setBmiResult] = useState(null);
  const [crClearance, setCrClearance] = useState(null);
  const [openRecommendation, setOpenRecommendation] = useState(null);

  const checkLabValue = (value, min, max, isMaxOnly = false, isMinOnly = false) => {
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    if (isMaxOnly && num > max) return { status: 'high', color: '#ef4444', text: '🔺 Выше нормы' };
    if (isMinOnly && num < min) return { status: 'low', color: '#f59e0b', text: '🔻 Ниже нормы' };
    if (num < min) return { status: 'low', color: '#f59e0b', text: '🔻 Ниже нормы' };
    if (num > max) return { status: 'high', color: '#ef4444', text: '🔺 Выше нормы' };
    return { status: 'normal', color: '#10b981', text: '✅ В норме' };
  };

  const tabs = {
    calculators: { /* ... калькуляторы ... */ },
    laboratory: {
      title: '🧪 Лаборатория',
      content: (
        <div style={styles.tabContent}>
          <h3 style={styles.sectionTitle}>Лабораторные референсы</h3>
          
          {/* Электролиты */}
          <div style={styles.labCategory}>
            <h4 style={styles.categoryTitle}>⚡ Электролиты</h4>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>K⁺ (Калий)</span>
                <span style={styles.labNorm}>3.5-5.0 ммоль/л</span>
              </div>
              <input type="number" step="0.1" placeholder="Введите значение" style={styles.input}
                value={labValues.k || ''} onChange={(e) => setLabValues({...labValues, k: e.target.value})} />
              {labValues.k && checkLabValue(labValues.k, 3.5, 5.0) && (
                <p style={{color: checkLabValue(labValues.k, 3.5, 5.0).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.k, 3.5, 5.0).text}
                </p>
              )}
            </div>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>Na⁺ (Натрий)</span>
                <span style={styles.labNorm}>135-145 ммоль/л</span>
              </div>
              <input type="number" step="0.1" placeholder="Введите значение" style={styles.input}
                value={labValues.na || ''} onChange={(e) => setLabValues({...labValues, na: e.target.value})} />
              {labValues.na && checkLabValue(labValues.na, 135, 145) && (
                <p style={{color: checkLabValue(labValues.na, 135, 145).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.na, 135, 145).text}
                </p>
              )}
            </div>
          </div>

          {/* Почечные маркеры */}
          <div style={styles.labCategory}>
            <h4 style={styles.categoryTitle}>🫘 Почечные маркеры</h4>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>Креатинин</span>
                <span style={styles.labNorm}>62-106 мкмоль/л</span>
              </div>
              <input type="number" step="0.1" placeholder="Введите значение" style={styles.input}
                value={labValues.creatinine || ''} onChange={(e) => setLabValues({...labValues, creatinine: e.target.value})} />
              {labValues.creatinine && checkLabValue(labValues.creatinine, 62, 106) && (
                <p style={{color: checkLabValue(labValues.creatinine, 62, 106).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.creatinine, 62, 106).text}
                </p>
              )}
            </div>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>Мочевина</span>
                <span style={styles.labNorm}>2.5-8.3 ммоль/л</span>
              </div>
              <input type="number" step="0.1" placeholder="Введите значение" style={styles.input}
                value={labValues.urea || ''} onChange={(e) => setLabValues({...labValues, urea: e.target.value})} />
              {labValues.urea && checkLabValue(labValues.urea, 2.5, 8.3) && (
                <p style={{color: checkLabValue(labValues.urea, 2.5, 8.3).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.urea, 2.5, 8.3).text}
                </p>
              )}
            </div>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>Мочевая кислота</span>
                <span style={styles.labNorm}>210-420 мкмоль/л</span>
              </div>
              <input type="number" step="1" placeholder="Введите значение" style={styles.input}
                value={labValues.uricAcid || ''} onChange={(e) => setLabValues({...labValues, uricAcid: e.target.value})} />
              {labValues.uricAcid && checkLabValue(labValues.uricAcid, 210, 420) && (
                <p style={{color: checkLabValue(labValues.uricAcid, 210, 420).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.uricAcid, 210, 420).text}
                </p>
              )}
            </div>
          </div>

          {/* Липидный профиль */}
          <div style={styles.labCategory}>
            <h4 style={styles.categoryTitle}>❤️ Липидный профиль</h4>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>Холестерин общий</span>
                <span style={styles.labNorm}>&lt;5.2 ммоль/л</span>
              </div>
              <input type="number" step="0.1" placeholder="Введите значение" style={styles.input}
                value={labValues.cholesterol || ''} onChange={(e) => setLabValues({...labValues, cholesterol: e.target.value})} />
              {labValues.cholesterol && checkLabValue(labValues.cholesterol, 0, 5.2, true) && (
                <p style={{color: checkLabValue(labValues.cholesterol, 0, 5.2, true).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.cholesterol, 0, 5.2, true).text}
                </p>
              )}
            </div>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>ЛПНП</span>
                <span style={styles.labNorm}>&lt;3.0 ммоль/л</span>
              </div>
              <input type="number" step="0.1" placeholder="Введите значение" style={styles.input}
                value={labValues.ldl || ''} onChange={(e) => setLabValues({...labValues, ldl: e.target.value})} />
              {labValues.ldl && checkLabValue(labValues.ldl, 0, 3.0, true) && (
                <p style={{color: checkLabValue(labValues.ldl, 0, 3.0, true).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.ldl, 0, 3.0, true).text}
                </p>
              )}
            </div>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>ЛПВП</span>
                <span style={styles.labNorm}>&gt;1.0 ммоль/л</span>
              </div>
              <input type="number" step="0.1" placeholder="Введите значение" style={styles.input}
                value={labValues.hdl || ''} onChange={(e) => setLabValues({...labValues, hdl: e.target.value})} />
              {labValues.hdl && checkLabValue(labValues.hdl, 1.0, 999, false, true) && (
                <p style={{color: checkLabValue(labValues.hdl, 1.0, 999, false, true).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.hdl, 1.0, 999, false, true).text}
                </p>
              )}
            </div>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>Триглицериды</span>
                <span style={styles.labNorm}>&lt;1.7 ммоль/л</span>
              </div>
              <input type="number" step="0.1" placeholder="Введите значение" style={styles.input}
                value={labValues.triglycerides || ''} onChange={(e) => setLabValues({...labValues, triglycerides: e.target.value})} />
              {labValues.triglycerides && checkLabValue(labValues.triglycerides, 0, 1.7, true) && (
                <p style={{color: checkLabValue(labValues.triglycerides, 0, 1.7, true).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.triglycerides, 0, 1.7, true).text}
                </p>
              )}
            </div>
          </div>

          {/* Общий анализ крови */}
          <div style={styles.labCategory}>
            <h4 style={styles.categoryTitle}>🔴 Общий анализ крови</h4>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>Гемоглобин</span>
                <span style={styles.labNorm}>120-160 г/л</span>
              </div>
              <input type="number" step="1" placeholder="Введите значение" style={styles.input}
                value={labValues.hemoglobin || ''} onChange={(e) => setLabValues({...labValues, hemoglobin: e.target.value})} />
              {labValues.hemoglobin && checkLabValue(labValues.hemoglobin, 120, 160) && (
                <p style={{color: checkLabValue(labValues.hemoglobin, 120, 160).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.hemoglobin, 120, 160).text}
                </p>
              )}
            </div>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>Лейкоциты</span>
                <span style={styles.labNorm}>4.0-9.0 ×10⁹/л</span>
              </div>
              <input type="number" step="0.1" placeholder="Введите значение" style={styles.input}
                value={labValues.leukocytes || ''} onChange={(e) => setLabValues({...labValues, leukocytes: e.target.value})} />
              {labValues.leukocytes && checkLabValue(labValues.leukocytes, 4.0, 9.0) && (
                <p style={{color: checkLabValue(labValues.leukocytes, 4.0, 9.0).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.leukocytes, 4.0, 9.0).text}
                </p>
              )}
            </div>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>Тромбоциты</span>
                <span style={styles.labNorm}>180-320 ×10⁹/л</span>
              </div>
              <input type="number" step="1" placeholder="Введите значение" style={styles.input}
                value={labValues.platelets || ''} onChange={(e) => setLabValues({...labValues, platelets: e.target.value})} />
              {labValues.platelets && checkLabValue(labValues.platelets, 180, 320) && (
                <p style={{color: checkLabValue(labValues.platelets, 180, 320).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.platelets, 180, 320).text}
                </p>
              )}
            </div>
          </div>

          {/* Печёночные пробы */}
          <div style={styles.labCategory}>
            <h4 style={styles.categoryTitle}>🟡 Печёночные пробы</h4>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>АЛТ</span>
                <span style={styles.labNorm}>&lt;35 Ед/л</span>
              </div>
              <input type="number" step="1" placeholder="Введите значение" style={styles.input}
                value={labValues.alt || ''} onChange={(e) => setLabValues({...labValues, alt: e.target.value})} />
              {labValues.alt && checkLabValue(labValues.alt, 0, 35, true) && (
                <p style={{color: checkLabValue(labValues.alt, 0, 35, true).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.alt, 0, 35, true).text}
                </p>
              )}
            </div>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>АСТ</span>
                <span style={styles.labNorm}>&lt;35 Ед/л</span>
              </div>
              <input type="number" step="1" placeholder="Введите значение" style={styles.input}
                value={labValues.ast || ''} onChange={(e) => setLabValues({...labValues, ast: e.target.value})} />
              {labValues.ast && checkLabValue(labValues.ast, 0, 35, true) && (
                <p style={{color: checkLabValue(labValues.ast, 0, 35, true).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.ast, 0, 35, true).text}
                </p>
              )}
            </div>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>Билирубин общий</span>
                <span style={styles.labNorm}>3.4-20.5 мкмоль/л</span>
              </div>
              <input type="number" step="0.1" placeholder="Введите значение" style={styles.input}
                value={labValues.bilirubin || ''} onChange={(e) => setLabValues({...labValues, bilirubin: e.target.value})} />
              {labValues.bilirubin && checkLabValue(labValues.bilirubin, 3.4, 20.5) && (
                <p style={{color: checkLabValue(labValues.bilirubin, 3.4, 20.5).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.bilirubin, 3.4, 20.5).text}
                </p>
              )}
            </div>
          </div>

          {/* Маркеры воспаления */}
          <div style={styles.labCategory}>
            <h4 style={styles.categoryTitle}>🔥 Маркеры воспаления</h4>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>СРБ</span>
                <span style={styles.labNorm}>&lt;5.0 мг/л</span>
              </div>
              <input type="number" step="0.1" placeholder="Введите значение" style={styles.input}
                value={labValues.crp || ''} onChange={(e) => setLabValues({...labValues, crp: e.target.value})} />
              {labValues.crp && checkLabValue(labValues.crp, 0, 5.0, true) && (
                <p style={{color: checkLabValue(labValues.crp, 0, 5.0, true).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.crp, 0, 5.0, true).text}
                </p>
              )}
            </div>
            <div style={styles.labValue}>
              <div style={styles.labHeader}>
                <span>СОЭ</span>
                <span style={styles.labNorm}>2-15 мм/ч</span>
              </div>
              <input type="number" step="1" placeholder="Введите значение" style={styles.input}
                value={labValues.esr || ''} onChange={(e) => setLabValues({...labValues, esr: e.target.value})} />
              {labValues.esr && checkLabValue(labValues.esr, 2, 15) && (
                <p style={{color: checkLabValue(labValues.esr, 2, 15).color, fontSize: '13px', marginTop: '5px', fontWeight: '600'}}>
                  {checkLabValue(labValues.esr, 2, 15).text}
                </p>
              )}
            </div>
          </div>
        </div>
      ),
    },
    drugs: { /* ... препараты ... */ },
    recommendations: { /* ... рекомендации ... */ },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.tabsContainer}>
          {Object.entries(tabs).map(([key, tab]) => (
            <button key={key} onClick={() => { setActiveTab(key); setOpenRecommendation(null); }}
              style={{...styles.tabButton, background: activeTab === key ? '#10b981' : '#f3f4f6', color: activeTab === key ? 'white' : '#374151'}}>
              {tab.title}
            </button>
          ))}
        </div>
        <div style={styles.tabPanel}>{tabs[activeTab].content}</div>
      </div>
    </div>
  );
}

const styles = {
  container: { flex: 1, padding: '40px', background: '#f0fdf4' },
  sidebar: { maxWidth: '900px', margin: '0 auto' },
  tabsContainer: { display: 'flex', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' },
  tabButton: { flex: '1 1 auto', padding: '12px 16px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s', whiteSpace: 'nowrap' },
  tabPanel: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', minHeight: '500px' },
  tabContent: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#10b981', marginBottom: '20px', margin: '0' },
  labCategory: { background: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' },
  categoryTitle: { fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '15px', margin: '0' },
  calculatorItem: { padding: '20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' },
  calcTitle: { margin: '0 0 8px 0', color: '#10b981', fontSize: '16px' },
  calcDesc: { margin: '0 0 15px 0', color: '#6b7280', fontSize: '13px' },
  inputGroup: { marginBottom: '12px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', marginTop: '5px', boxSizing: 'border-box', outline: 'none' },
  calculateButton: { width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginTop: '10px' },
  labValue: { padding: '15px', background: 'white', borderRadius: '6px', marginBottom: '10px', border: '1px solid #e5e7eb' },
  labHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: '600', color: '#374151' },
  labNorm: { color: '#6b7280', fontSize: '13px', fontWeight: '400' },
  recommendationItem: { padding: '15px', background: '#f0fdf4', borderRadius: '8px', borderLeft: '3px solid #10b981' },
  recommendationContent: { marginTop: '15px', padding: '15px', background: 'white', borderRadius: '6px', fontSize: '14px' },
  viewButton: { background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginTop: '10px' },
  drugItem: { padding: '15px', background: '#f9fafb', borderRadius: '6px', borderBottom: '1px solid #e5e7eb' },
  drugDosage: { color: '#10b981', fontWeight: '600', margin: '5px 0' },
  drugInfo: { color: '#6b7280', fontSize: '13px', margin: 0 },
};

export default Tools;