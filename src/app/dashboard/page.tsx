"use client"
import { useState } from "react"

const NICHES = ["African History", "SA Money & Finance", "AI & Tech Facts", "Health & Wellness"]
const LANGUAGES = ["English", "Zulu", "Sotho", "Afrikaans", "Xhosa"]
const TONES = ["Educational", "Shocking", "Inspirational", "Funny", "Mysterious"]

const SCHEDULE = [
  { time: "06:00", title: "Top 5 African Kingdoms You Never Learned About", niche: "African History", status: "published", platform: "TikTok + YT Shorts", views: "12.4K" },
  { time: "12:00", title: "How to Invest R500/Month on EasyEquities", niche: "SA Finance", status: "published", platform: "TikTok + IG Reels", views: "8.2K" },
  { time: "18:00", title: "AI Just Changed Everything About Your Job", niche: "AI & Tech", status: "scheduled", platform: "All Platforms", views: "—" }
]

export default function ContentDashboard() {
  const [tab, setTab] = useState("generate")
  const [niche, setNiche] = useState("African History")
  const [language, setLanguage] = useState("English")
  const [tone, setTone] = useState("Educational")
  const [topic, setTopic] = useState("")
  const [script, setScript] = useState("")
  const [loading, setLoading] = useState(false)

  const generateScript = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, language, tone, topic })
      })
      const data = await res.json()
      setScript(data.script || "")
    } catch {
      setScript("Error generating script. Check your API key.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white flex">
      <aside className="w-56 border-r border-white/10 p-5 flex flex-col gap-1 fixed h-full">
        <div className="font-black text-sm mb-8 text-[#39FF14]">AI Content Studio</div>
        {[["generate","✍️","Script Generator"],["schedule","📅","Schedule"],["analytics","📊","Analytics"],["channels","📺","Channels"],["settings","⚙️","Settings"]].map(([id,icon,label])=>(
          <button key={id} onClick={() => setTab(id as string)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${tab === id ? "bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30" : "text-slate-500 hover:text-slate-300"}`}>
            {icon} {label}
          </button>
        ))}
      </aside>
      <main className="ml-56 flex-1 p-8">
        {tab === "generate" && (
          <div className="max-w-3xl">
            <h1 className="text-2xl font-black mb-8">Script Generator</h1>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "NICHE", value: niche, options: NICHES, set: setNiche },
                { label: "LANGUAGE", value: language, options: LANGUAGES, set: setLanguage },
                { label: "TONE", value: tone, options: TONES, set: setTone }
              ].map(({ label, value, options, set }) => (
                <div key={label}>
                  <div className="text-xs text-slate-500 tracking-widest mb-2">{label}</div>
                  <select value={value} onChange={e => set(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#39FF14]/40">
                    {options.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <div className="text-xs text-slate-500 tracking-widest mb-2">TOPIC (optional — AI will choose if blank)</div>
              <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. The Great Zimbabwe Empire..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]/40 placeholder-slate-600" />
            </div>
            <button onClick={generateScript} disabled={loading}
              className="w-full bg-[#39FF14] text-black font-black py-3 rounded-xl hover:bg-green-300 transition-colors disabled:opacity-50 mb-6">
              {loading ? "Generating Script..." : "⚡ Generate Script"}
            </button>
            {script && (
              <div className="bg-white/5 border border-[#39FF14]/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-[#39FF14] tracking-widest">GENERATED SCRIPT</div>
                  <div className="flex gap-2">
                    <button className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded hover:border-white/20 transition-colors">Copy</button>
                    <button className="text-xs bg-[#39FF14]/20 border border-[#39FF14]/30 text-[#39FF14] px-3 py-1.5 rounded">→ Generate Voice</button>
                  </div>
                </div>
                <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">{script}</pre>
              </div>
            )}
          </div>
        )}
        {tab === "schedule" && (
          <div>
            <h1 className="text-2xl font-black mb-8">Today's Schedule</h1>
            <div className="space-y-4">
              {SCHEDULE.map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-6">
                  <div className="text-[#39FF14] font-mono font-bold text-sm w-14">{item.time}</div>
                  <div className="flex-1">
                    <div className="font-bold mb-1">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.niche} · {item.platform}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold px-2 py-1 rounded ${item.status === "published" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {item.status}
                    </div>
                    {item.views !== "—" && <div className="text-sm text-slate-400 mt-1">{item.views} views</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
