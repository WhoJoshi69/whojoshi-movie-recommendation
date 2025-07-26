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
import SplashCursorWelcome from "./components/SplashCursorWelcome";
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
  const [splashCursorEnabled, setSplashCursorEnabled] = useState(() => {
    // Don't show splash cursor by default, let user choose
    try {
      const saved = localStorage.getItem('whojoshi_splash_cursor_enabled');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [aiSearchEnabled, setAiSearchEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(() => {
    // Show welcome popup if user hasn't made a choice yet
    try {
      const hasChosenBefore = localStorage.getItem('whojoshi_splash_cursor_choice_made');
      return !hasChosenBefore;
    } catch {
      return true;
    }
  });

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
    try {
      localStorage.setItem('whojoshi_splash_cursor_enabled', JSON.stringify(enabled));
    } catch (error) {
      console.warn('Failed to save splash cursor preference:', error);
    }
  };

  const handleWelcomeChoice = (enabled: boolean) => {
    setSplashCursorEnabled(enabled);
    setShowWelcomePopup(false);
    try {
      localStorage.setItem('whojoshi_splash_cursor_enabled', JSON.stringify(enabled));
      localStorage.setItem('whojoshi_splash_cursor_choice_made', 'true');
    } catch (error) {
      console.warn('Failed to save splash cursor preference:', error);
    }
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
        {/* Welcome popup for first-time visitors (only on desktop) */}
        {!isMobile && (
          <SplashCursorWelcome
            isOpen={showWelcomePopup}
            onChoice={handleWelcomeChoice}
          />
        )}
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