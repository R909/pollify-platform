import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, CSSProperties } from 'react';

const C = {
  bg: '#c49456', card: 'rgba(255,250,245,0.86)', cardLight: '#fff4e6', cardLighter: '#f0dfc7',
  border: '#ead8c0', amber: '#d89a57', amberLight: '#f0b84a', gold: '#c07820',
  cream: '#2e1706', creamDim: '#7a5c3e', creamMuted: '#8f6f4d',
  green: '#5cad5c', red: '#d05050', blue: '#5090d0', purple: '#9060c0',
};

export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`rounded-[28px] p-5 backdrop-blur-xl ${className}`}
      style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 18px 45px rgba(60,25,5,0.10)', ...style }}>
      {children}
    </div>
  );
}

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  void size;
  return (
    <div className="flex items-center gap-3">
  <div className="w-12 h-12 rounded-2xl bg-[#2e1706] flex items-center justify-center shadow-xl">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 12L10 15L17 8"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M21 12C21 16.4183 16.9706 20 12 20C10.4184 20 8.93214 19.6376 7.65455 19L3 20L4.2 16.2C3.43858 14.9804 3 13.5447 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>

  <div>
    <h1 className="text-3xl font-black leading-none">
      Pollify
    </h1>

    <p className="text-xs tracking-wide">
      Live polls & insights
    </p>
  </div>
</div>
  );
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Btn({ children, variant = 'primary', size = 'md', loading, className = '', ...props }: BtnProps) {
  const variants = {
    primary: { background: C.amber, color: '#0f0c08', border: 'none' },
    secondary: { background: C.cardLight, color: C.cream, border: `1px solid ${C.border}` },
    ghost: { background: 'transparent', color: C.creamDim, border: 'none' },
    danger: { background: C.red, color: '#fff', border: 'none' },
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button
      className={`font-bold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 disabled:opacity-40 flex items-center gap-2 justify-center ${sizes[size]} ${className}`}
      style={variants[variant]}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label style={{ color: C.creamDim, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{label}</label>}
      <input
        className={`px-4 py-2.5 rounded-xl outline-none text-sm transition ${className}`}
        style={{ background: '#fffaf3', border: `1px solid ${error ? C.red : '#e8d5b8'}`, color: C.cream }}
        {...props}
      />
      {error && <span style={{ color: C.red, fontSize: 12 }}>{error}</span>}
    </div>
  );
}

export function Badge({ children, color = 'amber' }: { children: ReactNode; color?: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    amber: { bg: '#3d2800', text: C.amber },
    green: { bg: '#1a3a1a', text: C.green },
    red: { bg: '#3a1a1a', text: C.red },
    blue: { bg: '#1a2a3a', text: C.blue },
    muted: { bg: C.cardLight, text: C.creamDim },
  };
  const c = colors[color] || colors.muted;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: c.bg, color: c.text }}>
      {children}
    </span>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div className="flex justify-center items-center p-8">
      <div style={{ width: size, height: size, borderWidth: 2, borderColor: C.border, borderTopColor: C.amber }}
        className="rounded-full border-2 animate-spin" />
    </div>
  );
}

export function HBar({ label, pct, count, color }: { label: string; pct: number; count: number; color: string; total?: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1.5" style={{ fontSize: 13 }}>
        <span style={{ color: C.cream }}>{label}</span>
        <span style={{ color: C.creamDim }}>{count} vote{count !== 1 ? 's' : ''} · {pct}%</span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ background: C.cardLighter, height: 10 }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export const COLORS = C;
export const BAR_COLORS = ['#e8a030', '#5090d0', '#5cad5c', '#9060c0', '#d07030', '#30b0b0', '#d05090', '#a0c040'];

