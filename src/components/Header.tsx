import { Mic2, Github, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  return (
    <header className="relative z-10 border-b border-border/50 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-lg opacity-50" />
              <div className="relative p-2.5 bg-background rounded-xl neon-border">
                <Mic2 className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-wide">
                <span className="neon-text">Voice</span>
                <span className="neon-text-magenta">Clone</span>
              </h1>
              <p className="text-xs text-muted-foreground">AI Voice Conversion</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">
                    This app uses AI to convert song vocals into your voice. 
                    Requires a Python backend with RVC & Demucs.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">View Backend</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
