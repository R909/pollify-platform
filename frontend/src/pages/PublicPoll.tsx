import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { pollsApi } from '../api';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, Send, MessageCircleCheck } from 'lucide-react';

interface Option {
  id: string;
  text: string;
  order_index: number;
}

interface Question {
  id: string;
  text: string;
  is_mandatory: boolean;
  options: Option[];
}

const THEME = {
  bg: '#c49456',
  card: 'rgba(255,250,245,0.86)',
  border: '#ead8c0',
  primary: '#2e1706',
  secondary: '#7a5c3e',
  accent: '#d89a57',
  success: '#4e9a6a',
  danger: '#d04d37',
  shadow: '0 20px 60px rgba(60,25,5,0.12)',
};

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[30px] border p-6 backdrop-blur-2xl ${className}`}
      style={{ background: THEME.card, borderColor: THEME.border, boxShadow: THEME.shadow }}
    >
      {children}
    </div>
  );
}

export default function PublicPoll() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await pollsApi.getByToken(token!);
        setData(res.data);
      } catch (err: any) {
        setData({ error: err.response?.data?.error || 'Poll not found' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleSubmit = async () => {
    if (!data?.questions) return;

    for (const q of data.questions as Question[]) {
      if (q.is_mandatory && !answers[q.id]) {
        toast.error(`Please answer: "${q.text}"`);
        return;
      }
    }

    const payload = {
      answers: Object.entries(answers).map(([question_id, option_id]) => ({ question_id, option_id })),
    };

    setSubmitting(true);
    try {
      await pollsApi.submitResponse(token!, payload);
      setSubmitted(true);
      toast.success('Response submitted!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: THEME.bg }}>
        <div className="w-14 h-14 border-4 border-white/30 border-t-[#2e1706] rounded-full animate-spin" />
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: THEME.bg }}>
        <GlassCard className="text-center max-w-md w-full py-12">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-3xl font-black mb-2" style={{ color: THEME.primary }}>Poll Not Found</h2>
          <p style={{ color: THEME.secondary }}>{data.error}</p>
        </GlassCard>
      </div>
    );
  }

  const { poll, mode, questions, analytics } = data;

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden" style={{ background: THEME.bg }}>
      <div className="absolute -top-32 -left-20 w-[520px] h-[520px] bg-[#e9b870] rounded-full blur-[90px] opacity-30" />
      <div className="absolute bottom-[-100px] right-[280px] w-[380px] h-[380px] bg-[#8b4010] rounded-full blur-[100px] opacity-20" />
      <div className="absolute top-[40%] left-[46%] w-[280px] h-[280px] bg-[#d4894a] rounded-full blur-[80px] opacity-20" />

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2e1706] flex items-center justify-center shadow-xl">
              <MessageCircleCheck className="text-white w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black text-white leading-none">Pollify</h1>
              <p className="text-white/70 text-xs tracking-wide">Live polls & insights</p>
            </div>
          </div>
        </div>

        {mode === 'closed' && (
          <GlassCard className="text-center py-12">
            <Clock size={48} className="mx-auto mb-3" style={{ color: THEME.secondary }} />
            <h2 className="text-3xl font-black" style={{ color: THEME.primary }}>Poll Closed</h2>
            <p className="mt-2" style={{ color: THEME.secondary }}>This poll is no longer accepting responses.</p>
          </GlassCard>
        )}

        {mode === 'results' && analytics && (
          <div className="space-y-4">
            <GlassCard>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-black" style={{ color: THEME.primary }}>{poll.title}</h1>
                  {poll.description && <p className="mt-1" style={{ color: THEME.secondary }}>{poll.description}</p>}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#dce9fb', color: '#2f5f9f' }}>Results</span>
              </div>

              <div className="mt-5 rounded-2xl p-4 text-center" style={{ background: '#fffaf3', border: `1px solid ${THEME.border}` }}>
                <div className="text-4xl font-black" style={{ color: THEME.primary }}>{analytics.total_responses}</div>
                <div className="text-sm" style={{ color: THEME.secondary }}>Total Responses</div>
              </div>
            </GlassCard>

            {analytics.questions.map((q: any, qi: number) => (
              <GlassCard key={q.id}>
                <h3 className="text-lg font-bold mb-4" style={{ color: THEME.primary }}>
                  <span style={{ color: THEME.accent }}>Q{qi + 1}. </span>{q.text}
                </h3>

                <div className="space-y-3">
                  {q.options.map((o: any) => (
                    <div key={o.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: THEME.primary }}>{o.text}</span>
                        <span style={{ color: THEME.secondary }}>{o.count} vote{o.count !== 1 ? 's' : ''} · {o.percentage}%</span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#f0dfc7' }}>
                        <div className="h-full rounded-full" style={{ width: `${o.percentage}%`, background: THEME.accent }} />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {mode === 'respond' && !submitted && (
          <div className="space-y-4">
            <GlassCard>
              <h1 className="text-3xl font-black" style={{ color: THEME.primary }}>{poll.title}</h1>
              {poll.description && <p className="mt-1" style={{ color: THEME.secondary }}>{poll.description}</p>}

              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
                <span className="px-3 py-1 rounded-full font-semibold" style={{ background: '#dcefdc', color: '#2f7a4e' }}>Active</span>
                {poll.is_anonymous && <span className="px-3 py-1 rounded-full font-semibold" style={{ background: '#f2e4d1', color: '#8b5a2b' }}>Anonymous</span>}
                {poll.expires_at && <span style={{ color: THEME.secondary }}>Expires {new Date(poll.expires_at).toLocaleDateString()}</span>}
              </div>
            </GlassCard>

            {(questions as Question[]).map((q, qi) => (
              <GlassCard key={q.id}>
                <div className="mb-4">
                  <span className="text-lg font-bold" style={{ color: THEME.primary }}>
                    <span style={{ color: THEME.accent }}>Q{qi + 1}. </span>{q.text}
                  </span>
                  {q.is_mandatory && <span style={{ color: THEME.danger, marginLeft: 6 }}>*</span>}
                </div>

                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all"
                        style={{
                          background: selected ? '#f7e8d0' : '#fffaf3',
                          border: `2px solid ${selected ? THEME.accent : '#e8d5b8'}`,
                        }}
                        onClick={() => setAnswers({ ...answers, [q.id]: opt.id })}
                      >
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{
                            border: `2px solid ${selected ? THEME.accent : '#c9aa86'}`,
                            background: selected ? THEME.accent : 'transparent',
                          }}
                        />
                        <span style={{ color: THEME.primary }}>{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            ))}

            <button
              className="w-full h-14 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-xl disabled:opacity-70"
              style={{ background: '#2e1706' }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : <><Send size={16} /> Submit Response</>}
            </button>
          </div>
        )}

        {mode === 'respond' && submitted && (
          <GlassCard className="text-center py-16">
            <CheckCircle size={56} className="mx-auto mb-3" style={{ color: THEME.success }} />
            <h2 className="text-4xl font-black" style={{ color: THEME.primary }}>Thank You!</h2>
            <p className="mt-2" style={{ color: THEME.secondary }}>Your response has been recorded.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
