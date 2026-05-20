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

  const { originalText, industries, jobType, charLimit } = body;
  if (!originalText || !originalText.trim()) {
    return Response.json({ error: '自己PR文を入力してください' }, { status: 400 });
  }
  if (!industries || industries.length === 0) {
    return Response.json({ error: '業界を選択してください' }, { status: 400 });
  }

  const INDUSTRY_PROFILES = {
    it: {
      label: 'IT・テック',
      tone: '論理的・成果数値重視・アジャイル思考を前面に。「〜を実装した」「〜%改善した」など具体的な技術貢献と定量成果を強調。過度な敬語より簡潔な表現を好む。スキルセットと問題解決力を軸に。',
    },
    finance: {
      label: '金融・銀行・保険',
      tone: '誠実さ・責任感・正確性を前面に。数字・実績をエビデンスとして示しつつ、コンプライアンス意識の高さも匂わせる。丁寧かつフォーマルな文体。「信頼」「堅実」「長期視点」キーワードを自然に使う。',
    },
    maker: {
      label: 'メーカー・製造',
      tone: 'チームワーク・現場力・地道な改善姿勢を前面に。ものづくりへの情熱と品質へのこだわりを表現。「改善提案」「工程管理」「品質向上」などのキーワードを自然に盛り込む。堅実で誠実な文体。',
    },
    consulting: {
      label: 'コンサル・戦略',
      tone: '論点整理力・仮説思考・リーダーシップを前面に。「〜という課題に対して〜というアプローチで〜の成果を出した」というSCAR構造を意識。数値インパクトと再現性のある思考プロセスを強調。洗練された文体。',
    },
    retail: {
      label: '小売・サービス・接客',
      tone: '人間力・顧客志向・チームへの貢献を前面に。具体的な顧客エピソードや「〜により顧客満足度が上がった」「リピーターを獲得した」などの成果を。明るく前向きで読みやすい文体。',
    },
    startup: {
      label: 'スタートアップ・ベンチャー',
      tone: '主体性・スピード感・0→1経験を前面に。変化への適応力、オーナーシップ、事業成長への貢献を強調。「自ら提案し」「仕組みをゼロから作り」などの表現を活用。情熱と行動力が伝わるエネルギッシュな文体。',
    },
  };

  const targets = industries.map(id => INDUSTRY_PROFILES[id]).filter(Boolean);
  const charNote = charLimit ? `文字数上限: ${charLimit}字以内` : '文字数の指定なし（300〜400字目安）';

  const systemPrompt = `あなたは就活・転職の自己PR添削のプロです。
ユーザーが入力した自己PR原文を、指定された業界のトーン・価値観に合わせてリライトしてください。

## 出力形式
必ず以下のJSON形式のみで返してください（コードブロックで囲んでください）:

\`\`\`json
{
  "rewrites": [
    {
      "industryKey": "it",
      "industryLabel": "IT・テック",
      "text": "リライト後の自己PR文",
      "points": ["この業界向けに変えたポイント1", "変えたポイント2", "変えたポイント3"]
    }
  ],
  "commonAdvice": "原文全体へのアドバイス（30〜60字）"
}
\`\`\`

## リライトのルール
- 原文の事実・経験は変えない（嘘の実績を加えない）
- 各業界のトーン・キーワード・強調軸に合わせて表現を最適化する
- ${charNote}
- 文末は「〜です。〜ます。」調で統一
- 具体的な数字・成果があれば積極的に前面に出す
- 「私は〜」で始めず、インパクトのある一文から入る

## points（変えたポイント）
- 原文からどこをどう変えたかを3つ端的に説明
- 「〇〇を△△に変えた」「〇〇というキーワードを追加した」のような形式

## 注意
- JSONのみ返す。前置き・解説は不要`;

  const userPrompt = [
    `【原文】\n${originalText.trim()}`,
    jobType ? `【志望職種】${jobType}` : null,
    `【リライト対象業界】\n${targets.map(t => `- ${t.label}：${t.tone}`).join('\n')}`,
    charNote,
  ].filter(Boolean).join('\n\n');

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
