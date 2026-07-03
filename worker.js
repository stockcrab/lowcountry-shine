// =========================================================
// LOW COUNTRY SHINE — CLOUDFLARE WORKER
// Serves the static site for every normal request. The one exception is
// POST /api/save-content, used by admin/index.html's "Save all changes"
// button: it pushes the updated content.json (and any new photos)
// straight to GitHub via the GitHub API, using a token stored as a
// Worker secret (never sent to the browser).
//
// This Worker does NOT deploy the live site itself — that would mean
// re-implementing Cloudflare's asset-upload protocol by hand, which is
// fragile. Instead, every push to GitHub (from here or from a normal
// `git push`) is picked up by .github/workflows/deploy.yml, which runs
// the same `wrangler deploy` command used throughout this project.
//
// EDIT: if the GitHub repo is ever renamed or moved, update GITHUB_OWNER
// and GITHUB_REPO below.
// =========================================================

const GITHUB_OWNER = 'stockcrab';
const GITHUB_REPO = 'lowcountry-shine';
const GITHUB_BRANCH = 'main';

// Encodes a JS string as base64, safely handling non-ASCII characters
// (plain btoa() breaks on UTF-8 text like curly quotes).
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function githubRequest(path, options, token) {
  const url = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + path;
  return fetch(url, {
    ...options,
    headers: {
      Authorization: 'Bearer ' + token,
      'User-Agent': 'lowcountry-shine-admin-panel',
      Accept: 'application/vnd.github+json',
      ...(options.headers || {}),
    },
  });
}

// GitHub's Contents API requires the current file's SHA when overwriting
// it, but rejects the request if a SHA is sent for a file that doesn't
// exist yet. Returns null if the file isn't there so callers can omit it.
async function getFileSha(path, token) {
  const res = await githubRequest(path + '?ref=' + GITHUB_BRANCH, { method: 'GET' }, token);
  if (res.status === 200) {
    const data = await res.json();
    return data.sha;
  }
  return null;
}

async function putFile(path, base64Content, message, token) {
  const sha = await getFileSha(path, token);
  const body = { message, content: base64Content, branch: GITHUB_BRANCH };
  if (sha) body.sha = sha;

  const res = await githubRequest(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, token);

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('GitHub write failed for ' + path + ': ' + res.status + ' ' + errText);
  }
}

async function handleSaveContent(request, env) {
  if (!env.ADMIN_PASSWORD || !env.GITHUB_TOKEN) {
    return jsonResponse({ error: 'Server is not configured yet (missing secrets).' }, 500);
  }

  const password = request.headers.get('X-Admin-Password') || '';
  if (password !== env.ADMIN_PASSWORD) {
    return jsonResponse({ error: 'Incorrect password' }, 401);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const content = payload.content;
  const photos = Array.isArray(payload.photos) ? payload.photos : [];

  if (!content) {
    return jsonResponse({ error: 'Missing content' }, 400);
  }

  try {
    // Photos first so content.json's references are valid the moment it lands.
    for (const photo of photos) {
      if (!photo.path || !photo.base64) continue;
      await putFile(photo.path, photo.base64, 'Add photo via admin panel: ' + photo.path, env.GITHUB_TOKEN);
    }

    const contentJson = JSON.stringify(content, null, 2) + '\n';
    await putFile('content.json', toBase64(contentJson), 'Update site content via admin panel', env.GITHUB_TOKEN);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/save-content' && request.method === 'POST') {
      return handleSaveContent(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
