"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Music, Disc3, Radio, Sliders, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#1A1410] text-[#F5E6D3] overflow-hidden">
      {/* Header */}
      <header className="border-b border-[#4A3728] bg-[#2C1E14]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E8732A] to-[#D4A574] flex items-center justify-center">
              <Disc3 className="w-6 h-6 text-[#1A1410]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider" style={{ fontFamily: "'Courier New', monospace" }}>
                BEATFORGE 808
              </h1>
              <p className="text-[0.6rem] tracking-[0.2em] text-[#A08060] uppercase">Rhythm Computer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/dashboard">
                <Button className="bg-[#E8732A] hover:bg-[#D4651F] text-white font-mono tracking-wider text-sm">
                  OPEN MACHINE <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-[#D4A574] hover:text-[#F5E6D3] hover:bg-[#3D2B1F] font-mono tracking-wider text-sm">
                    SIGN IN
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-[#E8732A] hover:bg-[#D4651F] text-white font-mono tracking-wider text-sm">
                    GET STARTED
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 opacity-5">
          <div className="grid h-full" style={{ gridTemplateColumns: 'repeat(16, 1fr)' }}>
            {Array.from({ length: 128 }).map((_, i) => (
              <div key={i} className="border border-[#D4A574]" />
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-[#4A3728] bg-[#2C1E14]">
            <span className="text-xs tracking-[0.2em] text-[#D4A574] font-mono">PROGRAMMABLE RHYTHM</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-[#D4A574]">Build Beats</span>
            <br />
            <span className="text-[#E8732A]">That Actually Slap</span>
          </h2>
          <p className="text-lg text-[#A08060] max-w-2xl mx-auto mb-10 leading-relaxed">
            A 16-step drum machine that makes you sound like you know what you're doing—even if this is your first time. No $3,000 vintage gear required. Just vibes, creativity, and whatever genius is currently rattling around in your brain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-[#E8732A] hover:bg-[#D4651F] text-white font-mono tracking-wider px-8 py-6 text-base">
                  <Music className="w-5 h-5 mr-2" />
                  LET'S MAKE NOISE
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/dashboard?guest=true">
                  <Button size="lg" className="bg-[#E8732A] hover:bg-[#D4651F] text-white font-mono tracking-wider px-8 py-6 text-base">
                    <Music className="w-5 h-5 mr-2" />
                    KICK THE TIRES
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-[#4A3728] text-[#D4A574] hover:bg-[#3D2B1F] hover:text-[#F5E6D3] font-mono tracking-wider px-8 py-6 text-base">
                    GET STARTED
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Decorative Drum Machine Preview */}
        <div className="max-w-3xl mx-auto mt-16 vintage-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="vintage-label">PATTERN DISPLAY</div>
            <div className="flex gap-1.5">
              <div className="vintage-led active" />
              <div className="vintage-led" />
              <div className="vintage-led" />
            </div>
          </div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(16, 1fr)' }}>
            {Array.from({ length: 4 }).map((_, row) =>
              Array.from({ length: 16 }).map((_, col) => {
                const isActive = [
                  [1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0],
                  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                  [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
                ][row][col];
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`aspect-square rounded-sm transition-all ${
                      isActive
                        ? 'bg-[#E8732A] shadow-[0_0_8px_rgba(232,115,42,0.4)]'
                        : 'bg-[#3D2B1F] border border-[#4A3728]'
                    }`}
                  />
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="vintage-label">BPM: 120</div>
            <div className="vintage-label">GENRE: ROCK</div>
            <div className="vintage-label">PART: VERSE</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-[#4A3728]">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center text-sm tracking-[0.3em] text-[#D4A574] font-mono mb-12">
            FEATURES
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Radio,
                title: "7 Genres",
                desc: "House, Electronic, Lo-Fi, Pop, Rock, Hip-Hop, Trap. All of them slap in their own way, and we'll prove it.",
              },
              {
                icon: Sliders,
                title: "Song Parts",
                desc: "Intro, Verse, Chorus, Bridge, Outro. Build actual songs instead of just loops. Yeah, it's that good.",
              },
              {
                icon: Music,
                title: "Real-Time Playback",
                desc: "Synthesized drums that genuinely sound amazing. Adjust your tempo from 60 to 200 BPM—or whatever your vibe demands.",
              },
            ].map((f) => (
              <div key={f.title} className="vintage-panel rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-[#3D2B1F] border border-[#4A3728] flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-[#E8732A]" />
                </div>
                <h4 className="text-[#D4A574] font-mono tracking-wider text-sm mb-2">{f.title}</h4>
                <p className="text-[#A08060] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#4A3728] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-[#D4A574]" />
            <span className="font-mono text-sm tracking-wider text-[#A08060]">BEATFORGE 808</span>
          </div>
          <p className="text-xs text-[#A08060]">
            © {new Date().getFullYear()} BeatForge 808. We just really like making beats.
          </p>
        </div>
      </footer>
    </div>
  );
}
