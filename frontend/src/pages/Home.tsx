import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { pollsApi } from "../api";

import {
  BarChart2,
  Link2,
  Shield,
  Zap,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";

const THEME = {
  bg: "#d4894a",

  card: "rgba(255,250,244,0.68)",
  cardHover: "rgba(255,250,244,0.78)",

  border: "rgba(255,255,255,0.45)",

  text: "#2a1408",
  muted: "rgba(42,20,8,0.6)",

  accent: "#6a2d0c",

  shadow: "0 10px 40px rgba(80,40,10,0.08)",

  white: "#fffaf5",
};

export default function Home() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [loadingData, setLoadingData] = useState(false);

  const [summary, setSummary] = useState({
    totalResponses: 0,
    totalPolls: 0,
    activePolls: 0,
  });

  const [livePollTitle, setLivePollTitle] =
    useState("No poll selected");

  const [bars, setBars] = useState<
    Array<{ label: string; pct: number }>
  >([]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    setLoadingData(true);

    pollsApi
      .myPolls()
      .then(async (res) => {
        if (cancelled) return;

        const polls = res.data.polls || [];

        const totalResponses = polls.reduce(
          (sum: number, p: any) =>
            sum + parseInt(String(p.response_count || 0), 10),
          0
        );

        const activePolls = polls.filter(
          (p: any) =>
            !p.is_closed &&
            !p.is_expired &&
            !p.is_published
        ).length;

        setSummary({
          totalResponses,
          totalPolls: polls.length,
          activePolls,
        });

        if (!polls[0]) {
          setLivePollTitle("No poll selected");
          setBars([]);
          return;
        }

        setLivePollTitle(polls[0].title);

        const analyticsRes = await pollsApi.analytics(
          polls[0].id
        );

        if (cancelled) return;

        const firstQuestion =
          analyticsRes.data?.questions?.[0];

        if (!firstQuestion) {
          setBars([]);
          return;
        }

        const nextBars = (firstQuestion.options || [])
          .slice(0, 4)
          .map((o: any) => ({
            label: o.text,
            pct: o.percentage || 0,
          }));

        setBars(nextBars);
      })
      .catch(() => {
        if (cancelled) return;

        setSummary({
          totalResponses: 0,
          totalPolls: 0,
          activePolls: 0,
        });

        setLivePollTitle("Unable to load");

        setBars([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingData(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const completionRate = useMemo(() => {
    if (!summary.totalPolls) return 0;

    return Math.round(
      (summary.activePolls / summary.totalPolls) * 100
    );
  }, [summary]);

  const features = [
    {
      icon: <Zap size={20} />,
      title: "Create in Minutes",
      desc: "Build elegant polls instantly with smooth question flows.",
    },
    {
      icon: <Link2 size={20} />,
      title: "Share Anywhere",
      desc: "Generate public links and collect responses beautifully.",
    },
    {
      icon: <BarChart2 size={20} />,
      title: "Live Analytics",
      desc: "Watch responses update in real-time dashboards.",
    },
    {
      icon: <Shield size={20} />,
      title: "Anonymous Mode",
      desc: "Allow private participation whenever required.",
    },
    {
      icon: <Clock size={20} />,
      title: "Auto Expiry",
      desc: "Polls automatically close on your chosen schedule.",
    },
    {
      icon: <Users size={20} />,
      title: "Publish Results",
      desc: "Share final outcomes with teams and communities.",
    },
  ];

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{
        background: `
          radial-gradient(circle at top left, #e2a869 0%, transparent 28%),
          radial-gradient(circle at bottom right, #b8692f 0%, transparent 32%),
          linear-gradient(135deg, #d4894a 0%, #cb7c39 100%)
        `,
        fontFamily:
          "'Cormorant Garamond', Georgia, serif",
      }}
    >
     
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
      />

      {/* TOP */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-7">
        <div className="flex items-center justify-center gap-4">
          <div
            className="flex-1 h-px"
            style={{
              background:'#d4894a'
            }}
          />

          <div
            style={{
              color: "rgba(50,18,0,0.7)",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.35em",
              fontSize: "0.72rem",
              textTransform: "uppercase",
            }}
          >
            Pollify
          </div>

          <div
            className="flex-1 h-px"
            style={{
              background:'#c49456'
            }}
          />
        </div>
      </div>

      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-32 grid lg:grid-cols-2 gap-24 items-center">
        <div>
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8"
            style={{
              background: "rgba(255,255,255,0.24)",
              border: `1px solid ${THEME.border}`,
              backdropFilter: "blur(14px)",
              color: THEME.text,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.08em",
              fontSize: "0.72rem",
            }}
          >
            ✦ REAL-TIME POLLING PLATFORM
          </div>

          <h1
            className="leading-[0.94] tracking-[-0.03em] mb-8"
            style={{
              fontSize: "clamp(4rem, 7vw, 6rem)",
              color: THEME.text,
              fontWeight: 600,
            }}
          >
            Create polls
            <br />

            <span
              style={{
                fontStyle: "italic",
                color: THEME.accent,
              }}
            >
              people genuinely
            </span>

            <br />
            engage with.
          </h1>

          <p
            className="max-w-xl mb-12"
            style={{
              color: THEME.muted,
              fontSize: "1.22rem",
              lineHeight: 1.8,
            }}
          >
            Build elegant polls, collect live
            feedback, and analyze responses with a
            luxurious real-time analytics experience.
          </p>

          <div className="flex flex-wrap gap-4">
            {user ? (
              <button
                onClick={() =>
                  navigate("/dashboard")
                }
                className="h-14 px-8 rounded-2xl flex items-center gap-3 transition-all duration-300"
                style={{
                  background: THEME.accent,
                  color: THEME.white,
                  boxShadow:
                    "0 8px 20px rgba(40,15,0,0.15)",
                  fontFamily:
                    "'DM Mono', monospace",
                  letterSpacing: "0.06em",
                  fontSize: "0.8rem",
                }}
              >
                GO TO DASHBOARD
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button
                  onClick={() =>
                    navigate("/register")
                  }
                  className="h-14 px-8 rounded-2xl flex items-center gap-3 transition-all duration-300"
                  style={{
                    background: THEME.accent,
                    color: THEME.white,
                    boxShadow:
                      "0 8px 20px rgba(40,15,0,0.15)",
                    fontFamily:
                      "'DM Mono', monospace",
                    letterSpacing: "0.06em",
                    fontSize: "0.8rem",
                  }}
                >
                  START CREATING
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() =>
                    navigate("/login")
                  }
                  className="h-14 px-8 rounded-2xl transition-all duration-300"
                  style={{
                    background:
                      "rgba(255,255,255,0.45)",
                    border:
                      "1px solid rgba(80,30,0,0.08)",
                    color: THEME.text,
                    backdropFilter: "blur(14px)",
                    fontFamily:
                      "'DM Mono', monospace",
                    letterSpacing: "0.06em",
                    fontSize: "0.8rem",
                  }}
                >
                  SIGN IN
                </button>
              </>
            )}
          </div>

          {/* STATS */}
          <div className="flex flex-wrap gap-5 mt-16">
            {[
              [summary.totalResponses, "Responses"],
              [summary.totalPolls, "Polls"],
              [`${completionRate}%`, "Active Rate"],
            ].map(([value, label]) => (
              <div
                key={String(label)}
                className="px-6 py-5 rounded-[28px]"
                style={{
                  background: THEME.card,
                  border: `1px solid ${THEME.border}`,
                  backdropFilter: "blur(14px)",
                  boxShadow: THEME.shadow,
                }}
              >
                <div
                  style={{
                    color: THEME.text,
                    fontSize: "2.6rem",
                    fontWeight: 600,
                  }}
                >
                  {value}
                </div>

                <div
                  style={{
                    color: THEME.muted,
                    fontFamily:
                      "'DM Mono', monospace",
                    fontSize: "0.68rem",
                    letterSpacing: "0.08em",
                    marginTop: "4px",
                  }}
                >
                  {String(label).toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div
            className="p-8 lg:p-10"
            style={{
              borderRadius: "36px",
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              backdropFilter: "blur(14px)",
              boxShadow: THEME.shadow,
            }}
          >
            {/* HEADER */}
            <div className="flex items-start justify-between mb-10">
              <div>
                <div
                  style={{
                    color: THEME.muted,
                    fontFamily:
                      "'DM Mono', monospace",
                    fontSize: "0.68rem",
                    letterSpacing: "0.08em",
                    marginBottom: "10px",
                  }}
                >
                  LIVE ANALYTICS
                </div>

                <h3
                  style={{
                    color: THEME.text,
                    fontSize: "1.9rem",
                    lineHeight: 1.2,
                    fontWeight: 600,
                  }}
                >
                  {user
                    ? livePollTitle
                    : "Your poll insights"}
                </h3>
              </div>

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "rgba(255,255,255,0.7)",
                  border:
                    "1px solid rgba(120,60,20,0.08)",
                  color: THEME.accent,
                }}
              >
                <BarChart2 size={20} />
              </div>
            </div>

            <div className="space-y-6 mb-10">
              {(user ? bars : []).length === 0 ? (
                <div
                  style={{
                    color: THEME.muted,
                    fontFamily:
                      "'DM Mono', monospace",
                    fontSize: "0.72rem",
                  }}
                >
                  {loadingData
                    ? "Loading analytics..."
                    : user
                    ? "No responses available yet."
                    : "Create polls to see live analytics."}
                </div>
              ) : (
                bars.map((item) => (
                  <div key={item.label}>
                    <div
                      className="flex justify-between mb-2"
                      style={{
                        color: THEME.text,
                        fontFamily:
                          "'DM Mono', monospace",
                        fontSize: "0.72rem",
                      }}
                    >
                      <span>{item.label}</span>
                      <span>{item.pct}%</span>
                    </div>

                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{
                        background:
                          "rgba(255,255,255,0.45)",
                      }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.pct}%`,
                          background: THEME.accent,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              className="rounded-[28px] p-6"
              style={{
                background:
                  "rgba(255,255,255,0.5)",
                border:
                  "1px solid rgba(255,255,255,0.45)",
                backdropFilter: "blur(14px)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    style={{
                      color: THEME.muted,
                      fontFamily:
                        "'DM Mono', monospace",
                      fontSize: "0.68rem",
                      letterSpacing: "0.08em",
                    }}
                  >
                    TOTAL RESPONSES
                  </div>

                  <div
                    style={{
                      color: THEME.text,
                      fontSize: "4rem",
                      lineHeight: 1,
                      marginTop: "10px",
                      fontWeight: 600,
                    }}
                  >
                    {summary.totalResponses}
                  </div>
                </div>

                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "rgba(255,255,255,0.7)",
                    color: THEME.accent,
                    border:
                      "1px solid rgba(120,60,20,0.08)",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                  }}
                >
                  ↑
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 pb-32">
        <div className="text-center mb-20">
          <div
            style={{
              color: "rgba(60,20,0,0.6)",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.3em",
              fontSize: "0.72rem",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            Platform Features
          </div>

          <h2
            style={{
              color: THEME.white,
              fontSize: "clamp(3rem, 5vw, 4.5rem)",
              lineHeight: 1,
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            Everything you need
          </h2>

          <p
            className="max-w-2xl mx-auto"
            style={{
              color:
                "rgba(255,250,244,0.72)",
              fontSize: "1.18rem",
              lineHeight: 1.8,
            }}
          >
            Designed for creators, teams, and
            communities who want elegant polling
            experiences.
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-8 rounded-[32px] transition-all duration-300"
              style={{
                background:
                  "rgba(255,250,244,0.58)",
                border:
                  "1px solid rgba(255,255,255,0.5)",
                backdropFilter: "blur(14px)",
                boxShadow:
                  "0 8px 30px rgba(60,20,0,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-6px)";

                e.currentTarget.style.background =
                  "rgba(255,250,244,0.72)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0)";

                e.currentTarget.style.background =
                  "rgba(255,250,244,0.58)";
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background:
                    "rgba(255,255,255,0.7)",
                  border:
                    "1px solid rgba(120,60,20,0.08)",
                  color: THEME.accent,
                }}
              >
                {f.icon}
              </div>

              <h3
                style={{
                  color: THEME.text,
                  fontSize: "1.7rem",
                  fontWeight: 600,
                  marginBottom: "14px",
                }}
              >
                {f.title}
              </h3>

              <p
                style={{
                  color: THEME.muted,
                  lineHeight: 1.8,
                  fontSize: "1.05rem",
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
