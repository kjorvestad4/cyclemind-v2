import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState("menstrual");
  const [lmp, setLmp] = useState("");
  const [ovulationDate, setOvulationDate] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [hrtType, setHrtType] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [fullName, setFullName] = useState("");
  const [reminderTime, setReminderTime] = useState("19:00");
  const [unitSystem, setUnitSystem] = useState("imperial");
  const [saving, setSaving] = useState(false);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (currentStep === 1) {
      base44.auth.logout();
    }
  };

  const handleComplete = async (destination = "dashboard") => {
    setSaving(true);
    const targetUrl = destination === "log" ? "/log" : "/dashboard";
    const today = format(new Date(), "yyyy-MM-dd");

    try {
      // 1. Create Cycle entity with all entered data
      const cyclePayload = {
        cycle_type: selectedMode,
        start_date: lmp || birthDate || today,
        last_menstrual_period: lmp || null,
        cycle_length: cycleLength || 28,
      };
      if (selectedMode === "pregnancy" && ovulationDate) cyclePayload.ovulation_date = ovulationDate;
      if (selectedMode === "perimenopause" || selectedMode === "menopause") cyclePayload.hrt_type = hrtType || null;
      if (selectedMode === "postpartum") cyclePayload.start_date = birthDate || today;

      const cycle = await base44.entities.Cycle.create(cyclePayload);

      // 2. Save User profile: name, DOB, and onboarding state
      await base44.auth.updateMe({
        display_name: fullName || null,
        date_of_birth: dateOfBirth || null,
        onboarded: true,
        active_cycle_id: cycle.id,
        notification_time: reminderTime,
        unit_system: unitSystem,
      });

      toast.success("Onboarding data saved successfully — welcome to CycleMind");
    } catch (e) {
      console.error("handleComplete error:", e);
      toast.error("Something went wrong, but we'll take you to the app.");
      setSaving(false);
      return;
    }

    // Hard navigate to ensure fresh auth state
    window.location.href = targetUrl;
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 pb-8 flex flex-col max-w-lg mx-auto w-full">
          {currentStep === 1 && (
            <OnboardingStep1
              selectedMode={selectedMode}
              onSelect={setSelectedMode}
              onNext={handleNext}
              onSkip={() => navigate("/")}
              onSignIn={() => base44.auth.redirectToLogin("/")}
            />
          )}

          {currentStep === 2 && (
            <OnboardingStep2
              selectedMode={selectedMode}
              lmp={lmp}
              setLmp={setLmp}
              ovulationDate={ovulationDate}
              setOvulationDate={setOvulationDate}
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              cycleLength={cycleLength}
              setCycleLength={setCycleLength}
              hrtType={hrtType}
              setHrtType={setHrtType}
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
              fullName={fullName}
              setFullName={setFullName}
              onNext={handleNext}
            />
          )}

          {currentStep === 3 && (
            <div className="flex flex-col items-center justify-center flex-1 space-y-6 text-center max-w-md mx-auto">
              <OnboardingStep3
                reminderTime={reminderTime}
                setReminderTime={setReminderTime}
                unitSystem={unitSystem}
                setUnitSystem={setUnitSystem}
                onNext={() => {}}
              />
              <div className="w-full pt-4 border-t border-border/40 space-y-2">
                <button
                  onClick={() => handleComplete("log")}
                  disabled={saving}
                  className="w-full h-12 rounded-2xl font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 gap-2 inline-flex items-center justify-center disabled:opacity-60"
                >
                  <Check className="w-5 h-5" />
                  {saving ? "Saving…" : "Log Today"}
                </button>
                <button
                  onClick={() => handleComplete("dashboard")}
                  disabled={saving}
                  className="w-full h-10 rounded-2xl font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  Skip to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Footer buttons inside scrollable area */}
          <div className="space-y-2 mt-8 pt-4 border-t border-border/40">
            {currentStep >= 1 && currentStep < 3 && (
               <Button
                 onClick={handleNext}
                 className="w-full h-12 rounded-2xl font-semibold text-base"
               >
                 Continue
               </Button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}