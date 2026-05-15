import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, X, Check, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function VoiceLoggingButton({ onLogComplete, cycleType }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const navigate = useNavigate();

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice recognition is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        }
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event) => {
      toast.error(`Voice recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    window.currentRecognition = recognition;
  };

  const stopListening = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
      setIsListening(false);
    }
  };

  const processVoiceLog = async () => {
    if (!transcript.trim()) {
      toast.error("Please speak to log symptoms");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await base44.functions.invoke("voiceToSymptoms", {
        audioTranscript: transcript
      });

      if (response.data.success) {
        setExtractedData(response.data);
        setShowResult(true);
        toast.success(`Extracted ${response.data.extractedSymptoms.emotional_symptoms.length + response.data.extractedSymptoms.physical_symptoms.length} symptoms`);
        
        // Auto-save to DailyEntry if user confirms
        onLogComplete?.(response.data.mappedEntry);
      }
    } catch (error) {
      toast.error("Failed to process voice log");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToDailyLog = async () => {
    if (!extractedData) return;

    try {
      // Navigate to daily log with pre-filled data
      navigate("/log", { 
        state: { 
          prefillData: extractedData.mappedEntry,
          voiceTranscript: transcript 
        } 
      });
      setShowResult(false);
      setTranscript("");
      setExtractedData(null);
    } catch (error) {
      toast.error("Failed to save to daily log");
    }
  };

  return (
    <>
      {/* Voice Button */}
      <Button
        onClick={isListening ? stopListening : startListening}
        variant={isListening ? "destructive" : "outline"}
        size="icon"
        className={`rounded-full w-12 h-12 ${isListening ? "animate-pulse" : ""}`}
      >
        <Mic className="w-5 h-5" />
      </Button>

      {/* Listening Overlay */}
      {isListening && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-red-500 animate-pulse" />
                Listening...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4 min-h-[120px]">
                <p className="text-sm text-muted-foreground">
                  {transcript || "Start speaking to log your symptoms and mood..."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={stopListening} variant="outline" className="flex-1">
                  Stop
                </Button>
                <Button onClick={processVoiceLog} disabled={!transcript.trim()} className="flex-1">
                  Process
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Modal */}
      {showResult && extractedData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Symptoms Extracted
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-3 text-xs">
                <p className="font-semibold mb-2">Transcript:</p>
                <p className="text-muted-foreground">{transcript}</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-sm">Emotional Symptoms:</p>
                {extractedData.extractedSymptoms.emotional_symptoms.map((sym, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{sym.name}</span>
                    <Badge variant="secondary">Severity: {sym.severity}/10</Badge>
                  </div>
                ))}
                {extractedData.extractedSymptoms.emotional_symptoms.length === 0 && (
                  <p className="text-xs text-muted-foreground">None detected</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-sm">Physical Symptoms:</p>
                {extractedData.extractedSymptoms.physical_symptoms.map((sym, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{sym.name}</span>
                    <Badge variant="secondary">Severity: {sym.severity}/10</Badge>
                  </div>
                ))}
                {extractedData.extractedSymptoms.physical_symptoms.length === 0 && (
                  <p className="text-xs text-muted-foreground">None detected</p>
                )}
              </div>

              {extractedData.extractedSymptoms.journal_note && (
                <div className="bg-primary/5 rounded-lg p-3 text-xs">
                  <p className="font-semibold mb-1">Journal Note:</p>
                  <p className="text-muted-foreground">{extractedData.extractedSymptoms.journal_note}</p>
                </div>
              )}

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700">
                  This is AI-generated pattern recognition and not a substitute for professional medical advice.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setShowResult(false)} variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={saveToDailyLog} className="flex-1">
                  Save to Daily Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}