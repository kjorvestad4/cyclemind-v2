import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toBase64(text) {
  return btoa(
    new TextEncoder().encode(text).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
}

function buildMarkdown(comment) {
  const ts = comment.timestamp ? new Date(comment.timestamp) : new Date(comment.created_date || Date.now());
  const dateLabel = ts.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const lines = [
    `# User Comment — ${dateLabel}`,
    '',
    '## Metadata',
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Saved At** | ${ts.toISOString()} |`,
    `| **Record ID** | \`${comment.id}\` |`,
    `| **User ID** | ${comment.user_id || 'anonymous'} |`,
    `| **Mode** | ${comment.mode || 'general'} |`,
    '',
  ];

  if (comment.symptoms) {
    lines.push('## Symptoms Mentioned', '', `> ${comment.symptoms.replace(/\n/g, '\n> ')}`, '');
  }

  if (comment.comment) {
    lines.push('## Comment', '', `> ${comment.comment.replace(/\n/g, '\n> ')}`, '');
  }

  if (comment.suggested_improvements) {
    lines.push('## Suggested Improvements', '', `> ${comment.suggested_improvements.replace(/\n/g, '\n> ')}`, '');
  }

  lines.push('---', `*Exported by CycleMind · ${new Date().toISOString()}*`, '');
  return { content: lines.join('\n'), ts };
}

async function saveToGitHub(token, path, content, commitMsg) {
  const url = `https://api.github.com/repos/kjorvestad4/cyclemind/contents/${encodeURIComponent(path)}`;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  let sha = null;
  const checkResp = await fetch(url, { headers });
  if (checkResp.ok) {
    const existing = await checkResp.json();
    sha = existing.sha;
  }

  const body = { message: commitMsg, content: toBase64(content), branch: 'main', ...(sha ? { sha } : {}) };
  const resp = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
  return resp.ok;
}

async function logToOpik(opikKey, comment, ts) {
  const trace = {
    name: `user-comment-${comment.id.slice(0, 8)}`,
    start_time: ts.toISOString(),
    end_time: ts.toISOString(),
    input: {
      comment: (comment.comment || '').slice(0, 4000),
      symptoms: comment.symptoms || null,
    },
    output: {
      suggested_improvements: comment.suggested_improvements || null,
      mode: comment.mode || 'general',
    },
    metadata: {
      record_id: comment.id,
      user_id: comment.user_id || 'anonymous',
      mode: comment.mode || 'general',
      source: 'CycleMind UserComment export',
    },
    tags: ['user-comment', 'luna', 'cyclemind', comment.mode || 'general'],
  };

  const resp = await fetch('https://www.comet.com/opik/api/v1/private/traces', {
    method: 'POST',
    headers: {
      'Authorization': opikKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trace),
  });

  return resp.ok;
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const token = Deno.env.get('GITHUB_TOKEN');
    if (!token) return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });

    const opikKey = Deno.env.get('OPIK_API_KEY');

    const comments = await base44.asServiceRole.entities.UserComment.list('-created_date', 200);
    if (!comments || comments.length === 0) {
      return Response.json({ success: true, exported: 0, opik_logged: 0, message: 'No user comments to export.' });
    }

    let githubOk = 0, githubErr = 0, opikOk = 0;

    for (const comment of comments) {
      const { content, ts } = buildMarkdown(comment);
      const dateStr = ts.toISOString().replace(/[:.]/g, '-').slice(0, 16);
      const filename = `user-comment-${dateStr}-${comment.id.slice(0, 6)}.md`;
      const path = `src/knowledge-base/wiki/cyclemind-wiki/User Comments/${filename}`;

      const saved = await saveToGitHub(token, path, content, `chore: export user comment ${comment.id.slice(0, 6)}`);
      saved ? githubOk++ : githubErr++;

      if (opikKey) {
        try {
          const logged = await logToOpik(opikKey, comment, ts);
          if (logged) opikOk++;
        } catch (_) { /* Opik errors are non-fatal */ }
      }
    }

    return Response.json({
      success: true,
      exported: githubOk,
      errors: githubErr,
      opik_logged: opikOk,
      total: comments.length,
      message: `Exported ${githubOk}/${comments.length} to Obsidian · ${opikKey ? `${opikOk}/${comments.length} logged to Opik` : 'Opik key not set'}.`,
    });

  } catch (error) {
    console.error('exportUserCommentsToObsidian error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});