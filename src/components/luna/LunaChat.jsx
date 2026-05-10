import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Loader2, Moon } from 'lucide-react';
import { toast } from 'sonner';

export default function LunaChat({ cycleMode, cycleDay, eddInfo, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialGreeting, setInitialGreeting] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send initial greeting
  useEffect(() => {
    const sendGreeting = async () => {
      try {
        setLoading(true);
        const response = await base44.functions.invoke('lunaChat', {
          messages: [{ role: 'user', content: 'Hello Luna, I just opened the chat.' }],
          cycleMode,
          cycleDay,
          eddInfo
        });
        setMessages([{
          role: 'assistant',
          content: response.data.message || "Hi, I'm Luna 🌙 — your CycleMind companion.\nHow are you feeling today, or is there something on your mind you'd like to share?\nRemember, I'm not a doctor — this is not a substitute for professional medical advice. Please consult your doctor or psychiatrist."
        }]);
        setInitialGreeting(false);
      } catch (err) {
        console.error(err);
        setMessages([{
          role: 'assistant',
          content: "Hi! I'm Luna. I'm having a moment connecting to my systems, but I'm here to listen and support you. What's on your mind?"
        }]);
        setInitialGreeting(false);
      } finally {
        setLoading(false);
      }
    };

    sendGreeting();
  }, [cycleMode, cycleDay, eddInfo]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await base44.functions.invoke('lunaChat', {
        messages: [...messages, { role: 'user', content: userMessage }],
        cycleMode,
        cycleDay,
        eddInfo
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.message
      }]);
    } catch (err) {
      console.error(err);
      toast.error('Luna is taking a moment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md h-[600px] rounded-3xl bg-gradient-to-b from-purple-50 via-white to-pink-50 dark:from-purple-950 dark:via-slate-900 dark:to-pink-950 shadow-2xl flex flex-col border border-purple-200 dark:border-purple-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-purple-200 dark:border-purple-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground">Luna</h3>
              <p className="text-xs text-muted-foreground">Your AI companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-foreground border border-purple-200 dark:border-purple-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900 rounded-2xl rounded-bl-none px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer */}
        <div className="px-5 py-2 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-900">
          <p className="text-[10px] text-amber-900 dark:text-amber-100 leading-tight">
            ⚠️ Not a substitute for professional medical advice. Always consult your doctor.
          </p>
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-purple-200 dark:border-purple-900 flex gap-2">
          <Input
            placeholder="Share what's on your mind..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
            className="text-base h-10"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-10 w-10 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}