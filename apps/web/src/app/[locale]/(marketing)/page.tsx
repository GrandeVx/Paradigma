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
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/sign-in">Get Started</Link>
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
      <section className="py-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Stop Reinventing The Wheel
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Building modern fullstack applications shouldn't take months of setup. 
                Focus on your unique features, not boilerplate code.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <Card className="p-8 bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                <h3 className="text-xl font-semibold mb-4 text-red-900 dark:text-red-100">
                  ❌ Without Paradigma
                </h3>
                <ul className="space-y-3 text-red-700 dark:text-red-300">
                  <li>• Weeks setting up authentication</li>
                  <li>• Complex mobile + web synchronization</li>
                  <li>• Database design and migrations</li>
                  <li>• API architecture decisions</li>
                  <li>• State management complexity</li>
                  <li>• Deployment configuration</li>
                </ul>
              </Card>

              <Card className="p-8 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <h3 className="text-xl font-semibold mb-4 text-green-900 dark:text-green-100">
                  ✅ With Paradigma
                </h3>
                <ul className="space-y-3 text-green-700 dark:text-green-300">
                  <li>• Authentication ready in minutes</li>
                  <li>• Cross-platform sync out of the box</li>
                  <li>• Production database schema</li>
                  <li>• Type-safe APIs with tRPC</li>
                  <li>• Optimistic updates included</li>
                  <li>• One-click deployment</li>
                </ul>
              </Card>
            </div>
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
              <Link href="https://github.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="https://twitter.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="https://discord.gg" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <MessageSquare className="w-5 h-5" />
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Built with ❤️ by the community
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}