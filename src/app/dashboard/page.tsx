"use client"
import { useState } from "react"

const NICHES = [
  { id: "african-history", name: "African History", icon: "🌍", color: "#FFD700", platform: "TikTok + YouTube" },
  { id: "sa-money", name: "SA Money & Finance", icon: "💰", color: "#00FF88", platform: "TikTok + YouTube" },
  { id: "did-you-know", name: "Did You Know", icon: "🧠", color: "#00E5FF", platform: "TikTok + Shorts" },
  { id: "motivation-africa", name: "African Motivation", icon: "⚡", color: "#FF00AA", platform: "TikTok + YouTube" }
]

interface Script {
  title: string; hook: string; script: string;
  hashtags: string[]; thumbnail_text: string;
  duration_estimate: string; call_to_action: string
}

export default function ContentDashboard() {
  const [selectedNiche, setSelectedNiche] = useState("african-history")
  const [topic, setTopic] = useState("")
  const [script, setScript] = useState<Script | null>(null)
  const [loading, setLoading] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const [scripts, setScripts] = useState<Script[]>([])
  const [activeTab, setActiveTab] = useState<"single"|"batch"|"schedule">("single")

  const generateScript = async () => {
    setLoading(true)
    setScript(null)
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: selectedNiche, topic })
      })
      const data = await res.json()
      if (data.success) setScript(data.script)
      else alert(data.error)
    } catch (e) { alert("Generation failed") } finally { setLoading(false) }
  }

  const generateBatch = async (count: number) => {
    setBatchLoading(true)
    try {
      const res = await fetch("/api/batch-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: selectedNiche, count })
      })
      const data = await res.json()
      if (data.success) setScripts(prev => [...data.scripts, ...prev])
    } catch (e) { alert("Batch failed") } finally { setBatchLoading(false) }
  }

  const niche = NICHES.find(n => n.id === selectedNiche)!

  return (
    <div className="min-h-screen bg-[#060612] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black">🎬 Content Factory</h1>
            <p className="text-gray-500 text-sm mt-1">AI-powered video script generator</p>
          </div>
          <div className="flex gap-3">
            {(["single","batch","schedule"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`text-sm px-4 py-2 rounded-lg transition-colors ${activeTab === tab ? "bg-[#8B5CF6] text-white" : "bg-[#0d0d0d] text-gray-400 hover:text-white border border-[#1a1a1a]"}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Niche Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {NICHES.map(n => (
            <button key={n.id} onClick={() => setSelectedNiche(n.id)}
              className={`p-5 rounded-xl border transition-all text-left ${selectedNiche === n.id ? "border-[#8B5CF6] bg-[#8B5CF611]" : "border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#333]"}`}>
              <div className="text-2xl mb-2">{n.icon}</div>
              <div className="font-bold text-sm mb-1">{n.name}</div>
              <div className="text-xs text-gray-500">{n.platform}</div>
            </button>
          ))}
        </div>

        {activeTab === "single" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6">
              <h2 className="font-bold mb-4">Generate Script</h2>
              <div className="mb-4">
                <label className="text-xs text-gray-500 tracking-widest block mb-2">NICHE</label>
                <div className="flex items-center gap-2 bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3">
                  <span>{niche.icon}</span>
                  <span className="font-bold text-sm" style={{ color: niche.color }}>{niche.name}</span>
                </div>
              </div>
              <div className="mb-6">
                <label className="text-xs text-gray-500 tracking-widest block mb-2">SPECIFIC TOPIC (OPTIONAL)</label>
                <input value={topic} onChange={e => setTopic(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#8B5CF644]"
                  placeholder="e.g. The Kingdom of Mali, EasyEquities tips..." />
              </div>
              <button onClick={generateScript} disabled={loading}
                className="w-full bg-[#8B5CF6] text-white font-black py-3 rounded-lg hover:bg-[#7C3AED] transition-colors disabled:opacity-50">
                {loading ? "✨ Generating..." : "Generate Script →"}
              </button>
            </div>

            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6">
              {script ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold">Generated Script</h2>
                    <span className="text-xs bg-[#00FF8811] text-[#00FF88] px-2 py-1 rounded">{script.duration_estimate}</span>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">TITLE</div>
                    <div className="font-bold text-sm text-[#8B5CF6]">{script.title}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">THUMBNAIL TEXT</div>
                    <div className="font-black text-lg text-[#FFD700]">{script.thumbnail_text}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">SCRIPT</div>
                    <div className="bg-[#141414] rounded-lg p-3 text-sm text-gray-300 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">{script.script}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">HASHTAGS</div>
                    <div className="flex flex-wrap gap-1">{script.hashtags?.map((h,i) => <span key={i} className="text-xs bg-[#8B5CF611] text-[#8B5CF6] px-2 py-0.5 rounded">#{h}</span>)}</div>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(script.script) }}
                    className="w-full bg-[#141414] border border-[#2a2a2a] text-sm py-2 rounded-lg hover:border-[#8B5CF644] transition-colors mt-2">
                    📋 Copy Script
                  </button>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎬</div>
                    <p>Your script will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "batch" && (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold mb-1">Batch Generate</h2>
                <p className="text-sm text-gray-500">Generate a week of content at once</p>
              </div>
              <div className="flex gap-3">
                {[3,7,10].map(n => (
                  <button key={n} onClick={() => generateBatch(n)} disabled={batchLoading}
                    className="bg-[#8B5CF6] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#7C3AED] disabled:opacity-50">
                    {batchLoading ? "..." : `Generate ${n} Scripts`}
                  </button>
                ))}
              </div>
            </div>
            {scripts.length > 0 ? (
              <div className="space-y-3">
                {scripts.map((s, i) => (
                  <div key={i} className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm">{s.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.hook?.substring(0,80)}...</div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs bg-[#8B5CF611] text-[#8B5CF6] px-2 py-1 rounded">{s.duration_estimate}</span>
                        <button onClick={() => navigator.clipboard.writeText(s.script)} className="text-xs bg-[#1a1a1a] px-3 py-1 rounded hover:bg-[#222]">Copy</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <div className="text-4xl mb-3">📝</div>
                <p>Click a batch button to generate multiple scripts at once</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6">
            <h2 className="font-bold mb-2">Publishing Schedule</h2>
            <p className="text-sm text-gray-500 mb-6">Coming soon — auto-post to TikTok, YouTube Shorts, and Instagram Reels</p>
            <div className="grid grid-cols-7 gap-2">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => (
                <div key={day} className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-2">{day}</div>
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="bg-[#8B5CF611] border border-[#8B5CF622] rounded text-xs p-1 mb-1 text-[#8B5CF6]">
                      {["09:00","14:00","19:00"][j]} 🎬
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-4 text-center">21 videos/week · 3 per day · Automated publishing (n8n integration)</p>
          </div>
        )}
      </div>
    </div>
  )
}
