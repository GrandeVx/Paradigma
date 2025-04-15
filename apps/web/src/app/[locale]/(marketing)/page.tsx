import Balancer from "react-wrap-balancer";
import { api } from "@/trpc/server";

// Funzione per gestire il controllo dell'hash URL lato client
function ClientHashCheck() {
  "use client";

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

export default async function Home() {
  try {
    // Esegui la query dal server
    const healthCheckResult = await api.util.healthCheck.query();

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
            <Balancer data-oid=".6jgftj"> T3 Template App</Balancer>
          </h1>
          <p
            className="animate-fade-up mt-6 text-center text-muted-foreground/80 md:text-lg"
            data-oid="osyd_.y"
          >
            <Balancer data-oid="4us3rtt">
              This is a boilerplate for a fullstack{" "}
              <span className="font-bold" data-oid="c_c6k:6">
                Next.js
              </span>{" "}
              app i have done implementing different template around the web. I
              have done This because every time i try to start a new project i
              have to do the same thing over and over again (and every time
              something decide to don't work...). I promise to keep this updated
              and to add new stuff
            </Balancer>
            {healthCheckResult.status === "ok" && (
              <span className="text-green-500" data-oid="elntuy2">
                API STATUS : OK {healthCheckResult.timestamp.toISOString()}
              </span>
            )}
          </p>
        </div>
      </main>
    );
  } catch (error) {
    // Gestione degli errori
    console.error("Error in Home page:", error);
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Errore</h1>
          <p className="mt-2">
            Si è verificato un errore durante il caricamento della pagina.
          </p>
        </div>
      </main>
    );
  }
}
