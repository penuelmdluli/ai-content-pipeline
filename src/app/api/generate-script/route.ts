import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const NICHES: Record<string, { system: string; hooks: string[] }> = {
  "african-history": {
    system: "You create viral short-form video scripts about African history. Style: Shocking opener → suspense → reveal → mind-blown ending. 45-90 seconds.",
    hooks: ["Did you know Africa had a civilization older than Egypt?","The story they never taught in school...","This African queen defeated three colonial armies...","Why this African kingdom terrified Rome..."]
  },
  "sa-money": {
    system: "You create viral finance scripts for South Africans. Mix English with Zulu/Afrikaans phrases. Relatable problem → solution → actionable tip → CTA. 45-75 seconds.",
    hooks: ["This is why your salary disappears by the 15th...","I made R5,000 this month without a job - here's how...","The tax hack SARS doesn't advertise...","This EasyEquities strategy turns R500 into R5,000..."]
  },
  "did-you-know": {
    system: "You create viral Did You Know fact videos. 3-5 mind-blowing facts per video. 30-60 seconds. Make every sentence shareable.",
    hooks: ["Did you know honey is 3,000 years old and never expires?","The human brain generates enough electricity to power a bulb...","Did you know trees talk to each other underground?"]
  },
  "motivation-africa": {
    system: "You create motivational scripts for African entrepreneurs. Include African proverbs. Relatable struggle → mindset shift → powerful truth → CTA. 45-90 seconds.",
    hooks: ["Nobody is coming to save you. That's the best news today.","Ubuntu will make you rich if you understand it...","Stop waiting for the right time. The right time is a lie."]
  }
}

export async function POST(req: NextRequest) {
  try {
    const { niche, topic, customHook } = await req.json()
    if (!niche || !NICHES[niche]) return NextResponse.json({ error: "Invalid niche" }, { status: 400 })

    const config = NICHES[niche]
    const hook = customHook || config.hooks[Math.floor(Math.random() * config.hooks.length)]

    const prompt = `Generate a short-form video script.
HOOK: "${hook}"
${topic ? `TOPIC: ${topic}` : ""}

Return ONLY valid JSON (no markdown):
{"title":"...","hook":"...","script":"full script with [PAUSE] markers","hashtags":["tag1","tag2","tag3","tag4","tag5"],"thumbnail_text":"3-5 bold words","duration_estimate":"60 seconds","call_to_action":"follow for more"}`

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514", max_tokens: 800,
      system: config.system,
      messages: [{ role: "user", content: prompt }]
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    const script = JSON.parse(text.replace(/```json|```/g, "").trim())
    return NextResponse.json({ success: true, script, niche })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
