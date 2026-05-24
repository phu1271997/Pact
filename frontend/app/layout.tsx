import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import WalletConnect from "@/components/WalletConnect";
import Link from "next/link";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pact | Personal Commitment Smart Contracts",
  description: "Put your money where your mouth is. Stake GEN on personal goals, validated autonomously by AI referees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${inter.variable} font-sans antialiased text-white selection:bg-orange-500 selection:text-white`}>
        {/* Navigation Shell */}
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-md">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-2">
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent transition-all group-hover:opacity-90">
                  PACT
                </span>
                <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                  GenVM
                </span>
              </Link>
              <nav className="hidden items-center gap-6 md:flex">
                <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/create" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Create Pact
                </Link>
                <Link href="/leaderboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Leaderboard
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <WalletConnect />
            </div>
          </div>
        </header>

        {/* Core Content */}
        <main className="mx-auto max-w-7xl px-6 py-8 min-h-[calc(100vh-160px)]">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="w-full border-t border-white/5 bg-black/40 py-10 mt-12">
          <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-start gap-1">
              <p className="text-sm font-semibold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                PACT © 2026
              </p>
              <p className="text-xs text-zinc-500">
                AI-Driven Autonomous Commitments on GenLayer Testnet
              </p>
            </div>
            <div className="flex gap-6 text-xs text-zinc-500">
              <a href="https://studio.genlayer.com/run-debug" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                GenLayer Studio
              </a>
              <a href="https://docs.genlayer.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Docs
              </a>
              <span>Chain ID: 61999</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
