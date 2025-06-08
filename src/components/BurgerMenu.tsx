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
import { Menu, Sparkles, Brain, Search } from "lucide-react";

interface BurgerMenuProps {
  splashCursorEnabled: boolean;
  onToggleSplashCursor: (enabled: boolean) => void;
  aiSearchEnabled: boolean;
  onToggleAISearch: (enabled: boolean) => void;
}

export default function BurgerMenu({
  splashCursorEnabled,
  onToggleSplashCursor,
  aiSearchEnabled,
  onToggleAISearch,
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
          className="w-64 bg-white/95 backdrop-blur-md border-white/20"
        >
          <DropdownMenuLabel className="text-gray-800">
            Search Settings
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-100/50"
            onClick={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-gray-800 text-sm font-medium">AI Search</span>
                <span className="text-gray-500 text-xs">Find similar movies by plot</span>
              </div>
            </div>
            <Switch
              checked={aiSearchEnabled}
              onCheckedChange={onToggleAISearch}
              className="data-[state=checked]:bg-blue-600"
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-gray-800">
            Visual Effects
          </DropdownMenuLabel>
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