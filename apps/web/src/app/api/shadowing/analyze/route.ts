import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ShadowingRequest = {
  targetText?: string;
  transcript?: string;
  level?: "beginner" | "a1" | "a2" | "b1";
};

function fallback() {
  return {
    ok: true,
    summary: "Bạn đã hoàn thành lượt luyện nói này rồi đó.",
    good: ["Bạn đã dám nói lại câu mẫu, đây là bước rất tốt."],
    fix: ["Hãy thử nói chậm và rõ hơn một chút."],
    retryText: "Luyện lại câu này thêm một lần nhé.",
    score: 70,
  };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        summary: "Poo chưa được kết nối AI góp ý.",
        good: [],
        fix: [],
        retryText: "Bạn cần thêm GEMINI_API_KEY trong .env.local rồi chạy lại web.",
        score: 0,
      });
    }

    const body = (await req.json()) as ShadowingRequest;

    const targetText = body.targetText || "";
    const transcript = body.transcript || "";
    const level = body.level || "beginner";

    if (!targetText) {
      return NextResponse.json({
        ok: false,
        summary: "Poo chưa thấy câu mẫu để so sánh.",
        good: [],
        fix: [],
        retryText: "Hãy chọn một câu luyện rồi thử lại nhé.",
        score: 0,
      });
    }

    const prompt = `
Bạn là Poo, một chú cá voi thân thiện giúp người Việt mới bắt đầu luyện nói tiếng Anh.

Câu mẫu:
"${targetText}"

Người học nói được hệ thống nghe thành:
"${transcript || "Chưa nghe được rõ nội dung."}"

Trình độ: ${level}

Hãy so sánh câu người học nói với câu mẫu và trả về JSON thuần:
{
  "summary": "một câu nhận xét ngắn",
  "good": ["điểm tốt 1", "điểm tốt 2"],
  "fix": ["điểm cần luyện 1", "điểm cần luyện 2"],
  "retryText": "câu nhắc luyện lại",
  "score": 0-100
}

Yêu cầu:
- Viết bằng tiếng Việt.
- Giọng thân thiện.
- Phù hợp người mất gốc.
- Không dùng từ kỹ thuật.
- Không chê nặng.
- Góp ý ngắn, dễ hiểu.
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json(fallback());
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(fallback());
    }

    let parsed: any;

    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(fallback());
    }

    return NextResponse.json({
      ok: true,
      summary: parsed.summary || "Bạn đã luyện xong câu này rồi.",
      good: Array.isArray(parsed.good) ? parsed.good : ["Bạn đã hoàn thành lượt nói."],
      fix: Array.isArray(parsed.fix) ? parsed.fix : ["Hãy thử nói chậm và rõ hơn một chút."],
      retryText: parsed.retryText || "Luyện lại câu này thêm một lần nhé.",
      score: typeof parsed.score === "number" ? parsed.score : 70,
    });
  } catch {
    return NextResponse.json(fallback());
  }
}