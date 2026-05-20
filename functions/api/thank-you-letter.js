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

  const { situation, relationship, format, recipientName, senderName, detail } = body;
  if (!situation || !relationship || !format) {
    return Response.json({ error: '必須項目を選択してください' }, { status: 400 });
  }

  const SITUATIONS = {
    gift: { label: '贈答品・お中元・お歳暮', context: '贈り物をいただいたお礼' },
    interview: { label: '就活・転職面接後', context: '面接を受けた後のお礼' },
    funeral: { label: '葬儀・弔事', context: '弔問・香典・弔電・供花へのお礼' },
    business: { label: 'ビジネス接待・会食', context: '接待・食事会でご馳走になったお礼' },
    visit: { label: '訪問・お世話になった', context: '自宅や施設を訪問させていただいたお礼' },
    favor: { label: '紹介・仲介・助けてもらった', context: '紹介や手助けをしてもらったお礼' },
  };

  const RELATIONSHIPS = {
    formal: { label: '目上・ビジネス（丁寧）', tone: '格式高く、敬語を徹底した丁寧な文体。「〜いただきまして」「〜賜りまして」など謙譲表現を使う。' },
    colleague: { label: '知人・同僚（普通）', tone: '礼儀正しいが硬くなりすぎない、温かみのある文体。「〜していただき」程度の丁寧語。' },
    friend: { label: '親しい友人（カジュアル）', tone: '自然でフレンドリーな文体。くだけすぎず、でも堅苦しくない。「本当にありがとう」「すごく嬉しかった」など感情を素直に表現。' },
  };

  const FORMATS = {
    handwritten: { label: '手書き向け', note: '縦書きを想定した、短め・凝縮した表現。300〜400字目安。改行や段落を意識し、書き写しやすい文章にする。' },
    email: { label: 'メール向け', note: '件名も含める。メールらしい書き出し（お世話になっております等）から始め、400〜500字程度。読みやすい段落構成。' },
  };

  const sit = SITUATIONS[situation] || { label: situation, context: situation };
  const rel = RELATIONSHIPS[relationship];
  const fmt = FORMATS[format];

  const recipientPart = recipientName ? `相手のお名前: ${recipientName}` : '';
  const senderPart = senderName ? `自分のお名前: ${senderName}` : '';
  const detailPart = detail ? `詳細・背景: ${detail}` : '';

  const systemPrompt = `あなたは日本語のお礼状・お礼メール作成のプロです。
指定されたシチュエーション・距離感・形式に合わせて、3パターンのお礼文を作成してください。

## 出力形式
必ず以下のJSON形式のみで返してください:

\`\`\`json
{
  "patterns": [
    {
      "label": "パターン1のラベル（例：「王道・シンプル」「感謝を全面に」「格式重視」など）",
      "subject": "メール件名（メール向けのみ。手書きの場合は空文字）",
      "text": "お礼文の本文",
      "tips": "このパターンのポイント（30字以内）"
    },
    { ... },
    { ... }
  ],
  "writingNote": "作成時の全体的な注意点・アドバイス（50字以内）"
}
\`\`\`

## 作成ルール
- シチュエーション: ${sit.label}（${sit.context}）
- 相手との距離感: ${rel.label} / ${rel.tone}
- 形式: ${fmt.label} / ${fmt.note}
- 3パターンはそれぞれ表現・切り口・強調点を変えて、はっきり差別化する
- 固有名詞（相手名・自分名）は入力があれば使い、なければ「〇〇様」「〇〇」などのプレースホルダーを使う
- 葬儀・弔事の場合は忌み言葉（重ね言葉・直接的な死の表現など）を避ける
- 面接後の場合は熱意と御礼を両立し、志望度の高さが伝わる表現を入れる
- 実際にそのまま使えるクオリティで作成する
- JSONのみ返す。前置き・解説は不要`;

  const userPrompt = [
    `【シチュエーション】${sit.label}`,
    `【距離感】${rel.label}`,
    `【形式】${fmt.label}`,
    recipientPart,
    senderPart,
    detailPart,
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
        max_tokens: 3000,
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
