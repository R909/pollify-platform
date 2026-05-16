import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pollsApi } from "../api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

import {
  Plus,
  BarChart2,
  Send,
  Link2,
  Trash2,
  XCircle,
} from "lucide-react";

interface Poll {
  id: string;
  title: string;
  description?: string;
  is_anonymous: boolean;
  expires_at?: string;
  is_published: boolean;
  is_closed: boolean;
  is_expired: boolean;
  share_token: string;
  response_count: number;
  created_at: string;
}

export default function Dashboard() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await pollsApi.myPolls();

      setPolls(res.data.polls);
    } catch {
      toast.error("Failed to load polls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    pollsApi
      .myPolls()
      .then((res) => {
        if (cancelled) return;
        setPolls(res.data.polls);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Failed to load polls");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);


  const handleDelete = async (id: string) => {
    if (!confirm("Delete this poll?")) return;

    try {
      await pollsApi.delete(id);

      setPolls(polls.filter((p) => p.id !== id));

      toast.success("Poll deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleClose = async (id: string) => {
    try {
      await pollsApi.close(id);

      load();

      toast.success("Poll closed");
    } catch {
      toast.error("Failed to close poll");
    }
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/poll/${token}`
    );

    toast.success("Link copied!");
  };

  const getPollStatus = (p: Poll) => {
    if (p.is_published)
      return {
        label: "Published",
        color:
          "bg-blue-500/10 text-blue-700 border border-blue-200",
      };

    if (p.is_expired || p.is_closed)
      return {
        label: "Closed",
        color:
          "bg-red-500/10 text-red-700 border border-red-200",
      };

    return {
      label: "Active",
      color:
        "bg-green-500/10 text-green-700 border border-green-200",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#c49456]">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#c49456] relative overflow-hidden font-sans mt-[25px]">
      <div className="absolute -top-32 -left-20 w-[520px] h-[520px] bg-[#e9b870] rounded-full blur-[90px] opacity-30" />
      <div className="absolute bottom-[-100px] right-[280px] w-[380px] h-[380px] bg-[#8b4010] rounded-full blur-[100px] opacity-20" />
      <div className="absolute top-[40%] left-[46%] w-[280px] h-[280px] bg-[#d4894a] rounded-full blur-[80px] opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 pb-10">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-2">
                Welcome back, {user?.name?.split(" ")[0]} 👋
              </h2>
              <p className="text-white/75 text-sm lg:text-base">
                Manage your polls and track audience engagement.
              </p>
            </div>
            <button
              onClick={() => navigate("/polls/new")}
              className="h-12 px-5 rounded-2xl bg-[#2e1706] text-white font-semibold inline-flex items-center justify-center gap-2 shadow-xl hover:-translate-y-1 transition-all duration-300 w-full md:w-auto"
            >
              <Plus size={18} />
              Create Poll
            </button>
          </div>
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {[
            {
              label: "Total Polls",
              value: polls.length,
            },
            {
              label: "Total Responses",
              value: polls.reduce(
                (s, p) => s + parseInt(String(p.response_count)),
                0
              ),
            },
            {
              label: "Active Polls",
              value: polls.filter(
                (p) =>
                  !p.is_closed &&
                  !p.is_expired &&
                  !p.is_published
              ).length,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-[30px] bg-[#fffaf5]/80 border border-[#ead8c0] backdrop-blur-2xl p-7 shadow-[0_20px_60px_rgba(60,25,5,0.12)]"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#f0d5ae]/40 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="text-5xl font-black text-[#2e1706] mb-2">
                  {s.value}
                </div>

                <div className="text-[#7a5c3e] text-sm tracking-wide">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {polls.length === 0 ? (
          <div className="rounded-[36px] bg-[#fffaf5]/80 border border-[#ead8c0] backdrop-blur-2xl p-16 text-center shadow-[0_25px_60px_rgba(60,25,5,0.12)]">
            <div className="text-7xl mb-5">📊</div>

            <h3 className="text-4xl font-black text-[#2e1706] mb-3">
              No polls yet
            </h3>

            <p className="text-[#7a5c3e] mb-8">
              Create your first poll and start collecting opinions.
            </p>

            <button
              onClick={() => navigate("/polls/new")}
              className="h-14 px-6 rounded-2xl bg-[#2e1706] text-white font-bold flex items-center gap-2 mx-auto shadow-xl hover:scale-[1.03] transition-all duration-300"
            >
              <Plus size={18} />
              Create My First Poll
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {polls.map((p) => {
              const status = getPollStatus(p);

              return (
                <div
                  key={p.id}
                  className="relative overflow-hidden rounded-[32px] border border-[#ead8c0] bg-[#fffaf5]/80 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(60,25,5,0.10)]"
                >
                  <div className="absolute top-0 right-0 w-52 h-52 bg-[#f0d5ae]/40 blur-3xl rounded-full" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h3 className="text-2xl font-black text-[#2e1706] tracking-tight">
                          {p.title}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
                        >
                          {status.label}
                        </span>

                        {p.is_anonymous && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold border border-[#d89a57]/20 bg-[#d89a57]/10 text-[#8b4010]">
                            Anonymous
                          </span>
                        )}
                      </div>

                      {p.description && (
                        <p className="text-[#6b4b2f] text-sm leading-relaxed mb-5 max-w-2xl">
                          {p.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-5 text-sm text-[#7a5c3e]">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#d89a57]" />

                          {p.response_count} response
                          {p.response_count !== 1 ? "s" : ""}
                        </div>

                        {p.expires_at && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#d89a57]" />

                            {new Date(
                              p.expires_at
                            ).toLocaleDateString()}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#d89a57]" />

                          {new Date(
                            p.created_at
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => navigate(`/polls/${p.id}/analytics`)}
                        className="h-12 px-5 rounded-2xl bg-[#fffaf3] hover:bg-[#f7e8d0] border border-[#e8d5b8] text-[#2e1706] font-medium flex items-center gap-2 transition-all duration-300"
                      >
                        <BarChart2 size={16} />
                        Analytics
                      </button>
                      <button
                        onClick={() => navigate(`/polls/${p.id}/publish`)}
                        className="h-12 px-5 rounded-2xl bg-[#fffaf3] hover:bg-[#f7e8d0] border border-[#e8d5b8] text-[#2e1706] font-medium flex items-center gap-2 transition-all duration-300"
                      >{}
                        <Send size={16} />
                        {p.is_published ? "Published" : "Publish"}
                      </button>
                      <button
                        onClick={() => copyLink(p.share_token)}
                        className="h-12 px-5 rounded-2xl bg-[#fffaf3] hover:bg-[#f7e8d0] border border-[#e8d5b8] text-[#2e1706] font-medium flex items-center gap-2 transition-all duration-300"
                      >
                        <Link2 size={16} />
                        Share
                      </button>
                      {!p.is_closed &&
                        !p.is_expired &&
                        !p.is_published && (
                          <button
                            onClick={() => handleClose(p.id)}
                            className="h-12 px-5 rounded-2xl bg-[#fffaf3] hover:bg-[#f7e8d0] border border-[#e8d5b8] text-[#2e1706] font-medium flex items-center gap-2 transition-all duration-300"
                          >
                            <XCircle size={16} />
                            Close
                          </button>
                        )}

                      <button
                        onClick={() => handleDelete(p.id)}
                        className="h-12 px-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-all duration-300"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
