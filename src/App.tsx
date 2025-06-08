import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FeedbackFishComponent from "./components/FeedbackFish";
import SplashCursor from "./components/SplashCursor";
import BurgerMenu from "./components/BurgerMenu";

const queryClient = new QueryClient();

const App = () => {
  const [splashCursorEnabled, setSplashCursorEnabled] = useState(true);

  const handleToggleSplashCursor = (enabled: boolean) => {
    setSplashCursorEnabled(enabled);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {splashCursorEnabled && <SplashCursor />}
        <BurgerMenu
          splashCursorEnabled={splashCursorEnabled}
          onToggleSplashCursor={handleToggleSplashCursor}
        />
        <FeedbackFishComponent />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
