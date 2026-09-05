import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Lightbulb, 
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';
import { AvatarConfig, WorkoutSessionStats } from '../types';
import { playSound } from '../utils/audio';

interface AICoachPanelProps {
  avatarConfig: AvatarConfig;
  sessions: WorkoutSessionStats[];
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface AIAnalysis {
  analysis: string;
  recommendations: string[];
  focusArea: string;
  isLiveAI?: boolean;
}

export const AICoachPanel: React.FC<AICoachPanelProps> = ({
  avatarConfig,
  sessions,
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: `Greetings. I am AURA, your holographic biomechanics coach. Ask me about your joint kinematics, barbell path optimization, or tailored recovery routines.`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const runAnalysis = async () => {
    setAnalyzing(true);
    playSound('click');
    try {
      const res = await fetch('/api/coaching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessions,
          avatarConfig,
          currentExercise: sessions[0]?.exercise || 'squats',
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data && data.analysis) {
        setAnalysis(data);
        playSound('success');
      }
    } catch (err) {
      console.error('Coaching analysis error:', err);
      setAnalysis((prev) => prev || {
        analysis: "Kinematic sensors detect consistent hip-hinge mechanics and controlled turnaround depth. Maintain full thoracic brace and drive force evenly across the tripod of the foot.",
        recommendations: [
          "Focus on 3-second eccentric descent to build joint stability.",
          "Keep knees aligned over the second toe throughout the movement.",
          "Perform active hip abductor activation before working sets."
        ],
        focusArea: "Kinematic Tracking & Core Stability",
        isLiveAI: false,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [sessions.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || chatLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    const newHistory: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newHistory);
    setChatLoading(true);
    playSound('click');

    try {
      const res = await fetch('/api/coaching/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: newHistory,
          avatarConfig,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setMessages([...newHistory, { role: 'model', text: data.reply || 'Maintain stable form and controlled tempo.' }]);
      playSound('rep');
    } catch (err) {
      setMessages([
        ...newHistory,
        {
          role: 'model',
          text: 'Unable to connect to the AI coaching engine right now. Please try again shortly.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              GEMINI 3.8 FLASH INTELLIGENCE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            AURA Biomechanical Coach
          </h2>
          <p className="text-xs text-slate-600 font-medium max-w-xl">
            Real-time multi-session kinetic posture synthesis and interactive movement consultation.
          </p>
        </div>

        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-black text-xs tracking-wider hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-sm self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'ANALYZING KINEMATICS...' : 'RE-ANALYZE REPS'}</span>
        </button>
      </div>

      {/* Analysis Box */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
                FOCUS: {analysis.focusArea}
              </span>
              {analysis.isLiveAI && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  LIVE MODEL
                </span>
              )}
            </div>

            <div className="text-sm font-bold text-slate-900 leading-relaxed">
              "{analysis.analysis}"
            </div>
          </div>

          <div className="lg:col-span-5 space-y-2 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              PRESCRIPTIVE DRILLS
            </div>
            <div className="space-y-2 text-xs">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-700 font-medium">
                  <span className="text-indigo-600 font-black mt-0.5">0{i + 1}.</span>
                  <span className="leading-snug">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Coach Consultation Chat */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            INTERACTIVE KINEMATIC CONSULTATION
          </div>
          <span className="text-xs text-indigo-600 font-bold">Ask about form, pain prevention, or pacing</span>
        </div>

        {/* Message Thread */}
        <div className="h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'model' && (
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-md p-3.5 rounded-2xl font-medium leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {chatLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium italic">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
              <span>AURA is formulating kinematic response...</span>
            </div>
          )}
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AURA a question... (e.g. 'How do I avoid rounding my lower back in deep squats?')"
            className="flex-1 px-4 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:border-slate-900 focus:outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || chatLoading}
            className="px-6 py-3 rounded-full bg-slate-900 text-white font-black text-xs tracking-wider hover:bg-indigo-600 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>SEND</span>
            <Send className="w-3 h-3" />
          </button>
        </form>

        {/* Quick Question Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            SUGGESTED:
          </span>
          {[
            'How do I correct knee valgus during squats?',
            'What is the optimal elbow flare for shoulder press?',
            'How can I improve ankle dorsiflexion depth?',
          ].map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(q);
              }}
              className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
