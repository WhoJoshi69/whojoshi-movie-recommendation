import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Menu, Sparkles } from "lucide-react";

interface BurgerMenuProps {
  splashCursorEnabled: boolean;
  onToggleSplashCursor: (enabled: boolean) => void;
}

export default function BurgerMenu({
  splashCursorEnabled,
  onToggleSplashCursor,
}: BurgerMenuProps) {
  return (
    <div className="fixed top-4 right-4 z-[60]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-200"
          >
            <Menu className="h-4 w-4 text-white" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-56 bg-white/95 backdrop-blur-md border-white/20"
        >
          <DropdownMenuLabel className="text-gray-800">
            Visual Effects
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-100/50"
            onClick={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-gray-800">Splash Cursor</span>
            </div>
            <Switch
              checked={splashCursorEnabled}
              onCheckedChange={onToggleSplashCursor}
              className="data-[state=checked]:bg-purple-600"
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}