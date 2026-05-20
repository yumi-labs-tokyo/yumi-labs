export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { game, episode, highlight, style, moods } = body;

    if (!game || game.trim().length < 1) {
      return new Response(
        JSON.stringify({ error: 'ゲーム名を入力してください' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const episodeStr = episode ? `第${episode}回` : '回数未設定';
    const moodStr = moods && moods.length > 0 ? moods.join('・') : '指定なし';
    const highlightStr = highlight && highlight.trim() ? highlight.trim() : '指定なし';

    const styleMap = {
      gameplay: 'ゲーム実況（プレイメイン）',
      casual:   '雑談混じりのゆるめ実況',
      challenge: '縛り・チャレンジプレイ',
      firstplay: '初見プレイ',
      collab: 'コラボ配信',
    };
    const styleLabel = styleMap[style] || 'ゲーム実況';

    const systemPrompt = `あなたはゲーム配信・ライブ配信専門のタイトルコピーライターです。視聴者がクリックしたくなる魅力的な日本語タイトルを生成します。必ずJSON形式のみで回答してください。`;

    const userPrompt = `以下の情報をもとに、視聴者がクリックしたくなる配信タイトル案を10個生成してください。

【ゲーム名】${game}
【配信回数】${episodeStr}
【今回の見どころ・進行状況】${highlightStr}
【配信スタイル】${styleLabel}
【雰囲気・方向性】${moodStr}

以下の10スタイルを1つずつ含めてください：
1. ワクワク・期待感系（「ついに」「いよいよ」「ここから」）
2. 感情・感動系（「泣ける」「感動」「涙腺崩壊」）
3. 煽り・インパクト系（「衝撃」「ヤバい」「鳥肌」）
4. 謎めかし・続きが気になる系（「...」「どうなる」「まさかの」）
5. リアクション・実況系（「絶叫」「爆笑」「悲鳴」）
6. チャレンジ・達成系（「クリア」「攻略」「初撃破」）
7. 疑問形・視聴者巻き込み系（「〜できる？」「〜の正解は？」）
8. ユーモア・笑い系（「w」「草」軽めのノリ）
9. シリアス・ストーリー重視系（落ち着いたトーン）
10. 記念・マイルストーン系（「初」「○○達成」「ありがとう」）

タイトルは以下の形式を参考に（必ずしも同じでなくてよい）：
- 「【ゲーム名】#回数 ○○がついに○○！」
- 「ゲーム名 #回数【○○!!】○○してみた」

以下のJSON形式のみで回答してください：
{
  "titles": [
    {
      "title": "配信タイトル全文（60字以内）",
      "thumbnail": "サムネイル用キャッチコピー（12字以内・インパクト重視）",
      "style": "スタイル名（上記1〜10の名称を簡潔に）",
      "hook": "使っているフック手法（10字以内）"
    }
  ]
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
        JSON.stringify({ error: '応答が長すぎました。再試行してください。' }),
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
