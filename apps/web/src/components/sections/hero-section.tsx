import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Play, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with Flickering Grid */}
      <div className="absolute inset-0 z-0">
        <FlickeringGrid
          className="z-0 absolute inset-0 size-full opacity-30"
          squareSize={3}
          gridGap={4}
          color="#3b82f6"
          maxOpacity={0.2}
          flickerChance={0.05}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          {/* Badge */}
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium border border-border/50 mb-8">
            <Github className="w-4 h-4 mr-2" />
            Open Source & Free Forever
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Build{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Modern Apps
            </span>
            <br />
            That Actually Scale
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            The complete fullstack boilerplate with authentication, real-time features, 
            and modern tooling. Skip the setup, focus on what makes your app unique.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 font-medium">
              <Play className="w-4 h-4 mr-2" />
              Try Demo App
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto h-12 px-8 font-medium border-border hover:bg-accent"
              asChild
            >
              <Link href="https://github.com" target="_blank">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
                <Star className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>15.2k+ GitHub Stars</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>2.3k+ Contributors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>100% TypeScript</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10"></div>
    </section>
  );
}