import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const { niche, language, tone, topic } = await req.json()

    const prompt = `You are an expert viral short-form video script writer for South African social media (TikTok, YouTube Shorts, Instagram Reels).

Write a compelling 45-60 second video script for a FACELESS AI avatar video.

NICHE: ${niche}
LANGUAGE: ${language}
TONE: ${tone}
TOPIC: ${topic || "Choose the most trending/interesting topic in this niche right now"}

FORMAT your script EXACTLY like this:
[HOOK - 0-3 seconds]
<The most shocking/compelling opening line that stops the scroll>

[BODY - 3-45 seconds]
<Main content broken into short punchy sentences. Max 2 lines per sentence. Build curiosity.>

[CTA - 45-60 seconds]
<Call to action: follow, like, share, comment>

RULES:
- Hook must be shocking or create immediate curiosity
- Write in ${language} (if not English, keep it authentic)
- Short sentences. High energy. 
- Use "you" to address the viewer directly
- Include 2-3 specific facts or numbers to add credibility
- Total script should take 45-60 seconds to read aloud`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }]
    })

    const script = response.content[0].type === "text" ? response.content[0].text : ""
    return NextResponse.json({ script })
  } catch (err) {
    console.error("Script generation error:", err)
    return NextResponse.json({ error: "Failed to generate script" }, { status: 500 })
  }
}
