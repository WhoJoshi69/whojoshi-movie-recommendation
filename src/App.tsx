import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Details from "./pages/Details";
import NotFound from "./pages/NotFound";
import SplashCursor from "./components/SplashCursor";
import BurgerMenu from "./components/BurgerMenu";
import { 
  isMobileDevice, 
  isAndroidDevice, 
  setupAndroidOptimizations, 
  setupMobilePerformance, 
  setupTouchOptimizations 
} from "./utils/deviceDetection";
import "./styles/mobile.css";

const queryClient = new QueryClient();

const App = () => {
  const [splashCursorEnabled, setSplashCursorEnabled] = useState(true);
  const [aiSearchEnabled, setAiSearchEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    setIsMobile(isMobileDevice());
    
    // Setup mobile optimizations
    const cleanupAndroid = setupAndroidOptimizations();
    setupMobilePerformance();
    const cleanupTouch = setupTouchOptimizations();
    
    // Add device-specific classes
    if (isAndroidDevice()) {
      document.documentElement.classList.add('android-device');
    }
    
    if (isMobileDevice()) {
      document.documentElement.classList.add('mobile-device');
    }
    
    return () => {
      cleanupAndroid?.();
      cleanupTouch?.();
    };
  }, []);

  const handleToggleSplashCursor = (enabled: boolean) => {
    setSplashCursorEnabled(enabled);
  };

  const handleToggleAISearch = (enabled: boolean) => {
    setAiSearchEnabled(enabled);
  };

  // Disable splash cursor on mobile devices for better performance
  const shouldShowSplashCursor = splashCursorEnabled && !isMobile;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {shouldShowSplashCursor && <SplashCursor />}
        <BurgerMenu
          splashCursorEnabled={splashCursorEnabled}
          onToggleSplashCursor={handleToggleSplashCursor}
          aiSearchEnabled={aiSearchEnabled}
          onToggleAISearch={handleToggleAISearch}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index aiSearchEnabled={aiSearchEnabled} onToggleAISearch={handleToggleAISearch} />} />
            <Route path="/details/:type/:id" element={<Details />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;