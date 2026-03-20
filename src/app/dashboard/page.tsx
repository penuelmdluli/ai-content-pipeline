"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

const NICHES = ["African History", "SA Money & Finance", "AI & Tech Facts", "Health & Wellness"]
const LANGUAGES = ["English", "Zulu", "Sotho", "Afrikaans", "Xhosa"]
const TONES = ["Educational", "Shocking", "Inspirational", "Funny", "Mysterious"]
const STATUSES = ["draft", "approved", "voiced", "animated", "published"]
const PLATFORMS = ["tiktok", "youtube_shorts", "instagram_reels"]

type Script = {
  id: string
  niche: string
  language: string
  tone: string
  topic: string | null
  content: string
  hook: string | null
  body: string | null
  cta: string | null
  status: string
  created_at: string
}

type VideoJob = {
  id: string
  script_id: string
  status: string
  voice_url: string | null
  video_url: string | null
  final_url: string | null
  error_message: string | null
  created_at: string
  completed_at: string | null
  scripts?: { topic: string | null; niche: string; content: string }
}

type ScheduleEntry = {
  id: string
  video_job_id: string | null
  platforms: string[]
  scheduled_for: string
  published_at: string | null
  status: string
  created_at: string
  video_jobs?: { scripts?: { topic: string | null; niche: string } } | null
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-400",
  approved: "bg-blue-500/20 text-blue-400",
  voiced: "bg-purple-500/20 text-purple-400",
  animated: "bg-orange-500/20 text-orange-400",
  published: "bg-green-500/20 text-green-400",
  pending: "bg-slate-500/20 text-slate-400",
  voicing: "bg-purple-500/20 text-purple-400",
  animating: "bg-orange-500/20 text-orange-400",
  editing: "bg-yellow-500/20 text-yellow-400",
  done: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
  scheduled: "bg-blue-500/20 text-blue-400",
}

const PIPELINE_STEPS = ["pending", "voicing", "animating", "editing", "done"]

