import { useState, useEffect } from 'react';

/* ── Stripe Price IDs ── */
const SERVICES = [
  {
    id: 'yachin',
    priceId: 'price_1TIQTmDedaFhOLE3agiOgUwD',
    name: '家賃交渉サポート',
    price: 480,
    icon: '🏠',
    tagline: '借地借家法に基づく交渉メール文面を即日提供',
    desc: '周辺相場との比較・交渉可能性の分析・法的根拠つきの交渉メール文面・長期節約試算をレポートでお届けします。',
    fields: [
      { key: 'address', label: '物件の所在地（市区町村まで）', type: 'text', placeholder: '例：東京都新宿区' },
      { key: 'rent', label: '現在の家賃（管理費込み）', type: 'text', placeholder: '例：85,000円' },
      { key: 'age', label: '築年数', type: 'text', placeholder: '例：築15年' },
      { key: 'size', label: '間取り・専有面積', type: 'text', placeholder: '例：1LDK・40㎡' },
      { key: 'tenure', label: '入居年数', type: 'text', placeholder: '例：3年2ヶ月' },
      { key: 'reason', label: '交渉したい理由・背景', type: 'textarea', placeholder: '例：近隣の同条件物件より高い、収入が減った、設備が古いなど' },
    ],
  },
  {
    id: 'taiko',
    priceId: 'price_1TIQTqDedaFhOLE3gG3FRzl5',
    name: '退去費用チェック',
    price: 1480,
    icon: '📋',
    tagline: '不当請求を国交省ガイドラインで検証・異議申し立て文を作成',
    desc: '退去時の原状回復請求を国交省ガイドライン・民法第621条で検証。経年劣化・通常損耗の範囲を特定し、不当請求への異議申し立て文面と敷金返還交渉戦略をお届けします。',
    fields: [
      { key: 'tenure', label: '入居期間', type: 'text', placeholder: '例：2020年4月〜2024年3月（4年）' },
      { key: 'items', label: '請求されている項目と金額（すべて入力）', type: 'textarea', placeholder: '例：\nクロス張替え 60,000円\nフローリング補修 30,000円\nハウスクリーニング 50,000円\n...' },
      { key: 'deposit', label: '敷金の金額', type: 'text', placeholder: '例：85,000円（家賃1ヶ月分）' },
      { key: 'condition', label: '退去時の部屋の状態（正直に記入）', type: 'textarea', placeholder: '例：タバコは吸っていない。壁に画鋲の穴あり（数箇所）。ペットなし。通常の生活汚れはあり。' },
    ],
  },
  {
    id: 'mitsumori',
    priceId: 'price_1TIQTsDedaFhOLE3j13t52Xc',
    name: '見積書AIチェック',
    price: 1980,
    icon: '🔍',
    tagline: '過剰請求を特定し、項目別の交渉メールを作成',
    desc: '見積書の内容をAIが自動分析。不要・過剰請求項目の特定と法的根拠の提示・削減シミュレーション・項目別交渉メール文面をお届けします。国交省ガイドライン・消費者契約法に基づく戦略を提供します。',
    fields: [
      { key: 'items', label: '見積書の全項目と金額（すべて転記）', type: 'textarea', placeholder: '例：\nエアコンクリーニング 15,000円\nクロス（洋室6畳）張替え 45,000円\n鍵交換 25,000円\n消毒・除菌 20,000円\n...' },
      { key: 'tenure', label: '入居期間', type: 'text', placeholder: '例：2021年6月〜2024年3月（2年9ヶ月）' },
      { key: 'property', label: '物件種別・広さ', type: 'text', placeholder: '例：マンション・1K・25㎡' },
      { key: 'notes', label: '気になる点・特記事項', type: 'textarea', placeholder: '例：退去立会いで指摘されなかった箇所も請求されている。タバコは吸っていない。など' },
    ],
  },
];

const C = {
  bg: '#F7F8FA',
  card: '#FFFFFF',
  accent: '#2563EB',
  accentLight: '#EFF6FF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  success: '#059669',
  radius: '12px',
};

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans JP', sans-serif; background: ${C.bg}; color: ${C.text}; }
  input, textarea, button { font-family: inherit; }
  textarea { resize: vertical; }
