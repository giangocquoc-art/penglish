import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";

type DecoyReason = "contextmenu" | "shortcut" | "devtools";

type PooDecoyState = {
  reason: DecoyReason;
  line: string;
};

type PooDecoyOverlayProps = {
  decoy: PooDecoyState;
};

const funnyLines = [
  "Tang vật thu giữ: 1 cú F12 khả nghi và 3 bong bóng tò mò.",
  "Poo đã niêm phong khu vực code. Mời bạn quay lại học bài.",
  "Không có gì ở đây ngoài rong biển, bọt nước và một con cá voi biết TypeScript.",
  "Bạn vừa cố lặn xuống đáy đại dương HTML. Poo không giận, Poo chỉ lập biên bản.",
  "Hành vi tò mò được ghi nhận. Hình phạt: đọc từ vựng Anh.",
];

const decoyCss = `
  @keyframes pooDecoyPop {
    from { opacity: 0; transform: translateY(20px) scale(0.96) rotate(-1deg); }
    to { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
  }

  @keyframes pooDecoySirenBlink {
    from { filter: brightness(1); }
    to { filter: brightness(1.26); }
  }

  @keyframes pooDecoyRadarSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes pooDecoyWhaleBounce {
    0%, 100% { transform: translateY(0) rotate(-3deg); }
    50% { transform: translateY(-7px) rotate(3deg); }
  }

  @keyframes pooDecoyBubbleUp {
    from { transform: translateY(0) scale(1); opacity: 0; }
    15% { opacity: 1; }
    to { transform: translateY(-120vh) scale(1.7); opacity: 0; }
  }
`;

