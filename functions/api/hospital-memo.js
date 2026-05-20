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

  const { symptoms, duration, medicines, allergy, history, doctorType } = body;
  if (!symptoms || !symptoms.trim()) {
    return Response.json({ error: '症状を入力してください' }, { status: 400 });
  }

  const userPrompt = [
    `受診科・医師タイプ: ${doctorType || '内科（一般）'}`,
    `主な症状: ${symptoms.trim()}`,
    `症状の期間・経過: ${duration?.trim() || '不明'}`,
    medicines?.trim() ? `現在飲んでいる薬・サプリ: ${medicines.trim()}` : null,
    allergy?.trim()  ? `アレルギー・過去の薬の副作用: ${allergy.trim()}` : null,
    history?.trim()  ? `既往歴・持病: ${history.trim()}` : null,
  ].filter(Boolean).join('\n');

  const systemPrompt = `あなたは医療コミュニケーションの専門家です。
患者が入力した情報をもとに、限られた診察時間で医師に正確に伝わる「問診メモ」を作成してください。

## 出力形式
必ず以下のJSON形式のみで返してください（コードブロックで囲んでください）:

\`\`\`json
{
  "memo": "問診メモ本文（改行\\nを使ってよい）",
  "keyPoints": ["最も重要な伝達事項1", "最も重要な伝達事項2", "..."],
  "questions": ["医師に確認すべき質問1", "医師に確認すべき質問2", "..."],
  "medicinePrompt": "お薬手帳を持参する際の補足メモ"
}
\`\`\`

## memo（問診メモ本文）の構成ルール
医師が最も効率よく状況を把握できる「SOAPIER形式」に近い順序で整形してください：

1. **主訴**（一番困っていること・最初の一文に凝縮）
2. **現病歴**（いつから・どのように始まったか・経過）
3. **症状の詳細**（強さ・性質・部位・増悪/軽快因子）
4. **随伴症状**（他に気になる症状）
5. **現在の投薬・サプリ**（あれば）
6. **アレルギー・副作用歴**（あれば）
7. **既往歴**（あれば）

## 文体ルール
- 箇条書きと短文を組み合わせて、医師が10秒で読めるようにする
- 患者目線の言葉（「だるい」「変な感じ」）を医学的に自然な表現に翻訳する
- 大げさにせず、事実を簡潔に記載する
- 「〜と思います」などの曖昧表現は避ける

## keyPoints
- 医師に必ず口頭でも伝えるべき重要ポイントを3〜4個
- 問診票に書きにくいニュアンスや緊急性を優先

## questions
- 患者が聞き忘れがちな、受診時に確認すべき質問を3〜4個
- その科・症状に合った具体的な質問にする

## medicinePrompt
- お薬手帳を持参する場合に医師や薬剤師に伝える一言メモ（1〜2文）
- 現在の薬との相互作用確認を促す内容を含める

## 注意
- JSONのみ返す。前置きや解説は不要
- 診断・治療の提案は行わない（あくまで「伝える」ためのメモ）`;

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
