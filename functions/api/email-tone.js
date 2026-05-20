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

  const { emailText } = body;
  if (!emailText || !emailText.trim()) {
    return Response.json({ error: 'メール本文を入力してください' }, { status: 400 });
  }

  const systemPrompt = `あなたはビジネスメールの感情・温度感を読み解くプロのアナリストです。
日本語のビジネスメールを分析し、送り手の本音・温度感・緊急度を見抜いてください。

## 出力形式
必ず以下のJSON形式のみで返してください（コードブロックで囲んでください）:

\`\`\`json
{
  "verdict": "angry | urgent | watching | neutral | positive",
  "title": "一言判定タイトル（10字以内）",
  "score": {
    "anger": 0〜100,
    "urgency": 0〜100,
    "satisfaction": 0〜100
  },
  "signals": [
    { "quote": "メール内の該当フレーズ", "meaning": "その裏に隠れた本音（20字以内）" }
  ],
  "summary": "総合分析コメント（50〜100字）",
  "advice": "この相手への返信・対応のコツ（30〜60字）"
}
\`\`\`

## verdict の基準
- angry : 怒り・不満・クレーム色が強い（anger 60以上）
- urgent: 焦り・急かし・プレッシャーが強い（urgency 70以上）
- watching: 様子見・牽制・ジャブ的なメール（どちらも50未満だが含みがある）
- neutral: 特に感情が読み取れない通常のビジネスメール
- positive: 好意的・協力的・問題なし

## signals の抽出ルール
- 3〜5個のフレーズを抜き出す
- 表向きは丁寧でも裏に意図があるものを優先
- 「ご確認いただけましたでしょうか」→「もう催促してますよ」のように本音を暴く
- quoteはメール本文からの引用（原文ママ）

## 注意
- JSONのみ返す。前置き・解説は不要
- スコアは0〜100の整数`;

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
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: `以下のメールを分析してください:\n\n${emailText.trim()}` }],
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
    return Response.json({ error: `分析に失敗しました: ${err.message}` }, { status: 500 });
  }
}
