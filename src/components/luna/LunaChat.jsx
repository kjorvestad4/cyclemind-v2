import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Loader2, Moon, AlertCircle, ExternalLink, Plus, CheckCircle2, Mic, MicOff, FileDown, Bell, Eye, EyeOff, HelpCircle } from 'lucide-react';
// Loader2 kept for NotificationsPanel
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Actions that should navigate to the log page instead of sending a chat message
const LOG_ACTIONS = ['track today\'s symptoms', 'log symptoms', 'track symptoms', 'go to log', 'log my mood today', 'log today', 'log my symptoms', 'log symptoms today', 'track my symptoms today'];
// Actions that should navigate to the journal section of the log page
const JOURNAL_ACTIONS = ['journal your feelings', 'journal', 'write in your journal', 'log your feelings', 'start a journaling session', 'start journaling', 'journaling session', 'open journal'];

const SESSION_KEY = 'luna_chat_session';
const SESSION_TTL_MS = 7 * 60 * 1000; // 7 minutes

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { messages, savedIndexes, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return { messages, savedIndexes: new Set(savedIndexes) };
  } catch {
    return null;
  }
}

function saveSession(messages, savedIndexes) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      messages,
      savedIndexes: [...savedIndexes],
      timestamp: Date.now()
    }));
  } catch {}
}

