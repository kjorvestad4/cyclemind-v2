import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DOBPicker from "@/components/common/DOBPicker";
import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";

// Step 0: Welcome screen — no auth required
function WelcomeStep() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-8 text-center max-w-md mx-auto w-full">
      <div className="space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto">
          <span className="text-4xl">🌙</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Welcome to CycleMind</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The app that supports your full hormonal journey — from PMDD to pregnancy to menopause.
        </p>
      </div>

      <div className="w-full space-y-3">
        <Button
          onClick={() => base44.auth.redirectToLogin("/start?step=1")}
          className="w-full h-12 rounded-2xl font-semibold text-base"
        >
          Get Started
        </Button>
        <Button
          onClick={() => base44.auth.redirectToLogin("/start?step=1")}
          variant="outline"
          className="w-full h-12 rounded-2xl font-semibold text-base"
        >
          I already have an account
        </Button>
        <p className="text-xs text-muted-foreground pt-1">
          Free to use · Private by design · No ads
        </p>
      </div>
    </div>
  );
}

// Step 1 (post-login): Personal Info
function PersonalInfoStep({ fullName, setFullName, dateOfBirth, setDateOfBirth }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-6 text-center max-w-md mx-auto w-full">
      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Tell us about you</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This helps us personalize your experience and show age-appropriate insights.
        </p>
      </div>

      <div className="w-full space-y-5">
        <div className="space-y-2 text-left">
          <Label className="text-sm font-semibold">
            👤 Full Name <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            type="text"
            placeholder="Your name"
            className="h-11 text-base"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="text-left">
          <DOBPicker
            value={dateOfBirth}
            onChange={setDateOfBirth}
            label="🎂 Date of Birth"
            optional={true}
          />
          <p className="text-xs text-muted-foreground italic mt-2">
            Optional — used to show age-appropriate tips
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(null); // null = checking
  const [selectedMode, setSelectedMode] = useState("menstrual");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [reminderTime, setReminderTime] = useState("19:00");
  const [unitSystem, setUnitSystem] = useState("imperial");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get("step");

    if (stepParam) {
      // Came back from Base44 login — must be authenticated now
      base44.auth.me().then((u) => {
        if (u?.onboarded) {
          window.location.href = "/";
          return;
        }
        if (u?.display_name) setFullName(u.display_name);
        else if (u?.full_name) setFullName(u.full_name);
        if (u?.date_of_birth) setDateOfBirth(u.date_of_birth);
        setCurrentStep(parseInt(stepParam));
      }).catch(() => {
        // Auth failed — back to welcome
        setCurrentStep(0);
      });
    } else {
      // No step param — check if already authenticated
      base44.auth.isAuthenticated().then((authed) => {
        if (authed) {
          base44.auth.me().then((u) => {
            if (u?.onboarded) {
              window.location.href = "/";
              return;
            }
            if (u?.display_name) setFullName(u.display_name);
            else if (u?.full_name) setFullName(u.full_name);
            if (u?.date_of_birth) setDateOfBirth(u.date_of_birth);
            setCurrentStep(1);
          });
        } else {
          setCurrentStep(0); // Show welcome
        }
      });
    }
  }, []);

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleNext = () => setCurrentStep((s) => s + 1);

  const handleComplete = async () => {
    setSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      const profileUpdate = { onboarded: true, notification_time: reminderTime, unit_system: unitSystem };
      if (fullName) profileUpdate.display_name = fullName;
      if (dateOfBirth) profileUpdate.date_of_birth = dateOfBirth;
      await base44.auth.updateMe(profileUpdate);

      const u = await base44.auth.me();
      const existingCycles = await base44.entities.Cycle.filter({ created_by: u.email }, "-start_date", 1);
      if (existingCycles.length === 0) {
        await base44.entities.Cycle.create({ cycle_type: selectedMode, cycle_length: 28, start_date: today });
      } else {
        await base44.entities.Cycle.update(existingCycles[0].id, { cycle_type: selectedMode });
      }

      toast.success("Welcome to CycleMind! 💜");
      window.location.href = "/";
    } catch (e) {
      console.error("Failed to complete onboarding:", e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Steps 1–3 happen post-login; progress bar only shows for those
  const totalSteps = 3;
  const progress = currentStep > 0 ? (currentStep / totalSteps) * 100 : 0;

  if (currentStep === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar — only visible post-login */}
      {currentStep > 0 && (
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Back button — only for steps 2+ */}
      {currentStep >= 2 && (
        <div className="px-4 pt-3">
          <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 pb-8 flex flex-col max-w-lg mx-auto w-full">

          {/* Step 0: Welcome */}
          {currentStep === 0 && <WelcomeStep />}

          {/* Step 1: Mode selection (post-login) */}
          {currentStep === 1 && (
            <OnboardingStep1
              selectedMode={selectedMode}
              onSelect={setSelectedMode}
              onNext={handleNext}
            />
          )}

          {/* Step 2: Personal Info */}
          {currentStep === 2 && (
            <PersonalInfoStep
              fullName={fullName}
              setFullName={setFullName}
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
            />
          )}

          {/* Step 3: Preferences + Finish */}
          {currentStep === 3 && (
            <div className="flex flex-col items-center justify-center flex-1 space-y-6 text-center max-w-md mx-auto">
              <OnboardingStep3
                reminderTime={reminderTime}
                setReminderTime={setReminderTime}
                unitSystem={unitSystem}
                setUnitSystem={setUnitSystem}
                onNext={() => {}}
              />
              <div className="w-full pt-4 border-t border-border/40">
                <Button
                  onClick={handleComplete}
                  disabled={saving}
                  className="w-full h-12 rounded-2xl font-semibold text-base gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Get Started
                </Button>
              </div>
            </div>
          )}

          {/* Continue button for steps 1 & 2 */}
          {currentStep >= 1 && currentStep < 3 && (
            <div className="mt-8 pt-4 border-t border-border/40">
              <Button onClick={handleNext} className="w-full h-12 rounded-2xl font-semibold text-base">
                Continue
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}