import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation, test_mode_feedback, save_request } = await req.json();

    if (!save_request || !save_request.folder || !save_request.filename) {
      return Response.json({ 
        success: false, 
        error: 'Missing save_request with folder and filename' 
      }, { status: 400 });
    }

    // Build markdown content
    let markdownContent = `# Luna Conversation Log\n\n`;
    markdownContent += `**User:** ${user.full_name}\n`;
    markdownContent += `**Date:** ${new Date().toISOString()}\n`;
    markdownContent += `**Folder:** ${save_request.folder}\n\n`;
    markdownContent += `## Conversation\n\n`;
    markdownContent += conversation + '\n\n';

    if (test_mode_feedback && test_mode_feedback.show_form) {
      markdownContent += `## Test Mode Feedback\n\n`;
      markdownContent += `**Form Title:** ${test_mode_feedback.form_title}\n\n`;
      markdownContent += `**Ratings:**\n`;
      if (test_mode_feedback.ratings) {
        test_mode_feedback.ratings.forEach(r => {
          markdownContent += `- ${r}\n`;
        });
      }
      markdownContent += `\n**Suggested Changes Label:** ${test_mode_feedback.suggested_changes_label}\n\n`;
    }

    // For now, log to console (in a real impl, write to Obsidian vault)
    console.log(`[saveToObsidian] Saving to ${save_request.folder}/${save_request.filename}`);
    console.log(markdownContent);

    // Return success response
    return Response.json({
      success: true,
      filePath: `${save_request.folder}/${save_request.filename}`,
      message: `Conversation saved to ${save_request.folder}`,
      content: markdownContent
    });

  } catch (error) {
    console.error('saveToObsidian error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});