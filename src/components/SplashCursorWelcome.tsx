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
import { Sparkles, Mouse, Zap } from "lucide-react";

interface SplashCursorWelcomeProps {
  isOpen: boolean;
  onChoice: (enabled: boolean) => void;
}

export default function SplashCursorWelcome({
  isOpen,
  onChoice,
}: SplashCursorWelcomeProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-muted/20 border-2 border-primary/20">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Welcome to WhoJoshi's Space
          </DialogTitle>
          <DialogDescription className="text-center space-y-3">
            <p className="text-base">
              Would you like to enable our interactive splash cursor effect?
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>
                Creates beautiful visual effects as you move your cursor
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onChoice(false)}
            className="w-full sm:w-auto hover:bg-muted/50 transition-colors"
          >
            No, keep it simple
          </Button>
          <Button
            onClick={() => onChoice(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Zap className="w-4 h-4 mr-2" />
            Yes, enable effects!
          </Button>
        </DialogFooter>

        <div className="text-xs text-center text-muted-foreground mt-2">
          You can change this anytime in the menu
        </div>
      </DialogContent>
    </Dialog>
  );
}
