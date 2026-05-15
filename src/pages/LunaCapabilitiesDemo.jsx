import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Mic, FileText, Heart, TrendingUp, FileDown, Sparkles, Check, AlertCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import VoiceLoggingButton from "@/components/luna/VoiceLoggingButton";

export default function LunaCapabilitiesDemo() {
  const [journalText, setJournalText] = useState("");
  const [codedResult, setcodedResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [lunaMessage, setLunaMessage] = useState("");
  const [lunaResponse, setLunaResponse] = useState("");

  // Demo 1: Voice Logging
  const handleVoiceLogComplete = (mappedEntry) => {
    console.log("Voice log mapped entry:", mappedEntry);
    toast.success("Voice logging demo complete! Check console for mapped data.");
  };

  // Demo 2: Journal Auto-Coding
  const processJournal = async () => {
    if (!journalText.trim()) {
      toast.error("Please enter journal text");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await base44.functions.invoke("autoCodeJournal", {
        journalText: journalText
      });

      if (response.data.success) {
        setcodedResult(response.data);
        toast.success(`Auto-coded ${Object.keys(response.data.codedSymptoms).filter(k => response.data.codedSymptoms[k] > 0).length} symptoms`);
      }
    } catch (error) {
      toast.error("Failed to process journal");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Demo 3: Fertility Guidance
  const testFertilityGuidance = async () => {
    try {
      const response = await base44.functions.invoke("getFertilityGuidance", {});
      console.log("Fertility Guidance:", response.data);
      setTestResults(prev => ({ ...prev, fertility: response.data }));
      toast.success("Fertility guidance generated! See results below.");
      setActiveDemo("fertility");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to get fertility guidance");
    }
  };

  // Demo 4: Menopause Trajectory
  const testMenopauseTrajectory = async () => {
    try {
      const response = await base44.functions.invoke("getMenopauseTrajectory", {});
      console.log("Menopause Trajectory:", response.data);
      setTestResults(prev => ({ ...prev, menopause: response.data }));
      toast.success("Menopause trajectory generated! See results below.");
      setActiveDemo("menopause");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to get menopause trajectory");
    }
  };

  // Demo 5: Doctor Report
  const testDoctorReport = async () => {
    try {
      const response = await base44.functions.invoke("generateDoctorReport", {
        includeJournal: true,
        includeMedications: true,
        includeScreening: true
      });
      toast.success("Doctor report generated! Check your downloads folder.");
      setTestResults(prev => ({ ...prev, doctorReport: "Generated successfully" }));
    } catch (error) {
      toast.error("Failed to generate report");
    }
  };

  // Demo 6: Luna Chat Test
  const testLunaChat = async () => {
    if (!lunaMessage.trim()) {
      toast.error("Please enter a message for Luna");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await base44.functions.invoke("lunaChat", {
        message: lunaMessage
      });
      setLunaResponse(response.data.response);
      toast.success("Luna responded! See below.");
    } catch (error) {
      toast.error("Failed to chat with Luna");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold">Luna Clinical Superagent - Capability Demo</h1>
        <p className="text-muted-foreground">Test all new Luna features: voice logging, auto-coding, fertility mode, menopause trajectory, and doctor reports</p>
      </div>

      {/* Demo 1: Voice Logging */}
      <Card className="border-teal-200 bg-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-teal-600" />
            1. Voice-to-Symptom Logging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Click the microphone, speak your symptoms, and Luna will auto-extract and code them using DSM-5 PMDD criteria.
          </p>
          <div className="flex items-center gap-3">
            <VoiceLoggingButton onLogComplete={handleVoiceLogComplete} />
            <Badge variant="secondary">Try saying: "I've been feeling really anxious and overwhelmed lately, with bad bloating and breast tenderness"</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Demo 2: Journal Auto-Coding */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            2. Journal Sentiment + Auto-Coding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste or write a journal entry. Luna will extract symptoms, assign severity (1-6), and detect PMDD patterns.
          </p>
          <Textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Example: 'This week has been really tough. I'm so irritable with my partner, crying over small things. My breasts are sore and I feel bloated. Can't sleep well either.'"
            className="min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button onClick={processJournal} disabled={isProcessing || !journalText.trim()}>
              {isProcessing ? "Processing..." : "Auto-Code Journal"}
            </Button>
            <Button variant="outline" onClick={() => setJournalText("This week has been really tough. I'm so irritable with my partner, crying over small things. My breasts are sore and I feel bloated. Can't sleep well either.")}>
              Use Example
            </Button>
          </div>

          {codedResult && (
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold">Coded Symptoms:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(codedResult.codedSymptoms)
                  .filter(([_, value]) => value > 0)
                  .map(([key, value]) => (
                    <div key={key} className="text-xs bg-muted rounded p-2">
                      <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {value}/6
                    </div>
                  ))}
              </div>
              <div className="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded p-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700">
                  This is AI-generated pattern recognition and not a substitute for professional medical advice.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo 3: Fertility Guidance */}
      <Card className="border-pink-200 bg-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            3. Fertility / Conception Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Get daily conception probability, ovulation predictions, and evidence-based tips from ACOG guidelines.
          </p>
          <Button onClick={testFertilityGuidance} className="bg-pink-600 hover:bg-pink-700">
            <Heart className="w-4 h-4 mr-2" />
            Test Fertility Guidance
          </Button>
          {testResults.fertility && (
            <div className="bg-white rounded-lg p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Conception Probability</p>
                  <p className="font-semibold text-lg">{testResults.fertility.conceptionProbability}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cycle Day</p>
                  <p className="font-semibold">{testResults.fertility.currentCycleDay}</p>
                </div>
              </div>
              {testResults.fertility.fertilityWindow && (
                <div>
                  <p className="text-muted-foreground">Fertility Window</p>
                  <p className="font-medium">{new Date(testResults.fertility.fertilityWindow.start).toLocaleDateString()} - {new Date(testResults.fertility.fertilityWindow.end).toLocaleDateString()}</p>
                </div>
              )}
              {testResults.fertility.tips && testResults.fertility.tips.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2">Evidence-Based Tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {testResults.fertility.tips.slice(0, 3).map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo 4: Menopause Trajectory */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            4. Menopause Symptom Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Track symptoms against STRAW+10 stages, view progression charts, get HRT/lifestyle recommendations.
          </p>
          <Button onClick={testMenopauseTrajectory} className="bg-purple-600 hover:bg-purple-700">
            <TrendingUp className="w-4 h-4 mr-2" />
            Test Menopause Trajectory
          </Button>
          {testResults.menopause && (
            <div className="bg-white rounded-lg p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant={testResults.menopause.stage.includes("Early") ? "default" : "secondary"}>
                  {testResults.menopause.stage}
                </Badge>
                <span className="text-muted-foreground">Months since last period: {testResults.menopause.monthsSinceLastPeriod || "N/A"}</span>
              </div>
              {testResults.menopause.topSymptoms && testResults.menopause.topSymptoms.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2">Top Symptoms:</p>
                  <div className="flex flex-wrap gap-2">
                    {testResults.menopause.topSymptoms.map((symptom, i) => (
                      <Badge key={i} variant="secondary">{symptom}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {testResults.menopause.recommendations && testResults.menopause.recommendations.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2">Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {testResults.menopause.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo 5: Doctor Report */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-blue-600" />
            5. Shared-Care Doctor Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Generate HIPAA-style PDF summary (last 90 days) with cycles, symptoms, mood scores, and trends.
          </p>
          <Button onClick={testDoctorReport} className="bg-blue-600 hover:bg-blue-700">
            <FileDown className="w-4 h-4 mr-2" />
            Generate Test Report
          </Button>
        </CardContent>
      </Card>

      {/* Luna Chat Integration */}
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            6. Luna Chat - Test Live Conversation
          </CardTitle>
          <CardDescription>Test Luna's clinical superagent capabilities in real-time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Send a message to Luna and see her clinical insights with RAG-powered analysis:
          </p>
          <Textarea
            value={lunaMessage}
            onChange={(e) => setLunaMessage(e.target.value)}
            placeholder="Try: 'I've been feeling really moody and bloated this week, is this normal for my cycle phase?' or 'Can you analyze my symptoms and tell me if I might have PMDD?'"
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button onClick={testLunaChat} disabled={isProcessing || !lunaMessage.trim()}>
              {isProcessing ? "Luna is thinking..." : "Send to Luna"}
            </Button>
            <Button variant="outline" onClick={() => setLunaMessage("I've been feeling really moody and bloated this week, is this normal for my cycle phase?")}>
              Use Example
            </Button>
          </div>

          {lunaResponse && (
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="space-y-3 flex-1">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm leading-relaxed">{lunaResponse}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                    <p className="text-[10px] text-amber-700">
                      <strong>Disclaimer:</strong> This is AI-generated pattern recognition and not a substitute for professional medical advice. Please discuss with your psychiatrist.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-teal-50 border border-teal-200 rounded p-3 mt-4">
            <p className="text-xs font-semibold text-teal-800 mb-2">Luna's Capabilities:</p>
            <ul className="text-xs space-y-1 text-teal-700">
              <li>✓ Pattern analysis with DSM-5, ACOG, Endocrine Society guidelines</li>
              <li>✓ Voice-to-symptom logging & journal auto-coding</li>
              <li>✓ Fertility guidance with conception probability</li>
              <li>✓ Menopause trajectory with STRAW+10 staging</li>
              <li>✓ Doctor report generation on request</li>
              <li>✓ Proactive alerts for high-risk phases</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}