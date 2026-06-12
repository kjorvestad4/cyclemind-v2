export async function saveToObsidian({ conversation, test_mode_feedback, save_request }) {
  if (!save_request || !save_request.folder) {
    return { success: false, message: "No save_request provided" };
  }

  const folder = save_request.folder;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = save_request.filename || `conversation-${timestamp}.md`;
  
  // ✅ Updated correct path
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

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { success: false, message: "GITHUB_TOKEN secret is missing" };
  }

  try {
    const url = `https://api.github.com/repos/kjorvestad4/cyclemind/contents/${encodeURIComponent(path)}`;

    const body = {
      message: `chore: save Luna ${folder} conversation`,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: "main",
    };

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, message: `GitHub API error: ${res.status} ${errText}` };
    }

    return { success: true, filePath: path, message: `Saved to ${path}` };
  } catch (err) {
    return { success: false, message: err.message };
  }
}