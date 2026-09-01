import fs from "node:fs";

function readEnvValue(file, key) {
  if (!fs.existsSync(file)) return "";
  const raw = fs.readFileSync(file, "utf8");
  const line = raw
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith(`${key}=`));
  if (!line) return "";
  return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
}

const key =
  process.env.GEMINI_API_KEY ||
  readEnvValue(".env.local", "GEMINI_API_KEY");

if (!key) {
  console.error("GEMINI_API_KEY: MISSING");
  console.error("Hãy mở .env.local và thêm: GEMINI_API_KEY=AIza...");
  process.exit(1);
}

console.log("GEMINI_API_KEY: FOUND");
console.log("Testing Gemini API...");

const res = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "Reply with exactly: GEMINI_OK"
            }
          ]
        }
      ]
    })
  }
);

const text = await res.text();

if (!res.ok) {
  console.error("Gemini API: FAILED");
  console.error("HTTP status:", res.status);
  console.error(text.slice(0, 1200));
  process.exit(1);
}

let data;
try {
  data = JSON.parse(text);
} catch {
  console.error("Gemini API: FAILED - response is not JSON");
  console.error(text.slice(0, 1200));
  process.exit(1);
}

const output =
  data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "";

console.log("Gemini API: OK");
console.log("Model response:", output);
