import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AnimatedBudgetComponent = () => {
  const [currentTotal, setCurrentTotal] = useState(1600);
  const [currentSpent, setCurrentSpent] = useState(0);

  useEffect(() => {
    const runAnimation = () => {
      const duration = 4000; // 4 seconds
      const startTime = Date.now();
      const initialTotal = 1600;
      const finalTotal = 476.00;
      const initialSpent = 0;
      const finalSpent = 1124;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progressRatio, 3);

        // Animate total from 1600 to 476.66
        const newTotal = initialTotal - (initialTotal - finalTotal) * easeOutCubic;
        setCurrentTotal(newTotal);

        // Animate spent from 0 to 1124
        const newSpent = initialSpent + (finalSpent - initialSpent) * easeOutCubic;
        setCurrentSpent(newSpent);

        if (progressRatio < 1) {
          requestAnimationFrame(animate);
        } else {
          // Restart animation after a brief pause
          setTimeout(runAnimation, 1000);
        }
      };

      requestAnimationFrame(animate);
    };

    // Start the loop
    runAnimation();
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 scale-50 md:scale-75">
      <div className="bg-white rounded-3xl p-8 shadow-lg w-full relative min-w-[500px] h-72">
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
            ancora a disposizione per questo mese
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