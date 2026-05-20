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

  const systemPrompt = `あなたはメルカリ出品のプロです。
入力された商品情報をもとに、売れやすい出品文一式を生成してください。

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
- 検索されやすいキーワードを先頭に配置
- ブランド名・商品名・状態・サイズを盛り込む
- 【】などの記号を活用してわかりやすく

### description（説明文）
- 300〜500字目安
- 冒頭に商品の魅力を一言でまとめる
- 状態・サイズ・カラー・特徴を箇条書きや短段落で説明
- 「即購入OK」「値下げ交渉OK」など出品者フレンドリーな一文を末尾に添える
- 自然な日本語で、押しつけがましくなく

### hashtags（ハッシュタグ）
- 8〜12個
- #を含まない文字列の配列で返す
- 商品カテゴリ・ブランド・状態・サイズ・用途などを網羅
- 検索ボリュームが高そうなものを優先

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
