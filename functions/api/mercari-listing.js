export async function onRequestPost(context) {
  const apiKey = context.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'APIキーが設定されていません' }, { status: 500 });
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json({ error: 'リクエストの解析に失敗しました' }, { status: 400 });
  }

  const { productName, condition, size, brand, color, notes } = body;
  if (!productName || !productName.trim()) {
    return Response.json({ error: '商品名を入力してください' }, { status: 400 });
  }

  const conditionMap = {
    new: '新品・未使用',
    likenew: '未使用に近い',
    good: '目立った傷や汚れなし',
    fair: 'やや傷や汚れあり',
    poor: '傷や汚れあり',
    bad: '全体的に状態が悪い',
  };
  const conditionLabel = conditionMap[condition] || condition || '記載なし';

  const userPrompt = [
    `商品名: ${productName.trim()}`,
    `状態: ${conditionLabel}`,
    size ? `サイズ: ${size.trim()}` : null,
    brand ? `ブランド: ${brand.trim()}` : null,
    color ? `カラー: ${color.trim()}` : null,
    notes ? `補足: ${notes.trim()}` : null,
  ].filter(Boolean).join('\n');

  const systemPrompt = `あなたはメルカリで月100件以上売るトップセラーであり、購買心理に精通したコピーライターです。
入力された商品情報をもとに、「見た瞬間に欲しくなる」出品文一式を生成してください。

メルカリの自動生成機能との最大の差別化ポイントは「感情を動かすこと」です。
スペックの羅列ではなく、買い手が"自分がこれを持ったときの場面"を想像できる文章を書いてください。

## 出力形式
必ず以下のJSON形式のみで返してください（コードブロックで囲んでください）:

\`\`\`json
{
  "title": "商品タイトル（40字以内）",
  "description": "商品説明文（改行\\nを使ってよい）",
  "hashtags": ["タグ1", "タグ2", "タグ3"]
}
\`\`\`

## 各フィールドの要件

### title（タイトル）
- 40字以内厳守（メルカリ制限）
- 検索キーワード（ブランド・商品名・サイズ・状態）を先頭に詰め込む
- 【美品】【即発送】など注目を引くラベルを活用
- 「探していた人が思わずタップする」タイトルを意識

### description（説明文）
- 400〜600字目安
- **冒頭1〜2文：感情フック**
  - 「この1枚があれば〜」「〇〇好きな方に刺さる1点です」など、買い手がその商品を持った未来を想像させる一言で始める
  - 「定番人気」「入手困難」「廃盤モデル」など価値を高めるフレーズを状況に応じて入れる
- **中段：スペック＋ベネフィット**
  - 状態・サイズ・カラー・特徴を明記しつつ、「だから〇〇な人に向いている」という使用シーン・メリットに言及
  - 感触・質感・使い心地など五感に訴える表現を1つ入れる
- **信頼構築フレーズ**（以下から自然に1〜2個選ぶ）
  - 「丁寧に検品・クリーニングしてから発送します」
  - 「プチプチ＋紙袋で丁寧に梱包してお届けします」
  - 「ご質問はお気軽にどうぞ、即レスします」
- **クロージング（末尾1文）**
  - 希少性・緊急性を添える：「1点のみの出品です。気になった方はお早めに。」
  - または背中を押す一文：「ぜひ新しいオーナーの方のもとで活躍させてあげてください。」

### hashtags（ハッシュタグ）
- 10〜12個
- #を含まない文字列の配列で返す
- 商品カテゴリ・ブランド・状態・サイズ・用途・季節・ターゲット層などを幅広く網羅
- 「メルカリで実際に検索される」ボリュームが高いキーワードを優先

## 絶対に避けること
- スペックだけを並べた無機質な文章
- 「即購入OK」「値下げ交渉OK」のような使い古されたテンプレフレーズ単発での使用
- 大げさすぎる誇張（「最高傑作」「奇跡の一品」など）

## 注意
- JSONのみ返す。前置きや解説は不要`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1536,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `Claude APIエラー: ${err}` }, { status: 502 });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text ?? '';
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) {
      return Response.json({ error: 'レスポンスの解析に失敗しました' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[1]);
    return Response.json(parsed);
  } catch (err) {
    return Response.json({ error: `生成に失敗しました: ${err.message}` }, { status: 500 });
  }
}
