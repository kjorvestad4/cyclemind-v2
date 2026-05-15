import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Crown, Check, X, ArrowLeft } from "lucide-react";

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Essential tracking",
    features: [
      { name: "Menstrual cycle tracking", included: true },
      { name: "Daily symptom logging (mood, vitals)", included: true },
      { name: "Basic insights", included: true },
      { name: "Pregnancy tracking", included: false },
      { name: "Postpartum support", included: false },
      { name: "Menopause tracking", included: false },
      { name: "DRSP symptom tracking", included: false },
      { name: "Advanced scales (PHQ-9, GAD-7)", included: false },
      { name: "Doctor sharing", included: false },
      { name: "Luna AI companion 🌙", included: false },
    ],
  },
  {
    id: "founders",
    name: "Founder's Plan",
    price: "$6.99",
    period: "/month",
    description: "Limited: First 100 customers, locked for life",
    features: [
      { name: "Everything in Free", included: true },
      { name: "All 5 lifecycle modes", included: true },
      { name: "DRSP symptom tracking (clinical-grade)", included: true, highlight: true },
      { name: "Luna AI companion 🌙", included: true, highlight: true },
      { name: "Clinical-grade PDF reports", included: true },
      { name: "Shareable doctor links", included: true },
      { name: "EPDS postpartum screening", included: true },
      { name: "Advanced PMDD pattern analysis", included: true },
      { name: "Unlimited history & trends", included: true },
    ],
    highlighted: true,
    badge: "Founders: 3 months free, then $6.99/mo",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99",
    period: "/month",
    description: "Full access to all features",
    features: [
      { name: "Everything in Free", included: true },
      { name: "All 5 lifecycle modes", included: true },
      { name: "DRSP symptom tracking (clinical-grade)", included: true },
      { name: "Luna AI companion 🌙", included: true, highlight: true },
      { name: "Clinical-grade PDF reports", included: true },
      { name: "Shareable doctor links", included: true },
      { name: "EPDS postpartum screening", included: true },
      { name: "Advanced PMDD pattern analysis", included: true },
      { name: "Unlimited history & trends", included: true },
    ],
  },
];

export default function Billing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate("/welcome")).finally(() => setLoading(false));
  }, [navigate]);

  const handleUpgrade = () => {
    // TODO: Integrate with Stripe payment
    alert("Stripe integration coming soon!");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-lg font-semibold">Upgrade to Premium</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 pb-20">
        <div className="space-y-8">
          {/* Intro */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-semibold text-foreground">
              Unlock Full Potential
            </h2>
            <p className="text-muted-foreground">
              Get access to all tracking modes and advanced health insights.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-2xl border-2 p-6 space-y-6 transition-all ${
                  tier.highlighted
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 md:scale-105"
                    : "border-border bg-card"
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-foreground">{tier.name}</h3>
                    {tier.highlighted && <Crown className="w-5 h-5 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  {tier.badge && (
                    <span className="inline-block text-xs font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                      {tier.badge}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground text-sm">{tier.period}</span>
                    )}
                  </div>
                  {tier.id === "founders" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">First 100 customers only</span>
                    </div>
                  )}
                  {tier.id === "premium" && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground line-through">$119.88/year</span>
                      <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full">$100/year — Save 17%</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? feature.highlight ? "text-primary font-semibold" : "text-foreground"
                            : "text-muted-foreground line-through"
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                {tier.id === "free" ? (
                  <Button variant="outline" disabled className="w-full h-10">
                    Your Current Plan
                  </Button>
                ) : (
                  <Button onClick={handleUpgrade} className="w-full h-10 gap-2 rounded-xl">
                    {tier.id === "founders" ? (
                      <>
                        <Crown className="w-4 h-4" />
                        Claim Founder's Pricing
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4" />
                        Upgrade to Premium
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="border-t border-border/50 pt-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Questions?</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-foreground">What payment methods do you accept?</p>
                <p className="text-muted-foreground">We accept all major credit cards and digital payment methods.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">What payment methods do you accept?</p>
                <p className="text-muted-foreground">We accept all major credit cards and digital payment methods.</p>
              </div>
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