const FORMAT_RULES = {
  twitter: {
    min: 1, max: 15,
    pattern: /^[a-zA-Z0-9_]+$/,
    hint: '1〜15文字・英数字とアンダースコアのみ',
  },
  instagram: {
    min: 1, max: 30,
    pattern: /^[a-zA-Z0-9._]+$/,
    extra: (u) => !u.startsWith('.') && !u.endsWith('.') && !u.includes('..'),
    hint: '1〜30文字・英数字 / . / _ のみ（先頭末尾・連続ピリオド不可）',
  },
  tiktok: {
    min: 2, max: 24,
    pattern: /^[a-zA-Z0-9._]+$/,
    hint: '2〜24文字・英数字 / . / _ のみ',
  },
  youtube: {
    min: 3, max: 30,
    pattern: /^[a-zA-Z0-9_.-]+$/,
    hint: '3〜30文字・英数字 / _ / . / - のみ',
  },
  github: {
    min: 1, max: 39,
    pattern: /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$|^[a-zA-Z0-9]$/,
    extra: (u) => !u.includes('--'),
    hint: '1〜39文字・英数字とハイフン（先頭末尾・連続ハイフン不可）',
  },
  threads: {
    min: 1, max: 30,
    pattern: /^[a-zA-Z0-9._]+$/,
    extra: (u) => !u.startsWith('.') && !u.endsWith('.') && !u.includes('..'),
    hint: '1〜30文字・英数字 / . / _ のみ',
  },
};

function validateFormat(platform, username) {
  const rule = FORMAT_RULES[platform];
  if (!rule) return { valid: false };
  if (username.length < rule.min || username.length > rule.max) return { valid: false, hint: rule.hint };
  if (!rule.pattern.test(username)) return { valid: false, hint: rule.hint };
  if (rule.extra && !rule.extra(username)) return { valid: false, hint: rule.hint };
  return { valid: true, hint: rule.hint };
}

async function checkGitHub(username) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const r = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent': 'yumi-labs-handle-check/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (r.status === 404) return 'available';
    if (r.status === 200) return 'taken';
    return 'manual';
  } catch {
    clearTimeout(timer);
    return 'manual';
  }
}

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const raw = (body.username || '').trim().replace(/^@/, '');

    if (!raw) {
      return new Response(JSON.stringify({ error: 'ユーザー名を入力してください' }), {
        status: 400, headers: { 'content-type': 'application/json' },
      });
    }

    const PLATFORMS = ['twitter', 'instagram', 'tiktok', 'youtube', 'github', 'threads'];
    const URL_MAP = {
      twitter:   `https://x.com/${raw}`,
      instagram: `https://www.instagram.com/${raw}/`,
      tiktok:    `https://www.tiktok.com/@${raw}`,
      youtube:   `https://www.youtube.com/@${raw}`,
      github:    `https://github.com/${raw}`,
      threads:   `https://www.threads.net/@${raw}`,
    };

    // GitHub: API check (reliable). Others: format-only.
    const githubApiStatus = validateFormat('github', raw).valid
      ? await checkGitHub(raw)
      : 'invalid';

    const results = {};
    for (const p of PLATFORMS) {
      const fmt = validateFormat(p, raw);
      let status = fmt.valid ? 'manual' : 'invalid';
      if (p === 'github' && fmt.valid) status = githubApiStatus;

      results[p] = {
        status,   // 'available' | 'taken' | 'manual' | 'invalid'
        hint: fmt.hint || '',
        url: URL_MAP[p],
        // confidence: 'high' only for GitHub API
        apiChecked: p === 'github' && fmt.valid && status !== 'manual',
      };
    }

    return new Response(JSON.stringify({ username: raw, results }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: `エラー: ${e.message}` }), {
      status: 500, headers: { 'content-type': 'application/json' },
    });
  }
}
