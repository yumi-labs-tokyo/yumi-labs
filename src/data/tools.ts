export type Badge = '人気' | 'New' | 'Beta';
export type Status = 'available' | 'coming-soon';

export interface Tool {
	id: number;
	slug: string;
	name: string;
	description: string;
	emoji: string;
	category: string;
	badge?: Badge;
	status: Status;
}

export interface Category {
	id: string;
	label: string;
	emoji: string;
	color: string;
}

export const categories: Category[] = [
	{ id: 'practical', label: 'ニッチな実用ツール', emoji: '🎯', color: '#ff6b9d' },
	{ id: 'creator', label: 'クリエイター・SNS', emoji: '🎨', color: '#c77dff' },
	{ id: 'learning', label: '学習・自己研鑽', emoji: '🧠', color: '#00c9a7' },
	{ id: 'life', label: '暮らし・生活密着', emoji: '🍳', color: '#ffd93d' },
	{ id: 'hobby', label: 'エンタメ・趣味', emoji: '🎮', color: '#ff6b6b' },
];

export const tools: Tool[] = [
	// 🎯 ニッチな実用ツール (1-20)
	{
		id: 1, slug: 'meeting-timestamp',
		name: '議事録タイムスタンプ整形',
		description: '録音時間と発言メモを「00:12:34 - 〇〇発言」形式に自動整形。',
		emoji: '📋', category: 'practical', badge: '人気', status: 'available',
	},
	{
		id: 2, slug: 'resignation-script',
		name: '退職交渉スクリプト生成',
		description: '状況と理由を選ぶと、上司への切り出し方〜引き止め対応まで台本化。',
		emoji: '📝', category: 'practical', status: 'available',
	},
	{
		id: 3, slug: 'split-bill',
		name: '飲み会割り勘・幹事優遇計算',
		description: '幹事の労力分を自動割引。先輩後輩の傾斜配分もスライダーで調整。',
		emoji: '🍻', category: 'practical', badge: '人気', status: 'available',
	},
	{
		id: 4, slug: 'kids-why',
		name: '子どもの「なぜ?」回答アシスト',
		description: '年齢別（3歳/6歳/小学生）に分かりやすい説明文を生成。',
		emoji: '🌟', category: 'practical', status: 'available',
	},
	{
		id: 5, slug: 'mercari-listing',
		name: 'メルカリ出品文最適化',
		description: '商品情報を入れると検索に強いタイトル＋説明文＋ハッシュタグを生成。',
		emoji: '🛍️', category: 'practical', badge: '人気', status: 'available',
	},
	{
		id: 6, slug: 'resignation-letter-pdf',
		name: '退職届PDFジェネレーター',
		description: '縦書き・手書き風フォント対応。日付自動計算してPDFダウンロード。',
		emoji: '📄', category: 'practical', badge: 'New', status: 'available',
	},
	{
		id: 7, slug: 'koden-amount',
		name: '香典・ご祝儀金額判定',
		description: '関係性・年齢・地域を選ぶと相場と新札ルール、表書きまで提案。',
		emoji: '🎎', category: 'practical', status: 'available',
	},
	{
		id: 8, slug: 'email-tone-checker',
		name: '取引先メール温度感チェッカー',
		description: '貼り付けるだけで「怒ってる/急いでる/様子見」を判定。',
		emoji: '📧', category: 'practical', badge: '人気', status: 'available',
	},
	{
		id: 9, slug: 'furusato-simulator',
		name: 'ふるさと納税シミュレーター',
		description: '給与・賞与を入れるだけで限度額を計算。控除最大化の返礼品も提案。',
		emoji: '🏘️', category: 'practical', badge: '人気', status: 'available',
	},
	{
		id: 10, slug: 'hospital-memo',
		name: '病院問診メモ自動生成',
		description: '症状・期間・薬を入れると医師に伝わる順序で整形。',
		emoji: '🏥', category: 'practical', status: 'available',
	},
	{
		id: 11, slug: 'resume-pr-rewriter',
		name: '履歴書「自己PR」リライター',
		description: '業界別（IT/金融/メーカー）にトーン変換。',
		emoji: '💼', category: 'practical', status: 'available',
	},
	{
		id: 12, slug: 'business-card-ocr',
		name: '名刺OCR → vCard変換',
		description: '画像アップロードでOCR→連絡先をvCard形式で出力。',
		emoji: '📇', category: 'practical', badge: 'New', status: 'available',
	},
	{
		id: 13, slug: 'thank-you-letter',
		name: 'お礼状文例ジェネレーター',
		description: 'シチュエーション×相手との距離感で3パターン生成。',
		emoji: '💌', category: 'practical', status: 'available',
	},
	{
		id: 14, slug: 'vaccine-scheduler',
		name: '子育て予防接種スケジューラー',
		description: '生年月日を入れると次回接種日と種類を表示。.ics出力対応。',
		emoji: '💉', category: 'practical', badge: '人気', status: 'available',
	},
	{
		id: 15, slug: 'condo-value',
		name: '中古マンション資産価値推定',
		description: '築年数・駅徒歩・面積を入れると地域平均から減価率を計算。',
		emoji: '🏢', category: 'practical', status: 'available',
	},
	{
		id: 16, slug: 'moving-board',
		name: '引っ越し荷造り進捗ボード',
		description: '部屋ごとの梱包率を可視化、ダンボール番号と中身を記録。',
		emoji: '📦', category: 'practical', status: 'available',
	},
	{
		id: 17, slug: 'pta-handover',
		name: 'PTA役員引き継ぎ書生成',
		description: '役職・行事を選ぶと年間スケジュールと注意点をPDF化。',
		emoji: '🏫', category: 'practical', status: 'available',
	},
	{
		id: 18, slug: 'hangover-timer',
		name: '二日酔い回復タイマー',
		description: '飲酒量からアルコール分解時間を計算、運転OK時刻を表示。',
		emoji: '🍶', category: 'practical', badge: 'New', status: 'available',
	},
	{
		id: 19, slug: 'kaigo-check',
		name: '介護保険「要介護度」セルフ判定',
		description: '簡易チェックで認定の目安を表示。ケアマネ相談前の準備に。',
		emoji: '👴', category: 'practical', badge: 'New', status: 'available',
	},
	{
		id: 20, slug: 'family-tree',
		name: '戸籍謄本「続柄」関係図生成',
		description: '家族構成を入れると相関図SVGを生成。相続手続きの整理用。',
		emoji: '🌳', category: 'practical', badge: 'New', status: 'available',
	},

	// 🎨 クリエイター・SNS (21-40)
	{
		id: 21, slug: 'twitter-analytics',
		name: 'Xアナリティクス代替分析',
		description: '過去ツイートを貼るだけで伸びやすい時間帯・文字数・絵文字傾向を分析。',
		emoji: '📊', category: 'creator', badge: '人気', status: 'available',
	},
	{
		id: 22, slug: 'vertical-text-image',
		name: '縦書き縦長画像ジェネレーター',
		description: 'ポエム・名言を入れると和文フォントで縦書き画像を生成。',
		emoji: '✍️', category: 'creator', badge: 'New', status: 'available',
	},
	{
		id: 23, slug: 'podcast-show-notes',
		name: 'ポッドキャストショーノート生成',
		description: '文字起こしを貼ると章立て＋タイムスタンプ＋SNS投稿文を出力。',
		emoji: '🎙️', category: 'creator', badge: 'New', status: 'available',
	},
	{
		id: 24, slug: 'youtube-thumbnail-preview',
		name: 'YouTubeサムネ文字配置プレビュー',
		description: 'キャッチコピーを入れると複数の配置パターンをプレビュー。',
		emoji: '🎬', category: 'creator', badge: 'New', status: 'available',
	},
	{
		id: 25, slug: 'doujin-colophon',
		name: '同人誌奥付ジェネレーター',
		description: 'タイトル・サークル名・発行日を入れると奥付PNGを生成。',
		emoji: '📚', category: 'creator', badge: '人気', status: 'available',
	},
	{
		id: 26, slug: 'fan-letter',
		name: 'ファンレター下書きアシスト',
		description: '推しの属性別にマナー違反ワードチェック付き下書き。',
		emoji: '💝', category: 'creator', badge: 'New', status: 'available',
	},
	{
		id: 27, slug: 'insta-9grid',
		name: 'インスタ9マス統一感シミュレーター',
		description: '9枚画像をアップしてフィルターを一括適用プレビュー。',
		emoji: '📷', category: 'creator', badge: '人気', status: 'available',
	},
	{
		id: 28, slug: 'haiku-image',
		name: '縦書き俳句・短歌投稿用画像',
		description: '季語チェック機能付き、和紙テクスチャ背景選択可能。',
		emoji: '🌸', category: 'creator', status: 'coming-soon',
	},
	{
		id: 29, slug: 'nijisousaku-tags',
		name: '二次創作タグ自動生成',
		description: 'カプ名・ジャンルを入れるとpixiv/Twitter向け定型タグを生成。',
		emoji: '🏷️', category: 'creator', badge: 'New', status: 'coming-soon',
	},
	{
		id: 30, slug: 'stream-title',
		name: '配信タイトル・サムネ案ブレスト',
		description: 'ゲーム名・回数を入れると魅力的なタイトル案を10個生成。',
		emoji: '🎮', category: 'creator', status: 'coming-soon',
	},
	{
		id: 31, slug: 'font-combo',
		name: 'ロゴ用フォント組み合わせ提案',
		description: '業種を選ぶとGoogleフォント組み合わせを5パターン提案。',
		emoji: '🔤', category: 'creator', badge: '人気', status: 'coming-soon',
	},
	{
		id: 32, slug: 'handle-check',
		name: 'SNSハンドルネーム空き確認',
		description: '入力したIDがX/Insta/TikTok/YouTubeで取得可能か確認。',
		emoji: '🔍', category: 'creator', status: 'coming-soon',
	},
	{
		id: 33, slug: 'manga-panels',
		name: '漫画ネーム用コマ割りテンプレ',
		description: 'ページ数・起承転結スライダーを入れるとSVGコマ割りを出力。',
		emoji: '📖', category: 'creator', status: 'coming-soon',
	},
	{
		id: 34, slug: 'character-sheet',
		name: 'キャラクター設定シートPDF',
		description: '身長体重・趣味・口癖を入れると印刷可能な設定資料化。',
		emoji: '🧑‍🎨', category: 'creator', badge: 'New', status: 'coming-soon',
	},
	{
		id: 35, slug: 'goods-size-preview',
		name: 'グッズサイズ感シミュレーター',
		description: 'アクスタ・缶バッジのサイズを実寸表示。購入前確認に。',
		emoji: '🏷️', category: 'creator', status: 'coming-soon',
	},
	{
		id: 36, slug: 'event-schedule',
		name: '同人イベント当日タイムスケジュール',
		description: 'イベント名・場所を入れると始発計算＋設営手順まで自動化。',
		emoji: '🗓️', category: 'creator', badge: '人気', status: 'coming-soon',
	},
	{
		id: 37, slug: 'vtuber-announce',
		name: 'VTuber配信枠取り告知画像',
		description: '日時・タイトル・ゲーム名を入れるとTwitter投稿サイズで自動レイアウト。',
		emoji: '📺', category: 'creator', status: 'coming-soon',
	},
	{
		id: 38, slug: 'bpm-calculator',
		name: '楽曲BPM計算機（タップ測定）',
		description: 'スペースキー連打でBPM測定＋DJ用キー判定＋類似BPM曲提案。',
		emoji: '🎵', category: 'creator', badge: 'New', status: 'coming-soon',
	},
	{
		id: 39, slug: 'cosplay-spots',
		name: 'コスプレ撮影スポット記録',
		description: '位置情報なしでタグ管理。写真の地理情報を削除して保存。',
		emoji: '🎭', category: 'creator', status: 'coming-soon',
	},
	{
		id: 40, slug: 'stream-roulette',
		name: '配信枠決め豪華ルーレット',
		description: 'ゲームタイトル候補を入れて視聴者が見られる演出ルーレット。',
		emoji: '🎡', category: 'creator', status: 'coming-soon',
	},

	// 🧠 学習・自己研鑽 (41-60)
	{
		id: 41, slug: 'book-tracker',
		name: '専門書「1日1ページ」進捗トラッカー',
		description: '総ページ数と開始日を入れると終了予定日と1日のノルマを可視化。',
		emoji: '📚', category: 'learning', badge: '人気', status: 'coming-soon',
	},
	{
		id: 42, slug: 'vocab-forgetting-curve',
		name: '英単語「忘却曲線」復習アプリ',
		description: 'エビングハウス曲線に基づき次回復習日をブラウザ通知。',
		emoji: '🔁', category: 'learning', badge: '人気', status: 'coming-soon',
	},
	{
		id: 43, slug: 'hello-world-tour',
		name: 'プログラミング「Hello World」50言語',
		description: '1日1言語、50言語のHello Worldを写経。Monaco Editor埋め込み。',
		emoji: '💻', category: 'learning', badge: 'New', status: 'coming-soon',
	},
	{
		id: 44, slug: 'philosopher-chat',
		name: '哲学者「もしも対話」シミュレーター',
		description: '質問を入れるとカント風/ニーチェ風/ソクラテス風に回答。',
		emoji: '🤔', category: 'learning', status: 'coming-soon',
	},
	{
		id: 45, slug: 'csv-quiz',
		name: '資格試験「1問1答」CSVアップロード式',
		description: 'CSVを読み込ませるだけのランダム出題アプリ。データベース不要。',
		emoji: '📝', category: 'learning', badge: '人気', status: 'coming-soon',
	},
	{
		id: 46, slug: 'typing-symbols',
		name: 'タイピング速度測定（記号特化）',
		description: '{}[]=>!== など実務で使う記号の入力速度を測定。',
		emoji: '⌨️', category: 'learning', status: 'coming-soon',
	},
	{
		id: 47, slug: 'vim-game',
		name: 'Vimコマンド学習ゲーム',
		description: 'ステージ制で:wq・ddP・ciwなど実用コマンドをクイズ形式で習得。',
		emoji: '🟩', category: 'learning', badge: 'New', status: 'coming-soon',
	},
	{
		id: 48, slug: 'regex-visualizer',
		name: '正規表現ビジュアライザ',
		description: '入力すると状態遷移図SVGで表示。マッチ箇所をリアルタイムハイライト。',
		emoji: '🔢', category: 'learning', badge: '人気', status: 'coming-soon',
	},
	{
		id: 49, slug: 'git-undo',
		name: 'Git「やり直したい」逆引き辞典',
		description: '「コミット取り消したい」などを自然言語で検索。',
		emoji: '🔀', category: 'learning', badge: '人気', status: 'coming-soon',
	},
	{
		id: 50, slug: 'sql-join-visual',
		name: 'SQL JOIN種類ビジュアル学習',
		description: 'INNER/LEFT/FULLをベン図でアニメ表示、サンプルデータで結果プレビュー。',
		emoji: '🗃️', category: 'learning', status: 'coming-soon',
	},
	{
		id: 51, slug: 'speed-reading',
		name: '速読トレーニング',
		description: 'テキストを貼り付け、表示速度を調整して1分間に何文字読めるか測定。',
		emoji: '📰', category: 'learning', status: 'coming-soon',
	},
	{
		id: 52, slug: 'kanji-handwriting',
		name: '漢字検定「書き取り」練習',
		description: 'Canvas手書きで認識、級別問題でテスト。',
		emoji: '✏️', category: 'learning', status: 'coming-soon',
	},
	{
		id: 53, slug: 'design-patterns',
		name: 'デザインパターン学習カード（GoF 23種）',
		description: '1日1つ、UML図＋TypeScriptコード例＋「使うべき場面」を表示。',
		emoji: '🧩', category: 'learning', badge: 'New', status: 'coming-soon',
	},
	{
		id: 54, slug: 'cyrillic-typing',
		name: 'ロシア語キリル文字タイピング練習',
		description: '英字→キリル変換しながら入力練習。',
		emoji: '🇷🇺', category: 'learning', status: 'coming-soon',
	},
	{
		id: 55, slug: 'legal-ruby',
		name: '法律用語ふりがな付き読解',
		description: '判例文をペーストすると専門用語にフリガナと意味を表示。',
		emoji: '⚖️', category: 'learning', status: 'coming-soon',
	},
	{
		id: 56, slug: 'latex-math',
		name: '数学記号入力支援（LaTeX出力）',
		description: 'GUIで∫・Σ・√を選ぶとLaTeX記法をコピー。',
		emoji: '∑', category: 'learning', badge: '人気', status: 'coming-soon',
	},
	{
		id: 57, slug: 'chemistry-balance',
		name: '化学反応式バランス調整',
		description: '入力した式の係数を自動計算＋元素別収支を表で表示。',
		emoji: '⚗️', category: 'learning', status: 'coming-soon',
	},
	{
		id: 58, slug: 'music-theory',
		name: '楽典「音程・コード」可視化',
		description: '鍵盤クリックで音程名・コード名を即表示。',
		emoji: '🎹', category: 'learning', badge: 'New', status: 'coming-soon',
	},
	{
		id: 59, slug: 'peripheral-vision',
		name: '速読「視野角拡大」トレーニング',
		description: '中央固定でテキストが両端に流れ、眼球運動を最小化する練習。',
		emoji: '👁️', category: 'learning', status: 'coming-soon',
	},
	{
		id: 60, slug: 'kobun-cards',
		name: '古文単語暗記カード',
		description: '重要古文単語300語を進捗管理。間違えた単語のみ再出題。',
		emoji: '📜', category: 'learning', status: 'coming-soon',
	},

	// 🍳 暮らし・生活密着 (61-80)
	{
		id: 61, slug: 'fridge-recipe',
		name: '冷蔵庫の余り物レシピ提案',
		description: '食材3つ入れると作れる料理を提案＋不足食材リスト。',
		emoji: '🍳', category: 'life', badge: '人気', status: 'coming-soon',
	},
	{
		id: 62, slug: 'bento-color',
		name: 'お弁当「彩り3色」チェック',
		description: '詰めた食材を入れると赤・黄・緑・茶のバランスを評価。',
		emoji: '🍱', category: 'life', status: 'coming-soon',
	},
	{
		id: 63, slug: 'expiry-board',
		name: '賞味期限管理ボード',
		description: '冷蔵庫内をボードで可視化、近い順にソート。LocalStorage保存。',
		emoji: '🥛', category: 'life', badge: 'New', status: 'coming-soon',
	},
	{
		id: 64, slug: 'laundry-marks',
		name: '洗濯表示マーク逆引き',
		description: '服のタグ記号をクリックすると洗い方を日本語で解説。',
		emoji: '👕', category: 'life', badge: '人気', status: 'coming-soon',
	},
	{
		id: 65, slug: 'trash-calendar',
		name: 'ゴミ出しカレンダー',
		description: '週ごとの曜日設定で「明日燃えるゴミ」をブラウザ通知。',
		emoji: '🗑️', category: 'life', status: 'coming-soon',
	},
	{
		id: 66, slug: 'household-budget',
		name: '家計簿「使途別」円グラフ可視化',
		description: '銀行アプリのCSVを読み込ませて可視化。データはクライアントのみ保持。',
		emoji: '💰', category: 'life', badge: '人気', status: 'coming-soon',
	},
	{
		id: 67, slug: 'ampere-check',
		name: '電気代「契約アンペア」見直しシミュレーター',
		description: '家電リストを入れると適正アンペアを提案。',
		emoji: '⚡', category: 'life', status: 'coming-soon',
	},
	{
		id: 68, slug: 'moving-quote',
		name: '引っ越し見積もり交渉用比較表',
		description: '業者の見積もり額を入れると印刷可能な交渉資料化。',
		emoji: '🚚', category: 'life', status: 'coming-soon',
	},
	{
		id: 69, slug: 'height-prediction',
		name: '子供の身長予測ツール',
		description: '両親身長＋現在身長から最終身長を予測。',
		emoji: '📏', category: 'life', badge: '人気', status: 'coming-soon',
	},
	{
		id: 70, slug: 'pet-age',
		name: 'ペット年齢人間換算（犬種別精密版）',
		description: '犬種・年齢を入れると小型犬/大型犬で異なる正確な換算。',
		emoji: '🐕', category: 'life', badge: '人気', status: 'coming-soon',
	},
	{
		id: 71, slug: 'plant-watering',
		name: '観葉植物「水やりカレンダー」',
		description: '植物種類を選ぶと季節別水やり頻度を計算。',
		emoji: '🪴', category: 'life', status: 'coming-soon',
	},
	{
		id: 72, slug: 'fuel-economy',
		name: '燃費計算ツール（給油記録蓄積式）',
		description: '給油日・走行距離・金額を記録、月別/年間燃費グラフ化。',
		emoji: '⛽', category: 'life', badge: 'New', status: 'coming-soon',
	},
	{
		id: 73, slug: 'size-converter',
		name: '服のサイズ国別変換チャート',
		description: '日本M→US/EU/UK表示。海外通販前に1秒確認。',
		emoji: '🌍', category: 'life', badge: '人気', status: 'coming-soon',
	},
	{
		id: 74, slug: 'wrapping-calc',
		name: '包装紙必要サイズ計算機',
		description: '箱のサイズを入れると必要な包装紙寸法＋斜め包みの折り方図解。',
		emoji: '🎁', category: 'life', status: 'coming-soon',
	},
	{
		id: 75, slug: 'rental-car-insurance',
		name: 'レンタカー「保険プラン」比較フロー',
		description: '利用条件で必要な補償を判定。免責補償・対物超過の要否を可視化。',
		emoji: '🚗', category: 'life', status: 'coming-soon',
	},
	{
		id: 76, slug: 'parallel-parking',
		name: '縦列駐車シミュレーター',
		description: '車サイズ・駐車スペース寸法でハンドル切り角度をSVGアニメ表示。',
		emoji: '🅿️', category: 'life', badge: 'New', status: 'coming-soon',
	},
	{
		id: 77, slug: 'wedding-transport',
		name: '結婚式お車代相場計算機',
		description: '距離・新幹線/飛行機の有無を入れると相場＋ご祝儀袋の表書き提案。',
		emoji: '💒', category: 'life', status: 'coming-soon',
	},
	{
		id: 78, slug: 'moving-boxes',
		name: '引越しダンボール「最適個数」予測',
		description: '家族構成・部屋数・荷物量を入れるとサイズ別必要数を計算。',
		emoji: '📦', category: 'life', status: 'coming-soon',
	},
	{
		id: 79, slug: 'bath-cost',
		name: '追い焚き vs 入れ替えコスト比較',
		description: 'ガス代・水道代を入れて、何時間で追い焚きの方が損になるか計算。',
		emoji: '🛁', category: 'life', badge: 'New', status: 'coming-soon',
	},
	{
		id: 80, slug: 'food-waste',
		name: '食品ロス防止アプリ',
		description: '食材の賞味期限を記録。近づいたら通知＋レシピ提案。',
		emoji: '🥗', category: 'life', status: 'coming-soon',
	},

	// 🎮 エンタメ・ニッチ趣味 (81-100)
	{
		id: 81, slug: 'trpg-npc',
		name: 'TRPG用「即興NPC」ジェネレーター',
		description: '種族・職業をランダム生成＋性格・口癖＋セッション中の動機まで。',
		emoji: '🎲', category: 'hobby', badge: '人気', status: 'coming-soon',
	},
	{
		id: 82, slug: 'boardgame-guide',
		name: 'ボードゲーム「初心者ガイド」生成',
		description: 'ゲーム名を入れると簡易ルール＋よくある質問＋戦略ヒント表示。',
		emoji: '♟️', category: 'hobby', status: 'coming-soon',
	},
	{
		id: 83, slug: 'climbing-log',
		name: 'クライミングジム「課題記録ノート」',
		description: 'グレード・登れた/落ちた・感想を記録。月別グラフで成長可視化。',
		emoji: '🧗', category: 'hobby', badge: 'New', status: 'coming-soon',
	},
	{
		id: 84, slug: 'tide-fishing',
		name: '釣り「タイドグラフ＋月齢」表示',
		description: '日付と場所を入れると満潮干潮・月齢から釣り適期判定。',
		emoji: '🎣', category: 'hobby', status: 'coming-soon',
	},
	{
		id: 85, slug: 'camping-checklist',
		name: 'キャンプ場「持ち物チェックリスト」生成',
		description: '人数・季節・宿泊数で必要装備を自動生成、印刷チェックリスト化。',
		emoji: '🏕️', category: 'hobby', badge: '人気', status: 'coming-soon',
	},
	{
		id: 86, slug: 'hillclimb-predictor',
		name: 'ロードバイク「ヒルクライム所要時間」予測',
		description: 'FTP・距離・標高差を入れるとタイム予測＋補給ポイント提案。',
		emoji: '🚴', category: 'hobby', status: 'coming-soon',
	},
	{
		id: 87, slug: 'running-elevation',
		name: 'ランニングコース「標高プロフィール」',
		description: 'コース距離・坂の場所を手動入力するとSVGで起伏を可視化。',
		emoji: '🏃', category: 'hobby', status: 'coming-soon',
	},
	{
		id: 88, slug: 'backlog-planner',
		name: '積みゲー消化計画ツール',
		description: 'プレイ予定時間・所要時間を入れると終了予定日を計算。',
		emoji: '🎮', category: 'hobby', badge: '人気', status: 'coming-soon',
	},
	{
		id: 89, slug: 'retro-game-board',
		name: 'レトロゲーム「クリア記録」コレクション',
		description: 'タイトル・機種・クリア日を記録、SVGトロフィー風表示。',
		emoji: '🕹️', category: 'hobby', status: 'coming-soon',
	},
	{
		id: 90, slug: 'mahjong-score',
		name: '麻雀「点数計算」練習アプリ',
		description: 'ランダムな手牌から点数申告→答え合わせ。点数早見表機能付き。',
		emoji: '🀄', category: 'hobby', badge: 'New', status: 'coming-soon',
	},
	{
		id: 91, slug: 'shogi-puzzle',
		name: '将棋詰将棋「自作問題」共有',
		description: '盤面エディタで作って画像書き出し、URLパラメータで問題共有可能。',
		emoji: '♙', category: 'hobby', status: 'coming-soon',
	},
	{
		id: 92, slug: 'fish-acclimatization',
		name: 'アクアリウム「水合わせタイマー」',
		description: '購入魚種を選ぶと点滴法/コップ法の手順＋タイマーを表示。',
		emoji: '🐠', category: 'hobby', badge: 'New', status: 'coming-soon',
	},
	{
		id: 93, slug: 'knitting-counter',
		name: '編み物「目数カウンター」',
		description: '段ごとの目数を記録、複雑なパターンの編み図進捗管理。',
		emoji: '🧶', category: 'hobby', status: 'coming-soon',
	},
	{
		id: 94, slug: 'goshuin-album',
		name: '御朱印帳デジタル管理',
		description: '撮影日・神社名・場所をタグ管理。地図SVG上にピン表示。',
		emoji: '⛩️', category: 'hobby', badge: '人気', status: 'coming-soon',
	},
	{
		id: 95, slug: 'gunpla-log',
		name: 'プラモデル「制作工程記録」',
		description: '工程写真と所要時間を記録、完成までの累計時間を表示。',
		emoji: '🤖', category: 'hobby', status: 'coming-soon',
	},
	{
		id: 96, slug: 'railway-coverage',
		name: '鉄道「乗りつぶし率」可視化マップ',
		description: '路線リストにチェックを入れると都道府県別の乗車率%を表示。',
		emoji: '🚃', category: 'hobby', badge: '人気', status: 'coming-soon',
	},
	{
		id: 97, slug: 'stamp-collection',
		name: '切手コレクション管理',
		description: 'LocalStorage保存、テーマ別アルバム化。',
		emoji: '📮', category: 'hobby', status: 'coming-soon',
	},
	{
		id: 98, slug: 'vinyl-cleaning',
		name: 'アナログレコード「クリーニング履歴」管理',
		description: 'タイトル・状態・最終クリーニング日を記録、湿度警告機能付き。',
		emoji: '🎵', category: 'hobby', status: 'coming-soon',
	},
	{
		id: 99, slug: 'handmade-cost',
		name: 'ハンドメイドアクセサリー「原価計算」',
		description: 'パーツ価格・所要時間・希望時給を入れると販売価格を提案。',
		emoji: '💎', category: 'hobby', badge: 'New', status: 'coming-soon',
	},
	{
		id: 100, slug: 'fountain-pen-diary',
		name: '万年筆インク「使用日記」',
		description: 'インク名・使った日・気分を記録、色見本SVG付きで蒐集者向け。',
		emoji: '🖊️', category: 'hobby', badge: 'New', status: 'coming-soon',
	},
];

export const toolsByCategory = (categoryId: string) =>
	tools.filter((t) => t.category === categoryId);
