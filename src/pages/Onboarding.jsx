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
    const targetUrl = "/";
    const today = format(new Date(), "yyyy-MM-dd");

    // Persist name + DOB to localStorage as safety net
    if (fullName) localStorage.setItem("onboarding_fullName", fullName);
    else localStorage.removeItem("onboarding_fullName");
    if (dateOfBirth) localStorage.setItem("onboarding_dob", dateOfBirth);
    else localStorage.removeItem("onboarding_dob");
    localStorage.setItem("onboarding_mode", selectedMode);

    // Check if user is logged in
    const isLoggedIn = await base44.auth.isAuthenticated();

    if (isLoggedIn) {
      try {
        const currentUser = await base44.auth.me();

        // Save name + DOB + preferences
        const profileUpdate = {
          onboarded: true,
          notification_time: reminderTime,
          unit_system: unitSystem,
        };
        if (fullName) profileUpdate.display_name = fullName;
        if (dateOfBirth) profileUpdate.date_of_birth = dateOfBirth;
        await base44.auth.updateMe(profileUpdate);

        // Create a default cycle if none exists (LMP will be set on Profile page)
        const existingCycles = await base44.entities.Cycle.filter({ created_by: currentUser.email }, "-start_date", 1);
        if (existingCycles.length === 0) {
          await base44.entities.Cycle.create({
            cycle_type: selectedMode,
            cycle_length: 28,
            start_date: today,
          });
        } else {
          // Update mode on existing cycle
          await base44.entities.Cycle.update(existingCycles[0].id, { cycle_type: selectedMode });
        }

        // Clear localStorage
        ["onboarding_mode","onboarding_fullName","onboarding_dob"]
          .forEach(k => localStorage.removeItem(k));

        toast.success("Welcome to CycleMind!");
      } catch (e) {
        console.error("Failed to save onboarding data:", e);
        toast.error("Something went wrong. Please try again.");
        setSaving(false);
        return;
      }
    } else {
      // Not logged in — redirect to login; AuthContext will sync on return
      base44.auth.redirectToLogin(targetUrl);
      return;
    }

    window.location.href = targetUrl;
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
              fullName={fullName}
              setFullName={setFullName}
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
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
              <div className="w-full pt-4 border-t border-border/40">
                <button
                  onClick={() => handleComplete("dashboard")}
                  className="w-full h-12 rounded-2xl font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 gap-2 inline-flex items-center justify-center"
                >
                  <Check className="w-5 h-5" />
                  Get Started
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