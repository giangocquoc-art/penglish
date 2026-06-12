import { useEffect } from "react";

type DecoyReason = "contextmenu" | "shortcut" | "devtools";

const funnyLines = [
  "Tang vật thu giữ: 1 cú F12 khả nghi và 3 bong bóng tò mò.",
  "Poo đã niêm phong khu vực code. Mời bạn quay lại học bài.",
  "Không có gì ở đây ngoài rong biển, bọt nước và một con cá voi biết TypeScript.",
  "Bạn vừa cố lặn xuống đáy đại dương HTML. Poo không giận, Poo chỉ lập biên bản.",
  "Hành vi tò mò được ghi nhận. Hình phạt: đọc to 5 từ vựng tiếng Anh.",
];

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

function activatePooDecoy(reason: DecoyReason) {
  if (document.documentElement.dataset.pooDecoyGuard === "1") return;

  document.documentElement.dataset.pooDecoyGuard = "1";

  const line = getRandomLine();
  const reasonLabel = getReasonLabel(reason);

  document.body.innerHTML = `
    <main id="poo-decoy-page">
      <div class="poo-bubble bubble-1"></div>
      <div class="poo-bubble bubble-2"></div>
      <div class="poo-bubble bubble-3"></div>
      <div class="poo-bubble bubble-4"></div>

      <section class="poo-decoy-card">
        <div class="poo-siren">🚨 HẢI QUAN ĐẠI DƯƠNG POOENGLISH 🚨</div>

        <div class="poo-radar">
          <div class="poo-radar-line"></div>
          <div class="poo-whale">🐳</div>
        </div>

        <p class="poo-kicker">Biên bản số: POO-F12-404</p>

        <h1>Bắt quả tang thợ lặn code!</h1>

        <p class="poo-desc">
          Poo phát hiện bạn đang cố lặn vào phần tử bí mật của đại dương.
          Khu vực HTML đã được chuyển sang chế độ rong biển an toàn.
        </p>

        <div class="poo-ticket">
          <div>
            <span>Lý do</span>
            <strong>${reasonLabel}</strong>
          </div>
          <div>
            <span>Tình trạng</span>
            <strong>Đang bị cá voi Poo nhìn chằm chằm 👀</strong>
          </div>
          <div>
            <span>Hình phạt</span>
            <strong>Nộp phạt 5 từ vựng + 1 câu Shadowing</strong>
          </div>
        </div>

        <div class="poo-evidence">
          <b>🫧 Bằng chứng:</b>
          <p>${line}</p>
        </div>

        <div class="poo-actions">
          <button id="poo-back-button" class="primary">
            Tôi chỉ lỡ tay, cho học tiếp 😭
          </button>
          <button id="poo-words-button" class="secondary">
            Nộp phạt 5 từ vựng 📝
          </button>
        </div>

        <p class="poo-note">
          Admin muốn debug production thì mở URL với <b>?poo_debug=1</b>.
        </p>
      </section>
    </main>
  `;

  const style = document.createElement("style");

  style.innerHTML = `
    html,
    body {
      margin: 0;
      width: 100%;
      min-height: 100%;
      overflow: hidden;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at 18% 12%, rgba(255, 179, 138, 0.55), transparent 26%),
        radial-gradient(circle at 82% 18%, rgba(143, 211, 255, 0.85), transparent 28%),
        radial-gradient(circle at 50% 100%, rgba(207, 239, 232, 0.9), transparent 38%),
        linear-gradient(135deg, #061a33 0%, #0f2747 42%, #123d68 100%);
    }

    #poo-decoy-page {
      position: relative;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      color: #0f2747;
      isolation: isolate;
    }

    #poo-decoy-page::before {
      content: "";
      position: absolute;
      inset: -20%;
      background:
        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
      background-size: 44px 44px;
      transform: rotate(-7deg);
      z-index: -2;
    }

    .poo-decoy-card {
      width: min(680px, calc(100vw - 28px));
      max-height: calc(100vh - 40px);
      overflow: auto;
      padding: 28px;
      border-radius: 34px;
      text-align: center;
      background: rgba(247, 251, 255, 0.88);
      border: 1px solid rgba(143, 211, 255, 0.75);
      box-shadow:
        0 30px 90px rgba(0, 0, 0, 0.34),
        inset 0 1px 0 rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(24px);
      animation: pooPop 0.45s ease-out both;
    }

    .poo-siren {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 9px 14px;
      border-radius: 999px;
      color: #ffffff;
      background: linear-gradient(135deg, #ff4d6d, #ff9f1c);
      box-shadow: 0 14px 34px rgba(255, 77, 109, 0.28);
      font-size: 13px;
      font-weight: 950;
      letter-spacing: 0.08em;
      animation: sirenBlink 0.85s infinite alternate;
    }

    .poo-radar {
      position: relative;
      width: 142px;
      height: 142px;
      margin: 22px auto 12px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle, rgba(143,211,255,0.18) 0 18%, transparent 19%),
        radial-gradient(circle, transparent 0 35%, rgba(47,128,237,0.18) 36% 37%, transparent 38%),
        radial-gradient(circle, transparent 0 62%, rgba(47,128,237,0.2) 63% 64%, transparent 65%),
        rgba(15, 39, 71, 0.92);
      border: 1px solid rgba(143, 211, 255, 0.75);
      box-shadow:
        0 20px 45px rgba(15, 39, 71, 0.22),
        inset 0 0 28px rgba(143, 211, 255, 0.22);
      overflow: hidden;
    }

    .poo-radar-line {
      position: absolute;
      width: 50%;
      height: 50%;
      left: 50%;
      top: 0;
      transform-origin: 0% 100%;
      background: linear-gradient(45deg, rgba(143, 211, 255, 0.7), transparent 62%);
      animation: radarSpin 1.45s linear infinite;
    }

    .poo-whale {
      position: relative;
      z-index: 2;
      width: 72px;
      height: 72px;
      display: grid;
      place-items: center;
      border-radius: 26px;
      font-size: 46px;
      background: linear-gradient(180deg, #eaf8ff, #bdeaff);
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,0.72),
        0 14px 25px rgba(0,0,0,0.18);
      animation: whaleBounce 1.2s ease-in-out infinite;
    }

    .poo-kicker {
      margin: 4px 0 8px;
      color: #2f80ed;
      font-size: 13px;
      font-weight: 950;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .poo-decoy-card h1 {
      margin: 0 auto 12px;
      max-width: 560px;
      color: #0f2747;
      font-size: clamp(32px, 6vw, 58px);
      line-height: 0.98;
      letter-spacing: -0.06em;
    }

    .poo-desc {
      margin: 0 auto 18px;
      max-width: 540px;
      color: rgba(15, 39, 71, 0.78);
      font-size: 16px;
      line-height: 1.65;
      font-weight: 750;
    }

    .poo-ticket {
      display: grid;
      gap: 10px;
      margin: 18px auto;
      max-width: 560px;
      text-align: left;
    }

    .poo-ticket > div {
      display: grid;
      gap: 4px;
      padding: 13px 15px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.7);
      border: 1px dashed rgba(47, 128, 237, 0.38);
    }

    .poo-ticket span {
      color: rgba(15, 39, 71, 0.52);
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .poo-ticket strong {
      color: #0f2747;
      font-size: 15px;
      line-height: 1.35;
    }

    .poo-evidence {
      margin: 16px auto 20px;
      max-width: 560px;
      padding: 16px;
      border-radius: 22px;
      color: #5b3413;
      background: linear-gradient(135deg, rgba(255,238,189,0.9), rgba(255,179,138,0.38));
      border: 1px solid rgba(255, 179, 138, 0.62);
      text-align: left;
    }

    .poo-evidence p {
      margin: 6px 0 0;
      font-size: 15px;
      line-height: 1.55;
      font-weight: 800;
    }

    .poo-actions {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
    }

    .poo-actions button {
      border: 0;
      cursor: pointer;
      border-radius: 999px;
      padding: 13px 18px;
      font-size: 14px;
      font-weight: 950;
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease;
    }

    .poo-actions button:hover {
      transform: translateY(-2px) scale(1.02);
    }

    .poo-actions .primary {
      color: #ffffff;
      background: linear-gradient(135deg, #2f80ed, #37b7ff);
      box-shadow: 0 16px 34px rgba(47, 128, 237, 0.28);
    }

    .poo-actions .secondary {
      color: #0f2747;
      background: #ffffff;
      border: 1px solid rgba(47, 128, 237, 0.22);
      box-shadow: 0 12px 26px rgba(15, 39, 71, 0.12);
    }

    .poo-note {
      margin: 18px 0 0;
      color: rgba(15, 39, 71, 0.55);
      font-size: 12px;
      line-height: 1.5;
      font-weight: 700;
    }

    .poo-bubble {
      position: absolute;
      bottom: -80px;
      width: 28px;
      height: 28px;
      border-radius: 999px;
      background: rgba(255,255,255,0.28);
      border: 1px solid rgba(255,255,255,0.45);
      animation: bubbleUp 6s linear infinite;
    }

    .bubble-1 {
      left: 12%;
      animation-delay: 0s;
    }

    .bubble-2 {
      left: 28%;
      width: 18px;
      height: 18px;
      animation-delay: 1.2s;
      animation-duration: 7.5s;
    }

    .bubble-3 {
      right: 22%;
      width: 36px;
      height: 36px;
      animation-delay: 0.6s;
      animation-duration: 8s;
    }

    .bubble-4 {
      right: 9%;
      width: 22px;
      height: 22px;
      animation-delay: 2s;
      animation-duration: 6.8s;
    }

    @keyframes pooPop {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.96) rotate(-1deg);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1) rotate(0);
      }
    }

    @keyframes sirenBlink {
      from {
        filter: brightness(1);
      }
      to {
        filter: brightness(1.26);
      }
    }

    @keyframes radarSpin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes whaleBounce {
      0%, 100% {
        transform: translateY(0) rotate(-3deg);
      }
      50% {
        transform: translateY(-7px) rotate(3deg);
      }
    }

    @keyframes bubbleUp {
      from {
        transform: translateY(0) scale(1);
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      to {
        transform: translateY(-120vh) scale(1.7);
        opacity: 0;
      }
    }

    @media (max-width: 640px) {
      #poo-decoy-page {
        padding: 14px;
      }

      .poo-decoy-card {
        padding: 22px 16px;
        border-radius: 28px;
      }

      .poo-siren {
        font-size: 11px;
      }

      .poo-radar {
        width: 118px;
        height: 118px;
      }

      .poo-whale {
        width: 62px;
        height: 62px;
        font-size: 40px;
      }
    }
  `;

  document.head.appendChild(style);

  document.getElementById("poo-back-button")?.addEventListener("click", () => {
    window.location.reload();
  });

  document.getElementById("poo-words-button")?.addEventListener("click", () => {
    window.location.href = "/words";
  });
}

export function usePooDecoyGuard() {
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
      if (document.documentElement.dataset.pooDecoyGuard === "1") return;

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
  }, []);
}
