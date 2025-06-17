"use client";

import { useState } from "react";
import Balancer from "react-wrap-balancer";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

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

  // Health check query
  const { data: healthCheckResult } = api.util.healthCheck.useQuery();

  // Whitelist mutation
  const addToWhitelistMutation = api.util.addToWhitelist.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      setEmail("");
      toast({
        title: "Successo!",
        description: "La tua email è stata aggiunta alla whitelist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore.",
        variant: "destructive",
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
    <main
      className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 pt-48"
      data-oid="50wwh0g"
    >
      {/* Componente client per controllare l'hash URL */}
      <ClientHashCheck />

      <div
        className="z-10 min-h-[50vh] w-full max-w-4xl px-5 xl:px-0"
        data-oid="l3p60aq"
      >
        <h1
          className="animate-fade-up from-foreground to-muted-foreground bg-gradient-to-br bg-clip-text text-center text-7xl font-bold tracking-[-0.02em] text-black text-transparent opacity-0 drop-shadow-sm md:text-8xl/[5rem]"
          data-oid="v.i:wd3"
        >
          <Balancer data-oid=".6jgftj">Balance App</Balancer>
        </h1>

        <p
          className="animate-fade-up mt-6 text-center text-muted-foreground/80 md:text-lg"
          data-oid="osyd_.y"
        >
          <Balancer data-oid="4us3rtt">
            Gestisci le tue finanze in modo semplice e intelligente.
            Unisciti alla lista d'attesa per essere tra i primi a provare la nostra app.
          </Balancer>
        </p>

        {/* Whitelist Form */}
        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-md space-y-6">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Indirizzo email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="il-tuo-email@esempio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-white disabled:bg-primary/50 "
                  disabled={!isValidEmail || addToWhitelistMutation.isLoading}
                >
                  {addToWhitelistMutation.isLoading
                    ? "Aggiungendo..."
                    : "Unisciti alla Lista d'Attesa"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-green-600 text-lg font-semibold">
                  ✅ Perfetto!
                </div>
                <p className="text-gray-600">
                  Ti contatteremo non appena l'app sarà disponibile.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4"
                >
                  Aggiungi un'altra email
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* API Status */}
        {healthCheckResult?.status === "ok" && (
          <div className="mt-8 text-center">
            <span className="text-green-500 text-sm" data-oid="elntuy2">
              API STATUS: OK {healthCheckResult.timestamp.toISOString()}
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
