import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * HIPAA Audit Log Writer
 * Called by entity automations when records are created or updated
 * in PsychTestLog, UserSubmission, or PsychTestFeedback tables.
 *
 * Payload shape (from entity automation):
 *   { event: { type, entity_name, entity_id }, data, old_data }
 */
Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { event, data } = body;

    if (!event) {
      return Response.json({ error: 'No event payload' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const changedFields = body.changed_fields || [];
    const details = JSON.stringify({
      changed_fields: changedFields.length > 0 ? changedFields : undefined,
      source: data?.source || undefined,
      has_phi: data?.is_phi || false,
      consent_given: data?.consent_given || false,
    });

    await base44.asServiceRole.entities.AuditLog.create({
      timestamp: new Date().toISOString(),
      user_id: data?.created_by_id || data?.user_id || 'system',
      action: event.type === 'create' ? 'create' : event.type === 'update' ? 'update' : 'delete',
      table_affected: event.entity_name,
      record_id: event.entity_id,
      details,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('[auditLogWriter] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});