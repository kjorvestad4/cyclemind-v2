import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const RATINGS = [
  { key: 'tone_rating', label: 'Tone' },
  { key: 'personalization_rating', label: 'Personalization' },
  { key: 'safety_clinical_rating', label: 'Safety / Clinical Feel' },
];

function RatingRow({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <div className="flex gap-1.5">
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
      </div>
    </div>
  );
}

export default function PsychTestFeedback({ messageContent, msgIdx }) {
  const [ratings, setRatings] = useState({ tone_rating: null, personalization_rating: null, safety_clinical_rating: null });
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

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

  if (submitted) {
    return (
      <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        Feedback saved — thank you for testing Luna!
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl space-y-3">
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

      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={saving || !allRated}
        className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs h-8"
      >
        {saving ? 'Saving...' : 'Submit Feedback'}
      </Button>
    </div>
  );
}