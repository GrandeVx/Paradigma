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
    description: "Complete web and mobile setup with shared logic and components",
    icon: <Code className="w-6 h-6" />,
    content: (
      <div className="relative h-full w-full overflow-hidden">
        <div className="flex flex-col space-y-3 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">WEB</span>
            </div>
            <span className="text-sm font-medium">Next.js App</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">iOS</span>
            </div>
            <span className="text-sm font-medium">Expo App</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-6 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">API</span>
            </div>
            <span className="text-sm font-medium">tRPC Backend</span>
          </div>
        </div>
      </div>
    ),
    className: "md:col-span-1",
  },
  {
    id: 2,
    title: "Modern Tech Stack",
    description: "Next.js 15, tRPC, Prisma, and TypeScript for production-ready apps",
    icon: <Code className="w-6 h-6" />,
    content: (
      <div className="relative h-full w-full overflow-hidden">
        <FlickeringGrid
          className="z-0 absolute inset-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#3b82f6"
          maxOpacity={0.3}
          flickerChance={0.1}
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="grid grid-cols-2 gap-4 p-4">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 text-center">
              <Code className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-medium">Next.js 15</span>
            </div>
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 text-center">
              <Zap className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-medium">tRPC</span>
            </div>
          </div>
        </div>
      </div>
    ),
    className: "md:col-span-1",
  },
  {
    id: 3,
    title: "Developer Experience",
    description: "Everything configured for the best development workflow",
    icon: <Zap className="w-6 h-6" />,
    content: (
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10" />
        <div className="relative z-10 p-6 h-full flex flex-col justify-center">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">TypeScript</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ESLint + Prettier</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hot Reload</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auto Deploy</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    ),
    className: "md:col-span-2",
  },
];

export function BentoSection() {
  return (
    <section
      id="bento"
      className="flex flex-col items-center justify-center w-full relative px-5 md:px-10"
    >
      <div className="border-x mx-5 md:mx-10 relative max-w-7xl w-full">
        <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
        <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

        <SectionHeader>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance pb-1">
            Everything you need to build
          </h2>
          <p className="text-muted-foreground text-center text-balance font-medium">
            A complete fullstack boilerplate with modern tooling and best practices
          </p>
        </SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          {bentoItems.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col items-start justify-between min-h-[400px] md:min-h-[350px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-[''] group cursor-pointer transition-all duration-300 hover:bg-accent/5 ${item.className}`}
            >
              <div className="relative flex size-full items-center justify-center h-full overflow-hidden">
                {item.content}
              </div>
              <div className="flex flex-col gap-2 p-6 w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {item.icon}
                  </div>
                  <h3 className="text-lg tracking-tighter font-semibold">
                    {item.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}