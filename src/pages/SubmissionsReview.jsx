import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, FlaskConical, ScrollText, Upload, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  ingested: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-slate-100 text-slate-500',
};

export default function SubmissionsReview() {
  const [tab, setTab] = useState('psych');
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [exportingComments, setExportingComments] = useState(false);
  const [exportCommentsResult, setExportCommentsResult] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    setExportResult(null);
    const resp = await base44.functions.invoke('exportPsychLogsToObsidian', {});
    setExportResult(resp.data);
    setExporting(false);
  };

  const handleExportComments = async () => {
    setExportingComments(true);
    setExportCommentsResult(null);
    const resp = await base44.functions.invoke('exportUserCommentsToObsidian', {});
    setExportCommentsResult(resp.data);
    setExportingComments(false);
  };

  const { data: psychLogs = [], isLoading: loadingPsych } = useQuery({
    queryKey: ['psych-test-logs'],
    queryFn: () => base44.entities.PsychTestLog.list('-created_date', 50),
  });

  const { data: userSubs = [], isLoading: loadingUser } = useQuery({
    queryKey: ['user-submissions'],
    queryFn: () => base44.entities.UserSubmission.list('-created_date', 50),
  });

  const { data: userComments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['user-comments'],
    queryFn: () => base44.entities.UserComment.list('-created_date', 50),
  });

  const { data: auditLogs = [], isLoading: loadingAudit } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 100),
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-violet-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Submissions Review</h1>
            <p className="text-sm text-muted-foreground">HIPAA-compliant view of test logs, user feedback, and audit trail</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Upload className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export Psych Test Logs to Obsidian + Opik'}
            </Button>
            <Button
              onClick={handleExportComments}
              disabled={exportingComments}
              className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
            >
              <MessageSquare className="w-4 h-4" />
              {exportingComments ? 'Exporting...' : 'Export User Comments to Obsidian + Opik'}
            </Button>
          </div>
        </div>

        {exportResult && (
          <div className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${exportResult.errors > 0 ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-emerald-50 border-emerald-300 text-emerald-800'}`}>
            {exportResult.errors > 0 ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>{exportResult.message}{exportResult.errors > 0 ? ` (${exportResult.errors} failed)` : ''}</span>
          </div>
        )}
        {exportCommentsResult && (
          <div className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${exportCommentsResult.errors > 0 ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-emerald-50 border-emerald-300 text-emerald-800'}`}>
            {exportCommentsResult.errors > 0 ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>{exportCommentsResult.message}{exportCommentsResult.errors > 0 ? ` (${exportCommentsResult.errors} failed)` : ''}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 flex items-center gap-3">
              <FlaskConical className="w-5 h-5 text-violet-500" />
              <div>
                <p className="text-2xl font-bold">{psychLogs.length}</p>
                <p className="text-xs text-muted-foreground">Psych Test Logs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 flex items-center gap-3">
              <FileText className="w-5 h-5 text-teal-500" />
              <div>
                <p className="text-2xl font-bold">{userSubs.length}</p>
                <p className="text-xs text-muted-foreground">User Submissions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-teal-500" />
              <div>
                <p className="text-2xl font-bold">{userComments.length}</p>
                <p className="text-xs text-muted-foreground">User Comments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 flex items-center gap-3">
              <ScrollText className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-2xl font-bold">{auditLogs.length}</p>
                <p className="text-xs text-muted-foreground">Audit Events</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="psych">Psych Test Logs</TabsTrigger>
            <TabsTrigger value="user">User Submissions</TabsTrigger>
            <TabsTrigger value="comments">User Comments</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          {/* Psych Test Logs */}
          <TabsContent value="psych">
            <Card>
              <CardHeader><CardTitle className="text-base">Latest Psychiatrist Test Sessions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {loadingPsych && <p className="text-sm text-muted-foreground">Loading...</p>}
                {!loadingPsych && psychLogs.length === 0 && <p className="text-sm text-muted-foreground">No sessions yet.</p>}
                {psychLogs.map(log => (
                  <div key={log.id} className="border rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp ? format(new Date(log.timestamp), 'MMM d, yyyy HH:mm') : '—'}
                      </span>
                      <div className="flex gap-2">
                        {log.consent_given && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Consent ✓</Badge>}
                        {log.is_phi && <Badge className="bg-red-100 text-red-700 text-[10px]">PHI</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-600">
                      <span>Tone: <strong>{log.tone ?? '—'}</strong></span>
                      <span>Personalization: <strong>{log.personalization ?? '—'}</strong></span>
                      <span>Safety: <strong>{log.safety ?? '—'}</strong></span>
                    </div>
                    {log.suggested_changes && (
                      <p className="text-xs text-slate-500 italic">"{log.suggested_changes}"</p>
                    )}
                    {log.conversation && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-teal-600 font-medium">View conversation</summary>
                        <pre className="mt-2 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 text-[11px] text-slate-700 max-h-48 overflow-y-auto">
                          {log.conversation}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Submissions */}
          <TabsContent value="user">
            <Card>
              <CardHeader><CardTitle className="text-base">Latest User Submissions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {loadingUser && <p className="text-sm text-muted-foreground">Loading...</p>}
                {!loadingUser && userSubs.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
                {userSubs.map(sub => (
                  <div key={sub.id} className="border rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-muted-foreground">
                          {sub.timestamp ? format(new Date(sub.timestamp), 'MMM d, yyyy HH:mm') : '—'}
                        </span>
                        {sub.source && <Badge className="bg-blue-100 text-blue-700 text-[10px]">{sub.source}</Badge>}
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`text-[10px] ${STATUS_COLORS[sub.status] || STATUS_COLORS.pending}`}>
                          {sub.status || 'pending'}
                        </Badge>
                        {sub.consent_given && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Consent ✓</Badge>}
                        {sub.is_phi && <Badge className="bg-red-100 text-red-700 text-[10px]">PHI</Badge>}
                      </div>
                    </div>
                    {sub.suggested_improvements && (
                      <p className="text-xs text-slate-500 italic">"{sub.suggested_improvements}"</p>
                    )}
                    {sub.conversation_or_message && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-teal-600 font-medium">View message</summary>
                        <pre className="mt-2 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 text-[11px] text-slate-700 max-h-48 overflow-y-auto">
                          {sub.conversation_or_message}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Comments */}
          <TabsContent value="comments">
            <Card>
              <CardHeader><CardTitle className="text-base">Latest User Comments</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {loadingComments && <p className="text-sm text-muted-foreground">Loading...</p>}
                {!loadingComments && userComments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
                {userComments.map(comment => (
                  <div key={comment.id} className="border rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {comment.timestamp ? format(new Date(comment.timestamp), 'MMM d, yyyy HH:mm') : '—'}
                      </span>
                      <div className="flex gap-2">
                        {comment.mode && <Badge className="bg-teal-100 text-teal-700 text-[10px]">{comment.mode}</Badge>}
                        {comment.exported && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Exported ✓</Badge>}
                      </div>
                    </div>
                    {comment.symptoms && (
                      <p className="text-xs text-slate-600"><span className="font-medium">Symptoms:</span> {comment.symptoms}</p>
                    )}
                    {comment.comment && (
                      <p className="text-xs text-slate-700 bg-slate-50 rounded-lg px-3 py-2">{comment.comment}</p>
                    )}
                    {comment.suggested_improvements && (
                      <p className="text-xs text-slate-500 italic">"{comment.suggested_improvements}"</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log */}
          <TabsContent value="audit">
            <Card>
              <CardHeader><CardTitle className="text-base">Audit Trail</CardTitle></CardHeader>
              <CardContent>
                {loadingAudit && <p className="text-sm text-muted-foreground">Loading...</p>}
                {!loadingAudit && auditLogs.length === 0 && <p className="text-sm text-muted-foreground">No audit events yet.</p>}
                <div className="space-y-2">
                  {auditLogs.map(log => (
                    <div key={log.id} className="flex items-center gap-3 text-xs border-b pb-2 last:border-0">
                      <span className="text-muted-foreground w-36 shrink-0">
                        {log.timestamp ? format(new Date(log.timestamp), 'MMM d HH:mm:ss') : '—'}
                      </span>
                      <Badge className={`text-[10px] shrink-0 ${
                        log.action === 'create' ? 'bg-emerald-100 text-emerald-700' :
                        log.action === 'update' ? 'bg-blue-100 text-blue-700' :
                        log.action === 'delete' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{log.action}</Badge>
                      <span className="font-medium text-slate-700 shrink-0">{log.table_affected}</span>
                      <span className="text-muted-foreground truncate">{log.record_id}</span>
                      {log.user_id && <span className="text-muted-foreground truncate ml-auto">{log.user_id}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}