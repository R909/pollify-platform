import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pollsApi } from '../api';
import { getSocket, joinPoll, leavePoll } from '../api/socket';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Chart: any;
  }
}

interface OptionAnalytics {
  id: string;
  text: string;
  order_index: number;
  count: number;
  percentage: number;
}

interface QuestionAnalytics {
  id: string;
  text: string;
  is_mandatory: boolean;
  order_index: number;
  options: OptionAnalytics[];
}

interface AnalyticsData {
  total_responses: number;
  questions: QuestionAnalytics[];
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  is_anonymous: boolean;
  is_closed: boolean;
  is_published: boolean;
  is_expired: boolean;
}

function useChartJs(cb: any, deps: any[], chartReady: boolean) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartReady || !ref.current || !window.Chart) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = cb(ref.current.getContext('2d'));

    return () => chartRef.current?.destroy();
  }, [chartReady, ...deps]);

  return ref;
}

const THEME = {
  bg: '#c49456',
  card: 'rgba(255,255,255,0.72)',
  border: 'rgba(255,255,255,0.65)',
  primary: '#2e1706',
  secondary: '#7a5c3e',
  accent: '#d4a855',
  success: '#4e9a6a',
  blue: '#7090d0',
  shadow: '0 20px 60px rgba(60,25,5,0.08)',
};

function StatusDot() {
  return (
    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: 'pulse-dot 2s infinite' }} />
  );
}

