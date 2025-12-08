import { SectionHeader } from "@/components/section-header";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { Code, Zap } from "lucide-react";

interface BentoItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

const bentoItems: BentoItem[] = [
  {
    id: 1,
    title: "Full-Stack Architecture",
    description: "Complete web and mobile setup with shared logic and components across platforms",
    icon: <Code className="w-7 h-7" />,
    content: (
      <div className="relative h-full w-full flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center space-x-4 transform transition-transform duration-300 hover:scale-105">
            <div className="w-14 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">WEB</span>
            </div>
            <div className="flex-1">
              <span className="font-semibold">Next.js App</span>
              <p className="text-xs text-muted-foreground">Server & Client</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 transform transition-transform duration-300 hover:scale-105">
            <div className="w-14 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white text-sm font-bold">iOS</span>
            </div>
            <div className="flex-1">
              <span className="font-semibold">Expo App</span>
              <p className="text-xs text-muted-foreground">Native Mobile</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 transform transition-transform duration-300 hover:scale-105">
            <div className="w-14 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20">
              <span className="text-white text-sm font-bold">API</span>
            </div>
            <div className="flex-1">
              <span className="font-semibold">tRPC Backend</span>
              <p className="text-xs text-muted-foreground">Type-safe API</p>
            </div>
          </div>
        </div>
      </div>
    ),
    className: "lg:col-span-1",
  },
  {
    id: 2,
    title: "Modern Tech Stack",
    description: "Next.js 15, tRPC, Prisma, and TypeScript for production-ready applications",
    icon: <Code className="w-7 h-7" />,
    content: (
      <div className="relative h-full w-full overflow-hidden">
        <FlickeringGrid
          className="z-0 absolute inset-0 size-full"
          squareSize={4}
          gridGap={8}
          color="#3b82f6"
          maxOpacity={0.4}
          flickerChance={0.08}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="relative z-10 flex items-center justify-center h-full p-8">
          <div className="grid grid-cols-2 gap-6 max-w-sm w-full">
            <div className="bg-background/90 backdrop-blur-md rounded-2xl p-6 text-center transform transition-all duration-300 hover:scale-105 hover:bg-background/95 shadow-lg">
              <Code className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <span className="text-sm font-semibold">Next.js 15</span>
              <p className="text-xs text-muted-foreground mt-1">React Framework</p>
            </div>
            <div className="bg-background/90 backdrop-blur-md rounded-2xl p-6 text-center transform transition-all duration-300 hover:scale-105 hover:bg-background/95 shadow-lg">
              <Zap className="w-8 h-8 mx-auto mb-3 text-purple-600" />
              <span className="text-sm font-semibold">tRPC</span>
              <p className="text-xs text-muted-foreground mt-1">Type-safe API</p>
            </div>
          </div>
        </div>
      </div>
    ),
    className: "lg:col-span-1",
  },
  {
    id: 3,
    title: "Developer Experience",
    description: "Everything configured for the best development workflow and productivity",
    icon: <Zap className="w-7 h-7" />,
    content: (
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10" />
        <div className="absolute top-10 right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-500/5 rounded-full blur-xl animate-pulse"></div>
        
        <div className="relative z-10 p-8 h-full flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex items-center justify-between p-4 bg-background/60 backdrop-blur-md rounded-2xl transition-all duration-300 hover:bg-background/80 hover:scale-105 hover:shadow-lg">
                <span className="font-semibold text-lg">TypeScript</span>
                <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/40"></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-background/60 backdrop-blur-md rounded-2xl transition-all duration-300 hover:bg-background/80 hover:scale-105 hover:shadow-lg">
                <span className="font-semibold text-lg">ESLint + Prettier</span>
                <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/40"></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-background/60 backdrop-blur-md rounded-2xl transition-all duration-300 hover:bg-background/80 hover:scale-105 hover:shadow-lg">
                <span className="font-semibold text-lg">Hot Reload</span>
                <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/40"></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-background/60 backdrop-blur-md rounded-2xl transition-all duration-300 hover:bg-background/80 hover:scale-105 hover:shadow-lg">
                <span className="font-semibold text-lg">Auto Deploy</span>
                <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/40"></div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-muted-foreground">Ready for production in minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    className: "lg:col-span-2",
  },
];

export function BentoSection() {
  return (
    <section
      id="bento"
      className="py-32 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/2 to-background"></div>
      <div className="max-w-7xl mx-auto px-6 relative">
        <SectionHeader>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-6">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">build faster</span>
          </h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed">
            A complete fullstack boilerplate with modern tooling, best practices, and production-ready patterns
          </p>
        </SectionHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
          {bentoItems.map((item) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm transition-all duration-500 hover:border-border/60 hover:bg-card/50 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 min-h-[450px] ${item.className}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 transition-all duration-500 group-hover:opacity-100"></div>

              <div className="relative flex flex-col h-full">
                <div className="flex-1 relative overflow-hidden rounded-t-3xl">
                  {item.content}
                </div>

                <div className="p-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl text-primary transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}