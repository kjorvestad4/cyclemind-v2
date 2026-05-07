import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronLeft, Loader2 } from "lucide-react";
import Step1ModeSelection from "@/components/onboarding/Step1ModeSelection";
import Step2CycleSetup from "@/components/onboarding/Step2CycleSetup";
import Step3Preferences from "@/components/onboarding/Step3Preferences";
import Step4FirstLog from "@/components/onboarding/Step4FirstLog";
import { calculateEDD, getPregnancyWeek } from "@/lib/eddCalculation";
import { format } from "date-fns";

const STEPS = [
  { id: 1, title: "Mode Selection" },
  { id: 2, title: "Cycle Setup" },
  { id: 3, title: "Preferences" },
  { id: 4, title: "First Log" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState(null);
  const [formData, setFormData] = useState({
    lmp: "",
    cycle_length: 28,
    ovulation_date: "",
    birth_date: "",
    hrt_type: "",
    track_ovulation: "yes",
    notification_time: "09:00",
    unit_system: "imperial",
    consent_export: false,
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();

      // Build cycle data
      const today = format(new Date(), "yyyy-MM-dd");
      let cycleData = {
        start_date: today,
        cycle_type: selectedMode,
      };

      // Add mode-specific fields
      if (["menstrual", "perimenopause", "pregnancy", "menopause"].includes(selectedMode) && formData.lmp) {
        cycleData.last_menstrual_period = formData.lmp;
      }

      if (["menstrual", "perimenopause"].includes(selectedMode)) {
        cycleData.cycle_length = formData.cycle_length || 28;
      }

      if (selectedMode === "pregnancy" && formData.lmp) {
        const eddData = calculateEDD(formData.ovulation_date ? new Date(formData.ovulation_date) : undefined, formData.lmp);
        cycleData.estimated_due_date = eddData.edd;
        cycleData.pregnancy_week = getPregnancyWeek(formData.lmp, new Date(today));
      }

      if (selectedMode === "postpartum" && formData.birth_date) {
        cycleData.start_date = formData.birth_date;
      }

      if (["menopause", "perimenopause"].includes(selectedMode) && formData.hrt_type) {
        cycleData.hrt_type = formData.hrt_type;
      }

      // Create cycle
      await base44.entities.Cycle.create(cycleData);

      // Update user with onboarding status and preferences
      await base44.auth.updateMe({
        has_completed_onboarding: true,
        notification_time: formData.notification_time,
        unit_system: formData.unit_system,
      });
    },
    onSuccess: () => {
      toast.success("Welcome to CycleMind! 💜");
      navigate("/");
    },
    onError: () => {
      toast.error("Failed to complete onboarding. Please try again.");
    },
  });

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedMode) {
      toast.error("Please select a tracking mode");
      return;
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartLogging = () => {
    completeMutation.mutate();
    navigate(`/log?date=${format(new Date(), "yyyy-MM-dd")}`);
  };

  const handleSkipFirstLog = () => {
    completeMutation.mutate();
  };

  const isLastStep = currentStep === STEPS.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Indicator */}
        <div className="mb-8 space-y-2">
          <div className="flex gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  step.id <= currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Step {currentStep} of {STEPS.length}</span>
            <span className="text-muted-foreground font-medium">{STEPS[currentStep - 1].title}</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-card rounded-3xl border border-border shadow-xl p-8 min-h-[420px] flex flex-col">
          {currentStep === 1 && (
            <Step1ModeSelection selectedMode={selectedMode} onSelect={handleModeSelect} />
          )}

          {currentStep === 2 && selectedMode && (
            <Step2CycleSetup selectedMode={selectedMode} formData={formData} onUpdate={setFormData} />
          )}

          {currentStep === 3 && (
            <Step3Preferences formData={formData} onUpdate={setFormData} />
          )}

          {currentStep === 4 && selectedMode && (
            <Step4FirstLog
              selectedMode={selectedMode}
              onSkip={handleSkipFirstLog}
              onStart={handleStartLogging}
            />
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="mt-auto flex gap-2 pt-6 border-t border-border">
              <Button
                variant="outline"
                size="icon"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="h-12 w-12 rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleNext}
                disabled={completeMutation.isPending}
                className="flex-1 h-12 rounded-xl font-semibold text-base gap-2"
              >
                {completeMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLastStep ? "Complete" : "Next"}
              </Button>
            </div>
          )}
        </div>

        {/* Skip Onboarding Option */}
        {currentStep < 4 && (
          <button
            onClick={() => {
              completeMutation.mutate();
            }}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            disabled={completeMutation.isPending}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}