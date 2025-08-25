import { Marquee } from "@/components/ui/marquee";

const techStack = [
  { name: "Next.js 15", category: "Frontend", color: "bg-black text-white" },
  { name: "React 19", category: "Frontend", color: "bg-blue-600 text-white" },
  { name: "TypeScript", category: "Language", color: "bg-blue-700 text-white" },
  { name: "tRPC v10", category: "API", color: "bg-purple-600 text-white" },
  { name: "Prisma ORM", category: "Database", color: "bg-gray-800 text-white" },
  { name: "PostgreSQL", category: "Database", color: "bg-blue-800 text-white" },
  { name: "BetterAuth", category: "Auth", color: "bg-green-600 text-white" },
  { name: "Tailwind CSS", category: "Styling", color: "bg-cyan-500 text-white" },
  { name: "TanStack Query", category: "State", color: "bg-red-600 text-white" },
  { name: "Expo SDK 53", category: "Mobile", color: "bg-indigo-600 text-white" },
  { name: "React Native", category: "Mobile", color: "bg-blue-500 text-white" },
  { name: "Expo Router", category: "Navigation", color: "bg-violet-600 text-white" },
];

const TechCard = ({ tech }: { tech: typeof techStack[0] }) => (
  <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-background p-6 transition-all duration-300 hover:border-border hover:shadow-lg min-w-[160px]">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tech.color}`}>
          {tech.name}
        </div>
        <p className="text-xs text-muted-foreground">{tech.category}</p>
      </div>
    </div>
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
  </div>
);

export function TechShowcase() {
  const firstRow = techStack.slice(0, techStack.length / 2);
  const secondRow = techStack.slice(techStack.length / 2);

  return (
    <section className="py-16 w-full overflow-hidden bg-gradient-to-b from-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Built with{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Modern Tech Stack
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Production-ready technologies that scale with your ideas
          </p>
        </div>

        <div className="relative">
          <Marquee pauseOnHover className="[--duration:20s] py-4">
            {firstRow.map((tech) => (
              <TechCard key={tech.name} tech={tech} />
            ))}
          </Marquee>
          
          <Marquee reverse pauseOnHover className="[--duration:20s] py-4">
            {secondRow.map((tech) => (
              <TechCard key={tech.name} tech={tech} />
            ))}
          </Marquee>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background"></div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            And many more modern tools for the best developer experience
          </p>
        </div>
      </div>
    </section>
  );
}