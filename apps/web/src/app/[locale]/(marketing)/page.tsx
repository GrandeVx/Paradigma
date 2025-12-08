"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { HeroSection } from "@/components/sections/hero-section";
import { TechShowcase } from "@/components/sections/tech-showcase";
import { BentoSection } from "@/components/sections/bento-section";
import {
  Code,
  Github,
  Twitter,
  MessageSquare
} from "lucide-react";

// Funzione per gestire il controllo dell'hash URL lato client
function ClientHashCheck() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const hash = window.location.hash;
            if (hash && hash.includes("access_token")) {
              window.location.href = "/auth/email-confirmed";
            }
          })();
        `,
      }}
    />
  );
}

export default function HomePage() {

  return (
    <main className="min-h-screen w-full relative bg-background">
      <ClientHashCheck />

      {/* Header */}
      <header className="relative z-50 w-full border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Paradigma
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#bento" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#tech-stack" className="text-muted-foreground hover:text-foreground transition-colors">
              Stack
            </Link>
            <Link href="#community" className="text-muted-foreground hover:text-foreground transition-colors">
              Community
            </Link>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/sign-in">Try now</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Modern Hero Section */}
      <HeroSection />

      {/* Tech Stack Showcase */}
      <TechShowcase />

      {/* Bento Features Grid */}
      <BentoSection />

      {/* Problem & Solution Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background"></div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Stop Reinventing <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">The Wheel</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Building modern fullstack applications shouldn't take months of setup.
              Focus on your unique features, not boilerplate code.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="relative p-8 bg-gradient-to-br from-red-50/80 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 border-red-200/60 dark:border-red-800/40 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-2xl">❌</span>
                  </div>
                  <h3 className="text-2xl font-bold text-red-900 dark:text-red-100">
                    Without Paradigma
                  </h3>
                </div>
                <ul className="space-y-4 text-red-800 dark:text-red-200">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Weeks setting up authentication flows and security</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Complex mobile + web state synchronization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Database design and migration headaches</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>API architecture and scaling decisions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>State management complexity across platforms</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Deployment and infrastructure configuration</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="relative p-8 bg-gradient-to-br from-green-50/80 to-emerald-100/50 dark:from-green-950/20 dark:to-emerald-900/10 border-green-200/60 dark:border-green-800/40 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-2xl">✅</span>
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                    With Paradigma
                  </h3>
                </div>
                <ul className="space-y-4 text-green-800 dark:text-green-200">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Authentication ready in minutes with BetterAuth</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Cross-platform sync out of the box with tRPC</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Production-ready database schema with Prisma</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Type-safe APIs with end-to-end TypeScript</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Optimistic updates and caching included</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>One-click deployment with Docker & Vercel</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          <div className="text-center mt-16">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-3 text-lg font-medium">
              <Link href="/sign-in">Start Building Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Community/CTA Section */}
      <section id="community" className="py-24 border-t border-border/50 bg-gradient-to-b from-background to-accent/5">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Join the Community
            </h2>
            <p className="text-xl text-muted-foreground">
              Connect with developers building the next generation of applications
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="https://github.com" target="_blank">
                <Github className="w-5 h-5 mr-2" />
                Star on GitHub
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://discord.gg" target="_blank">
                <MessageSquare className="w-5 h-5 mr-2" />
                Join Discord
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Paradigma
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="https://github.com/GrandeVx/Paradigma" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="https://x.com/vittoIam" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="https://discord.gg/G2qEWYbmgj" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <MessageSquare className="w-5 h-5" />
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              Built with ❤️ by <Link href="https://x.com/vittoIam" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                @vittoIam
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}