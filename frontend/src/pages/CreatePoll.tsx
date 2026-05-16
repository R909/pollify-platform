import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pollsApi } from "../api";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
} from "lucide-react";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  is_mandatory: boolean;
  options: Option[];
}

function uid() {
  return Math.random().toString(36).slice(2);
}

const THEME = {
  bg: "#c49456",

  card: "rgba(255,255,255,0.72)",

  border: "rgba(255,255,255,0.65)",

  primary: "#2e1706",

  secondary: "#7a5c3e",

  muted: "#9f866e",

  accent: "#d4a855",

  accentSoft: "#f3e2c1",

  input: "#fffaf5",

  shadow: "0 20px 60px rgba(60,25,5,0.08)",
};

export default function CreatePoll() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [isAnonymous, setIsAnonymous] = useState(true);

  const [expiresAt, setExpiresAt] = useState("");

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: uid(),
      text: "",
      is_mandatory: true,
      options: [
        { id: uid(), text: "" },
        { id: uid(), text: "" },
      ],
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uid(),
        text: "",
        is_mandatory: true,
        options: [
          { id: uid(), text: "" },
          { id: uid(), text: "" },
        ],
      },
    ]);
  };

  const removeQuestion = (qid: string) => {
    if (questions.length === 1) {
      toast.error("Need at least 1 question");
      return;
    }

    setQuestions(questions.filter((q) => q.id !== qid));
  };

  const updateQuestion = (
    qid: string,
    updates: Partial<Question>
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === qid ? { ...q, ...updates } : q
      )
    );
  };

  const addOption = (qid: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === qid
          ? {
              ...q,
              options: [
                ...q.options,
                {
                  id: uid(),
                  text: "",
                },
              ],
            }
          : q
      )
    );
  };

  const removeOption = (
    qid: string,
    oid: string
  ) => {
    const q = questions.find((q) => q.id === qid)!;

    if (q.options.length <= 2) {
      toast.error("Need at least 2 options");
      return;
    }

    setQuestions(
      questions.map((q) =>
        q.id === qid
          ? {
              ...q,
              options: q.options.filter(
                (o) => o.id !== oid
              ),
            }
          : q
      )
    );
  };

  const updateOption = (
    qid: string,
    oid: string,
    text: string
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === qid
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === oid ? { ...o, text } : o
              ),
            }
          : q
      )
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Poll title required");
      return;
    }

    for (const q of questions) {
      if (!q.text.trim()) {
        toast.error(
          "All questions must have text"
        );
        return;
      }

      if (
        q.options.some((o) => !o.text.trim())
      ) {
        toast.error(
          "All options must have text"
        );
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),

        description:
          description.trim() || undefined,

        is_anonymous: isAnonymous,

        expires_at: expiresAt
          ? new Date(expiresAt).toISOString()
          : null,

        questions: questions.map((q) => ({
          text: q.text,

          is_mandatory: q.is_mandatory,

          options: q.options.map((o) => ({
            text: o.text,
          })),
        })),
      };

      const res = await pollsApi.create(
        payload
      );

      toast.success("Poll created!");

      navigate(
        `/polls/${res.data.poll.id}/analytics`
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          "Failed to create poll"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity: 1 }
          50% { opacity: .4 }
        }
      `}</style>

      <div
        className="min-h-screen relative overflow-hidden px-6 py-10"
        style={{
          background: THEME.bg,
        }}
      >
        <div className="absolute -top-32 -left-20 w-[520px] h-[520px] bg-[#f1d3a5] rounded-full blur-[100px] opacity-40" />

        <div className="absolute bottom-[-100px] right-[250px] w-[420px] h-[420px] bg-[#d4a855] rounded-full blur-[100px] opacity-20" />

        <div className="absolute top-[40%] left-[46%] w-[280px] h-[280px] bg-[#edd8b3] rounded-full blur-[80px] opacity-30" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: THEME.primary,
                  boxShadow:
                    "0 10px 30px rgba(46,23,6,0.15)",
                }}
              >
                <CheckCircle2
                  className="text-white"
                  size={22}
                />
              </div>

              <h1
                className="text-5xl font-black"
                style={{
                  color: THEME.primary,
                  fontFamily: "'Lora', serif",
                }}
              >
                Create Poll
              </h1>
            </div>

            <p
              className="text-base ml-[60px]"
              style={{
                color: THEME.secondary,
              }}
            >
              Build beautiful polls and collect
              responses instantly
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            {/* POLL DETAILS */}
            <div
              className="rounded-[32px] p-7"
              style={{
                background: THEME.card,
                backdropFilter: "blur(18px)",
                border: `1px solid ${THEME.border}`,
                boxShadow: THEME.shadow,
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{
                  color: THEME.primary,
                  fontFamily: "'Lora', serif",
                }}
              >
                Poll Details
              </h2>

              <div className="flex flex-col gap-5">
                <div>
                  <label
                    className="text-sm font-semibold mb-2 block"
                    style={{
                      color: THEME.secondary,
                    }}
                  >
                    Poll Title
                  </label>

                  <input
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="What do you want to ask?"
                    className="w-full px-5 h-14 rounded-2xl outline-none text-sm"
                    style={{
                      background: THEME.input,
                      border:
                        "1px solid rgba(212,168,85,0.12)",
                      color: THEME.primary,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-semibold mb-2 block"
                    style={{
                      color: THEME.secondary,
                    }}
                  >
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    placeholder="Add context for your poll..."
                    className="w-full px-5 py-4 rounded-2xl outline-none text-sm resize-none"
                    style={{
                      background: THEME.input,
                      border:
                        "1px solid rgba(212,168,85,0.12)",
                      color: THEME.primary,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* SETTINGS */}
            <div
              className="rounded-[32px] p-7"
              style={{
                background: THEME.card,
                backdropFilter: "blur(18px)",
                border: `1px solid ${THEME.border}`,
                boxShadow: THEME.shadow,
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{
                  color: THEME.primary,
                  fontFamily: "'Lora', serif",
                }}
              >
                Poll Settings
              </h2>

              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="font-semibold"
                      style={{
                        color: THEME.primary,
                      }}
                    >
                      Anonymous Responses
                    </h3>

                    <p
                      className="text-sm mt-1"
                      style={{
                        color:
                          THEME.secondary,
                      }}
                    >
                      Hide participant identity
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setIsAnonymous(
                        !isAnonymous
                      )
                    }
                  >
                    {isAnonymous ? (
                      <ToggleRight
                        size={40}
                        color={
                          THEME.accent
                        }
                      />
                    ) : (
                      <ToggleLeft
                        size={40}
                        color={
                          THEME.muted
                        }
                      />
                    )}
                  </button>
                </div>

                <div>
                  <label
                    className="text-sm font-semibold mb-2 block"
                    style={{
                      color: THEME.secondary,
                    }}
                  >
                    Expiry Date
                  </label>

                  <input
                    type="datetime-local"
                    value={expiresAt}
                    min={new Date()
                      .toISOString()
                      .slice(0, 16)}
                    onChange={(e) =>
                      setExpiresAt(
                        e.target.value
                      )
                    }
                    className="w-full px-5 h-14 rounded-2xl outline-none text-sm"
                    style={{
                      background: THEME.input,
                      border:
                        "1px solid rgba(212,168,85,0.12)",
                      color: THEME.primary,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* QUESTIONS */}
            <div className="flex flex-col gap-5">
              {questions.map((q, qi) => (
                <div
                  key={q.id}
                  className="rounded-[32px] p-7"
                  style={{
                    background:
                      THEME.card,
                    backdropFilter:
                      "blur(18px)",
                    border: `1px solid ${THEME.border}`,
                    boxShadow:
                      THEME.shadow,
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold"
                        style={{
                          background:
                            THEME.accentSoft,
                          color:
                            THEME.primary,
                        }}
                      >
                        Q{qi + 1}
                      </div>

                      <input
                        value={q.text}
                        onChange={(e) =>
                          updateQuestion(
                            q.id,
                            {
                              text:
                                e.target
                                  .value,
                            }
                          )
                        }
                        placeholder={`Question ${
                          qi + 1
                        }`}
                        className="flex-1 px-5 h-14 rounded-2xl outline-none text-sm"
                        style={{
                          background:
                            THEME.input,
                          border:
                            "1px solid rgba(212,168,85,0.12)",
                          color:
                            THEME.primary,
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestion(
                            q.id,
                            {
                              is_mandatory:
                                !q.is_mandatory,
                            }
                          )
                        }
                        className="px-4 h-11 rounded-2xl text-sm font-semibold"
                        style={{
                          background:
                            q.is_mandatory
                              ? THEME.primary
                              : THEME.input,

                          color:
                            q.is_mandatory
                              ? "#fff"
                              : THEME.secondary,

                          border:
                            q.is_mandatory
                              ? "none"
                              : "1px solid rgba(212,168,85,0.12)",
                        }}
                      >
                        {q.is_mandatory
                          ? "Required"
                          : "Optional"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeQuestion(
                            q.id
                          )
                        }
                        className="w-11 h-11 rounded-2xl flex items-center justify-center"
                        style={{
                          background:
                            "#fff4f1",
                          color: "#d04d37",
                        }}
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pl-16">
                    {q.options.map(
                      (opt, oi) => (
                        <div
                          key={opt.id}
                          className="flex items-center gap-3"
                        >
                          <div
                            className="w-5 h-5 rounded-full border-2"
                            style={{
                              borderColor:
                                THEME
                                  .accent,
                            }}
                          />

                          <input
                            value={
                              opt.text
                            }
                            onChange={(
                              e
                            ) =>
                              updateOption(
                                q.id,
                                opt.id,
                                e.target
                                  .value
                              )
                            }
                            placeholder={`Option ${
                              oi + 1
                            }`}
                            className="flex-1 px-5 h-12 rounded-2xl outline-none text-sm"
                            style={{
                              background:
                                THEME.input,
                              border:
                                "1px solid rgba(212,168,85,0.12)",
                              color:
                                THEME.primary,
                            }}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeOption(
                                q.id,
                                opt.id
                              )
                            }
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                              background:
                                "#fff4f1",
                              color:
                                "#d04d37",
                            }}
                          >
                            <Trash2
                              size={14}
                            />
                          </button>
                        </div>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        addOption(q.id)
                      }
                      className="flex items-center gap-2 text-sm font-semibold mt-2 ml-8"
                      style={{
                        color:
                          THEME.accent,
                      }}
                    >
                      <Plus size={16} />
                      Add Option
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <button
              type="button"
              onClick={addQuestion}
              className="h-14 rounded-2xl font-semibold flex items-center justify-center gap-2"
              style={{
                background:
                  "rgba(255,255,255,0.65)",
                border:
                  "1px solid rgba(212,168,85,0.12)",
                color: THEME.primary,
                backdropFilter:
                  "blur(10px)",
              }}
            >
              <Plus size={18} />
              Add Question
            </button>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                className="h-14 px-8 rounded-2xl font-semibold"
                style={{
                  background:
                    "#fffaf5",
                  border:
                    "1px solid rgba(212,168,85,0.12)",
                  color:
                    THEME.secondary,
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-14 rounded-2xl text-white font-bold transition-all"
                style={{
                  background:
                    THEME.primary,
                  boxShadow:
                    "0 12px 35px rgba(46,23,6,0.18)",
                }}
              >
                {loading
                  ? "Creating Poll..."
                  : "Create Poll"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
