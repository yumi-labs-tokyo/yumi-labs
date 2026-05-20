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

  if (!body.rawNotes || !body.rawNotes.trim()) {
    return Response.json({ error: 'メモを入力してください' }, { status: 400 });
  }

  const { meta, rawNotes, options } = body;

  const userPrompt = [
    '## 会議情報',
    `- 会議名: ${meta.title || '（未設定）'}`,
    `- 日付: ${meta.date}`,
    `- 時間: ${meta.startTime}〜${meta.endTime}`,
    meta.location ? `- 場所: ${meta.location}` : '',
    meta.participants?.length ? `- 参加者: ${meta.participants.join('、')}` : '',
    '',
    '## オプション',
    `- タイムスタンプ自動推定: ${options.autoTimestamp ? 'する' : 'しない'}`,
    `- 決定事項・アクション抽出: ${options.extractActions ? 'する' : 'しない'}`,
    `- 敬体統一（です・ます）: ${options.formalTone ? 'する' : 'しない'}`,
    '',
    '## 走り書きメモ',
    rawNotes,
  ].filter(s => s !== undefined).join('\n');

  const systemPrompt = `あなたは会議の議事録整形アシスタントです。
ユーザーから渡された走り書きメモを、構造化された議事録JSONに変換してください。

## 出力形式

必ず以下のJSON形式のみで返答してください（コードブロックで囲んでください）:

\`\`\`json
{
  "summary": "会議全体の要約（2〜3文）",
  "agendas": [
    {
      "title": "議題名",
      "timeRange": "14:05〜14:25",
      "items": [
        {
          "timestamp": "14:05",
          "speaker": "発言者名",
          "type": "discussion",
          "content": "発言内容（整形済み）"
        }
      ]
    }
  ],
  "actionItems": [
    {
      "assignee": "担当者名",
      "task": "タスク内容",
      "dueDate": "期日（例: 5月27日）"
    }
  ]
}
\`\`\`

## type の値
- "decision": 決定事項
- "action": アクションアイテム・宿題
- "discussion": 通常の議論・発言

## 注意事項
- メモに時刻が一部しかなくても、前後の文脈から合理的に推定してください
- 発言者が不明な場合は "（不明）" を使用してください
- 内容は忠実に保ちつつ、自然な文体に整えてください
- アクションアイテムは items と actionItems の両方に含めてください
- 議題が明示されていない場合も、内容のまとまりごとに適切な議題名をつけてください`;

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
        max_tokens: 4096,
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
      return Response.json({ error: 'レスポンスのJSON解析に失敗しました' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[1]);
    return Response.json({ meta, ...parsed });
  } catch (err) {
    return Response.json({ error: `整形に失敗しました: ${err.message}` }, { status: 500 });
  }
}
