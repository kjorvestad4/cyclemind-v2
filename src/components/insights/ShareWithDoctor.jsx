import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, isPast } from "date-fns";
import { Link2, Copy, Trash2, Shield, Eye, EyeOff, CheckCircle, Clock, AlertTriangle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function generateToken() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
}

export default function ShareWithDoctor({ cycles, entries, analysis }) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [opts, setOpts] = useState({ include_journal: false, include_medications: true, include_screening: true, anonymized: true });
  const [copiedId, setCopiedId] = useState(null);

  const { data: shares = [] } = useQuery({
    queryKey: ["doctor-shares"],
    queryFn: () => base44.entities.DoctorShare.list("-created_date", 20),
  });

  const createShare = useMutation({
    mutationFn: async () => {
      const token = generateToken();
      const expires_at = addDays(new Date(), 30).toISOString();
      return base44.entities.DoctorShare.create({
        share_token: token,
        expires_at,
        label: newLabel.trim() || `Doctor Share – ${format(new Date(), "MMM d, yyyy")}`,
        include_journal: opts.include_journal,
        include_medications: opts.include_medications,
        include_screening: opts.include_screening,
        anonymized: opts.anonymized,
        access_count: 0,
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-shares"] });
      setCreating(false);
      setNewLabel("");
      toast.success("Secure share link created — expires in 30 days");
    },
    onError: () => toast.error("Failed to create share link"),
  });

  const revokeShare = useMutation({
    mutationFn: (id) => base44.entities.DoctorShare.update(id, { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-shares"] });
      toast.success("Share link revoked");
    },
  });

  const deleteShare = useMutation({
    mutationFn: (id) => base44.entities.DoctorShare.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctor-shares"] }),
  });

  const copyLink = (token) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(token);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const activeShares = shares.filter(s => s.is_active && !isPast(new Date(s.expires_at)));
  const expiredShares = shares.filter(s => !s.is_active || isPast(new Date(s.expires_at)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Share with Doctor
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Generate a secure, time-limited link for your clinician</p>
        </div>
        {!creating && (
          <Button size="sm" onClick={() => setCreating(true)} className="gap-1.5 rounded-xl">
            <Plus className="w-3.5 h-3.5" /> New Link
          </Button>
        )}
      </div>

      {/* CREATE FORM */}
      {creating && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">Configure share link</p>
            <button onClick={() => setCreating(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>

          <input
            type="text"
            placeholder="Label (e.g. Dr. Smith – May appt)"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />

          <div className="space-y-2.5">
            {[
              { key: "anonymized", label: "Anonymize name & email", icon: <EyeOff className="w-3.5 h-3.5" /> },
              { key: "include_screening", label: "Include PHQ-9 & GAD-7 scores", icon: <Eye className="w-3.5 h-3.5" /> },
              { key: "include_medications", label: "Include medication log", icon: <Eye className="w-3.5 h-3.5" /> },
              { key: "include_journal", label: "Include journal / notes", icon: <Eye className="w-3.5 h-3.5" /> },
            ].map(({ key, label, icon }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setOpts(o => ({ ...o, [key]: !o[key] }))}
                  className={`w-9 h-5 rounded-full transition-colors relative ${opts[key] ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${opts[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="flex items-center gap-1.5 text-sm text-foreground">{icon}{label}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            Link expires automatically in 30 days. You can revoke it at any time.
          </div>

          <Button
            onClick={() => createShare.mutate()}
            disabled={createShare.isPending}
            className="w-full rounded-xl gap-2"
          >
            <Link2 className="w-4 h-4" />
            {createShare.isPending ? "Creating…" : "Generate Secure Link"}
          </Button>
        </div>
      )}

      {/* ACTIVE SHARES */}
      {activeShares.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Active Links</p>
          {activeShares.map(share => (
            <ShareCard
              key={share.id}
              share={share}
              onCopy={copyLink}
              onRevoke={() => revokeShare.mutate(share.id)}
              copied={copiedId === share.share_token}
            />
          ))}
        </div>
      )}

      {/* EXPIRED/REVOKED */}
      {expiredShares.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Expired / Revoked</p>
          {expiredShares.map(share => (
            <ShareCard
              key={share.id}
              share={share}
              expired
              onDelete={() => deleteShare.mutate(share.id)}
            />
          ))}
        </div>
      )}

      {shares.length === 0 && !creating && (
        <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-2xl">
          No share links yet. Generate one to securely share your data with a clinician.
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
        🔒 Links are read-only and time-limited. Your doctor cannot modify your data.
        Links only expose what you choose to include above.
      </p>
    </div>
  );
}

function ShareCard({ share, onCopy, onRevoke, onDelete, copied, expired }) {
  const expiresDate = new Date(share.expires_at);
  const daysLeft = Math.max(0, Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <div className={`rounded-xl border p-3.5 space-y-2 ${expired ? "bg-muted/30 border-border/40 opacity-70" : "bg-card border-border/50"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{share.label || "Doctor Share"}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {!expired && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="w-2.5 h-2.5" /> Active · {daysLeft}d left
              </span>
            )}
            {expired && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <AlertTriangle className="w-2.5 h-2.5" /> {share.is_active ? "Expired" : "Revoked"}
              </span>
            )}
            {share.anonymized && <span className="text-[10px] text-muted-foreground">• Anonymized</span>}
            {share.include_screening && <span className="text-[10px] text-muted-foreground">• PHQ/GAD</span>}
            {share.include_medications && <span className="text-[10px] text-muted-foreground">• Meds</span>}
            {share.include_journal && <span className="text-[10px] text-muted-foreground">• Journal</span>}
            {share.access_count > 0 && (
              <span className="text-[10px] text-muted-foreground">• {share.access_count} view{share.access_count !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!expired && onCopy && (
            <>
              <button
                onClick={() => onCopy(share.share_token)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                title="Copy link"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button
                onClick={onRevoke}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                title="Revoke link"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {expired && onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {!expired && (
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-2.5 py-1.5">
          <span className="text-[10px] font-mono text-muted-foreground truncate flex-1">
            {window.location.origin}/share/{share.share_token.slice(0, 16)}…
          </span>
        </div>
      )}
    </div>
  );
}