function MetricCard({ label, value, delta, deltaColor }: { label: string; value: string | number; delta: string; deltaColor: string }) {
  return (
    <div
      className="relative rounded-[28px] p-5 overflow-hidden"
      style={{
        background: THEME.card,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${THEME.border}`,
        boxShadow: THEME.shadow,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg,#d4a855,rgba(212,168,85,0.05))' }} />
      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: THEME.secondary }}>{label}</p>
      <h2 className="text-4xl font-black mb-2" style={{ color: THEME.primary, fontFamily: "'Lora', serif" }}>{value}</h2>
      <p className="text-xs font-medium" style={{ color: deltaColor }}>{delta}</p>
    </div>
  );
}

export default function PollifyAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const loadChart = async () => {
      if (window.Chart) {
        setChartReady(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
      script.onload = () => setChartReady(true);
      document.body.appendChild(script);
    };

    loadChart();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let pollId = id;

        if (!pollId) {
          const myRes = await pollsApi.myPolls();
          const firstPoll = myRes.data.polls?.[0];

          if (!firstPoll) {
            setPoll(null);
            setAnalytics({ total_responses: 0, questions: [] });
            return;
          }

          pollId = firstPoll.id;
          navigate(`/polls/${pollId}/analytics`, { replace: true });
          return;
        }

        const [myRes, analyticsRes] = await Promise.all([
          pollsApi.myPolls(),
          pollsApi.analytics(pollId),
        ]);

        const selectedPoll = (myRes.data.polls || []).find((p: Poll) => p.id === pollId) || null;
        setPoll(selectedPoll);
        setAnalytics(analyticsRes.data);
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;

    const socket = getSocket();
    joinPoll(id);

    const onAnalytics = (payload: AnalyticsData) => {
      setAnalytics(payload);
    };

    const onPublished = () => {
      setPoll((prev) => (prev ? { ...prev, is_published: true, is_closed: true } : prev));
    };

    socket.on('analytics_update', onAnalytics);
    socket.on('poll_published', onPublished);

    return () => {
      socket.off('analytics_update', onAnalytics);
      socket.off('poll_published', onPublished);
      leavePoll(id);
    };
  }, [id]);

  const donutData = useMemo(() => {
    const labels: string[] = [];
    const values: number[] = [];
    const colors = ['#d4a855', '#4e9a6a', '#7090d0', '#c06020', '#9b59b6', '#f39c12'];

    (analytics?.questions || []).forEach((q) => {
      q.options.forEach((o) => {
        labels.push(`${q.text}: ${o.text}`);
        values.push(o.count);
      });
    });

    return { labels, values, colors };
  }, [analytics]);

  const lineData = useMemo(() => {
    const labels = (analytics?.questions || []).map((_q, i) => `Q${i + 1}`);
    const values = (analytics?.questions || []).map((q) => q.options.reduce((sum, o) => sum + o.count, 0));
    return { labels, values };
  }, [analytics]);

  const insights = useMemo(() => {
    return (analytics?.questions || []).map((q) => {
      const top = [...q.options].sort((a, b) => b.count - a.count)[0];
      return {
        question: q.text,
        summary: top ? `${top.text} (${top.count} votes, ${top.percentage}%)` : 'No responses yet',
      };
    });
  }, [analytics]);

  const statusLabel = poll?.is_closed || poll?.is_expired ? 'Closed' : poll?.is_published ? 'Published' : 'Active';

  const donutRef = useChartJs(
    (ctx: any) =>
      new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: donutData.labels,
          datasets: [
            {
              data: donutData.values,
              backgroundColor: donutData.colors,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#5d3512',
              },
            },
          },
        },
      }),
    [donutData],
    chartReady
  );

  const lineRef = useChartJs(
    (ctx: any) =>
      new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: lineData.labels,
          datasets: [
            {
              data: lineData.values,
              borderColor: '#c68a3e',
              backgroundColor: 'rgba(198,138,62,0.12)',
              borderWidth: 3,
              pointBackgroundColor: '#c68a3e',
              pointRadius: 4,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              ticks: {
                color: '#7a5c3e',
              },
              grid: {
                color: 'rgba(0,0,0,0.03)',
              },
            },
            y: {
              ticks: {
                color: '#7a5c3e',
              },
              grid: {
                color: 'rgba(0,0,0,0.03)',
              },
              beginAtZero: true,
            },
          },
        },
      }),
    [lineData],
    chartReady
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: THEME.bg }}>
        <div className="w-14 h-14 border-4 border-[#ead9c2] border-t-[#2e1706] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity: 1 }
          50% { opacity: .4 }
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden" style={{ background: THEME.bg }}>
        <div className="absolute -top-32 -left-20 w-[520px] h-[520px] bg-[#f1d3a5] rounded-full blur-[100px] opacity-40" />
        <div className="absolute bottom-[-100px] right-[250px] w-[420px] h-[420px] bg-[#d4a855] rounded-full blur-[100px] opacity-20" />
        <div className="absolute top-[40%] left-[46%] w-[280px] h-[280px] bg-[#edd8b3] rounded-full blur-[80px] opacity-30" />

        <div className="relative z-10 px-8 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-5xl font-black mb-2" style={{ color: THEME.primary, fontFamily: "'Lora', serif" }}>
                Poll Analytics ✦
              </h1>
              <p className="text-base" style={{ color: THEME.secondary }}>{poll?.title || 'Poll Analytics'}</p>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 rounded-full" style={{ background: '#2e1706', color: 'white', boxShadow: '0 10px 30px rgba(46,23,6,0.15)' }}>
              <StatusDot />
              Live Analytics · {statusLabel}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-5 mb-6">
            <MetricCard
              label="Total Responses"
              value={analytics?.total_responses || 0}
              delta="Realtime updates"
              deltaColor={THEME.success}
            />

            <MetricCard
              label="Questions"
              value={analytics?.questions.length || 0}
              delta="Total poll questions"
              deltaColor={THEME.accent}
            />

            <MetricCard
              label="Anonymous"
              value={poll?.is_anonymous ? 'Yes' : 'No'}
              delta="Privacy mode"
              deltaColor={THEME.blue}
            />

            <MetricCard
              label="Status"
              value={statusLabel}
              delta="Current poll state"
              deltaColor={statusLabel === 'Active' ? THEME.success : THEME.accent}
            />
          </div>

          <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
            <div className="rounded-[32px] p-6" style={{ background: THEME.card, backdropFilter: 'blur(18px)', border: `1px solid ${THEME.border}`, boxShadow: THEME.shadow }}>
              <h3 className="text-2xl font-bold mb-1" style={{ color: THEME.primary, fontFamily: "'Lora', serif" }}>
                Responses By Question
              </h3>
              <p className="text-sm mb-5" style={{ color: THEME.secondary }}>Distribution of answers across poll questions</p>
              <div style={{ height: 280 }}>
                <canvas ref={lineRef} />
              </div>
            </div>

            <div className="rounded-[32px] p-6" style={{ background: THEME.card, backdropFilter: 'blur(18px)', border: `1px solid ${THEME.border}`, boxShadow: THEME.shadow }}>
              <h3 className="text-2xl font-bold mb-1" style={{ color: THEME.primary, fontFamily: "'Lora', serif" }}>
                Answer Distribution
              </h3>
              <p className="text-sm mb-5" style={{ color: THEME.secondary }}>Live voting insights</p>
              <div style={{ height: 280 }}>
                <canvas ref={donutRef} />
              </div>
            </div>
          </div>

          <div className="rounded-[32px] p-6" style={{ background: THEME.card, backdropFilter: 'blur(18px)', border: `1px solid ${THEME.border}`, boxShadow: THEME.shadow }}>
            <div className="mb-6">
              <h3 className="text-2xl font-bold" style={{ color: THEME.primary, fontFamily: "'Lora', serif" }}>
                Question Insights
              </h3>
              <p className="text-sm mt-1" style={{ color: THEME.secondary }}>
                Top selections and option-level vote share
              </p>
            </div>

            <div className="space-y-4">
              {insights.map((r, i) => (
                <div key={i} className="p-5 rounded-[24px]" style={{ background: '#fffaf5', border: '1px solid rgba(212,168,85,0.12)' }}>
                  <h4 className="font-bold text-base" style={{ color: THEME.primary }}>{r.question}</h4>
                  <p className="text-sm mt-1" style={{ color: THEME.secondary }}>{r.summary}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-6 text-sm" style={{ color: THEME.success }}>
              <StatusDot />
              Auto refresh enabled via websocket
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
