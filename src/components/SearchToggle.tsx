import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchToggleProps {
  aiSearchEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function SearchToggle({ aiSearchEnabled, onToggle }: SearchToggleProps) {
  return (
    <div className="fixed top-4 right-20 z-[60]">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle(!aiSearchEnabled)}
              className={cn(
                "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-200 text-white gap-2 px-3 py-2",
                aiSearchEnabled 
                  ? "bg-blue-500/20 border-blue-400/30 hover:bg-blue-500/30" 
                  : "bg-gray-500/20 border-gray-400/30 hover:bg-gray-500/30"
              )}
            >
              {aiSearchEnabled ? (
                <>
                  <Brain className="h-4 w-4" />
                  <span className="text-xs font-medium">AI Search</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span className="text-xs font-medium">Traditional</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">
              {aiSearchEnabled 
                ? "AI search finds movies with similar plots and themes. Click to switch to traditional TMDB search."
                : "Traditional search shows exact matches from TMDB database. Click to switch to AI search for plot-based recommendations."
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}