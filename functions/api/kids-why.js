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

  const { question, ages } = body;
  if (!question || !question.trim()) {
    return Response.json({ error: '質問を入力してください' }, { status: 400 });
  }
  if (!ages || ages.length === 0) {
    return Response.json({ error: '年齢を選択してください' }, { status: 400 });
  }

  const ageLabels = {
    age3: '3歳向け（ひらがなメイン、とても短く、身近な例え）',
    age6: '6歳向け（やさしい言葉、少し詳しく、絵本のような語り口）',
    school: '小学生向け（学校で習う言葉OK、理由をきちんと説明、科学的に正確に）',
  };

  const targets = ages.map(a => ageLabels[a]).filter(Boolean).join('\n');

  const systemPrompt = `あなたは子どもの「なぜ？」に答える専門家です。
子どもが疑問に思ったことを、指定された年齢層ごとにわかりやすく説明してください。

## 出力形式
必ず以下のJSON形式のみで返答してください（コードブロックで囲んでください）:

\`\`\`json
{
  "answers": [
    {
      "ageKey": "age3",
      "ageLabel": "3歳向け",
      "text": "説明文",
      "emoji": "絵文字1〜2個"
    }
  ]
}
\`\`\`

## 注意事項
- ageKey は age3 / age6 / school のいずれかで、リクエストされたものだけ返す
- 3歳向け: ひらがなメイン、1〜3文、身近な物への例えを使う
- 6歳向け: やさしい日本語、3〜4文、「〜だからね」など絵本調
- 小学生向け: 科学的に正確、5〜6文、理由を段階的に説明
- 返答はJSONのみ。前置き・解説・余計なテキストは不要`;

  const userPrompt = `質問: 「${question.trim()}」\n\n以下の年齢層向けに説明してください:\n${targets}`;

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
        max_tokens: 2048,
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
