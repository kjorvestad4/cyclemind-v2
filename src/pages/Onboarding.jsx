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
import OnboardingStep4 from "@/components/onboarding/OnboardingStep4";

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
    if (currentStep < 5) {
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

  const handleComplete = async (destination = "log") => {
    // Validate required fields
    if (!lmp && !birthDate) {
      toast.error("Please enter a start date to continue");
      return;
    }

    setSaving(true);
    const targetUrl = destination === "log" ? "/log" : "/";
    const today = format(new Date(), "yyyy-MM-dd");

    try {
      // 1. Create Cycle entity (active cycle)
      const cyclePayload = {
        cycle_type: selectedMode,
        start_date: lmp || birthDate || today,
        last_menstrual_period: lmp || (selectedMode === "pregnancy" ? null : birthDate || null),
        cycle_length: cycleLength || 28,
      };
      if (selectedMode === "pregnancy") cyclePayload.estimated_ovulation_date = ovulationDate || null;
      if (selectedMode === "perimenopause" || selectedMode === "menopause") cyclePayload.hrt_type = hrtType || null;
      if (selectedMode === "postpartum") cyclePayload.start_date = birthDate || today;

      const cycle = await base44.entities.Cycle.create(cyclePayload);
      const cycleId = cycle.id;

      // 2. Save User entity with full_name and date_of_birth
      await base44.auth.updateMe({
        full_name: fullName || null,
        date_of_birth: dateOfBirth || null,
        onboarded: true,
        active_cycle_id: cycleId,
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
    
    // Hard navigate
    window.location.href = targetUrl;
  };

  const progress = (currentStep / 5) * 100;

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
            <OnboardingStep3
              reminderTime={reminderTime}
              setReminderTime={setReminderTime}
              unitSystem={unitSystem}
              setUnitSystem={setUnitSystem}
              onNext={handleNext}
            />
          )}

          {currentStep === 4 && (
            <OnboardingStep4
              onLogToday={() => handleComplete("log")}
              onSkipToDashboard={() => handleComplete("dashboard")}
              saving={saving}
            />
          )}

          {/* Footer buttons inside scrollable area */}
          <div className="space-y-2 mt-8 pt-4 border-t border-border/40">
            {currentStep >= 1 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="w-full gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {currentStep === 1 ? "Sign Out" : "Back"}
              </Button>
            )}
            {currentStep >= 1 && currentStep < 5 && (
               <Button
                 onClick={handleNext}
                 className="w-full h-12 rounded-2xl font-semibold text-base"
               >
                 Continue
               </Button>
             )}
            {currentStep === 5 && (
              <>
                <Button
                  onClick={() => handleComplete("dashboard")}
                  disabled={saving}
                  className="w-full h-12 rounded-2xl font-semibold text-base gap-2"
                >
                  {saving ? "Setting up..." : <>
                    <Check className="w-5 h-5" />
                    Get Started
                  </>}
                </Button>

              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}