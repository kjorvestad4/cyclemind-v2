import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Users, Lightbulb, CheckCircle } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="link" onClick={() => navigate('/')} className="text-foreground hover:text-primary">
            ← CycleMind
          </Button>
          <Button onClick={() => navigate('/welcome')}>Get Started</Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        {/* Hero */}
        <section className="space-y-4">
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Why CycleMind Exists
          </h1>
          <p className="text-lg text-muted-foreground">
            Understanding the silent burden of menstrual-related mood disorders and the power of precise tracking.
          </p>
        </section>

        {/* The Problem */}
        <section className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              The Problem: PMDD & Undiagnosed Menstrual Mood Disorders
            </h2>
            <p className="text-muted-foreground">
              Premenstrual Dysphoric Disorder (PMDD) affects 5–8% of menstruating women—that's up to 18 million people in the U.S. alone. Yet, the majority remain undiagnosed.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
            <h3 className="font-semibold text-lg">Why PMDD is so often missed:</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                <span><strong>Lack of visible markers.</strong> Unlike a rash or fever, mood and anxiety changes are internal and subjective, making them easy to dismiss.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                <span><strong>No single clinical test.</strong> PMDD diagnosis requires 2+ cycles of prospective daily tracking using the DSM-5 DRSP criteria—something most patients and providers have never heard of.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                <span><strong>Stigma and normalization.</strong> "Just PMS" or "all women get moody" dismisses real suffering. Patients internalize shame and don't seek help.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">4.</span>
                <span><strong>Misdiagnosis.</strong> Without cycle context, PMDD looks like depression, bipolar disorder, or anxiety—leading to incorrect treatment.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">5.</span>
                <span><strong>Provider knowledge gaps.</strong> OB/GYNs rarely ask about mood. Psychiatrists rarely ask about cycle. The cycle-mood connection falls between specialties.</span>
              </li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 space-y-3">
            <p className="text-sm text-foreground">
              <strong>The human cost:</strong> Untreated PMDD leads to lost productivity, relationship strain, impaired school/work performance, and in severe cases, suicidal ideation. Yet with the right diagnosis and treatment, most patients recover dramatically.
            </p>
          </div>
        </section>

        {/* The Solution */}
        <section className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-400" />
              The Solution: Precision Tracking, Accessible to All
            </h2>
            <p className="text-muted-foreground">
              CycleMind was built to democratize clinical-grade cycle tracking. No more spreadsheets. No more missing data.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
              <h3 className="font-semibold">Daily Symptom Tracking</h3>
              <p className="text-sm text-muted-foreground">
                The 34-item Daily Record of Severity of Problems (DRSP) is the gold standard for PMDD diagnosis. CycleMind makes it fast and intuitive—no pen-and-paper burden.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
              <h3 className="font-semibold">Mental Health Integration</h3>
              <p className="text-sm text-muted-foreground">
                Integrated PHQ-9 (depression), GAD-7 (anxiety), and EPDS (postpartum depression) screening tools identify mood disorders in real-time and show luteal vs. follicular patterns.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
              <h3 className="font-semibold">Automatic Clinical Analysis</h3>
              <p className="text-sm text-muted-foreground">
                CycleMind calculates DRSP totals, compares luteal vs. follicular phases, and flags diagnostic criteria—giving you and your provider instant clarity.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
              <h3 className="font-semibold">Secure Doctor Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Generate one-time links to share anonymized data with your healthcare provider—no patient portal needed, no privacy concerns.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
              <h3 className="font-semibold">Life Stage Support</h3>
              <p className="text-sm text-muted-foreground">
                Whether you're navigating menstruation, pregnancy, postpartum recovery, or menopause, CycleMind adapts its tracking to your current stage.
              </p>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Who CycleMind Is For
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
              <h3 className="font-semibold">Women Struggling with Mood Changes</h3>
              <p className="text-sm text-muted-foreground">
                If your mood crashes before your period, anxiety spikes, or depression hits—you need proof. CycleMind provides it.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
              <h3 className="font-semibold">Those Seeking Diagnosis</h3>
              <p className="text-sm text-muted-foreground">
                PMDD requires 2 cycles of prospective DRSP data. CycleMind accelerates diagnosis and reduces the time to treatment.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
              <h3 className="font-semibold">Healthcare Providers</h3>
              <p className="text-sm text-muted-foreground">
                Psychiatrists, OB/GYNs, and primary care doctors can now access patient data that reveals cycle-mood links they'd otherwise miss.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3">
              <h3 className="font-semibold">Those in Other Life Stages</h3>
              <p className="text-sm text-muted-foreground">
                Pregnant, postpartum, or navigating menopause? CycleMind adapts to track symptoms and mood disorders relevant to your stage.
              </p>
            </div>
          </div>
        </section>

        {/* Evidence */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            Built on Clinical Evidence
          </h2>

          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6 space-y-4">
            <p className="text-sm text-foreground">
              CycleMind uses validated, evidence-based assessment tools:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>DRSP (Daily Record of Severity of Problems)</strong> — Endicott, Nee & Harrison (2006). The standard for PMDD diagnosis per DSM-5.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>PHQ-9</strong> — Kroenke & Spitzer (2001). Validated depression screening in 8+ languages.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>GAD-7</strong> — Spitzer et al. (2006). Gold-standard generalized anxiety screening.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>EPDS (Edinburgh Postnatal Depression Scale)</strong> — Cox et al. (1987). Standard perinatal/postpartum depression screening.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Call to Action */}
        <section className="space-y-6 border-t border-border/50 pt-12 text-center">
          <h2 className="text-2xl font-semibold">Ready to Take Control?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start tracking your cycle with precision. Share your data with your provider. Get diagnosed. Get treated. Reclaim your life.
          </p>
          <Button onClick={() => navigate('/welcome')} size="lg" className="h-12 px-8 text-base">
            Try CycleMind Today →
          </Button>
        </section>

        {/* Disclaimer */}
        <section className="bg-muted/50 rounded-2xl border border-border/50 p-6 text-sm text-muted-foreground text-center space-y-2">
          <p className="font-semibold text-foreground">Medical Disclaimer</p>
          <p>
            CycleMind is an informational tool. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before making medical decisions.
          </p>
          <p>
            If you are experiencing suicidal thoughts, please contact the National Suicide Prevention Lifeline at 988 (US) or your local crisis service.
          </p>
        </section>
      </div>
    </div>
  );
}