const styles: Record<string, CSSProperties> = {
  page: {
    position: "fixed",
    inset: 0,
    zIndex: 2147483647,
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    color: "#0f2747",
    isolation: "isolate",
    overflow: "hidden",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    background:
      "radial-gradient(circle at 18% 12%, rgba(255, 179, 138, 0.55), transparent 26%), radial-gradient(circle at 82% 18%, rgba(143, 211, 255, 0.85), transparent 28%), radial-gradient(circle at 50% 100%, rgba(207, 239, 232, 0.9), transparent 38%), linear-gradient(135deg, #061a33 0%, #0f2747 42%, #123d68 100%)",
  },
  grid: {
    position: "absolute",
    inset: "-20%",
    zIndex: -2,
    background:
      "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "44px 44px",
    transform: "rotate(-7deg)",
  },
  card: {
    width: "min(680px, calc(100vw - 28px))",
    maxHeight: "calc(100vh - 40px)",
    overflow: "auto",
    padding: 28,
    borderRadius: 34,
    textAlign: "center",
    background: "rgba(247, 251, 255, 0.88)",
    border: "1px solid rgba(143, 211, 255, 0.75)",
    boxShadow: "0 30px 90px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.75)",
    backdropFilter: "blur(24px)",
    animation: "pooDecoyPop 0.45s ease-out both",
  },
  siren: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    borderRadius: 999,
    color: "#ffffff",
    background: "linear-gradient(135deg, #ff4d6d, #ff9f1c)",
    boxShadow: "0 14px 34px rgba(255, 77, 109, 0.28)",
    fontSize: 13,
    fontWeight: 950,
    letterSpacing: "0.08em",
    animation: "pooDecoySirenBlink 0.85s infinite alternate",
  },
  radar: {
    position: "relative",
    width: 142,
    height: 142,
    margin: "22px auto 12px",
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(circle, rgba(143,211,255,0.18) 0 18%, transparent 19%), radial-gradient(circle, transparent 0 35%, rgba(47,128,237,0.18) 36% 37%, transparent 38%), radial-gradient(circle, transparent 0 62%, rgba(47,128,237,0.2) 63% 64%, transparent 65%), rgba(15, 39, 71, 0.92)",
    border: "1px solid rgba(143, 211, 255, 0.75)",
    boxShadow: "0 20px 45px rgba(15, 39, 71, 0.22), inset 0 0 28px rgba(143, 211, 255, 0.22)",
    overflow: "hidden",
  },
  radarLine: {
    position: "absolute",
    width: "50%",
    height: "50%",
    left: "50%",
    top: 0,
    transformOrigin: "0% 100%",
    background: "linear-gradient(45deg, rgba(143, 211, 255, 0.7), transparent 62%)",
    animation: "pooDecoyRadarSpin 1.45s linear infinite",
  },
  whale: {
    position: "relative",
    zIndex: 2,
    width: 72,
    height: 72,
    display: "grid",
    placeItems: "center",
    borderRadius: 26,
    fontSize: 46,
    background: "linear-gradient(180deg, #eaf8ff, #bdeaff)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.72), 0 14px 25px rgba(0,0,0,0.18)",
    animation: "pooDecoyWhaleBounce 1.2s ease-in-out infinite",
  },
  kicker: {
    margin: "4px 0 8px",
    color: "#2f80ed",
    fontSize: 13,
    fontWeight: 950,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },
  title: {
    margin: "0 auto 12px",
    maxWidth: 560,
    color: "#0f2747",
    fontSize: "clamp(32px, 6vw, 58px)",
    lineHeight: 0.98,
    letterSpacing: "-0.06em",
  },
  desc: {
    margin: "0 auto 18px",
    maxWidth: 540,
    color: "rgba(15, 39, 71, 0.78)",
    fontSize: 16,
    lineHeight: 1.65,
    fontWeight: 750,
  },
  ticket: {
    display: "grid",
    gap: 10,
    margin: "18px auto",
    maxWidth: 560,
    textAlign: "left",
  },
  ticketRow: {
    display: "grid",
    gap: 4,
    padding: "13px 15px",
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.7)",
    border: "1px dashed rgba(47, 128, 237, 0.38)",
  },
  ticketLabel: {
    color: "rgba(15, 39, 71, 0.52)",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  ticketValue: {
    color: "#0f2747",
    fontSize: 15,
    lineHeight: 1.35,
  },
  evidence: {
    margin: "16px auto 20px",
    maxWidth: 560,
    padding: 16,
    borderRadius: 22,
    color: "#5b3413",
    background: "linear-gradient(135deg, rgba(255,238,189,0.9), rgba(255,179,138,0.38))",
    border: "1px solid rgba(255, 179, 138, 0.62)",
    textAlign: "left",
  },
  evidenceText: {
    margin: "6px 0 0",
    fontSize: 15,
    lineHeight: 1.55,
    fontWeight: 800,
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  button: {
    border: 0,
    cursor: "pointer",
    borderRadius: 999,
    padding: "13px 18px",
    fontSize: 14,
    fontWeight: 950,
  },
  primaryButton: {
    color: "#ffffff",
    background: "linear-gradient(135deg, #2f80ed, #37b7ff)",
    boxShadow: "0 16px 34px rgba(47, 128, 237, 0.28)",
  },
  secondaryButton: {
    color: "#0f2747",
    background: "#ffffff",
    border: "1px solid rgba(47, 128, 237, 0.22)",
    boxShadow: "0 12px 26px rgba(15, 39, 71, 0.12)",
  },
  note: {
    margin: "18px 0 0",
    color: "rgba(15, 39, 71, 0.55)",
    fontSize: 12,
    lineHeight: 1.5,
    fontWeight: 700,
  },
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName.toLowerCase();

  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

function getRandomLine() {
  return funnyLines[Math.floor(Math.random() * funnyLines.length)];
}

function getReasonLabel(reason: DecoyReason) {
  if (reason === "contextmenu") return "Bấm chuột phải hơi đáng ngờ";
  if (reason === "shortcut") return "Tổ hợp phím có mùi Inspect";
  return "DevTools mở to như cửa biển";
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.ticketRow}>
      <span style={styles.ticketLabel}>{label}</span>
      <strong style={styles.ticketValue}>{value}</strong>
    </div>
  );
}

