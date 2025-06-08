// Device detection utilities for mobile optimization

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android/i.test(navigator.userAgent);
};

export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getScreenSize = (): 'small' | 'medium' | 'large' => {
  if (typeof window === 'undefined') return 'large';
  
  const width = window.innerWidth;
  
  if (width < 480) return 'small';
  if (width < 768) return 'medium';
  return 'large';
};

export const getDeviceInfo = () => {
  return {
    isMobile: isMobileDevice(),
    isAndroid: isAndroidDevice(),
    isIOS: isIOSDevice(),
    isTouch: isTouchDevice(),
    screenSize: getScreenSize(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    viewport: {
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
    }
  };
};

// Android-specific optimizations
export const setupAndroidOptimizations = () => {
  if (!isAndroidDevice()) return;
  
  // Handle viewport height for Android Chrome address bar
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
  
  // Prevent zoom on input focus
  const preventZoom = () => {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        if (input instanceof HTMLElement) {
          input.style.fontSize = '16px';
        }
      });
    });
  };
  
  preventZoom();
  
  // Optimize scrolling
  document.body.style.webkitOverflowScrolling = 'touch';
  document.body.style.overflowScrolling = 'touch';
  
  return () => {
    window.removeEventListener('resize', setVH);
    window.removeEventListener('orientationchange', setVH);
  };
};

// Performance optimizations for mobile
export const setupMobilePerformance = () => {
  if (!isMobileDevice()) return;
  
  // Reduce animations on low-end devices
  const isLowEndDevice = () => {
    // Simple heuristic based on available memory and hardware concurrency
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    return memory && memory < 4 || cores && cores < 4;
  };
  
  if (isLowEndDevice()) {
    document.documentElement.classList.add('reduce-motion');
  }
  
  // Optimize images for mobile
  const optimizeImages = () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.loading = 'lazy';
      img.decoding = 'async';
    });
  };
  
  // Run after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeImages);
  } else {
    optimizeImages();
  }
};

// Touch-friendly interactions
export const setupTouchOptimizations = () => {
  if (!isTouchDevice()) return;
  
  // Add touch-friendly classes
  document.documentElement.classList.add('touch-device');
  
  // Improve touch responsiveness
  const addTouchFeedback = (element: Element) => {
    element.addEventListener('touchstart', () => {
      element.classList.add('touch-active');
    });
    
    element.addEventListener('touchend', () => {
      setTimeout(() => {
        element.classList.remove('touch-active');
      }, 150);
    });
  };
  
  // Apply to interactive elements
  const interactiveElements = document.querySelectorAll('button, [role="button"], .clickable');
  interactiveElements.forEach(addTouchFeedback);
  
  // Handle orientation changes
  const handleOrientationChange = () => {
    // Force a reflow to handle Android keyboard issues
    setTimeout(() => {
      window.scrollTo(0, window.scrollY);
    }, 100);
  };
  
  window.addEventListener('orientationchange', handleOrientationChange);
  
  return () => {
    window.removeEventListener('orientationchange', handleOrientationChange);
  };
};