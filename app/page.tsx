'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FluidText from '@/components/FluidText';

export default function HomePage() {
  const router = useRouter();
  const [taglineOpacity, setTaglineOpacity] = useState(0);
  const [quoteOpacity, setQuoteOpacity] = useState(0);
  
  // Typewriter states
  const [welcomeText, setWelcomeText] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [authorText, setAuthorText] = useState('');
  
  const fullWelcomeText = 'Welcome\nto';
  const fullQuoteText = 'The essence of interior design will always be about people and how they live.';
  const fullAuthorText = '- Albert Hadley';

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    const timeouts: NodeJS.Timeout[] = [];
    
    // Typewriter for Welcome text (starts immediately)
    let welcomeIndex = 0;
    const welcomeInterval = setInterval(() => {
      if (welcomeIndex < fullWelcomeText.length) {
        setWelcomeText(fullWelcomeText.slice(0, welcomeIndex + 1));
        welcomeIndex++;
      } else {
        clearInterval(welcomeInterval);
      }
    }, 80);
    intervals.push(welcomeInterval);
    
    // Show tagline 2s after PASADA appears
    const timer1 = setTimeout(() => setTaglineOpacity(1), 2000);
    timeouts.push(timer1);
    
    // Show quote 2s after tagline (4s total) and start typewriter
    const timer2 = setTimeout(() => {
      setQuoteOpacity(1);
      
      // Start quote typewriter
      let quoteIndex = 0;
      const quoteInterval = setInterval(() => {
        if (quoteIndex < fullQuoteText.length) {
          setQuoteText(fullQuoteText.slice(0, quoteIndex + 1));
          quoteIndex++;
        } else {
          clearInterval(quoteInterval);
          
          // Start author typewriter after quote finishes
          const authorTimeout = setTimeout(() => {
            let authorIndex = 0;
            const authorInterval = setInterval(() => {
              if (authorIndex < fullAuthorText.length) {
                setAuthorText(fullAuthorText.slice(0, authorIndex + 1));
                authorIndex++;
              } else {
                clearInterval(authorInterval);
              }
            }, 60);
            intervals.push(authorInterval);
          }, 300);
          timeouts.push(authorTimeout);
        }
      }, 50);
      intervals.push(quoteInterval);
    }, 4000);
    timeouts.push(timer2);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [fullWelcomeText, fullQuoteText, fullAuthorText]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ 
        background: 'radial-gradient(circle at 50% 30%, #0e0e0e 0%, #000000 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Animated Grid Lines Background with Parallax */}
      <div 
        className="absolute inset-0 overflow-hidden animate-gridMove" 
        style={{ 
          perspective: '1000px', 
          zIndex: 1,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }}
      />
      
      {/* Ambient Glow */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
          zIndex: 2
        }}
      />

      {/* Main Content Container */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center w-full"
        style={{ gap: '32px', maxWidth: '1400px', padding: '0 20px' }}
      >
        {/* 1. Welcome to - Premium typography with typewriter */}
        <div className="text-center animate-fadeUp" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <p 
            className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wide" 
            style={{ 
              fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Cinzel', serif",
              color: '#ffffff',
              textShadow: '0 2px 6px rgba(255, 255, 255, 0.2)',
              letterSpacing: '0.2em',
              lineHeight: '1.3',
              minHeight: '5rem',
              whiteSpace: 'pre-line'
            }}
          >
            {welcomeText}
            {welcomeText.length < fullWelcomeText.length && <span className="typewriter-cursor">|</span>}
          </p>
        </div>

        {/* 2. PASADA - Fluid Text */}
        <div className="animate-fadeUp" style={{ width: '100%', maxWidth: '1200px', animationDelay: '0.6s', opacity: 0 }}>
          <FluidText />
        </div>

        {/* 3. Tagline - Modern sans-serif with fade */}
        <div 
          className="text-center transition-all duration-1200 ease-out animate-fadeUp"
          style={{ 
            opacity: taglineOpacity, 
            marginTop: '-8px',
            animationDelay: '0.9s',
            transform: taglineOpacity ? 'translateY(0)' : 'translateY(10px)'
          }}
        >
          <p 
            className="text-2xl md:text-3xl lg:text-4xl font-light" 
            style={{ 
              fontFamily: "'Poppins', 'Inter', 'Outfit', sans-serif",
              color: '#ffffff',
              textShadow: '0 2px 8px rgba(255, 255, 255, 0.2)',
              letterSpacing: '0.02em',
              fontWeight: 300
            }}
          >
            Every corner at PASADA tells a story.
          </p>
        </div>

        {/* 4. Quote with typewriter - Elegant italic serif */}
        <div 
          className="text-center transition-all duration-1200 ease-out animate-fadeUp"
          style={{ 
            opacity: quoteOpacity, 
            marginTop: '40px',
            animationDelay: '1.2s',
            transform: quoteOpacity ? 'translateY(0)' : 'translateY(10px)'
          }}
        >
          <p 
            className="text-xl md:text-2xl lg:text-3xl font-light italic leading-relaxed mb-4 px-4" 
            style={{ 
              fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Georgia', serif",
              color: '#ffffff',
              opacity: 0.9,
              textShadow: '0 2px 6px rgba(255, 255, 255, 0.2)',
              letterSpacing: '0.02em',
              minHeight: '4rem'
            }}
          >
            {quoteText}
            {quoteOpacity > 0 && quoteText.length < fullQuoteText.length && <span className="typewriter-cursor">|</span>}
          </p>
          <p 
            className="text-base md:text-lg font-medium tracking-wider"
            style={{ 
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              color: '#ffffff',
              opacity: 0.85,
              textShadow: '0 2px 4px rgba(255, 255, 255, 0.15)',
              letterSpacing: '0.1em',
              minHeight: '2rem'
            }}
          >
            {authorText}
            {authorText.length > 0 && authorText.length < fullAuthorText.length && <span className="typewriter-cursor">|</span>}
          </p>
        </div>

        {/* 5. Get Started Button - Shimmer effect */}
        <div className="animate-fadeUp" style={{ marginTop: '60px', animationDelay: '1.5s', opacity: 0 }}>
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
        /* Grid parallax animation */
        @keyframes gridMove {
          from { background-position: 0 0; }
          to { background-position: 80px 80px; }
        }
        
        .animate-gridMove {
          animation: gridMove 30s linear infinite;
        }

        /* Fade up animation for staggered entrance */
        @keyframes fadeUp {
          from { 
            opacity: 0; 
            transform: translateY(10px);
            filter: blur(3px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
            filter: blur(0);
          }
        }
        
        .animate-fadeUp {
          animation: fadeUp 1.2s ease-out forwards;
        }

        /* Typewriter cursor */
        .typewriter-cursor {
          display: inline-block;
          margin-left: 2px;
          animation: blink 0.7s infinite;
          font-weight: 300;
        }

        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }

        /* Shimmer button */
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
