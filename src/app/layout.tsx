import type { Metadata } from "next"
import "./globals.css"
export const metadata: Metadata = {
  title: "AI Content Pipeline — Automated Faceless Video Factory",
  description: "Generate, schedule, and publish AI faceless videos to TikTok, YouTube Shorts, and Instagram Reels. Fully automated."
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
