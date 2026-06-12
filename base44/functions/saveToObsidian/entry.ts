export async function saveToObsidian({ conversation, test_mode_feedback, save_request }) {
  try {
    if (!save_request || !save_request.folder) {
      throw new Error("No save_request provided");
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

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN secret is missing or not loaded");
    }

    // Safer base64 encoding for UTF-8 content
    const base64Content = btoa(
      new TextEncoder().encode(content).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const url = `https://api.github.com/repos/kjorvestad4/cyclemind/contents/${encodeURIComponent(path)}`;

    const body = {
      message: `chore: save Luna ${folder} conversation`,
      content: base64Content,
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
      throw new Error(`GitHub API error ${res.status}: ${errText}`);
    }

    return { success: true, filePath: path, message: `Saved to ${path}` };

  } catch (err: any) {
    console.error("[saveToObsidian] Full error:", err);
    return { 
      success: false, 
      message: err.message || "Unknown error in saveToObsidian",
      stack: err.stack 
    };
  }
}