import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Crown, Check, X, ArrowLeft, Sparkles, Zap } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: "$0",
    description: "Essential cycle tracking",
    features: [
      { name: "Menstrual cycle tracking", included: true },
      { name: "Daily symptom logging (mood, vitals)", included: true },
      { name: "Basic insights", included: true },
      { name: "Pregnancy & postpartum modes", included: false },
      { name: "Menopause tracking", included: false },
      { name: "DRSP symptom tracking", included: false },
      { name: "Advanced scales (EPDS, PHQ-9, GAD-7)", included: false },
      { name: "Doctor sharing & PDF reports", included: false },
      { name: "Luna AI companion 🌙", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: "$9.99",
    annualPrice: "$99",
    annualNote: "Save $20.88/year",
    period: "/month",
    description: "Full tracking + basic Luna AI",
    features: [
      { name: "Everything in Free", included: true },
      { name: "All 5 lifecycle modes", included: true },
      { name: "DRSP symptom tracking (clinical-grade)", included: true, highlight: true },
      { name: "Luna AI — RAG-powered responses 🌙", included: true, highlight: true },
      { name: "Clinical-grade PDF reports", included: true },
      { name: "Shareable doctor links", included: true },
      { name: "EPDS, PHQ-9, GAD-7 screening", included: true },
      { name: "Advanced PMDD pattern analysis", included: true },
      { name: "Luna deep mode (Let me think on it)", included: false },
      { name: "API backup + ongoing psychiatrist training", included: false },
    ],
  },
  {
    id: "premium_plus",
    name: "Premium+",
    monthlyPrice: "$14.99",
    annualPrice: "$150",
    annualNote: "Save $29.88/year",
    period: "/month",
    description: "Everything + full Luna AI power",
    highlighted: true,
    features: [
      { name: "Everything in Premium", included: true },
      { name: "Luna deep mode — Let me think on it ✨", included: true, highlight: true },
      { name: "API backup (Grok / cloud fallback)", included: true, highlight: true },
      { name: "Markdown knowledge files", included: true, highlight: true },
      { name: "Ongoing psychiatrist training updates", included: true, highlight: true },
      { name: "Priority access to new features", included: true },
    ],
  },
];

export default function Billing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "annual"

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate("/welcome")).finally(() => setLoading(false));
  }, [navigate]);

  const handleUpgrade = (planId) => {
    // TODO: Integrate with Stripe payment
    alert(`Stripe integration coming soon! (Plan: ${planId})`);
  };

  if (loading) return null;

  const currentTier = user?.tier || "free";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-lg font-semibold">Plans & Pricing</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-20">
        <div className="space-y-8">
          {/* Intro */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-serif font-semibold text-foreground">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              From essential tracking to full AI-powered clinical insights — find the plan that fits your journey.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-1 bg-muted p-1 rounded-full w-fit mx-auto mt-4">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  billingCycle === "monthly" ? "bg-background shadow text-foreground" : "text-muted-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  billingCycle === "annual" ? "bg-background shadow text-foreground" : "text-muted-foreground"
                }`}
              >
                Annual
                <span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                  Save up to 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => {
              const isCurrent = currentTier === plan.id;
              const displayPrice = billingCycle === "annual" && plan.annualPrice
                ? plan.annualPrice
                : plan.monthlyPrice;
              const displayPeriod = billingCycle === "annual" && plan.annualPrice
                ? "/year"
                : plan.period;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-6 space-y-5 flex flex-col transition-all ${
                    plan.highlighted
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 md:-mt-2 md:mb-2"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Most Powerful
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      {plan.highlighted && <Sparkles className="w-4 h-4 text-primary" />}
                      {plan.id === "premium" && <Zap className="w-4 h-4 text-accent" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">{displayPrice}</span>
                      {displayPeriod && (
                        <span className="text-muted-foreground text-sm">{displayPeriod}</span>
                      )}
                    </div>
                    {billingCycle === "annual" && plan.annualNote && (
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                        ✓ {plan.annualNote}
                      </span>
                    )}
                    {billingCycle === "monthly" && plan.annualPrice && (
                      <p className="text-[11px] text-muted-foreground">
                        {plan.annualPrice}/year when billed annually
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5 flex-1">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm leading-snug ${
                            feature.included
                              ? feature.highlight
                                ? "text-primary font-semibold"
                                : "text-foreground"
                              : "text-muted-foreground line-through"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    {isCurrent ? (
                      <Button variant="outline" disabled className="w-full h-10 rounded-xl">
                        Current Plan
                      </Button>
                    ) : plan.id === "free" ? (
                      <Button variant="outline" disabled className="w-full h-10 rounded-xl">
                        Free Forever
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        className={`w-full h-10 rounded-xl gap-2 ${
                          plan.highlighted
                            ? "bg-primary hover:bg-primary/90"
                            : ""
                        }`}
                        variant={plan.highlighted ? "default" : "outline"}
                      >
                        {plan.highlighted ? (
                          <><Sparkles className="w-4 h-4" /> Get Premium+</>
                        ) : (
                          <><Crown className="w-4 h-4" /> Get Premium</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Luna comparison callout */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              🌙 Luna AI — What's the difference?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="space-y-1.5">
                <p className="font-semibold text-foreground">Premium — Basic Luna</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• RAG-powered clinical knowledge</li>
                  <li>• Contextual cycle & symptom responses</li>
                  <li>• Quick reply mode only</li>
                  <li>• "Let me think on it" grayed out</li>
                </ul>
              </div>
              <div className="space-y-1.5">
                <p className="font-semibold text-primary">Premium+ — Full Luna</p>
                <ul className="text-primary/80 space-y-1 text-xs">
                  <li>• Everything in Basic Luna</li>
                  <li>• Deep mode: "Let me think on it"</li>
                  <li>• Markdown knowledge files</li>
                  <li>• API cloud fallback (Grok)</li>
                  <li>• Ongoing psychiatrist training updates</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="border-t border-border/50 pt-6 space-y-4 text-sm">
            <h3 className="text-lg font-semibold text-foreground">Questions?</h3>
            <div>
              <p className="font-medium text-foreground">What payment methods do you accept?</p>
              <p className="text-muted-foreground">We accept all major credit cards and digital payment methods.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Can I cancel anytime?</p>
              <p className="text-muted-foreground">Yes — you can cancel or downgrade your subscription at any time. Annual plans are non-refundable after 14 days.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">What is "ongoing psychiatrist training"?</p>
              <p className="text-muted-foreground">Premium+ users get access to Luna's newest capabilities as our clinical team continuously fine-tunes her responses with psychiatric expertise.</p>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            CycleMind is not a substitute for professional medical advice.
          </p>
        </div>
      </main>
    </div>
  );
}