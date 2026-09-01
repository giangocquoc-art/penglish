import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        transcript: "",
        message: "Poo chưa được kết nối phần nghe giọng nói.",
      });
    }

    const formData = await req.formData();
    const audio = formData.get("audio");

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json({
        ok: false,
        transcript: "",
        message: "Poo chưa nhận được file ghi âm.",
      });
    }

    const groqForm = new FormData();
    groqForm.append("file", audio, "shadowing.webm");
    groqForm.append("model", "whisper-large-v3-turbo");
    groqForm.append("language", "en");
    groqForm.append("response_format", "json");

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: groqForm,
    });

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        transcript: "",
        message: "Poo chưa nghe rõ. Bạn thử nói lại chậm hơn nhé.",
      });
    }

    const data = await res.json();

    return NextResponse.json({
      ok: true,
      transcript: data.text || "",
    });
  } catch {
    return NextResponse.json({
      ok: false,
      transcript: "",
      message: "Poo gặp chút trục trặc khi nghe giọng của bạn.",
    });
  }
}