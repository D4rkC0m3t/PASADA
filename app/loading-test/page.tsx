'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FluidText from '@/components/FluidText';

export default function LoadingTestPage() {
  const router = useRouter();
  const [taglineOpacity, setTaglineOpacity] = useState(0);
  const [quoteOpacity, setQuoteOpacity] = useState(0);

  useEffect(() => {
    // Show tagline at 6s
    const timer1 = setTimeout(() => setTaglineOpacity(1), 6000);
    
    // Show quote at 12s
    const timer2 = setTimeout(() => setQuoteOpacity(1), 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);


  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ 
        backgroundColor: '#000000',
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
        {/* 1. Welcome to - Small text at top (two lines) */}
        <div className="text-center" style={{ opacity: 1, transition: 'opacity 2s' }}>
          <p 
            className="text-xl md:text-2xl font-light tracking-wide" 
            style={{ 
              fontFamily: "'Cinzel', 'Didot', serif",
              color: '#ffffff',
              textShadow: '0 4px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)',
              letterSpacing: '0.15em',
              lineHeight: '1.2'
            }}
          >
            Welcome<br />to
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

        {/* 5. Get Started Button */}
        <div style={{ marginTop: '60px' }}>
          <button 
            className="shimmer-button"
            onClick={() => router.push('/pasada.design/en/homepage.html')}
          >
            <span className="text">Get Started</span>
            <span className="shimmer"></span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .shimmer-button {
          --inset: 40px;
          --glow-hue: 222deg;
          --shadow-hue: 180deg;
          color: #000;
          font-weight: 600;
          background-image: linear-gradient(315deg, #ffc4ec -10%, #efdbfd 50%, #ffedd6 110%);
          padding: 0.8em 1.4em;
          position: relative;
          isolation: isolate;
          box-shadow: 0 2px 3px 1px hsl(var(--glow-hue) 50% 20% / 50%), inset 0 -10px 20px -10px hsla(var(--shadow-hue), 10%, 90%, 95%);
          border-radius: 0.66em;
          scale: 1;
          transition: all 1.33s linear(0, 0.002, 0.01 0.9%, 0.038 1.8%, 0.156, 0.312 5.8%, 0.789 11.1%, 1.015 14.2%, 1.096, 1.157, 1.199, 1.224 20.3%, 1.231, 1.231, 1.226, 1.214 24.6%, 1.176 26.9%, 1.057 32.6%, 1.007 35.5%, 0.984, 0.968, 0.956, 0.949 42%, 0.946 44.1%, 0.95 46.5%, 0.998 57.2%, 1.007, 1.011 63.3%, 1.012 68.3%, 0.998 84%, 1);
          border: none;
          cursor: pointer;
        }

        .shimmer-button:hover {
          scale: 1.2;
          transition-duration: 0.665s;
          box-shadow: 0 4px 8px -2px hsl(var(--glow-hue) 50% 20% / 50%), inset 0 0 0 transparent;
        }

        .shimmer-button:active {
          scale: 1.1;
          transition-duration: 0.665s;
        }

        .shimmer {
          position: absolute;
          inset: calc(var(--inset) * -1);
          border-radius: inherit;
          pointer-events: none;
          mask-image: conic-gradient(from var(--shimmer, 0deg), transparent 0%, transparent 20%, black 36%, black 45%, transparent 50%, transparent 70%, black 85%, black 95%, transparent 100%);
          mask-size: cover;
          mix-blend-mode: plus-lighter;
          animation: shimmer 1s linear infinite both;
        }

        .shimmer-button:hover .shimmer::before,
        .shimmer-button:hover .shimmer::after {
          opacity: 1;
          animation: shine 1.2s ease-in 1 forwards;
        }

        .shimmer::before,
        .shimmer::after {
          transition: all 0.5s ease;
          opacity: 0;
          content: "";
          border-radius: inherit;
          position: absolute;
          mix-blend-mode: color;
          inset: var(--inset);
          pointer-events: none;
        }

        .shimmer::before {
          box-shadow: 0 0 calc(var(--inset) * 0.1) 2px hsl(var(--glow-hue) 20% 95%), 0 0 calc(var(--inset) * 0.18) 4px hsl(var(--glow-hue) 20% 80%), 0 0 calc(var(--inset) * 0.33) 4px hsl(var(--glow-hue) 50% 70%), 0 0 calc(var(--inset) * 0.66) 5px hsl(var(--glow-hue) 100% 70%);
          z-index: -1;
        }

        .shimmer::after {
          box-shadow: inset 0 0 0 1px hsl(var(--glow-hue) 70% 95%), inset 0 0 2px 1px hsl(var(--glow-hue) 100% 80%), inset 0 0 5px 2px hsl(var(--glow-hue) 100% 70%);
          z-index: 2;
        }

        .shimmer-button .text {
          color: transparent;
          background-clip: text;
          background-color: #000;
          background-image: linear-gradient(120deg, transparent, hsla(var(--glow-hue), 100%, 80%, 0.66) 40%, hsla(var(--glow-hue), 100%, 90%, 0.9) 50%, transparent 52%);
          background-repeat: no-repeat;
          background-size: 300% 300%;
          background-position: center 200%;
        }

        .shimmer-button:hover .text {
          animation: text 0.66s ease-in 1 both;
        }

        @property --shimmer {
          syntax: "<angle>";
          inherits: false;
          initial-value: 33deg;
        }

        @keyframes shimmer {
          0% {
            --shimmer: 0deg;
          }
          100% {
            --shimmer: 360deg;
          }
        }

        @keyframes shine {
          0% {
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          55% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes text {
          0% {
            background-position: 100% center;
          }
          100% {
            background-position: -100% center;
          }
        }
      `}</style>
    </div>
  );
}
