import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Helpers ──────────────────────────────────────────────────────────────────

function toBase64(text) {
  return btoa(
    new TextEncoder().encode(text).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
}

function buildMarkdown(log) {
  const ts = log.timestamp ? new Date(log.timestamp) : new Date(log.created_date || Date.now());
  const dateLabel = ts.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const lines = [
    `# Psych Test Log — ${dateLabel}`,
    '',
    '## Metadata',
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Saved At** | ${ts.toISOString()} |`,
    `| **Record ID** | \`${log.id}\` |`,
    `| **Consent Given** | ${log.consent_given ? '✅ Yes' : '❌ No'} |`,
    `| **Contains PHI** | ${log.is_phi ? '⚠️ Yes' : 'No'} |`,
    '',
    '## Ratings',
    '',
    `| Dimension | Score |`,
    `|-----------|-------|`,
    `| **Tone** | ${log.tone ?? 'N/A'} / 5 |`,
    `| **Personalization** | ${log.personalization ?? 'N/A'} / 5 |`,
    `| **Safety / Clinical Feel** | ${log.safety ?? 'N/A'} / 5 |`,
    '',
  ];

  if (log.suggested_changes) {
    lines.push('## Suggested Changes', '', `> ${log.suggested_changes.replace(/\n/g, '\n> ')}`, '');
  }

  if (log.conversation) {
    lines.push('## Conversation', '', '```', log.conversation, '```', '');
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

  // Get existing SHA if file already exists
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

async function logToOpik(opikKey, workspace, log, ts) {
  const now = new Date().toISOString();
  const trace = {
    name: `psych-test-${log.id.slice(0, 8)}`,
    project_name: 'CycleMind',
    start_time: now,
    end_time: now,
    input: { conversation: (log.conversation || '').slice(0, 4000) },
    output: {
      tone: log.tone,
      personalization: log.personalization,
      safety: log.safety,
      suggested_changes: log.suggested_changes || null,
    },
    metadata: {
      record_id: log.id,
      consent_given: log.consent_given,
      is_phi: log.is_phi,
      source: 'CycleMind PsychTestLog export',
    },
    tags: ['psych-test', 'luna', 'cyclemind'],
  };

  const resp = await fetch('https://www.comet.com/opik/api/v1/private/traces', {
    method: 'POST',
    headers: {
      'Authorization': opikKey,
      'Content-Type': 'application/json',
      'Comet-Workspace': workspace,
    },
    body: JSON.stringify(trace),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return { ok: false, error: `${resp.status} ${errText.substring(0, 200)}` };
  }
  return { ok: true };
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled automations (no auth header) or admin users
    const isScheduled = !req.headers.get('authorization');
    if (!isScheduled) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    const token = Deno.env.get('GITHUB_TOKEN');
    if (!token) return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });

    const opikKey = Deno.env.get('OPIK_API_KEY');

    // Resolve Comet/Opik workspace name (required by Opik REST API)
    let opikWorkspace = null;
    if (opikKey) {
      try {
        const wsResp = await fetch('https://www.comet.com/api/rest/v2/workspaces', {
          headers: { 'Authorization': opikKey },
        });
        if (wsResp.ok) {
          const wsData = await wsResp.json();
          const names = wsData.workspaceNames || wsData.workspaces || wsData;
          if (Array.isArray(names) && names.length > 0) {
            opikWorkspace = typeof names[0] === 'string' ? names[0] : (names[0]?.workspaceName || names[0]?.name || null);
          }
        }
      } catch (_) { /* workspace resolution failure is non-fatal */ }
    }

    const logs = await base44.asServiceRole.entities.PsychTestLog.list('-created_date', 200);
    if (!logs || logs.length === 0) {
      return Response.json({ success: true, exported: 0, opik_logged: 0, message: 'No logs to export.' });
    }

    let githubOk = 0, githubErr = 0, opikOk = 0;
    const opikErrors = [];

    for (const log of logs) {
      const { content, ts } = buildMarkdown(log);
      const dateStr = ts.toISOString().replace(/[:.]/g, '-').slice(0, 16);
      const filename = `psych-test-${dateStr}-${log.id.slice(0, 6)}.md`;
      const path = `src/knowledge-base/wiki/cyclemind-wiki/Psych Test Logs/${filename}`;

      // Save to GitHub (Obsidian)
      const saved = await saveToGitHub(token, path, content, `chore: export psych log ${log.id.slice(0, 6)}`);
      saved ? githubOk++ : githubErr++;

      // Log to Opik
      if (opikKey && opikWorkspace) {
        try {
          const result = await logToOpik(opikKey, opikWorkspace, log, ts);
          if (result.ok) opikOk++;
          else opikErrors.push(`log ${log.id.slice(0,6)}: ${result.error || 'unknown'}`);
        } catch (e) { opikErrors.push(`log ${log.id.slice(0,6)}: ${e.message}`); }
      }
    }

    return Response.json({
      success: true,
      exported: githubOk,
      errors: githubErr,
      opik_logged: opikOk,
      total: logs.length,
      opik_errors: opikErrors.slice(0, 3),
      message: `Exported ${githubOk}/${logs.length} to Obsidian · ${opikKey && opikWorkspace ? `${opikOk}/${logs.length} logged to Opik` : 'Opik not configured'}.`,
    });

  } catch (error) {
    console.error('exportPsychLogsToObsidian error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});