`;

export default function App() {
  const [page, setPage] = useState('landing'); // landing | form | processing | result | error
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  /* 決済後のリダイレクト処理 */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const svcId = params.get('svc');
    if (sessionId && svcId) {
      window.history.replaceState({}, '', window.location.pathname);
      const saved = sessionStorage.getItem('chintai_form');
      if (saved) {
        const { serviceId, data } = JSON.parse(saved);
        sessionStorage.removeItem('chintai_form');
        const svc = SERVICES.find(s => s.id === serviceId);
        if (svc) {
          setSelected(svc);
          setPage('processing');
          fetchResult(sessionId, svc, data);
        }
      }
    }
  }, []);

  async function fetchResult(sessionId, svc, data) {
    try {
      const res = await fetch('/api/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, serviceId: svc.id, formData: data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '分析に失敗しました');
      setResult(json.report);
      setPage('result');
    } catch (e) {
      setErrorMsg(e.message);
      setPage('error');
    }
  }

  async function handleSubmit(svc, data) {
    setSelected(svc);
    setPage('processing');
    try {
      sessionStorage.setItem('chintai_form', JSON.stringify({ serviceId: svc.id, data }));
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: svc.priceId, serviceId: svc.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '決済の作成に失敗しました');
      window.location.href = json.url;
    } catch (e) {
      setErrorMsg(e.message);
      setPage('error');
    }
  }

  return (
    <>
      <style>{css}</style>
      {page === 'landing' && <Landing onSelect={svc => { setSelected(svc); setPage('form'); }} />}
      {page === 'form' && selected && <Form svc={selected} onBack={() => setPage('landing')} onSubmit={(data) => handleSubmit(selected, data)} />}
      {page === 'processing' && <Processing />}
      {page === 'result' && <Result svc={selected} report={result} onBack={() => setPage('landing')} />}
      {page === 'error' && <ErrorPage msg={errorMsg} onBack={() => setPage('landing')} />}
    </>
  );
}

/* ── Landing ── */
function Landing({ onSelect }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <header style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: C.accent }}>チンサポAI</span>
          <span style={{ fontSize: '0.75rem', color: C.muted, marginLeft: 8 }}>賃貸トラブル AI分析サービス</span>
        </div>
        <a href="#/legal" style={{ fontSize: '0.75rem', color: C.muted, textDecoration: 'none' }}>特定商取引法</a>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 16 }}>
            賃貸トラブル、<br />法的根拠をもとにAIが解決します。
          </h1>
          <p style={{ fontSize: '0.95rem', color: C.muted, lineHeight: 1.8 }}>
            国交省ガイドライン・民法・借地借家法に基づき、退去費用の不当請求チェック・<br />
            見積書の過剰請求分析・家賃交渉メール文面を即時提供します。
          </p>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          {SERVICES.map(svc => (
            <div key={svc.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: '28px 28px 24px', cursor: 'pointer', transition: 'box-shadow 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              onClick={() => onSelect(svc)}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: '1.4rem' }}>{svc.icon}</span>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{svc.name}</h2>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: C.accent, fontWeight: 500, marginBottom: 8 }}>{svc.tagline}</p>
                  <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: 1.7 }}>{svc.desc}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: C.accent }}>¥{svc.price.toLocaleString()}</div>
                  <div style={{ fontSize: '0.72rem', color: C.muted }}>（税込・1回）</div>
                  <div style={{ marginTop: 12, padding: '8px 18px', background: C.accent, color: '#fff', borderRadius: 8, fontSize: '0.82rem', fontWeight: 500 }}>
                    利用する →
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: '20px 24px', background: C.accentLight, borderRadius: C.radius, fontSize: '0.8rem', color: '#1D4ED8', lineHeight: 1.8 }}>
          <strong>ご注意：</strong>本サービスはAIによる情報提供サービスです。法的アドバイスや弁護士の代替ではありません。
          重大なトラブルは弁護士・司法書士等の専門家にご相談ください。入力内容はサーバーに保存されません。
        </div>

        <footer style={{ textAlign: 'center', marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
          <a href="#/legal" style={{ fontSize: '0.78rem', color: C.muted, textDecoration: 'none', margin: '0 12px' }}>特定商取引法に基づく表記</a>
          <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: 12 }}>© 2026 チンサポAI — 佐藤 公宜</p>
        </footer>
      </div>
    </div>
  );
}

/* ── Form ── */
function Form({ svc, onBack, onSubmit }) {
  const [data, setData] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    svc.fields.forEach(f => {
      if (!data[f.key] || !data[f.key].trim()) e[f.key] = '入力してください';
    });
    if (!agreed) e.agreed = 'チェックしてください';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) onSubmit(data);
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <header style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '0.85rem' }}>← 戻る</button>
        <span style={{ fontWeight: 700, color: C.accent }}>{svc.icon} {svc.name}</span>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 64px' }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: '32px 28px', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>{svc.name}</h2>
          <p style={{ fontSize: '0.82rem', color: C.muted, marginBottom: 24, lineHeight: 1.7 }}>{svc.desc}</p>

          <form onSubmit={handleSubmit}>
            {svc.fields.map(f => (
              <div key={f.key} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 6 }}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    rows={5}
                    placeholder={f.placeholder}
                    value={data[f.key] || ''}
                    onChange={e => setData(d => ({ ...d, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${errors[f.key] ? '#EF4444' : C.border}`, borderRadius: 8, fontSize: '0.85rem', background: '#FAFAFA', lineHeight: 1.7 }}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={data[f.key] || ''}
                    onChange={e => setData(d => ({ ...d, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${errors[f.key] ? '#EF4444' : C.border}`, borderRadius: 8, fontSize: '0.85rem', background: '#FAFAFA' }}
                  />
                )}
                {errors[f.key] && <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 4 }}>{errors[f.key]}</p>}
              </div>
            ))}

            <div style={{ padding: '16px', background: C.accentLight, borderRadius: 8, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '0.8rem', color: '#1D4ED8', lineHeight: 1.6 }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
                本サービスはAIによる情報提供であり、法的アドバイスや弁護士の代替ではないことを理解しました。入力情報はAI分析にのみ使用され、サーバーに保存されません。
              </label>
              {errors.agreed && <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 4 }}>{errors.agreed}</p>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#F9FAFB', borderRadius: 8, marginBottom: 20 }}>
              <span style={{ fontSize: '0.85rem', color: C.muted }}>お支払い金額</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: C.accent }}>¥{svc.price.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: C.muted }}>（税込・1回）</span></span>
            </div>

            <button type="submit" style={{ width: '100%', padding: '14px', background: C.accent, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}>
              カード決済へ進む →
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: C.muted, marginTop: 10 }}>Stripe の安全な決済ページに移動します。カード情報は当サービスには送信されません。</p>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Processing ── */
function Processing() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <div style={{ width: 48, height: 48, border: `4px solid ${C.border}`, borderTop: `4px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: '0.95rem', color: C.muted }}>AIが分析中です{dots}</p>
      <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>法的根拠を確認しながら丁寧に分析しています。しばらくお待ちください。</p>
    </div>
  );
}

