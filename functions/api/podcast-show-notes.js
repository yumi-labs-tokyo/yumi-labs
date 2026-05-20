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

  const { transcript, podcastTitle, hostName, totalDuration, platform, language } = body;
  if (!transcript || transcript.trim().length < 50) {
    return Response.json({ error: '文字起こしが短すぎます（50文字以上入力してください）' }, { status: 400 });
  }

  const durationNote = totalDuration ? `収録時間：${totalDuration}` : '';
  const hostNote = hostName ? `ホスト名：${hostName}` : '';
  const titleNote = podcastTitle ? `番組名：${podcastTitle}` : '';
  const langNote = language === 'en' ? '出力言語：英語' : '出力言語：日本語';
  const platformNote = platform ? `主な配信プラットフォーム：${platform}` : '';

  const systemPrompt = `あなたはポッドキャスト制作のプロです。文字起こしテキストを分析して、リスナーが読みやすい高品質なショーノートを作成します。

## 出力形式
必ず以下のJSON形式のみで返してください（コードブロックで囲む）:

\`\`\`json
{
  "episodeTitle": "エピソードタイトル（キャッチーかつ内容を表す）",
  "summary": "エピソードの概要（3〜5文。このエピソードで得られる価値を明記）",
  "chapters": [
    {
      "index": 1,
      "title": "章タイトル",
      "timestamp": "00:00",
      "description": "この章の内容を1〜2文で説明",
      "keywords": ["キーワード1", "キーワード2"]
    }
  ],
  "highlights": ["聴きどころ・名言・重要ポイント1", "2", "3"],
  "resources": ["言及されたリソース・本・サービス・URL等（あれば）"],
  "snsTwitter": "Twitter/X用投稿文（140文字以内、ハッシュタグ含む）",
  "snsInstagram": "Instagram用キャプション（絵文字多め、改行あり、ハッシュタグ含む）",
  "snsNote": "note/ブログ用リード文（200〜300字、読者を引き込む書き出し）",
  "tags": ["SEO・検索向けタグ1", "タグ2", "タグ3", "タグ4", "タグ5"],
  "guestIntro": "ゲストがいる場合の紹介文（いない場合は空文字）"
}
\`\`\`

## 作成ルール
- chaptersはテキストの流れを分析して自然な区切りで5〜10個生成
- timestampは収録時間から推定（文字起こしの分量で比例配分）。総収録時間が不明な場合は「-」を入れる
- highlightsは聴衆が「これは聞く価値があった」と思えるポイント3〜5個
- SNS文はそれぞれのプラットフォームの特性に合わせた文体で
- resourcesは実際に言及されていないものは含めない
- JSONのみ返す。前置き・解説不要`;

  const userPrompt = [
    titleNote,
    hostNote,
    durationNote,
    platformNote,
    langNote,
    '',
    '【文字起こし】',
    transcript.slice(0, 12000), // 長すぎる場合は先頭12000文字まで
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
    if (data.stop_reason === 'max_tokens') {
      return Response.json({ error: '文字起こしが長すぎます。一部を切り取って再試行してください。' }, { status: 500 });
    }

    const text = data.content?.[0]?.text ?? '';
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) {
      return Response.json({ error: 'レスポンスの解析に失敗しました' }, { status: 500 });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[1]);
    } catch (e) {
      return Response.json({ error: `JSON解析エラー: ${e.message}` }, { status: 500 });
    }

    return Response.json(parsed);
  } catch (err) {
    return Response.json({ error: `生成に失敗しました: ${err.message}` }, { status: 500 });
  }
}
