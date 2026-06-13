import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const token = Deno.env.get('GITHUB_TOKEN');
    if (!token) {
      return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
    }

    // Fetch all psych test logs
    const logs = await base44.asServiceRole.entities.PsychTestLog.list('-created_date', 200);

    if (!logs || logs.length === 0) {
      return Response.json({ success: true, exported: 0, message: 'No logs to export.' });
    }

    const results = [];

    for (const log of logs) {
      const ts = log.timestamp ? new Date(log.timestamp) : new Date(log.created_date || Date.now());
      const dateStr = ts.toISOString().replace(/[:.]/g, '-').slice(0, 16);
      const filename = `psych-test-${dateStr}-${log.id.slice(0, 6)}.md`;
      const path = `src/knowledge-base/wiki/cyclemind-wiki/Psych Test Logs/${filename}`;

      const lines = [
        `# Psych Test Log — ${ts.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        '',
        `**Saved At:** ${ts.toISOString()}`,
        `**Record ID:** ${log.id}`,
        `**Consent Given:** ${log.consent_given ? 'Yes' : 'No'}`,
        `**Contains PHI:** ${log.is_phi ? 'Yes' : 'No'}`,
        '',
        '## Ratings',
        '',
        `- **Tone:** ${log.tone ?? 'N/A'} / 5`,
        `- **Personalization:** ${log.personalization ?? 'N/A'} / 5`,
        `- **Safety / Clinical Feel:** ${log.safety ?? 'N/A'} / 5`,
        '',
      ];

      if (log.suggested_changes) {
        lines.push('## Suggested Changes', '', log.suggested_changes, '');
      }

      if (log.conversation) {
        lines.push('## Conversation', '', '```', log.conversation, '```', '');
      }

      const content = lines.join('\n');

      // Encode to base64 safely for UTF-8
      const base64Content = btoa(
        new TextEncoder().encode(content).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const url = `https://api.github.com/repos/kjorvestad4/cyclemind/contents/${encodeURIComponent(path)}`;

      // Check if file exists (to get SHA for update)
      let sha = null;
      try {
        const checkResp = await fetch(url, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        if (checkResp.ok) {
          const existing = await checkResp.json();
          sha = existing.sha;
        }
      } catch (_) { /* file doesn't exist yet */ }

      const body = {
        message: `chore: export psych test log ${log.id.slice(0, 6)}`,
        content: base64Content,
        branch: 'main',
        ...(sha ? { sha } : {}),
      };

      const resp = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (resp.ok) {
        results.push({ filename, status: 'ok' });
      } else {
        const err = await resp.text();
        results.push({ filename, status: 'error', error: err });
      }
    }

    const successCount = results.filter(r => r.status === 'ok').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return Response.json({
      success: true,
      exported: successCount,
      errors: errorCount,
      total: logs.length,
      message: `Exported ${successCount} of ${logs.length} logs to Obsidian.`,
      results,
    });

  } catch (error) {
    console.error('exportPsychLogsToObsidian error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});