export default function LunaChat({ cycleMode, cycleDay, eddInfo, fertilityMode, menopauseStage, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'notifications'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedSymptomIndexes, setSavedSymptomIndexes] = useState(new Set());
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const voiceTranscriptRef = useRef('');
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persist session whenever messages or savedIndexes change
  useEffect(() => {
    if (messages.length > 0) {
      saveSession(messages, savedSymptomIndexes);
    }
  }, [messages, savedSymptomIndexes]);

  // Initial greeting — fully local, zero network call
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const session = loadSession();
    if (session && session.messages.length > 0) {
      setMessages(session.messages);
      setSavedSymptomIndexes(session.savedIndexes);
      return;
    }

    let greeting = "Hi, I'm Luna 🌙 — your CycleMind companion. How are you feeling today?";
    if (fertilityMode) greeting += " I'm here to support your fertility journey.";
    else if (menopauseStage) greeting += ` I'm here to support you through menopause (${menopauseStage}).`;
    else if (cycleDay) greeting += ` You're on cycle day ${cycleDay} — I'm here to listen.`;
    greeting += "\n\n*This is not a substitute for professional medical advice. Please consult your doctor.*";

    setMessages([{
      role: 'assistant',
      content: greeting,
      suggestedActions: ["Track today's symptoms", "Cycle phase tips", "I need support"],
      flags: { escalate: false, crisis: false }
    }]);
  }, []);

  const handleSend = useCallback(async (userMessage = input.trim()) => {
    if (!userMessage || loading) return;
    setInput('');
    setLoading(true);

    // Capture messages synchronously before state update
    const currentMessages = messages;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Collect all symptoms already saved so Luna won't re-detect them
    const alreadySavedSymptoms = currentMessages
      .filter((m, i) => m.detectedSymptoms?.length > 0 && savedSymptomIndexes.has(i))
      .flatMap(m => m.detectedSymptoms);

    try {
      const response = await base44.functions.invoke('lunaChat', {
        messages: [...currentMessages, { role: 'user', content: userMessage }],
        cycleMode,
        cycleDay,
        eddInfo,
        fertilityMode,
        menopauseStage,
        alreadySavedSymptoms,
      });

      const botReply = response.data;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: botReply.message,
        suggestedActions: botReply.suggestedActions || [],
        flags: botReply.flags || { escalate: false, crisis: false },
        detectedSymptoms: botReply.detectedSymptoms || [],
        codedSymptoms: botReply.codedSymptoms || {}
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => !(m.content === userMessage && m.role === 'user')));
      toast.error("Luna is taking a brief moment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, cycleMode, cycleDay, eddInfo, fertilityMode, menopauseStage, savedSymptomIndexes]);

  const handleSuggestedAction = (action) => {
    const lc = action.toLowerCase();
    if (LOG_ACTIONS.includes(lc)) {
      onClose();
      navigate('/log');
      return;
    }
    if (JOURNAL_ACTIONS.some(j => lc.includes(j))) {
      onClose();
      window.location.href = '/log#journal';
      return;
    }
    if (lc === 'generate clinical report' || lc === 'generate doctor report') {
      handleGenerateReport();
      return;
    }
    handleSend(action);
  };

  const saveSymptoms = async (symptoms, msgIdx) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const existing = await base44.entities.DailyEntry.filter({ date: today });
      const entry = existing[0];
      const newSymptoms = symptoms.map(s => typeof s === 'string' ? { name: s, severity: 3 } : s);
      if (entry) {
        const merged = [...(entry.custom_symptoms || [])];
        newSymptoms.forEach(s => {
          if (!merged.find(e => e.name.toLowerCase() === s.name.toLowerCase())) merged.push(s);
        });
        await base44.entities.DailyEntry.update(entry.id, { custom_symptoms: merged });
      } else {
        await base44.entities.DailyEntry.create({ date: today, custom_symptoms: newSymptoms });
      }
      setSavedSymptomIndexes(prev => new Set([...prev, msgIdx]));
      toast.success(`${newSymptoms.length} symptom(s) saved to today's log!`);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save symptoms. Please try again.");
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await base44.functions.invoke('generateClinicalReport', { days: 90 });
      
      // Create blob and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CycleMind_Clinical_Summary_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Clinical report downloaded! Check your downloads.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report');
    }
  };

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice recording not supported in this browser. Use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setVoiceTranscript('');
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interimTranscript += event.results[i][0].transcript;
      }
      setVoiceTranscript(interimTranscript);
      voiceTranscriptRef.current = interimTranscript;
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Voice recording error: ' + event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Automatically process the transcript after a brief delay
      setTimeout(() => {
        const transcript = voiceTranscriptRef.current.trim();
        if (transcript) {
          handleSend(transcript);
          setVoiceTranscript('');
          voiceTranscriptRef.current = '';
        }
      }, 500);
    }
  };

  const handleITSupport = async () => {
    try {
      const user = await base44.auth.me();
      const last5Entries = messages.slice(-5).map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n');
      const userAgent = navigator.userAgent;
      const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

      const emailBody = `
  Hi CycleMind Support Team,

  I'm experiencing an issue with the app and would like assistance.

  === USER INFO ===
  User ID: ${user?.id || 'unknown'}
  Timestamp: ${timestamp}
  Device: ${userAgent}

  === RECENT MESSAGES ===
  ${last5Entries || 'No messages yet'}

  === ISSUE DESCRIPTION ===
  (Please describe your issue above)

  Thank you for your help!
      `.trim();

      // Open email client
      const mailtoLink = `mailto:support@cyclemindapp.com?subject=CycleMind%20Support%20Request&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;

      toast.success('Opening your email client...');
    } catch (err) {
      console.error(err);
      toast.error('Could not open email client. Please email support@cyclemindapp.com directly.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md h-[640px] rounded-3xl bg-gradient-to-b from-slate-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950 shadow-2xl flex flex-col border border-teal-300 dark:border-teal-900 overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur" style={{ paddingTop: `calc(1rem + env(safe-area-inset-top))` }}>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-700 to-blue-800 flex items-center justify-center shadow">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-teal-900 dark:text-teal-100">Luna</h3>
              <p className="text-xs text-muted-foreground">Your compassionate cycle companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                activeTab === 'chat'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Notifications
            </button>
            <button onClick={onClose} aria-label="Close chat">
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chat' && (
            <div className="p-5 space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-3xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-bl-none'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}

                {/* Suggested Actions */}
                {msg.role === 'assistant' && msg.suggestedActions?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {msg.suggestedActions.map((action, i) => {
                      const isLogAction = LOG_ACTIONS.includes(action.toLowerCase());
                      const isReportAction = action.toLowerCase() === 'generate clinical report';
                      return (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className={`text-xs rounded-2xl ${
                            isReportAction 
                              ? 'border-teal-400 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300'
                              : isLogAction 
                                ? 'border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100' 
                                : 'border-teal-200 hover:bg-teal-50 dark:border-teal-800 dark:hover:bg-teal-950/30'
                          }`}
                          onClick={() => handleSuggestedAction(action)}
                        >
                          {isReportAction && <FileDown className="w-3 h-3 mr-1" />}
                          {isLogAction && <ExternalLink className="w-3 h-3 mr-1" />}
                          {action}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {/* Detected Symptoms — offer to save */}
                {msg.role === 'assistant' && msg.detectedSymptoms?.length > 0 && (
                  <div className="mt-3 p-3 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-2xl">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">Symptoms I noticed you mentioned:</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {msg.detectedSymptoms.map((s, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                          {typeof s === 'string' ? s : s.name}
                        </span>
                      ))}
                    </div>
                    {savedSymptomIndexes.has(idx) ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Saved to today's log!
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="text-xs rounded-2xl h-7 gap-1 bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => saveSymptoms(msg.detectedSymptoms, idx)}
                      >
                        <Plus className="w-3 h-3" /> Save to today's log
                      </Button>
                    )}
                  </div>
                )}

                {/* Crisis Banner */}
                {msg.role === 'assistant' && msg.flags?.crisis && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-px shrink-0" />
                    <div>
                      I'm really concerned about how you're feeling. Please reach out right now to the <strong>988 Suicide &amp; Crisis Lifeline</strong> (call or text 988) or your doctor/ER.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-teal-100 dark:border-teal-900 rounded-3xl rounded-bl-none px-5 py-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationsPanel onClose={onClose} />
          )}
        </div>

        {/* Disclaimer */}
        <div className="px-5 py-3 text-[10px] bg-amber-50 dark:bg-amber-950/50 border-t border-amber-200 text-amber-800 dark:text-amber-200">
          ⚠️ Luna is not a doctor. This is supportive conversation only. Always consult your healthcare provider.
        </div>

        {/* Voice Recording Overlay */}
        {isListening && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500 animate-pulse flex items-center justify-center mx-auto">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-semibold">Listening...</p>
              <p className="text-white/80 text-sm max-w-[200px]">{voiceTranscript || 'Speak your symptoms...'}</p>
              <Button onClick={stopVoiceRecording} variant="destructive" size="sm">
                <MicOff className="w-4 h-4 mr-2" /> Stop Recording
              </Button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-5 border-t flex gap-3 bg-white/90 dark:bg-slate-900/90">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={isListening ? stopVoiceRecording : startVoiceRecording}
            className={`rounded-full ${isListening ? 'bg-red-500 text-white hover:bg-red-600' : 'border-teal-300 hover:bg-teal-50'}`}
            disabled={loading}
            title="Voice logging"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-teal-600" />}
          </Button>
          <Input
            placeholder={isListening ? 'Recording...' : 'How are you feeling today?'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            disabled={loading || isListening}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleITSupport}
            className="rounded-full border-amber-300 hover:bg-amber-50"
            title="IT Support"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </Button>
          <Button onClick={() => handleSend()} disabled={loading || !input.trim()} size="icon" className="rounded-full bg-teal-600 hover:bg-teal-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Notifications Panel Component
function NotificationsPanel({ onClose }) {
  const queryClient = useQueryClient();
  const { data: alertData, isLoading } = useQuery({
    queryKey: ["luna-alerts"],
    queryFn: async () => {
      const response = await base44.functions.invoke("generateLunaAlerts", {});
      return response.data;
    },
    staleTime: 60000,
  });
  const [showRead, setShowRead] = useState(false);

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId) => {
      await base44.entities.LunaAlert.update(alertId, { is_read: true });
    },
    onMutate: async (alertId) => {
      await queryClient.cancelQueries({ queryKey: ["luna-alerts"] });
      const previousData = queryClient.getQueryData(["luna-alerts"]);
      
      queryClient.setQueryData(["luna-alerts"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          alerts: oldData.alerts.map(a => 
            a.id === alertId ? { ...a, is_read: true } : a
          ),
          unreadCount: Math.max(0, oldData.unreadCount - 1)
        };
      });
      
      return { previousData };
    },
    onError: (err, alertId, context) => {
      queryClient.setQueryData(["luna-alerts"], context.previousData);
      toast.error("Failed to mark alert as read");
    },
    onSuccess: () => {
      toast.success("Alert marked as read");
    },
  });

  const alerts = alertData?.alerts || [];
  const filteredAlerts = showRead ? alerts : alerts.filter(a => !a.is_read);

  const alertIcons = {
    luteal_phase: AlertCircle,
    severe_symptoms: AlertCircle,
    log_reminder: Bell,
    pattern_insight: Moon,
    fertility_window: Plus,
    menopause_milestone: Moon,
    irregular_cycle: AlertCircle,
    positive_progress: CheckCircle2,
  };

  // Color by alert_type category
  const alertColors = {
    luteal_phase:        "bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-200",
    severe_symptoms:     "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200",
    log_reminder:        "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200",
    pattern_insight:     "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200",
    fertility_window:    "bg-pink-50 border-pink-200 text-pink-900 dark:bg-pink-950/30 dark:border-pink-800 dark:text-pink-200",
    menopause_milestone: "bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-200",
    irregular_cycle:     "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-200",
    positive_progress:   "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200",
  };
  const defaultAlertColor = "bg-teal-50 border-teal-200 text-teal-900 dark:bg-teal-950/30 dark:border-teal-800 dark:text-teal-200";

  return (
    <div className="flex flex-col h-full">
      {/* Header with filter toggle */}
      <div className="px-5 py-3 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-800">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {showRead ? alerts.length : alerts.filter(a => !a.is_read).length} alert{showRead ? alerts.length !== 1 ? "s" : "" : alerts.filter(a => !a.is_read).length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowRead(!showRead)}
          className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium flex items-center gap-1"
        >
          {showRead ? (
            <>
              <EyeOff className="w-3 h-3" />
              Hide Read
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              Show All
            </>
          )}
        </button>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              {showRead ? "No read alerts" : "No unread alerts"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {showRead ? "Mark alerts as read to see them here" : "Luna will notify you when she spots patterns or important updates"}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = alertIcons[alert.alert_type] || Bell;
            const colorClass = alertColors[alert.alert_type] || defaultAlertColor;
            
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${colorClass} ${!alert.is_read ? "ring-2 ring-teal-500/30" : "opacity-80"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${alert.severity === "high" ? "bg-white/50" : "bg-white/30"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{alert.title}</p>
                      {!alert.is_read && (
                        <button
                          onClick={() => markAsReadMutation.mutate(alert.id)}
                          disabled={markAsReadMutation.isPending}
                          className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium disabled:opacity-50"
                        >
                          {markAsReadMutation.isPending ? "Marking..." : "Mark as read"}
                        </button>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed opacity-90 mt-1">{alert.message}</p>
                    <p className="text-[10px] mt-2 opacity-70">
                      {format(new Date(alert.created_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}