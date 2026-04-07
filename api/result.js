import Stripe from 'stripe';
import Anthropic from '@anthropic-ai/sdk';

const PROMPTS = {
  yachin: (d) => `あなたは日本の賃貸借法に精通した専門家です。以下の情報をもとに、家賃交渉のための分析レポートを作成してください。

【物件情報】
- 所在地：${d.address}
- 現在の家賃（管理費込み）：${d.rent}
- 築年数：${d.age}
- 間取り・面積：${d.size}
- 入居年数：${d.tenure}
- 交渉したい理由：${d.reason}

以下の構成でレポートを作成してください：

## 1. 周辺相場の分析
（所在地・間取り・築年数から推定できる相場帯を示し、現在の家賃との比較を行う）

## 2. 交渉可能性の評価
（交渉が通りやすい根拠、難しい場合の理由を具体的に記述）

## 3. 法的根拠
（借地借家法、民法等の関連条文を引用）

## 4. 長期節約試算
（交渉成功時の月額・年額・5年間の節約額を計算）

## 5. 交渉メール文面（そのままコピーして使える形式）
（Subject行から本文末まで完全な形で作成）

## 6. 交渉のアドバイス
（タイミング、心構え、注意点）`,

  taiko: (d) => `あなたは国土交通省の原状回復ガイドラインと日本の賃貸借法に精通した専門家です。以下の退去費用請求を検証し、不当請求を特定してください。

【入居情報】
- 入居期間：${d.tenure}
- 敷金：${d.deposit}
- 退去時の部屋の状態：${d.condition}

【請求内容】
${d.items}

以下の構成で分析レポートを作成してください：

## 1. 各項目の適法性チェック
（請求された各項目について、国交省ガイドライン・民法第621条・借主負担か貸主負担かを判定）

## 2. 経年劣化・通常損耗の範囲
（入居年数から計算される経年劣化分の説明）

## 3. 不当請求の特定と適正金額の試算
（不当と判断した項目、適正な借主負担額を算出）

## 4. 敷金返還予測
（適正な差し引き後の返還見込み額）

## 5. 異議申し立てメール文面（そのままコピーして使える形式）
（Subject行から本文末まで完全な形で。法的根拠を明示した強い文面）

## 6. 次のステップ
（内容証明郵便、少額訴訟など、段階的な対応策）`,

  mitsumori: (d) => `あなたは国土交通省の原状回復ガイドライン、消費者契約法、日本の賃貸借法に精通した専門家です。以下の退去費用見積書を詳細に分析してください。

【物件情報】
- 入居期間：${d.tenure}
- 物件種別・広さ：${d.property}
- 特記事項：${d.notes}

【見積書の内容】
${d.items}

以下の構成で分析レポートを作成してください：

## 1. 項目別チェック結果
（各項目について：①借主負担か貸主負担か ②適正金額の目安 ③根拠法令）

## 2. 過剰・不当請求の特定
（削減を求めるべき項目を一覧で整理）

## 3. 削減シミュレーション
（交渉前・交渉後の金額比較、削減可能額の試算）

## 4. 項目別交渉メール文面（そのままコピーして使える形式）
（Subject行から本文末まで完全な形で。各請求項目に対する具体的な異議を記載）

## 5. 交渉の優先順位とアドバイス
（どの項目から交渉すべきか、成功率の高い順に整理）

## 6. 次のステップ
（合意できない場合の対応策）`,
};

const FREE_SERVICES = ['yachin'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, serviceId, formData } = req.body;
  if (!serviceId || !formData) return res.status(400).json({ error: 'Missing parameters' });

  // 無料サービス以外はStripeで決済確認
  if (!FREE_SERVICES.includes(serviceId)) {
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(402).json({ error: '決済が確認できませんでした' });
      }
    } catch (e) {
      return res.status(400).json({ error: 'セッションの確認に失敗しました: ' + e.message });
    }
  }

  // Claude で分析
  const promptFn = PROMPTS[serviceId];
  if (!promptFn) return res.status(400).json({ error: '不明なサービスIDです' });

  const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: promptFn(formData) }],
    });
    const report = message.content[0].text;
    res.status(200).json({ report });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'AI分析に失敗しました: ' + e.message });
  }
}