/* ── Result ── */
function Result({ svc, report, onBack }) {
  function copyToClipboard() {
    navigator.clipboard.writeText(report).then(() => alert('コピーしました'));
  }
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <header style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '0.85rem' }}>← トップに戻る</button>
        <span style={{ fontWeight: 700, color: C.success }}>✓ 分析完了 — {svc?.name}</span>
      </header>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 64px' }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: '32px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>分析レポート</h2>
            <button onClick={copyToClipboard} style={{ padding: '6px 14px', background: C.accentLight, color: C.accent, border: `1px solid ${C.accent}`, borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500 }}>
              📋 コピー
            </button>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem', lineHeight: 2, color: C.text, fontFamily: 'inherit' }}>
            {report}
          </div>
        </div>
        <div style={{ marginTop: 20, padding: '16px 20px', background: C.accentLight, borderRadius: C.radius, fontSize: '0.78rem', color: '#1D4ED8', lineHeight: 1.7 }}>
          本レポートはAIによる情報提供です。法的判断・弁護士の代替ではありません。実際の交渉・請求には必要に応じて専門家にご相談ください。
        </div>
      </div>
    </div>
  );
}

/* ── Error ── */
function ErrorPage({ msg, onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
      <p style={{ fontSize: '1.5rem' }}>⚠️</p>
      <p style={{ fontWeight: 700 }}>エラーが発生しました</p>
      <p style={{ fontSize: '0.85rem', color: C.muted, textAlign: 'center' }}>{msg}</p>
      <p style={{ fontSize: '0.82rem', color: C.muted, textAlign: 'center' }}>お急ぎの場合は formaruhaut.1@gmail.com までご連絡ください。</p>
      <button onClick={onBack} style={{ padding: '10px 24px', background: C.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem' }}>トップに戻る</button>
    </div>
  );
}
