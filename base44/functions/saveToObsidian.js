import { Octokit } from "@octokit/rest";

export async function saveToObsidian({ conversation, test_mode_feedback, save_request }) {
  if (!save_request || !save_request.folder) {
    return { success: false, message: "No save_request provided" };
  }

  const folder = save_request.folder;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = save_request.filename || `conversation-${timestamp}.md`;
  const path = `wiki/cyclemind-wiki/${folder}/${filename}`;

  let content = `# Conversation - ${new Date().toLocaleString()}\n\n`;

  if (conversation) content += `## Conversation\n${conversation}\n\n`;

  if (test_mode_feedback) {
    content += `## Psychiatrist Feedback\n`;
    content += `- Tone: ${test_mode_feedback.tone || 'N/A'}\n`;
    content += `- Personalization: ${test_mode_feedback.personalization || 'N/A'}\n`;
    content += `- Safety / Clinical Feel: ${test_mode_feedback.safety || 'N/A'}\n`;
    content += `- Suggested changes: ${test_mode_feedback.suggested_changes || 'None'}\n\n`;
  }

  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    await octokit.repos.createOrUpdateFileContents({
      owner: "kjorvestad4",
      repo: "cyclemind",
      path,
      message: `chore: save Luna ${folder} conversation`,
      content: Buffer.from(content).toString("base64"),
      branch: "main",
    });

    return {
      success: true,
      filePath: path,
      message: `Saved to GitHub → ${path}`,
    };
  } catch (err) {
    console.error("GitHub write failed:", err);
    return { success: false, message: err.message };
  }
}
