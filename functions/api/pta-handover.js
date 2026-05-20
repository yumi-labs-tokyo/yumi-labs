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

  const { role, events, schoolName, grade, notes } = body;
  if (!role) {
    return Response.json({ error: '役職を選択してください' }, { status: 400 });
  }

  const eventsText = events && events.length > 0
    ? events.join('、')
    : '特定の行事なし（基本業務のみ）';

  const schoolPart = schoolName ? `学校名：${schoolName}` : '';
  const gradePart  = grade      ? `対象学年：${grade}`    : '';
  const notesPart  = notes      ? `特記事項：${notes}`    : '';

  const systemPrompt = `あなたはPTA活動に精通した日本の小学校PTA引き継ぎ書作成の専門家です。
指定された役職・行事について、実用的で具体的な引き継ぎ書のコンテンツを作成してください。

## 出力形式
必ず以下のJSON形式のみで返してください（コードブロックで囲む）:

\`\`\`json
{
  "roleOverview": "役職の概要説明（3〜5文。具体的な責任範囲・立場を明記）",
  "keyDuties": ["主な業務1", "主な業務2", "主な業務3", "主な業務4", "主な業務5"],
  "monthlySchedule": [
    { "month": 4, "tasks": ["タスク1", "タスク2"], "notes": "月の注意点（あれば）" },
    { "month": 5, "tasks": [], "notes": "" },
    { "month": 6, "tasks": [], "notes": "" },
    { "month": 7, "tasks": [], "notes": "" },
    { "month": 8, "tasks": [], "notes": "" },
    { "month": 9, "tasks": [], "notes": "" },
    { "month": 10, "tasks": [], "notes": "" },
    { "month": 11, "tasks": [], "notes": "" },
    { "month": 12, "tasks": [], "notes": "" },
    { "month": 1, "tasks": [], "notes": "" },
    { "month": 2, "tasks": [], "notes": "" },
    { "month": 3, "tasks": [], "notes": "" }
  ],
  "eventNotes": [
    {
      "event": "行事名",
      "timing": "例：5月上旬",
      "prepWeeks": 2,
      "duties": ["担当業務1", "担当業務2"],
      "cautions": ["注意点1", "注意点2"]
    }
  ],
  "handoverDocs": ["引き継ぎ書類1（例：前年度議事録）", "書類2"],
  "handoverItems": ["物品1（例：印鑑・保管場所を明記）", "物品2"],
  "handoverDigital": ["デジタル引き継ぎ1（例：メーリングリスト管理者権限）", "デジタル2"],
  "importantTips": ["新任者へのアドバイス1", "アドバイス2", "アドバイス3"],
  "cautions": ["毎年トラブルになりやすい注意点1", "注意点2"],
  "contactsTemplate": "連絡先一覧テンプレ（学校担当・PTA顧問・業者など記載欄の見出しリスト）"
}
\`\`\`

## 作成ルール
- 実際の小学校PTAの現場を熟知した具体的な内容にする
- 月別スケジュールは4月始まり〜3月の日本の学校年度に沿う
- 行事が指定されている場合はそれに特化した内容を eventNotes に詳細記載
- handoverItems には「どこに保管されているか」「鍵の場合は何の鍵か」などを具体的に書く
- importantTips は「前任者として絶対伝えたい」というリアルなアドバイス
- JSONのみ返す。前置き・解説不要`;

  const userPrompt = [
    `【役職】${role}`,
    `【関連行事】${eventsText}`,
    schoolPart,
    gradePart,
    notesPart,
  ].filter(Boolean).join('\n');

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
      return Response.json({ error: 'レスポンスの解析に失敗しました' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[1]);
    return Response.json(parsed);
  } catch (err) {
    return Response.json({ error: `生成に失敗しました: ${err.message}` }, { status: 500 });
  }
}
