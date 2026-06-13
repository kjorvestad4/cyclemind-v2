import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Save } from 'lucide-react';
import { toast } from 'sonner';

const RATINGS = [
  { key: 'tone_rating', label: 'Tone' },
  { key: 'personalization_rating', label: 'Personalization' },
  { key: 'safety_clinical_rating', label: 'Safety / Clinical Feel' },
];

function RatingRow({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <div className="flex gap-1.5 items-center">
        <span className="text-[10px] text-slate-400 shrink-0">worst</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 h-8 rounded-lg text-xs font-semibold border transition-all ${
              value === n
                ? 'bg-teal-600 text-white border-teal-600 shadow'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-teal-400 hover:text-teal-600'
            }`}
          >
            {n}
          </button>
        ))}
        <span className="text-[10px] text-slate-400 shrink-0">best</span>
      </div>
    </div>
  );
}

export default function PsychTestFeedback({ messageContent, msgIdx, allMessages }) {
  const [ratings, setRatings] = useState({ tone_rating: null, personalization_rating: null, safety_clinical_rating: null });
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const allRated = RATINGS.every(r => ratings[r.key] !== null);

  const handleSubmit = async () => {
    if (!allRated) { toast.error('Please rate all three dimensions before submitting.'); return; }
    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.PsychTestFeedback.create({
        user_id: user.id,
        message_content: (messageContent || '').slice(0, 500),
        tone_rating: ratings.tone_rating,
        personalization_rating: ratings.personalization_rating,
        safety_clinical_rating: ratings.safety_clinical_rating,
        notes: notes.trim() || null,
        submitted_at: new Date().toISOString(),
      });
      setSubmitted(true);
      toast.success('Feedback saved. Thank you!');
    } catch (err) {
      console.error(err);
      toast.error('Could not save feedback. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSession = async () => {
    setSavingSession(true);
    try {
      const conversationText = (allMessages || [])
        .map(m => `[${m.role.toUpperCase()}]: ${m.content}`)
        .join('\n\n');

      await base44.entities.PsychTestLog.create({
        timestamp: new Date().toISOString(),
        conversation: conversationText,
        tone: ratings.tone_rating,
        personalization: ratings.personalization_rating,
        safety: ratings.safety_clinical_rating,
        suggested_changes: notes.trim() || null,
        consent_given: true,
        is_phi: false,
      });

      setSessionSaved(true);
      toast.success('Session saved! Thank you for helping train Luna. 💚');
    } catch (err) {
      console.error(err);
      toast.error('Could not save session. Please try again.');
    } finally {
      setSavingSession(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-3 space-y-2">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Feedback saved — thank you for testing Luna!
        </div>
        {!sessionSaved && (
          <Button
            size="sm"
            onClick={handleSaveSession}
            disabled={savingSession}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 gap-1.5"
          >
            <Save className="w-3 h-3" />
            {savingSession ? 'Saving...' : '💾 Save Test Session for Luna'}
          </Button>
        )}
        {sessionSaved && (
          <div className="p-2 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl flex items-center gap-2 text-xs text-violet-700 dark:text-violet-300 font-medium">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            Full session saved to database!
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {/* HIPAA Disclaimer Banner */}
      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
        <span className="shrink-0 mt-0.5">⚠️</span>
        <span>
          <strong>Test Mode:</strong> This is clinician feedback mode. Data is saved for AI improvement only and is <strong>not used for clinical decisions</strong>.
        </span>
      </div>

      <div className="p-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl space-y-3">
        <p className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wide">
          ⚗️ PSYCH TEST MODE — Rate this response
        </p>

        {RATINGS.map(({ key, label }) => (
          <RatingRow
            key={key}
            label={label}
            value={ratings[key]}
            onChange={(v) => setRatings(prev => ({ ...prev, [key]: v }))}
          />
        ))}

        <textarea
          placeholder="Suggested changes? (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full text-xs rounded-xl border border-violet-200 dark:border-violet-700 bg-white dark:bg-slate-800 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-violet-400 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
        />

        {/* Consent Checkbox */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-0.5 accent-violet-600"
          />
          <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            I confirm this is test data and consent to it being used for Luna improvement (anonymized).
          </span>
        </label>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={saving || !allRated}
            className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs h-8"
          >
            {saving ? 'Saving...' : 'Submit Feedback'}
          </Button>
          <Button
            size="sm"
            onClick={handleSaveSession}
            disabled={savingSession || sessionSaved || !consentGiven}
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1 disabled:opacity-40"
          >
            <Save className="w-3 h-3" />
            {savingSession ? 'Saving...' : sessionSaved ? '✓ Saved!' : '💾 Save Session'}
          </Button>
        </div>
      </div>
    </div>
  );
}