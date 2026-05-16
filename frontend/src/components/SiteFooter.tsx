export default function SiteFooter() {
  return (
    <footer
      className="relative z-10 py-8"
      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <p
        className="text-center"
        style={{
          color: "rgba(255,250,244,0.42)",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.14em",
        }}
      >
        POLLIFY — BEAUTIFUL REAL-TIME POLLING PLATFORM
      </p>
    </footer>
  );
}
