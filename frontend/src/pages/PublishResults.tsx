import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BarChart3, Send } from 'lucide-react';
import { pollsApi } from '../api';
import { getSocket, joinPoll, leavePoll } from '../api/socket';

declare global {
  interface Window {
    Chart: any;
  }
}

interface OptionAnalytics {
  id: string;
  text: string;
  count: number;
}

interface QuestionAnalytics {
  id: string;
  text: string;
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
  is_published: boolean;
  is_closed: boolean;
}

export default function PublishResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const chartCanvas = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (window.Chart) {
      setChartReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = () => setChartReady(true);
    document.body.appendChild(script);
  }, []);

  const chartData = useMemo(() => {
    const labels: string[] = [];
    const values: number[] = [];

    (analytics?.questions || []).forEach((q) => {
      q.options.forEach((o) => {
        labels.push(`${q.text.slice(0, 18)}${q.text.length > 18 ? '…' : ''} · ${o.text}`);
        values.push(o.count);
      });
    });

    return { labels, values };
  }, [analytics]);

  useEffect(() => {
    if (!chartReady || !chartCanvas.current || !window.Chart) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new window.Chart(chartCanvas.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Votes',
            data: chartData.values,
            backgroundColor: '#d89a57',
            borderRadius: 10,
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
            ticks: { color: '#7a5c3e' },
            grid: { color: 'rgba(0,0,0,0.03)' },
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#7a5c3e' },
            grid: { color: 'rgba(0,0,0,0.03)' },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [chartReady, chartData]);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [myRes, analyticsRes] = await Promise.all([
          pollsApi.myPolls(),
          pollsApi.analytics(id),
        ]);

        const selectedPoll = (myRes.data.polls || []).find((p: Poll) => p.id === id) || null;
        setPoll(selectedPoll);
        setAnalytics(analyticsRes.data);
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to load publish page');
      } finally {
        setLoading(false);
      }
    };

    load();

    const socket = getSocket();
    joinPoll(id);

    const onAnalytics = (payload: AnalyticsData) => setAnalytics(payload);
    socket.on('analytics_update', onAnalytics);

    return () => {
      socket.off('analytics_update', onAnalytics);
      leavePoll(id);
    };
  }, [id]);

  const handlePublish = async () => {
    if (!id) return;
    setPublishing(true);
    try {
      await pollsApi.publish(id);
      toast.success('Results published successfully');
      setPoll((prev) => (prev ? { ...prev, is_published: true, is_closed: true } : prev));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to publish results');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#c49456]">
        <div className="w-14 h-14 border-4 border-white/30 border-t-[#2e1706] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#c49456] p-6 relative overflow-hidden">
      <div className="absolute -top-32 -left-20 w-[520px] h-[520px] bg-[#e9b870] rounded-full blur-[90px] opacity-30" />
      <div className="absolute bottom-[-100px] right-[280px] w-[380px] h-[380px] bg-[#8b4010] rounded-full blur-[100px] opacity-20" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <h1 className="text-4xl font-black text-[#2e1706]">Publish Results</h1>
            <p className="text-[#7a5c3e] mt-1">{poll?.title}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/polls/${id}/analytics`)}
              className="h-11 px-4 rounded-xl bg-[#fffaf3] border border-[#e8d5b8] text-[#2e1706]"
            >
              Back to Analytics
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing || !!poll?.is_published}
              className="h-11 px-4 rounded-xl bg-[#2e1706] text-white flex items-center gap-2 disabled:opacity-60"
            >
              <Send size={15} />
              {poll?.is_published ? 'Published' : publishing ? 'Publishing...' : 'Publish Results'}
            </button>
          </div>
        </div>

        <div className="rounded-[32px] bg-[#fffaf5]/85 border border-[#ead8c0] backdrop-blur-2xl p-6 shadow-[0_20px_60px_rgba(60,25,5,0.12)]">
          <div className="flex items-center gap-2 mb-3 text-[#2e1706] font-bold">
            <BarChart3 size={18} /> Column Chart Results
          </div>
          <p className="text-sm text-[#7a5c3e] mb-4">Total responses: {analytics?.total_responses || 0}</p>
          <div style={{ height: 420 }}>
            <canvas ref={chartCanvas} />
          </div>
        </div>
      </div>
    </div>
  );
}