export default function ContentDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState("generate")

  // Generate tab state
  const [niche, setNiche] = useState("African History")
  const [language, setLanguage] = useState("English")
  const [tone, setTone] = useState("Educational")
  const [topic, setTopic] = useState("")
  const [script, setScript] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ttsLoading, setTtsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [savedScriptId, setSavedScriptId] = useState<string | null>(null)

  // History tab state
  const [scripts, setScripts] = useState<Script[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [filterNiche, setFilterNiche] = useState("")
  const [filterLang, setFilterLang] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  // Video jobs tab state
  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)

  // Schedule tab state
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [showAddSchedule, setShowAddSchedule] = useState(false)
  const [newScheduleDate, setNewScheduleDate] = useState("")
  const [newScheduleTime, setNewScheduleTime] = useState("06:00")
  const [newSchedulePlatforms, setNewSchedulePlatforms] = useState<string[]>(["tiktok", "youtube_shorts"])

  // Auth
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.email) setUserEmail(d.user.email)
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  // Generate script
  const generateScript = async () => {
    setLoading(true)
    setAudioUrl(null)
    setSavedScriptId(null)
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, language, tone, topic }),
      })
      const data = await res.json()
      setScript(data.script || "")
    } catch {
      setScript("Error generating script. Check your API key.")
    }
    setLoading(false)
  }

  // Save script to Supabase
  const saveScript = async () => {
    if (!script) return
    setSaving(true)
    try {
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, language, tone, topic, content: script }),
      })
      const data = await res.json()
      if (res.ok && data.script) {
        setSavedScriptId(data.script.id)
      }
    } catch {
      // silent fail
    }
    setSaving(false)
  }

  // Generate TTS
  const generateVoice = async () => {
    if (!script) return
    setTtsLoading(true)
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          language,
          script_id: savedScriptId,
        }),
      })
      const data = await res.json()
      if (res.ok && data.audio_url) {
        setAudioUrl(data.audio_url)
      }
    } catch {
      // silent fail
    }
    setTtsLoading(false)
  }

  // Copy to clipboard
  const copyScript = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Fetch scripts history
  const fetchScripts = useCallback(async () => {
    setHistoryLoading(true)
    const params = new URLSearchParams()
    if (filterNiche) params.set("niche", filterNiche)
    if (filterLang) params.set("language", filterLang)
    if (filterStatus) params.set("status", filterStatus)
    try {
      const res = await fetch(`/api/scripts?${params}`)
      const data = await res.json()
      if (res.ok) setScripts(data.scripts || [])
    } catch {
      // silent
    }
    setHistoryLoading(false)
  }, [filterNiche, filterLang, filterStatus])

  // Delete script
  const deleteScript = async (id: string) => {
    try {
      await fetch(`/api/scripts/${id}`, { method: "DELETE" })
      setScripts((prev) => prev.filter((s) => s.id !== id))
    } catch {
      // silent
    }
  }

  // Update script status
  const updateScriptStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/scripts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setScripts((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
      }
    } catch {
      // silent
    }
  }

  // Fetch video jobs
  const fetchVideoJobs = useCallback(async () => {
    setJobsLoading(true)
    try {
      const res = await fetch("/api/video-jobs")
      const data = await res.json()
      if (res.ok) setVideoJobs(data.jobs || [])
    } catch {
      // silent
    }
    setJobsLoading(false)
  }, [])

  // Fetch schedule
  const fetchSchedule = useCallback(async () => {
    setScheduleLoading(true)
    try {
      const res = await fetch("/api/schedule")
      const data = await res.json()
      if (res.ok) setScheduleEntries(data.entries || [])
    } catch {
      // silent
    }
    setScheduleLoading(false)
  }, [])

  // Add schedule entry
  const addScheduleEntry = async () => {
    if (!newScheduleDate || !newScheduleTime) return
    const scheduled_for = `${newScheduleDate}T${newScheduleTime}:00`
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platforms: newSchedulePlatforms,
          scheduled_for,
        }),
      })
      if (res.ok) {
        setShowAddSchedule(false)
        setNewScheduleDate("")
        setNewScheduleTime("06:00")
        fetchSchedule()
      }
    } catch {
      // silent
    }
  }

  // Delete schedule entry
  const deleteScheduleEntry = async (id: string) => {
    try {
      await fetch(`/api/schedule/${id}`, { method: "DELETE" })
      setScheduleEntries((prev) => prev.filter((e) => e.id !== id))
    } catch {
      // silent
    }
  }

  // Load data when switching tabs
  useEffect(() => {
    if (tab === "history") fetchScripts()
  }, [tab, fetchScripts])

  useEffect(() => {
    if (tab === "video-jobs") fetchVideoJobs()
  }, [tab, fetchVideoJobs])

  useEffect(() => {
    if (tab === "schedule") fetchSchedule()
  }, [tab, fetchSchedule])

  const SIDEBAR_ITEMS: [string, string, string][] = [
    ["generate", "\u270D\uFE0F", "Script Generator"],
    ["history", "\uD83D\uDCDC", "Script History"],
    ["video-jobs", "\uD83C\uDFAC", "Video Jobs"],
    ["schedule", "\uD83D\uDCC5", "Schedule"],
    ["analytics", "\uD83D\uDCCA", "Analytics"],
    ["settings", "\u2699\uFE0F", "Settings"],
  ]

  // Calendar helpers
  const getCalendarDays = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return { days, year, month }
  }

  const getEntriesForDay = (day: number, month: number, year: number) => {
    return scheduleEntries.filter((e) => {
      const d = new Date(e.scheduled_for)
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
    })
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-white/10 p-5 flex flex-col fixed h-full">
        <div className="font-black text-sm mb-8 text-[#39FF14]">AI Content Studio</div>
        <div className="flex flex-col gap-1 flex-1">
          {SIDEBAR_ITEMS.map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                tab === id
                  ? "bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        {/* User info */}
        <div className="border-t border-white/10 pt-4 mt-4">
          {userEmail && (
            <div className="text-xs text-slate-500 truncate mb-2" title={userEmail}>
              {userEmail}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-8">
        {/* ====== GENERATE TAB ====== */}
        {tab === "generate" && (
          <div className="max-w-3xl">
            <h1 className="text-2xl font-black mb-8">Script Generator</h1>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "NICHE", value: niche, options: NICHES, set: setNiche },
                { label: "LANGUAGE", value: language, options: LANGUAGES, set: setLanguage },
                { label: "TONE", value: tone, options: TONES, set: setTone },
              ].map(({ label, value, options, set }) => (
                <div key={label}>
                  <div className="text-xs text-slate-500 tracking-widest mb-2">{label}</div>
                  <select
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#39FF14]/40"
                  >
                    {options.map((o) => (
                      <option key={o} value={o} className="bg-slate-900">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <div className="text-xs text-slate-500 tracking-widest mb-2">
                TOPIC (optional -- AI will choose if blank)
              </div>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. The Great Zimbabwe Empire..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]/40 placeholder-slate-600"
              />
            </div>
            <button
              onClick={generateScript}
              disabled={loading}
              className="w-full bg-[#39FF14] text-black font-black py-3 rounded-xl hover:bg-green-300 transition-colors disabled:opacity-50 mb-6"
            >
              {loading ? "Generating Script..." : "Generate Script"}
            </button>

            {script && (
              <div className="bg-white/5 border border-[#39FF14]/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-[#39FF14] tracking-widest">GENERATED SCRIPT</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyScript(script)}
                      className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded hover:border-white/20 transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={saveScript}
                      disabled={saving || !!savedScriptId}
                      className="text-xs bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded disabled:opacity-50"
                    >
                      {savedScriptId ? "Saved" : saving ? "Saving..." : "Save to Library"}
                    </button>
                    <button
                      onClick={generateVoice}
                      disabled={ttsLoading}
                      className="text-xs bg-[#39FF14]/20 border border-[#39FF14]/30 text-[#39FF14] px-3 py-1.5 rounded disabled:opacity-50"
                    >
                      {ttsLoading ? "Generating..." : "Generate Voice"}
                    </button>
                  </div>
                </div>
                <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                  {script}
                </pre>

                {audioUrl && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-[#39FF14] tracking-widest mb-3">GENERATED AUDIO</div>
                    <audio controls src={audioUrl} className="w-full" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ====== HISTORY TAB ====== */}
        {tab === "history" && (
          <div>
            <h1 className="text-2xl font-black mb-6">Script History</h1>

            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <select
                value={filterNiche}
                onChange={(e) => setFilterNiche(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#39FF14]/40"
              >
                <option value="" className="bg-slate-900">All Niches</option>
                {NICHES.map((n) => (
                  <option key={n} value={n} className="bg-slate-900">{n}</option>
                ))}
              </select>
              <select
                value={filterLang}
                onChange={(e) => setFilterLang(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#39FF14]/40"
              >
                <option value="" className="bg-slate-900">All Languages</option>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l} className="bg-slate-900">{l}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#39FF14]/40"
              >
                <option value="" className="bg-slate-900">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900">{s}</option>
                ))}
              </select>
              <button
                onClick={fetchScripts}
                className="bg-[#39FF14]/20 border border-[#39FF14]/30 text-[#39FF14] px-4 py-2 rounded-lg text-sm hover:bg-[#39FF14]/30 transition-colors"
              >
                Refresh
              </button>
            </div>

            {historyLoading ? (
              <div className="text-center text-slate-500 py-12">Loading scripts...</div>
            ) : scripts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-600 text-lg mb-2">No scripts yet</div>
                <p className="text-slate-500 text-sm">
                  Generate a script and save it to see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {scripts.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[s.status] || ""}`}>
                            {s.status}
                          </span>
                          <span className="text-xs text-slate-500">{s.niche}</span>
                          <span className="text-xs text-slate-600">{s.language}</span>
                          <span className="text-xs text-slate-600">{s.tone}</span>
                        </div>
                        {s.topic && (
                          <div className="text-sm font-bold mb-1 truncate">{s.topic}</div>
                        )}
                        <div className="text-xs text-slate-500 line-clamp-2">
                          {s.content.slice(0, 200)}...
                        </div>
                        <div className="text-xs text-slate-600 mt-2">
                          {new Date(s.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => copyScript(s.content)}
                          className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded hover:border-white/20 transition-colors"
                        >
                          Copy
                        </button>
                        <select
                          value={s.status}
                          onChange={(e) => updateScriptStatus(s.id, e.target.value)}
                          className="text-xs bg-white/5 border border-white/10 px-2 py-1.5 rounded text-white focus:outline-none"
                        >
                          {STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-slate-900">{st}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => deleteScript(s.id)}
                          className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====== VIDEO JOBS TAB ====== */}
        {tab === "video-jobs" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black">Video Jobs</h1>
              <button
                onClick={fetchVideoJobs}
                className="bg-[#39FF14]/20 border border-[#39FF14]/30 text-[#39FF14] px-4 py-2 rounded-lg text-sm"
              >
                Refresh
              </button>
            </div>

            {jobsLoading ? (
              <div className="text-center text-slate-500 py-12">Loading video jobs...</div>
            ) : videoJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-600 text-lg mb-2">No video jobs yet</div>
                <p className="text-slate-500 text-sm">
                  Generate a voice from a script to start a video job.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {videoJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-bold text-sm mb-1">
                          {job.scripts?.topic || job.scripts?.niche || "Untitled"}
                        </div>
                        <div className="text-xs text-slate-500">
                          Created {new Date(job.created_at).toLocaleString()}
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded ${STATUS_COLORS[job.status] || ""}`}>
                        {job.status}
                      </span>
                    </div>

                    {/* Pipeline progress */}
                    <div className="flex items-center gap-1">
                      {PIPELINE_STEPS.map((step, i) => {
                        const stepIndex = PIPELINE_STEPS.indexOf(job.status)
                        const isComplete = i <= stepIndex
                        const isCurrent = step === job.status
                        const isFailed = job.status === "failed"

                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div
                              className={`flex-1 h-2 rounded-full transition-all ${
                                isFailed
                                  ? "bg-red-500/30"
                                  : isComplete
                                  ? "bg-[#39FF14]/60"
                                  : "bg-white/5"
                              } ${isCurrent ? "ring-1 ring-[#39FF14]/50" : ""}`}
                            />
                            {i < PIPELINE_STEPS.length - 1 && <div className="w-1" />}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-1">
                      {PIPELINE_STEPS.map((step) => (
                        <div key={step} className="text-[10px] text-slate-600 capitalize">
                          {step}
                        </div>
                      ))}
                    </div>

                    {job.error_message && (
                      <div className="mt-3 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                        {job.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====== SCHEDULE TAB ====== */}
        {tab === "schedule" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black">Content Schedule</h1>
              <button
                onClick={() => setShowAddSchedule(true)}
                className="bg-[#39FF14] text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-green-300 transition-colors"
              >
                + Add Entry
              </button>
            </div>

            {/* Add schedule modal */}
            {showAddSchedule && (
              <div className="bg-white/5 border border-[#39FF14]/30 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-sm mb-4 text-[#39FF14]">New Schedule Entry</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-slate-500 tracking-widest mb-2">DATE</div>
                    <input
                      type="date"
                      value={newScheduleDate}
                      onChange={(e) => setNewScheduleDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#39FF14]/40"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 tracking-widest mb-2">TIME</div>
                    <input
                      type="time"
                      value={newScheduleTime}
                      onChange={(e) => setNewScheduleTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#39FF14]/40"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 tracking-widest mb-2">PLATFORMS</div>
                    <div className="flex gap-2 flex-wrap">
                      {PLATFORMS.map((p) => (
                        <button
                          key={p}
                          onClick={() =>
                            setNewSchedulePlatforms((prev) =>
                              prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
                            )
                          }
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            newSchedulePlatforms.includes(p)
                              ? "bg-[#39FF14]/20 border-[#39FF14]/30 text-[#39FF14]"
                              : "bg-white/5 border-white/10 text-slate-500"
                          }`}
                        >
                          {p.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addScheduleEntry}
                    className="bg-[#39FF14] text-black font-bold px-4 py-2 rounded-lg text-sm"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddSchedule(false)}
                    className="bg-white/5 border border-white/10 text-slate-400 px-4 py-2 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Calendar view */}
            {(() => {
              const { days, year, month } = getCalendarDays()
              const monthName = new Date(year, month).toLocaleString("default", { month: "long" })
              return (
                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-4">
                    {monthName} {year}
                  </h2>
                  <div className="grid grid-cols-7 gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="text-xs text-slate-600 text-center py-2 font-bold">
                        {d}
                      </div>
                    ))}
                    {days.map((day, i) => {
                      if (day === null)
                        return <div key={`empty-${i}`} className="h-20" />
                      const entries = getEntriesForDay(day, month, year)
                      const isToday = day === new Date().getDate() && month === new Date().getMonth()
                      return (
                        <div
                          key={day}
                          className={`h-20 bg-white/5 border rounded-lg p-1.5 ${
                            isToday ? "border-[#39FF14]/40" : "border-white/5"
                          }`}
                        >
                          <div className={`text-xs font-bold mb-1 ${isToday ? "text-[#39FF14]" : "text-slate-500"}`}>
                            {day}
                          </div>
                          {entries.slice(0, 2).map((e) => (
                            <div
                              key={e.id}
                              className={`text-[9px] rounded px-1 py-0.5 mb-0.5 truncate ${STATUS_COLORS[e.status] || ""}`}
                            >
                              {new Date(e.scheduled_for).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          ))}
                          {entries.length > 2 && (
                            <div className="text-[9px] text-slate-600">+{entries.length - 2} more</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Schedule list */}
            <h2 className="text-lg font-bold mb-4">Upcoming</h2>
            {scheduleLoading ? (
              <div className="text-center text-slate-500 py-8">Loading schedule...</div>
            ) : scheduleEntries.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-slate-600 text-lg mb-2">No scheduled entries</div>
                <p className="text-slate-500 text-sm">Add a schedule entry to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduleEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="text-[#39FF14] font-mono font-bold text-sm w-24">
                      {new Date(entry.scheduled_for).toLocaleDateString([], { month: "short", day: "numeric" })}
                      <br />
                      <span className="text-xs">
                        {new Date(entry.scheduled_for).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold mb-1">
                        {entry.video_jobs?.scripts?.topic || "Content Slot"}
                      </div>
                      <div className="flex gap-1">
                        {entry.platforms.map((p) => (
                          <span key={p} className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                            {p.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[entry.status] || ""}`}>
                      {entry.status}
                    </span>
                    <button
                      onClick={() => deleteScheduleEntry(entry.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====== ANALYTICS TAB ====== */}
        {tab === "analytics" && (
          <div>
            <h1 className="text-2xl font-black mb-8">Analytics</h1>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Views", value: "--", color: "text-[#39FF14]" },
                { label: "Total Likes", value: "--", color: "text-blue-400" },
                { label: "Scripts Created", value: "--", color: "text-purple-400" },
                { label: "Videos Published", value: "--", color: "text-orange-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <div className="text-slate-600 text-lg mb-2">Analytics Coming Soon</div>
              <p className="text-slate-500 text-sm">
                Connect your social accounts to see real-time analytics.
              </p>
            </div>
          </div>
        )}

        {/* ====== SETTINGS TAB ====== */}
        {tab === "settings" && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-black mb-8">Settings</h1>
            <div className="space-y-4">
              {[
                { label: "Supabase URL", env: "NEXT_PUBLIC_SUPABASE_URL" },
                { label: "Anthropic API Key", env: "ANTHROPIC_API_KEY" },
                { label: "ElevenLabs API Key", env: "ELEVENLABS_API_KEY" },
              ].map((item) => (
                <div key={item.env} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">{item.label}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1">{item.env}</div>
                    </div>
                    <div className="text-xs bg-[#39FF14]/20 text-[#39FF14] px-2 py-1 rounded">
                      Set via .env
                    </div>
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
