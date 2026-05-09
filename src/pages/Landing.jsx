import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Brain, Heart, Activity, TrendingUp, BarChart3 } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const handleStartApp = () => {
    navigate('/welcome');
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-foreground">CycleMind</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/about')} className="text-sm">
              Learn More
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 space-y-8 text-center">
        <div className="space-y-4">
          <h2 className="font-serif text-5xl font-bold text-foreground leading-tight">
            Track Your Cycle with Clinical Precision
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive symptom tracking for menstrual health, pregnancy, postpartum recovery, and menopause—designed for clinicians and patients.
          </p>
        </div>

        <div className="pt-4">
          <Button onClick={handleStartApp} size="lg" className="h-12 px-8 text-base">
            Try CycleMind Today →
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-semibold text-center mb-12">Powerful Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            title="DRSP Symptom Tracking"
            description="Track 34 daily symptoms using the validated Daily Record of Severity of Problems"
          />
          <FeatureCard
            icon={<Heart className="w-6 h-6" />}
            title="Mental Health Screening"
            description="Integrated PHQ-9, GAD-7, and EPDS assessments for mood and anxiety monitoring"
          />
          <FeatureCard
            icon={<Activity className="w-6 h-6" />}
            title="Multi-Mode Tracking"
            description="Customize tracking for menstrual, pregnancy, postpartum, perimenopause, and menopause modes"
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Clinical Insights"
            description="Automated analysis identifying PMDD patterns, luteal phase severity, and diagnostic indicators"
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Doctor Share Links"
            description="Generate secure, time-limited links to share anonymized data with your healthcare provider"
          />
          <FeatureCard
            icon={<Heart className="w-6 h-6" />}
            title="Vitals & Intimacy Logging"
            description="Track heart rate, blood pressure, temperature, weight, and sexual activity with protection status"
          />
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold">Intuitive Interface</h3>
          <p className="text-muted-foreground">Beautiful, responsive design optimized for daily tracking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScreenshotCard
            title="Daily Log"
            description="Log symptoms, vitals, medications, and mood screens in one place"
            emoji="📝"
          />
          <ScreenshotCard
            title="Interactive Calendar"
            description="Visualize your cycle patterns with color-coded severity indicators"
            emoji="📅"
          />
          <ScreenshotCard
            title="Clinical Insights"
            description="Get PMDD diagnostic indicators and phase-based analysis"
            emoji="📊"
          />
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-6xl mx-auto px-4 py-16 space-y-8">
        <h3 className="text-2xl font-semibold text-center">For Every Stage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UseCase
            title="PMDD & Menstrual Health"
            features={["DRSP daily tracking", "Luteal vs follicular comparison", "Doctor share links", "Diagnostic pattern detection"]}
          />
          <UseCase
            title="Pregnancy & Postpartum"
            features={["Pregnancy symptom tracking", "EPDS depression screening", "Postpartum recovery metrics", "Fetal movement monitoring"]}
          />
          <UseCase
            title="Perimenopause & Menopause"
            features={["Hot flash tracking", "Symptom burden analysis", "Mental health screening", "HRT monitoring"]}
          />
          <UseCase
            title="Clinical Providers"
            features={["Patient data synthesis", "Pattern recognition", "Validated screening tools", "Secure patient sharing"]}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <h3 className="text-3xl font-semibold">Ready to Track Your Health?</h3>
        <p className="text-lg text-muted-foreground">
          Start your free account and take control of your cycle health with CycleMind.
        </p>
        <Button onClick={handleStartApp} size="lg" className="h-12 px-8 text-base">
          Try CycleMind Today →
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Based on the Daily Record of Severity of Problems (DRSP), PHQ-9, GAD-7, and EPDS.
          </p>
          <p className="text-xs text-muted-foreground">
            CycleMind is an informational tool. Always consult with a qualified healthcare provider for medical advice.
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => navigate('/about')}
            className="text-primary hover:text-primary/80"
          >
            Learn about the need for better tracking →
          </Button>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-3 hover:border-primary/30 transition-colors">
      <div className="text-primary">{icon}</div>
      <h4 className="font-semibold text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ScreenshotCard({ title, description, emoji }) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 h-40 flex items-center justify-center text-5xl">
        {emoji}
      </div>
      <div className="p-6 space-y-2">
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function UseCase({ title, features }) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
      <h4 className="font-semibold text-lg text-foreground">{title}</h4>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}