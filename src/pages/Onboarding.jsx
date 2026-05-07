import { useState, useMemo } from "react";
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
  const [selectedMode, setSelectedMode] = useState("pregnancy");
  const [lmp, setLmp] = useState("");
  const [ovulationDate, setOvulationDate] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [hrtType, setHrtType] = useState("");
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
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      // Build cycle payload based on selected mode
      const today = format(new Date(), "yyyy-MM-dd");
      const cyclePayload = {
        cycle_type: selectedMode,
        start_date: lmp || birthDate || today,
        last_menstrual_period: lmp || null,
        cycle_length: cycleLength || 28,
      };

      if (selectedMode === "pregnancy") {
        cyclePayload.ovulation_date = ovulationDate || null;
      }
      if (selectedMode === "perimenopause" || selectedMode === "menopause") {
        cyclePayload.hrt_type = hrtType || null;
      }
      if (selectedMode === "postpartum") {
        cyclePayload.start_date = birthDate || today;
      }

      // Create the cycle
      await base44.entities.Cycle.create(cyclePayload);

      // Update user profile
      await base44.auth.updateMe({
        has_completed_onboarding: true,
        notification_time: reminderTime,
        unit_system: unitSystem,
      });

      toast.success("Welcome to CycleMind!");
      navigate("/log");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Setup failed — please try again");
    } finally {
      setSaving(false);
    }
  };

  const progress = (currentStep / 4) * 100;

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
        <div className="flex-1 overflow-y-auto p-5 flex flex-col">
          {currentStep === 1 && (
            <OnboardingStep1
              selectedMode={selectedMode}
              onSelect={setSelectedMode}
              onNext={handleNext}
              onSkip={() => navigate("/")}
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
              selectedMode={selectedMode}
              onComplete={handleComplete}
              onSkip={() => navigate("/")}
              saving={saving}
            />
          )}
        </div>

        {/* Footer buttons */}
        <div className="border-t border-border/40 p-5 space-y-2 bg-card">
          {currentStep > 1 && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="w-full gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          {currentStep < 4 && (
            <Button
              onClick={handleNext}
              className="w-full h-12 rounded-2xl font-semibold text-base"
            >
              Continue
            </Button>
          )}
          {currentStep === 4 && (
            <Button
              onClick={handleComplete}
              disabled={saving}
              className="w-full h-12 rounded-2xl font-semibold text-base gap-2"
            >
              {saving ? "Setting up..." : <>
                <Check className="w-5 h-5" />
                Get Started
              </>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}