function Bubble({ index }: { index: number }) {
  const bubbleStyles: CSSProperties[] = [
    { left: "12%", animationDelay: "0s" },
    { left: "28%", width: 18, height: 18, animationDelay: "1.2s", animationDuration: "7.5s" },
    { right: "22%", width: 36, height: 36, animationDelay: "0.6s", animationDuration: "8s" },
    { right: "9%", width: 22, height: 22, animationDelay: "2s", animationDuration: "6.8s" },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: -80,
        width: 28,
        height: 28,
        borderRadius: 999,
        background: "rgba(255,255,255,0.28)",
        border: "1px solid rgba(255,255,255,0.45)",
        animation: "pooDecoyBubbleUp 6s linear infinite",
        ...bubbleStyles[index],
      }}
    />
  );
}

export function PooDecoyOverlay({ decoy }: PooDecoyOverlayProps) {
  const reasonLabel = getReasonLabel(decoy.reason);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <main id="poo-decoy-page" role="alertdialog" aria-modal="true" aria-labelledby="poo-decoy-title" style={styles.page}>
      <style>{decoyCss}</style>
      <div aria-hidden="true" style={styles.grid} />
      {[0, 1, 2, 3].map((index) => <Bubble key={index} index={index} />)}

      <section style={styles.card}>
        <div style={styles.siren}>🚨 HẢI QUAN ĐẠI DƯƠNG POOENGLISH 🚨</div>

        <div style={styles.radar}>
          <div aria-hidden="true" style={styles.radarLine} />
          <div aria-hidden="true" style={styles.whale}>🐳</div>
        </div>

        <p style={styles.kicker}>Biên bản số: POO-F12-404</p>
        <h1 id="poo-decoy-title" style={styles.title}>Bắt quả tang thợ lặn code!</h1>
        <p style={styles.desc}>
          Poo phát hiện bạn đang cố lặn vào phần tử bí mật của đại dương. Khu vực HTML đã được chuyển sang chế độ rong biển an toàn.
        </p>

        <div style={styles.ticket}>
          <TicketRow label="Lý do" value={reasonLabel} />
          <TicketRow label="Tình từ vựng bị cá voi Poo nhìn chằm chằm 👀" />
          <TicketRow label="Hình phạt" value="Nộp phạtừ vựng + 1 câu Shadowing" />
        </div>

        <div style={styles.evidence}>
          <b>🫧 Bằng chứng:</b>
          <p style={styles.evidenceText}>{decoy.line}</p>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={() => window.location.reload()}
          >
            Tôi chỉ lỡ tay, cho học tiếp 😭
          </button>
          <button
            type="button"
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={() => { window.location.href = "/words"; }}
          >
            Nộp phạtừ vựng 📝
          </button>
        </div>

        <p style={styles.note}>
          Admin muốn debug production thì mở URL với <b>?poo_debug=1</b>.
        </p>
      </section>
    </main>
  );
}

export function usePooDecoyGuard() {
  const [decoy, setDecoy] = useState<PooDecoyState | null>(null);

  const activatePooDecoy = useCallback((reason: DecoyReason) => {
    setDecoy((current) => current ?? { reason, line: getRandomLine() });
  }, []);

  useEffect(() => {
    const isProduction = import.meta.env.PROD;
    const isBypass =
      new URLSearchParams(window.location.search).get("poo_debug") === "1";

    if (!isProduction || isBypass) return;

    const onContextMenu = (event: MouseEvent) => {
      if (isTypingTarget(event.target)) return;

      event.preventDefault();
      activatePooDecoy("contextmenu");
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();

      const blocked =
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        (event.ctrlKey && key === "u");

      if (!blocked) return;

      event.preventDefault();
      event.stopPropagation();
      activatePooDecoy("shortcut");
    };

    const detectDockedDevTools = () => {
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;

      if (widthGap > 260 || heightGap > 260) {
        activatePooDecoy("devtools");
      }
    };

    window.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("keydown", onKeyDown, true);

    const interval = window.setInterval(detectDockedDevTools, 1200);

    return () => {
      window.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown, true);
      window.clearInterval(interval);
    };
  }, [activatePooDecoy]);

  return useMemo(() => decoy, [decoy]);
}
