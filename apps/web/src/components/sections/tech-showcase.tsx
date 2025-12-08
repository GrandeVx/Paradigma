import { Marquee } from "@/components/ui/marquee";
import { Card } from "@/components/ui/card";

const techStack = [
  { name: "Next.js 15", category: "Frontend", color: "bg-black text-white shadow-black/20" },
  { name: "React 19", category: "Frontend", color: "bg-blue-600 text-white shadow-blue-600/20" },
  { name: "TypeScript", category: "Language", color: "bg-blue-700 text-white shadow-blue-700/20" },
  { name: "tRPC v10", category: "API", color: "bg-purple-600 text-white shadow-purple-600/20" },
  { name: "Prisma ORM", category: "Database", color: "bg-gray-800 text-white shadow-gray-800/20" },
  { name: "PostgreSQL", category: "Database", color: "bg-blue-800 text-white shadow-blue-800/20" },
  { name: "BetterAuth", category: "Auth", color: "bg-green-600 text-white shadow-green-600/20" },
  { name: "Tailwind CSS", category: "Styling", color: "bg-cyan-500 text-white shadow-cyan-500/20" },
  { name: "TanStack Query", category: "State", color: "bg-red-600 text-white shadow-red-600/20" },
  { name: "Expo SDK 53", category: "Mobile", color: "bg-indigo-600 text-white shadow-indigo-600/20" },
  { name: "React Native", category: "Mobile", color: "bg-blue-500 text-white shadow-blue-500/20" },
  { name: "Expo Router", category: "Navigation", color: "bg-violet-600 text-white shadow-violet-600/20" },
];

const TechCard = ({ tech }: { tech: typeof techStack[0] }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 transition-all duration-500 hover:border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 min-w-[180px] mx-3">
    <div className="flex flex-col space-y-3">
      <div className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ${tech.color} transition-transform duration-300 group-hover:scale-105`}>
        {tech.name}
      </div>
      <div className="flex items-center justify-center">
        <span className="text-xs text-muted-foreground font-medium tracking-wide">{tech.category}</span>
      </div>
    </div>
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 transition-all duration-500 group-hover:opacity-100" />
    <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 -z-10" />
  </div>
);

export function TechShowcase() {
  const firstRow = techStack.slice(0, 6);
  const secondRow = techStack.slice(6, 12);

  return (
    <section className="py-24 w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/3 to-background"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Built with{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Modern Tech Stack</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Production-ready technologies carefully selected for performance, developer experience, and scalability
          </p>
        </div>

        <div className="relative space-y-6">
          <Marquee pauseOnHover className="[--duration:25s] py-4">
            {firstRow.map((tech) => (
              <TechCard key={tech.name} tech={tech} />
            ))}
          </Marquee>

          <Marquee reverse pauseOnHover className="[--duration:25s] py-4">
            {secondRow.map((tech) => (
              <TechCard key={tech.name} tech={tech} />
            ))}
          </Marquee>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent"></div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center px-4 py-2 bg-accent/50 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
            <span className="text-sm font-medium text-muted-foreground">
              Everything configured for the best developer experience
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}