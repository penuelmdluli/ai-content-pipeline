"use client"
import { useState } from "react"
import Link from "next/link"

const NICHES = [
  { emoji: "🌍", name: "African History & Mysteries", desc: "Deep dives into African empires, myths, and untold stories. Massive engagement on SA TikTok.", potential: "500K views/month" },
  { emoji: "💰", name: "SA Money & Finance", desc: "Investment tips, EasyEquities guides, property hacks in Zulu, Sotho & English.", potential: "300K views/month" },
  { emoji: "🤖", name: "AI & Tech Facts", desc: "Mind-blowing AI facts and tech trends explained simply. Global audience.", potential: "1M views/month" },
  { emoji: "🏥", name: "Health & Wellness SA", desc: "Natural remedies, fitness tips, mental health — tailored for SA audiences.", potential: "400K views/month" }
]

const PIPELINE_STEPS = [
  { step: "01", title: "Topic Research", desc: "Claude AI researches trending topics in your niche from TikTok, YouTube, and Google Trends", tool: "Claude API + Google Trends" },
  { step: "02", title: "Script Generation", desc: "AI writes a compelling 45-60 second script optimised for retention and virality", tool: "Claude API (your React app)" },
  { step: "03", title: "Voice Generation", desc: "ElevenLabs converts the script to natural-sounding voiceover in any SA language", tool: "ElevenLabs API" },
  { step: "04", title: "Avatar Animation", desc: "Kling Avatar 2.0 lip-syncs a virtual presenter to the audio", tool: "Kling Avatar 2.0" },
  { step: "05", title: "Video Assembly", desc: "Auto-add captions, background music, B-roll overlays via CapCut API", tool: "CapCut Automation" },
  { step: "06", title: "Auto-Publish", desc: "Schedule and publish to TikTok, YouTube Shorts, and Instagram Reels simultaneously", tool: "Social Media APIs" }
]

export default function ContentPipelineLanding() {
  const [activeNiche, setActiveNiche] = useState(0)

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 30% 20%, #0d0d3320 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #1a0d2020 0%, transparent 50%)"
      }} />

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-white/5">
        <div className="font-black text-xl">
          <span className="text-[#39FF14]">AI</span>Content<span className="text-[#39FF14]">Pipeline</span>
        </div>
        <Link href="/dashboard" className="bg-[#39FF14] text-black font-black px-5 py-2.5 rounded-lg text-sm hover:bg-green-300 transition-colors">
          Open Studio →
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative z-10 px-6 pt-20 pb-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 border border-[#39FF14]/30 text-[#39FF14] text-xs px-4 py-2 rounded-full mb-8 bg-[#39FF14]/5 tracking-widest">
          ⚡ FULLY AUTOMATED · 3 VIDEOS/DAY · ZERO MANUAL WORK
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-none mb-6">
          Your AI Video<br />
          <span className="text-[#39FF14]" style={{ textShadow: "0 0 40px #39FF1488" }}>Factory</span><br />
          Never Sleeps
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Generate, voice, animate, and publish faceless videos to TikTok, YouTube, and Instagram — 100% automatically. Go from zero to 3 videos per day without touching your phone.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
          {[{v:"3",l:"Videos/Day"},{v:"6",l:"Platforms"},{v:"11",l:"SA Languages"},{v:"100%",l:"Automated"}].map((s,i)=>(
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-3xl font-black text-[#39FF14]">{s.v}</div>
              <div className="text-xs text-slate-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
        <Link href="/dashboard" className="inline-block bg-[#39FF14] text-black font-black px-8 py-4 rounded-xl text-lg hover:bg-green-300 transition-all hover:scale-105">
          Start Your Content Factory →
        </Link>
      </section>

      {/* PIPELINE */}
      <section className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
        <h2 className="text-4xl font-black text-center mb-12">The 6-Step Pipeline</h2>
        <div className="space-y-4">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} className="flex gap-6 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#39FF14]/30 transition-all">
              <div className="text-4xl font-black text-[#39FF14]/30 font-mono leading-none w-12 shrink-0">{step.step}</div>
              <div className="flex-1">
                <h3 className="font-black text-lg mb-1">{step.title}</h3>
                <p className="text-slate-400 text-sm mb-2">{step.desc}</p>
                <span className="text-xs bg-[#39FF14]/10 text-[#39FF14] px-2 py-1 rounded font-mono">{step.tool}</span>
              </div>
              <div className="text-2xl">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* NICHES */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-4xl font-black text-center mb-12">Choose Your Niche</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {NICHES.map((niche, i) => (
            <div key={i} onClick={() => setActiveNiche(i)}
              className={`bg-white/5 border rounded-xl p-6 cursor-pointer transition-all ${activeNiche === i ? "border-[#39FF14]/60 bg-[#39FF14]/5" : "border-white/10 hover:border-white/20"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{niche.emoji}</div>
                <span className="text-xs text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 rounded">{niche.potential}</span>
              </div>
              <h3 className="font-black text-lg mb-2">{niche.name}</h3>
              <p className="text-slate-400 text-sm">{niche.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 px-6 py-8 text-center text-sm text-slate-600">
        <div className="font-black text-white mb-2"><span className="text-[#39FF14]">AI</span>ContentPipeline</div>
        <p>© 2026 · Built for SA Content Creators 🇿🇦</p>
      </footer>
    </div>
  )
}
