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

// Step 0: Login/Signup gate
function LoginGate({ onAuthenticated }) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) {
        onAuthenticated();
      } else {
        setChecking(false);
      }
    });
  }, []);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 space-y-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-6 text-center max-w-md mx-auto w-full">
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto">
          <span className="text-3xl">🌙</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Welcome to CycleMind</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The app that supports your full hormonal journey — from PMDD to pregnancy to menopause.
        </p>
      </div>

      <div className="w-full space-y-3">
        <Button
          onClick={() => base44.auth.redirectToLogin("/start")}
          className="w-full h-12 rounded-2xl font-semibold text-base"
        >
          Create Account / Sign In
        </Button>
        <p className="text-xs text-muted-foreground">
          Free to use · Private by design · No ads
        </p>
      </div>
    </div>
  );
}

// Step 2: Personal Info (Name + DOB) — runs while logged in
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
  const [currentStep, setCurrentStep] = useState(null); // null = still checking auth
  const [selectedMode, setSelectedMode] = useState("menstrual");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [reminderTime, setReminderTime] = useState("19:00");
  const [unitSystem, setUnitSystem] = useState("imperial");
  const [saving, setSaving] = useState(false);

  // Check auth on mount before rendering anything
  useEffect(() => {
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
          setCurrentStep(1); // skip login, go straight to mode selection
        });
      } else {
        setCurrentStep(0); // show login gate
      }
    });
  }, []);

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else if (currentStep === 1) base44.auth.logout("/start");
  };

  const handleNext = () => setCurrentStep((s) => s + 1);

  const handleComplete = async () => {
    setSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // Save profile directly — user is authenticated at this point
      const profileUpdate = { onboarded: true, notification_time: reminderTime, unit_system: unitSystem };
      if (fullName) profileUpdate.display_name = fullName;
      if (dateOfBirth) profileUpdate.date_of_birth = dateOfBirth;
      await base44.auth.updateMe(profileUpdate);

      // Upsert cycle
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

  const totalSteps = 3; // steps 1–3 (after login)
  const progress = currentStep === 0 ? 0 : ((currentStep || 0) / totalSteps) * 100;

  // Still checking auth — show spinner
  if (currentStep === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Back button */}
      {currentStep >= 1 && (
        <div className="px-4 pt-3">
          <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 pb-8 flex flex-col max-w-lg mx-auto w-full">

          {/* Step 0: Login Gate */}
          {currentStep === 0 && (
            <LoginGate onAuthenticated={() => setCurrentStep(1)} />
          )}

          {/* Step 1: Choose Mode */}
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