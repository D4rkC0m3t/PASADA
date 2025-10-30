'use client';

import { useState, useEffect } from 'react';
import FluidText from './FluidText';

export default function LoadingScreenNew() {
  const [isVisible, setIsVisible] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [taglineOpacity, setTaglineOpacity] = useState(0);
  const [quoteOpacity, setQuoteOpacity] = useState(0);

  useEffect(() => {
    // Show tagline at 6s
    const timer1 = setTimeout(() => setTaglineOpacity(1), 6000);
    
    // Show quote at 12s
    const timer2 = setTimeout(() => setQuoteOpacity(1), 12000);
    
    // Start fade out at 28s
    const timer3 = setTimeout(() => {
      setHasPlayed(true);
      setTimeout(() => setIsVisible(false), 2000);
    }, 28000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-2000 ${
        hasPlayed ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ 
        backgroundColor: '#000000',
        pointerEvents: hasPlayed ? 'none' : 'auto',
        overflow: 'hidden'
      }}
    >
      {/* Animated Grid Lines Background */}
      <div className="absolute inset-0 overflow-hidden" style={{ perspective: '1000px', zIndex: 3 }}>
        {/* Vertical lines */}
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((left, i) => (
          <div
            key={`v${i}`}
            className="absolute w-[1px] h-0 top-0 bg-white/20 animate-drawVertical"
            style={{ 
              left: `${left}%`,
              animationDelay: `${Math.abs(50 - left) * 0.02}s`
            }}
          />
        ))}
        
        {/* Horizontal lines */}
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((top, i) => (
          <div
            key={`h${i}`}
            className="absolute h-[1px] w-0 left-0 bg-white/20 animate-drawHorizontal"
            style={{ 
              top: `${top}%`,
              animationDelay: `${Math.abs(50 - top) * 0.02}s`
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center w-full"
        style={{ gap: '32px', maxWidth: '1400px', padding: '0 20px' }}
      >
        {/* 1. Welcome to - Small text at top */}
        <div className="text-center" style={{ opacity: 1, transition: 'opacity 2s' }}>
          <p 
            className="text-xl md:text-2xl font-light tracking-wide" 
            style={{ 
              fontFamily: "'Cinzel', 'Didot', serif",
              color: '#ffffff',
              textShadow: '0 4px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)',
              letterSpacing: '0.15em'
            }}
          >
            Welcome to
          </p>
        </div>

        {/* 2. PASADA - Fluid Text */}
        <div style={{ width: '100%', maxWidth: '1200px' }}>
          <FluidText />
        </div>

        {/* 3. Tagline */}
        <div 
          className="text-center transition-opacity duration-2000"
          style={{ opacity: taglineOpacity, marginTop: '-8px' }}
        >
          <p 
            className="text-2xl md:text-3xl lg:text-4xl font-light" 
            style={{ 
              fontFamily: "'Playfair Display', 'Georgia', serif",
              color: '#ffffff',
              textShadow: '0 4px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)',
              letterSpacing: '0.05em'
            }}
          >
            Every corner at PASADA tells a story.
          </p>
        </div>

        {/* 4. Quote */}
        <div 
          className="text-center transition-opacity duration-2000"
          style={{ opacity: quoteOpacity, marginTop: '40px' }}
        >
          <p 
            className="text-xl md:text-2xl lg:text-3xl font-light italic leading-relaxed mb-4 px-4" 
            style={{ 
              fontFamily: "'Playfair Display', 'Georgia', serif",
              color: '#ffffff',
              textShadow: '0 4px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)',
              letterSpacing: '0.02em'
            }}
          >
            The essence of interior design will always be about people and how they live.
          </p>
          <p 
            className="text-base md:text-lg font-medium tracking-wider"
            style={{ 
              fontFamily: "'Cinzel', 'Didot', serif",
              color: '#ffffff',
              textShadow: '0 4px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)',
              letterSpacing: '0.1em'
            }}
          >
            - Albert Hadley
          </p>
        </div>
      </div>
    </div>
  );
}
