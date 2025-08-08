"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";



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

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();


  // Whitelist mutation
  const addToWhitelistMutation = api.util.addToWhitelist.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      setEmail("");
      toast({
        title: "🎉 Iscrizione Completata!",
        description: "Controlla la tua casella di posta per l'email di conferma.",
        className: "bg-white border-primary-600 text-black shadow-2xl z-[9999]",
        duration: 5000,
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Errore",
        description: error.message || "Si è verificato un errore durante l'iscrizione.",
        variant: "destructive",
        className: "bg-red-100 border-red-500 text-red-900 shadow-2xl z-[9999]",
        duration: 5000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    addToWhitelistMutation.mutate({ email });
  };

  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


  return (
    <main className="min-h-screen w-full relative bg-white">
      {/* Componente client per controllare l'hash URL */}
      <ClientHashCheck />


      {/* Header */}
      <header className="relative z-10 w-full py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Paradigma
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#tech-stack" className="text-gray-600 hover:text-gray-900 transition-colors">
              Tech Stack
            </Link>
            <Link href="/sign-in" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-shadow">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">


        {/* Hero Section */}
        <div className="pt-20 pb-16">
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Modern Fullstack
              </span>
              <br />
              <span className="text-gray-900">Boilerplate</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Production-ready foundation for building cross-platform applications with Next.js, Expo, and powerful monorepo architecture.
            </p>
            <div className="flex gap-4 justify-center pt-8">
              <Link href="/sign-in" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:shadow-lg transition-shadow">
                Start Building
              </Link>
              <a href="https://github.com" className="bg-gray-900 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors">
                View on GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-24 border-t border-gray-200">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-600">Start with a solid foundation and build from there</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cross-Platform</h3>
              <p className="text-gray-600">Build for web and mobile from a single codebase with Next.js and Expo.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Type-Safe</h3>
              <p className="text-gray-600">End-to-end type safety with TypeScript, tRPC, and Prisma ORM.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Production Ready</h3>
              <p className="text-gray-600">Docker, authentication, i18n, and monorepo setup out of the box.</p>
            </div>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div id="tech-stack" className="py-24 border-t border-gray-200">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Modern Tech Stack</h2>
            <p className="text-lg text-gray-600">Built with the latest and most powerful tools</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Next.js 15", category: "Framework" },
              { name: "Expo SDK 53", category: "Mobile" },
              { name: "TypeScript", category: "Language" },
              { name: "tRPC v10", category: "API" },
              { name: "Prisma ORM", category: "Database" },
              { name: "PostgreSQL", category: "Database" },
              { name: "BetterAuth", category: "Auth" },
              { name: "Tailwind CSS", category: "Styling" },
            ].map((tech) => (
              <div key={tech.name} className="bg-gray-50 p-6 rounded-xl text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{tech.category}</div>
                <div className="font-semibold text-gray-900">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-24 border-t border-gray-200">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-lg text-gray-600 mb-8">
              Get notified about updates and new features
            </p>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6"
                  disabled={!isValidEmail || addToWhitelistMutation.isLoading}
                >
                  {addToWhitelistMutation.isLoading ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            ) : (
              <div className="bg-green-50 text-green-800 p-4 rounded-lg max-w-md mx-auto">
                ✓ Successfully subscribed! Check your email for confirmation.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
