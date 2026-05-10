import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Loader2, Moon, AlertCircle, ExternalLink, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

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

export default function LunaChat({ cycleMode, cycleDay, eddInfo, onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedSymptomIndexes, setSavedSymptomIndexes] = useState(new Set());
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persist session whenever messages or savedIndexes change
  useEffect(() => {
    if (messages.length > 0) {
      saveSession(messages, savedSymptomIndexes);
    }
  }, [messages, savedSymptomIndexes]);

  // Initial greeting — restore session or fetch greeting
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const session = loadSession();
    if (session && session.messages.length > 0) {
      setMessages(session.messages);
      setSavedSymptomIndexes(session.savedIndexes);
      return;
    }

    const sendGreeting = async () => {
      setLoading(true);
      try {
        const response = await base44.functions.invoke('lunaChat', {
          messages: [{ role: 'user', content: 'Hello Luna, I just opened the chat.' }],
          cycleMode,
          cycleDay,
          eddInfo,
        });
        setMessages([{
          role: 'assistant',
          content: response.data.message,
          suggestedActions: response.data.suggestedActions || [],
          flags: response.data.flags || { escalate: false, crisis: false }
        }]);
      } catch (err) {
        console.error(err);
        setMessages([{
          role: 'assistant',
          content: "Hi! I'm Luna 🌙 — your compassionate companion. What's on your mind today?",
          suggestedActions: [],
          flags: { escalate: false, crisis: false }
        }]);
      } finally {
        setLoading(false);
      }
    };
    sendGreeting();
  }, []);

  const handleSend = useCallback(async (userMessage = input.trim()) => {
    if (!userMessage || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Collect all symptoms already saved so Luna won't re-detect them
    const alreadySavedSymptoms = messages
      .filter((m, i) => m.detectedSymptoms?.length > 0 && savedSymptomIndexes.has(i))
      .flatMap(m => m.detectedSymptoms);

    try {
      const response = await base44.functions.invoke('lunaChat', {
        messages: [...messages, { role: 'user', content: userMessage }],
        cycleMode,
        cycleDay,
        eddInfo,
        alreadySavedSymptoms,
      });

      const botReply = response.data;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: botReply.message,
        suggestedActions: botReply.suggestedActions || [],
        flags: botReply.flags || { escalate: false, crisis: false },
        detectedSymptoms: botReply.detectedSymptoms || []
      }]);
    } catch (err) {
      console.error(err);
      toast.error("Luna is taking a brief moment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, cycleMode, cycleDay, eddInfo]);

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
    handleSend(action);
  };

  const saveSymptoms = async (symptoms, msgIdx) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const existing = await base44.entities.DailyEntry.filter({ date: today });
      const entry = existing[0];
      const newSymptoms = symptoms.map(name => ({ name, severity: 3 }));
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
      toast.success(`${symptoms.length} symptom(s) saved to today's log!`);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save symptoms. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md h-[640px] rounded-3xl bg-gradient-to-b from-purple-50 via-white to-pink-50 dark:from-purple-950 dark:via-slate-900 dark:to-pink-950 shadow-2xl flex flex-col border border-purple-200 dark:border-purple-900 overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold">Luna</h3>
              <p className="text-xs text-muted-foreground">Your compassionate cycle companion</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close chat">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-3xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900 rounded-bl-none'
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
                      return (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className={`text-xs rounded-2xl ${isLogAction ? 'border-purple-400 bg-purple-50 text-purple-700 hover:bg-purple-100' : 'border-purple-200 hover:bg-purple-50'}`}
                          onClick={() => handleSuggestedAction(action)}
                        >
                          {isLogAction && <ExternalLink className="w-3 h-3 mr-1" />}
                          {action}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {/* Detected Symptoms — offer to save */}
                {msg.role === 'assistant' && msg.detectedSymptoms?.length > 0 && (
                  <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-2xl">
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">Symptoms I noticed you mentioned:</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {msg.detectedSymptoms.map((s, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">{s}</span>
                      ))}
                    </div>
                    {savedSymptomIndexes.has(idx) ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Saved to today's log!
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="text-xs rounded-2xl h-7 gap-1 bg-purple-600 hover:bg-purple-700 text-white"
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
              <div className="bg-white dark:bg-slate-800 border rounded-3xl rounded-bl-none px-5 py-3.5">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer */}
        <div className="px-5 py-3 text-[10px] bg-amber-50 dark:bg-amber-950/50 border-t border-amber-200 text-amber-800 dark:text-amber-200">
          ⚠️ Luna is not a doctor. This is supportive conversation only. Always consult your healthcare provider.
        </div>

        {/* Input */}
        <div className="p-5 border-t flex gap-3 bg-white/90 dark:bg-slate-900/90">
          <Input
            placeholder="How are you feeling today?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            disabled={loading}
          />
          <Button onClick={() => handleSend()} disabled={loading || !input.trim()} size="icon" className="rounded-full">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}