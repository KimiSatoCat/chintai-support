const s = {
  page: { minHeight: '100vh', background: '#F7F8FA', fontFamily: "'Noto Sans JP', sans-serif", padding: '40px 20px 60px' },
  container: { maxWidth: 680, margin: '0 auto' },
  back: { display: 'inline-block', fontSize: '0.82rem', color: '#2563EB', textDecoration: 'none', marginBottom: 20 },
  h1: { fontSize: '1.2rem', fontWeight: 700, borderBottom: '2px solid #2563EB', paddingBottom: 8, marginBottom: 28, color: '#111827' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { fontSize: '0.82rem', color: '#555', fontWeight: 600, background: '#F9FAFB', padding: '14px 16px', borderBottom: '1px solid #E5E7EB', textAlign: 'left', whiteSpace: 'nowrap', width: 140, verticalAlign: 'top' },
  td: { fontSize: '0.82rem', color: '#374151', padding: '14px 16px', borderBottom: '1px solid #E5E7EB', lineHeight: 1.8, verticalAlign: 'top' },
  footer: { textAlign: 'center', marginTop: 40, fontSize: '0.72rem', color: '#9CA3AF' },
};

export function Legal() {
  return (
    <div style={s.page}>
      <div style={s.container}>
        <a href="/" style={s.back}>← トップに戻る</a>
        <h1 style={s.h1}>特定商取引法に基づく表記</h1>
        <table style={s.table}>
          <tbody>
            <tr><th style={s.th}>販売者名</th><td style={s.td}>佐藤 公宜</td></tr>
            <tr><th style={s.th}>運営責任者</th><td style={s.td}>佐藤 公宜</td></tr>
            <tr><th style={s.th}>所在地</th><td style={s.td}>請求があった場合に遅滞なく開示いたします</td></tr>
            <tr><th style={s.th}>電話番号</th><td style={s.td}>請求があった場合に遅滞なく開示いたします</td></tr>
            <tr><th style={s.th}>メールアドレス</th><td style={s.td}>formaruhaut.1@gmail.com</td></tr>
            <tr><th style={s.th}>販売URL</th><td style={s.td}>https://chintai-support.vercel.app</td></tr>
            <tr><th style={s.th}>販売サービス・価格</th><td style={s.td}>
              チンサポAI — AIによる賃貸トラブル分析サービス（情報提供サービス）<br />
              ・家賃交渉サポート：¥480（税込・1回）<br />
              ・退去費用チェック：¥1,480（税込・1回）<br />
              ・見積書AIチェック：¥1,980（税込・1回）
            </td></tr>
            <tr><th style={s.th}>サービス内容</th><td style={s.td}>
              国土交通省ガイドライン・民法・借地借家法に基づき、AIが賃貸トラブルの情報分析・文面作成を行う情報提供サービスです。
              法的アドバイス・弁護士の代替ではありません。本サービスは医療・法律・税務の専門的判断を提供するものではありません。
            </td></tr>
            <tr><th style={s.th}>支払方法</th><td style={s.td}>クレジットカード決済（Stripe経由）</td></tr>
            <tr><th style={s.th}>支払時期</th><td style={s.td}>サービス利用時に都度決済</td></tr>
            <tr><th style={s.th}>サービス提供時期</th><td style={s.td}>お支払い確認後、即時に分析レポートを画面に表示します</td></tr>
            <tr><th style={s.th}>返金・キャンセルポリシー</th><td style={s.td}>
              デジタルコンテンツの性質上、決済完了後の返金は原則行っておりません。<br />
              ただし、システム障害によりレポートが表示されなかった場合は個別にご相談ください。
            </td></tr>
            <tr><th style={s.th}>その他の費用</th><td style={s.td}>インターネット接続に必要な通信費はお客様のご負担となります。</td></tr>
            <tr><th style={s.th}>動作環境</th><td style={s.td}>インターネット接続環境および最新のWebブラウザ（Chrome、Safari、Edge、Firefox）</td></tr>
          </tbody>
        </table>
        <div style={{ ...s.footer }}>
          <a href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>トップに戻る</a>
          <p style={{ marginTop: 12 }}>© 2026 チンサポAI</p>
        </div>
      </div>
    </div>
  );
}
