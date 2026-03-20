"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Signup failed")
        setLoading(false)
        return
      }

      // If session exists (no email confirmation), redirect immediately
      if (data.user && !data.message?.includes("Check your email")) {
        router.push("/dashboard")
      } else {
        setSuccess(true)
      }
    } catch {
      setError("Network error. Please try again.")
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-2xl p-8">
            <div className="text-4xl mb-4">&#9993;</div>
            <h2 className="text-xl font-black text-white mb-2">Check Your Email</h2>
            <p className="text-slate-400 text-sm mb-6">
              We sent a confirmation link to <span className="text-[#39FF14]">{email}</span>
            </p>
            <Link href="/login" className="text-[#39FF14] hover:underline text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-black text-2xl mb-2">
            <span className="text-[#39FF14]">AI</span>Content<span className="text-[#39FF14]">Pipeline</span>
          </div>
          <p className="text-slate-500 text-sm">Create your content studio account</p>
        </div>

        <form onSubmit={handleSignup} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-slate-500 tracking-widest block mb-2">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]/40 placeholder-slate-600"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 tracking-widest block mb-2">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]/40 placeholder-slate-600"
              placeholder="Min. 6 characters"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 tracking-widest block mb-2">CONFIRM PASSWORD</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]/40 placeholder-slate-600"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#39FF14] text-black font-black py-3 rounded-xl hover:bg-green-300 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#39FF14] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
