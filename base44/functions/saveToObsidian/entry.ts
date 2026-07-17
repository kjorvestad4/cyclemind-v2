import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { conversation, test_mode_feedback, save_request } = body;

    if (!save_request || !save_request.folder) {
      return Response.json({ success: false, message: 'No save_request provided' }, { status: 400 });
    }

    const folder = save_request.folder;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = save_request.filename || `conversation-${timestamp}.md`;
    const path = `src/knowledge-base/wiki/cyclemind-wiki/${folder}/${filename}`;

    let content = `# Conversation - ${new Date().toLocaleString()}\n\n`;
    if (conversation) content += `## Conversation\n${conversation}\n\n`;

    if (test_mode_feedback) {
      content += `## Psychiatrist Feedback\n`;
      content += `- Tone: ${test_mode_feedback.tone || 'N/A'}\n`;
      content += `- Personalization: ${test_mode_feedback.personalization || 'N/A'}\n`;
      content += `- Safety / Clinical Feel: ${test_mode_feedback.safety || 'N/A'}\n`;
      content += `- Suggested changes: ${test_mode_feedback.suggested_changes || 'None'}\n\n`;
    }

    const token = Deno.env.get('GITHUB_TOKEN');
    if (!token) {
      return Response.json({ success: false, message: 'GITHUB_TOKEN secret is missing' }, { status: 500 });
    }

    // UTF-8 safe base64 encoding for Deno
    const base64Content = btoa(
      new TextEncoder().encode(content).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const url = `https://api.github.com/repos/kjorvestad4/cyclemind/contents/${encodeURIComponent(path)}`;
    const body_ = {
      message: `chore: save Luna ${folder} conversation`,
      content: base64Content,
      branch: 'main',
    };

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'CycleMind-App',
      },
      body: JSON.stringify(body_),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ success: false, message: `GitHub API error ${res.status}: ${errText}` }, { status: 502 });
    }

    return Response.json({ success: true, filePath: path, message: `Saved to ${path}` });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
});