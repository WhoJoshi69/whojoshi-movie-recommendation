import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, Search, Zap, Database } from "lucide-react";

interface SearchModeWelcomeProps {
  isOpen: boolean;
  onChoice: (aiEnabled: boolean) => void;
}

export default function SearchModeWelcome({ isOpen, onChoice }: SearchModeWelcomeProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background to-muted/20 border-2 border-primary/20">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-blue-500 animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-blue-500 bg-clip-text text-transparent">
            Choose Your Search Experience 🔍
          </DialogTitle>
          <DialogDescription className="text-center space-y-4">
            <p className="text-base">
              How would you like to discover movies and TV shows?
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-6">
          <div className="text-left">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-lg text-blue-500">AI Search</span>
            </div>
            <p className="text-foreground ml-9">
              Get intelligent recommendations based on plot, themes, and similar content. Perfect for discovering hidden gems!
            </p>
          </div>
          
          <div className="text-left">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-6 h-6 text-orange-500" />
              <span className="font-bold text-lg text-orange-500">Traditional Search</span>
            </div>
            <p className="text-foreground ml-9">
              Direct search through TMDB database with exact matches. Fast and reliable for finding specific titles.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onChoice(false)}
            className="w-full sm:w-auto hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <Search className="w-4 h-4 mr-2" />
            Traditional Search
          </Button>
          <Button
            onClick={() => onChoice(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl text-white"
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Search
          </Button>
        </DialogFooter>
        
        <div className="text-xs text-center text-muted-foreground mt-2">
          You can switch between modes anytime using the toggle button
        </div>
      </DialogContent>
    </Dialog>
  );
}