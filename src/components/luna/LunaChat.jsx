import { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Loader2, Moon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function LunaChat({ cycleMode, cycleDay, eddInfo, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
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
  }, [cycleMode, cycleDay, eddInfo]);

  const handleSend = useCallback(async (userMessage = input.trim()) => {
    if (!userMessage || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await base44.functions.invoke('lunaChat', {
        messages: [...messages, { role: 'user', content: userMessage }],
        cycleMode,
        cycleDay,
        eddInfo,
      });

      const botReply = response.data;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: botReply.message,
        suggestedActions: botReply.suggestedActions || [],
        flags: botReply.flags || { escalate: false, crisis: false }
      }]);
    } catch (err) {
      console.error(err);
      toast.error("Luna is taking a brief moment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, cycleMode, cycleDay, eddInfo]);

  const handleSuggestedAction = (action) => {
    handleSend(action);
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
                    {msg.suggestedActions.map((action, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs rounded-2xl border-purple-200 hover:bg-purple-50"
                        onClick={() => handleSuggestedAction(action)}
                      >
                        {action}
                      </Button>
                    ))}
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