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

  const { imageBase64, mimeType } = body;
  if (!imageBase64) {
    return Response.json({ error: '画像データがありません' }, { status: 400 });
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const type = validTypes.includes(mimeType) ? mimeType : 'image/jpeg';

  const systemPrompt = `あなたは名刺画像から情報を抽出するOCRアシスタントです。
画像に写っている名刺から以下の情報を抽出し、必ず以下のJSON形式のみで返してください。

\`\`\`json
{
  "lastName": "姓（漢字/カタカナ）",
  "firstName": "名（漢字/カタカナ）",
  "lastNameKana": "セイ（読み仮名、不明なら空文字）",
  "firstNameKana": "メイ（読み仮名、不明なら空文字）",
  "company": "会社名・組織名",
  "department": "部署名（なければ空文字）",
  "title": "役職名（なければ空文字）",
  "tel": "電話番号（代表・直通など最初の1つ）",
  "mobile": "携帯番号（あれば）",
  "fax": "FAX番号（あれば）",
  "email": "メールアドレス（あれば）",
  "url": "WebサイトURL（あれば、https://含む形式）",
  "zip": "郵便番号（〒除く、例: 100-0001）",
  "address": "住所（都道府県から番地まで）",
  "note": "その他特記事項（あれば）"
}
\`\`\`

- 読み取れない・記載のない項目は空文字にする
- 電話番号はハイフン区切りで統一（例: 03-1234-5678）
- URLはhttps://を含む完全な形式で
- JSONのみ返す、前置きや解説は不要`;

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
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: type,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: 'この名刺から情報を抽出してください。',
              },
            ],
          },
        ],
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
      return Response.json({ error: 'OCR結果の解析に失敗しました' }, { status: 500 });
    }

    const fields = JSON.parse(jsonMatch[1]);
    return Response.json({ fields });
  } catch (err) {
    return Response.json({ error: `解析に失敗しました: ${err.message}` }, { status: 500 });
  }
}
