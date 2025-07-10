import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type AnimationPhase = 'idle' | 'loading' | 'calculating' | 'complete' | 'resetting';

const AnimatedBudgetComponent = () => {
  const [currentTotal, setCurrentTotal] = useState(1600);
  const [currentSpent, setCurrentSpent] = useState(0);
  const [phase, setPhase] = useState<AnimationPhase>('idle');

  const animateValues = (
    fromTotal: number, 
    toTotal: number, 
    fromSpent: number, 
    toSpent: number, 
    duration: number, 
    callback?: () => void
  ) => {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      // Animate values
      const newTotal = fromTotal + (toTotal - fromTotal) * easeOutCubic;
      const newSpent = fromSpent + (toSpent - fromSpent) * easeOutCubic;
      
      setCurrentTotal(newTotal);
      setCurrentSpent(newSpent);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (callback) {
        callback();
      }
    };

    requestAnimationFrame(animate);
  };

  const runAnimationCycle = () => {
    // Phase 1: Idle state
    setPhase('idle');
    setCurrentTotal(1600);
    setCurrentSpent(0);

    setTimeout(() => {
      setPhase('loading');
      
      // Phase 2: Start spending animation
      setTimeout(() => {
        setPhase('calculating');
        
        animateValues(1600, 476, 0, 1124, 3000, () => {
          setPhase('complete');
          
          // Phase 3: Show complete state for a moment
          setTimeout(() => {
            setPhase('resetting');
            
            // Phase 4: Quick reset
            animateValues(476, 1600, 1124, 0, 800, () => {
              setTimeout(runAnimationCycle, 500); // Restart cycle
            });
          }, 1500);
        });
      }, 1000);
    }, 1000);
  };

  useEffect(() => {
    const timer = setTimeout(runAnimationCycle, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 scale-50 md:scale-75">
      <div className={`rounded-3xl p-8 w-full relative min-w-[500px] h-72 transition-all duration-500 ${
        phase === 'complete' ? 'bg-red-50 shadow-2xl border-2 border-red-200 scale-105' :
        phase === 'calculating' ? 'bg-yellow-50 shadow-xl border border-yellow-200' :
        phase === 'loading' ? 'bg-blue-50 shadow-lg border border-blue-200' :
        phase === 'resetting' ? 'bg-gray-100 shadow-sm scale-95' :
        'bg-white shadow-lg'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h2 className="text-lg font-medium text-gray-800" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Agosto 2025
          </h2>
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </div>

        {/* Main Amount */}
        <div className="mb-6">
          <div className="flex items-baseline mb-2">
            <span className="text-3xl text-gray-900 mr-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>€</span>
            <span
              className="text-7xl font-medium text-gray-900"
              style={{ fontFamily: 'Apfel Grotezk, system-ui, sans-serif' }}
            >
              {Math.floor(currentTotal)}
            </span>
            <span
              className="text-4xl font-normal text-gray-900"
              style={{ fontFamily: 'Apfel Grotezk, system-ui, sans-serif' }}
            >
              ,{(currentTotal % 1).toFixed(2).substring(2)}
            </span>
          </div>
          <p className="text-gray-500 text-base" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {phase === 'calculating' ? 'Calcolando spese...' :
             phase === 'complete' ? 'Budget quasi esaurito!' :
             phase === 'loading' ? 'Caricamento dati...' :
             phase === 'resetting' ? 'Reimpostazione...' :
             'ancora a disposizione per questo mese'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
            {/* Each section fills proportionally as spending increases */}
            <div className="h-full bg-red-500" style={{ width: `${Math.min(20, (currentSpent / 1600) * 100)}%` }} />
            <div className="h-full bg-orange-400" style={{ width: `${Math.max(0, Math.min(15, (currentSpent / 1600) * 100 - 20))}%` }} />
            <div className="h-full bg-blue-500" style={{ width: `${Math.max(0, Math.min(20, (currentSpent / 1600) * 100 - 35))}%` }} />
            <div className="h-full bg-pink-400" style={{ width: `${Math.max(0, Math.min(10, (currentSpent / 1600) * 100 - 55))}%` }} />
            <div className="h-full bg-purple-500" style={{ width: `${Math.max(0, (currentSpent / 1600) * 100 - 65)}%` }} />
          </div>
        </div>

        {/* Spending Info */}
        <div className="mb-8">
          <p className="text-gray-600 text-base" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Hai speso{' '}
            <span
              className="font-medium text-gray-900"
              style={{ fontFamily: 'Apfel Grotezk, system-ui, sans-serif' }}
            >
              € {currentSpent.toFixed(2).replace('.', ',')}
            </span>
            {' '}su{' '}
            <span
              className="font-medium text-gray-900"
              style={{ fontFamily: 'Apfel Grotezk, system-ui, sans-serif' }}
            >
              € 1600,00
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AnimatedBudgetComponent;