export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { category, draft, recipientName } = body;

    if (!draft || draft.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: '下書きを入力してください（10文字以上）' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const categoryMap = {
      actor: '俳優',
      voice_actor: '声優',
      vtuber: 'VTuber',
      idol: 'アイドル',
    };
    const catLabel = categoryMap[category] || 'エンタメ関係者';
    const recipStr = recipientName ? `「${recipientName}」さん（${catLabel}）` : `${catLabel}`;

    const categoryGuidance = {
      actor: '役柄と俳優本人を混同しない。演技力・表現力・作品への感謝を伝える。外見への言及（太った/老けたなど）・他の俳優との比較・プライベートへの詮索は排除する。',
      voice_actor: 'キャラクターと声優（演者）を混同しない。演技力・キャラクターへの解釈の深さを具体的に褒める。「声だけが好き」など演者を軽視する表現を排除する。',
      vtuber: 'VTuberとしてのキャラクター・配信活動のみに言及する。中の人・素顔・本名・前世・転生への言及は絶対に排除する。引退を強く求める表現も排除する。',
      idol: 'パフォーマンス・楽曲・ステージへの感謝を伝える。他メンバーとの比較・運営批判・恋愛的アプローチ・卒業引き止めを排除する。',
    };

    const systemPrompt = `あなたはファンレターのプロのアドバイザーです。推しとファンの健全な関係を大切にし、相手に喜ばれる丁寧で温かいファンレター作成をサポートします。必ずJSON形式のみで回答してください。`;

    const userPrompt = `以下のファンレターの下書きを${recipStr}宛てのファンレターとして改善してください。

【カテゴリー固有のガイドライン】
${categoryGuidance[category] || '相手への敬意と感謝を大切に。'}

【共通のガイドライン】
- 感謝と応援の気持ちをわかりやすく伝える
- 重すぎる依存・執着・プレッシャーになる表現を和らげる
- 自分の具体的な思い出や感動を盛り込む
- 丁寧で温かい日本語表現
- 元の文章の長さ・構成をなるべく維持する
- 改善が不要な箇所はそのまま残す

【原文】
${draft.slice(0, 2000)}

以下のJSON形式のみで回答してください：
{
  "improvedDraft": "改善後のファンレター全文",
  "changes": [
    {"original": "気になった元の表現", "improved": "改善後の表現", "reason": "改善理由"}
  ],
  "tips": ["このカテゴリへのファンレターのコツ1", "コツ2", "コツ3"]
}`;

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
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

    if (!resp.ok) {
      return new Response(
        JSON.stringify({ error: `API エラー (${resp.status})` }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      );
    }

    const data = await resp.json();

    if (data.stop_reason === 'max_tokens') {
      return new Response(
        JSON.stringify({ error: '文章が長すぎます。下書きを短くして再試行してください。' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const rawText = data.content[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: '応答の解析に失敗しました。再試行してください。' }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' },
    });

  } catch (e) {
    return new Response(
      JSON.stringify({ error: `エラーが発生しました: ${e.message}` }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
