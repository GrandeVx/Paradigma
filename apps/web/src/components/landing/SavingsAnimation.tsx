import React, { useEffect, useState } from 'react';

type AnimationPhase = 'idle' | 'loading' | 'waiting' | 'celebrating' | 'resetting';

const SavingsAnimation = () => {
  const [currentAmount, setCurrentAmount] = useState(0);
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [isComplete, setIsComplete] = useState(false);

  const animateValue = (start: number, end: number, duration: number, callback?: () => void) => {
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function per un'animazione più fluida
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easedProgress);

      setCurrentAmount(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else if (callback) {
        callback();
      }
    };

    requestAnimationFrame(update);
  };

  const runAnimationCycle = () => {
    // Fase 1: Idle → Loading
    setPhase('idle');
    setCurrentAmount(0);
    setIsComplete(false);

    setTimeout(() => {
      setPhase('loading');

      // Anima l'importo da 0 a 1000 in 3 secondi
      animateValue(0, 1000, 3000, () => {
        setIsComplete(true);
        setPhase('celebrating');
        console.log('🎉 Obiettivo raggiunto!');

        // Fase 3: Waiting (mostra il risultato per 2 secondi)
        setTimeout(() => {
          setPhase('waiting');

          // Fase 4: Reset e ricomincia dopo 1.5 secondi
          setTimeout(() => {
            setPhase('resetting');

            // Animazione di reset veloce
            animateValue(1000, 0, 800, () => {
              // Ricomincia il ciclo dopo una breve pausa
              setTimeout(runAnimationCycle, 500);
            });
          }, 1500);
        }, 2000);
      });
    }, 1000); // Pausa iniziale
  };

  useEffect(() => {
    // Avvia il primo ciclo automaticamente
    const timer = setTimeout(runAnimationCycle, 500);
    return () => clearTimeout(timer);
  }, []);

  const progress = (currentAmount / 1000) * 100;
  const remaining = 1000 - currentAmount;

  return (
    <div className={`rounded-3xl p-8 text-white w-[450px] max-w-md shadow-xl relative overflow-hidden min-w-[400px] transition-all duration-500 ${phase === 'celebrating' ? 'bg-green-500 scale-105 shadow-2xl' :
      phase === 'loading' ? 'bg-sky-500 shadow-xl' :
        phase === 'resetting' ? 'bg-gray-500 scale-95' :
          'bg-sky-500'
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <div className="w-6 h-6 mr-3 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_684_31624)">
                <path d="M11.5 3C12.483 3.00008 13.439 3.32191 14.222 3.91634C15.0049 4.51077 15.5718 5.34514 15.836 6.292L15.888 6.497L17.758 6.03C17.8947 5.99598 18.037 5.99122 18.1757 6.01602C18.3143 6.04083 18.4462 6.09465 18.5626 6.17395C18.679 6.25325 18.7773 6.35625 18.8511 6.47621C18.925 6.59616 18.9726 6.73035 18.991 6.87L19 7V8.81C19.5638 9.35053 20.0258 9.988 20.364 10.692L20.502 11H21C21.2449 11 21.4813 11.09 21.6644 11.2527C21.8474 11.4155 21.9643 11.6397 21.993 11.883L22 12V15C22 15.1646 21.9594 15.3266 21.8818 15.4718C21.8042 15.6169 21.6919 15.7407 21.555 15.832L21.447 15.894L20.279 16.479C19.8008 17.4041 19.1082 18.2013 18.259 18.804L18 18.978V20C18 20.2449 17.91 20.4813 17.7473 20.6644C17.5845 20.8474 17.3603 20.9643 17.117 20.993L17 21H14C13.7551 21 13.5187 20.91 13.3356 20.7473C13.1526 20.5845 13.0357 20.3603 13.007 20.117L13 20H12C12 20.2449 11.91 20.4813 11.7473 20.6644C11.5845 20.8474 11.3603 20.9643 11.117 20.993L11 21H8C7.75507 21 7.51866 20.91 7.33563 20.7473C7.15259 20.5845 7.03566 20.3603 7.007 20.117L7 20V18.978C6.27758 18.5161 5.65355 17.9161 5.16377 17.2123C4.67399 16.5085 4.3281 15.7149 4.146 14.877C3.55633 14.7015 3.03481 14.3491 2.65205 13.8674C2.26929 13.3857 2.04376 12.7981 2.006 12.184L2 12V11.5C2.00028 11.2451 2.09788 11 2.27285 10.8146C2.44782 10.6293 2.68695 10.5178 2.94139 10.5028C3.19584 10.4879 3.44638 10.5707 3.64183 10.7343C3.83729 10.8979 3.9629 11.1299 3.993 11.383L4 11.5V12C4 12.148 4.032 12.289 4.09 12.415C4.24263 11.5147 4.58313 10.6567 5.08933 9.89667C5.59553 9.13668 6.25608 8.4918 7.028 8.004C6.95705 7.37448 7.01981 6.73708 7.21219 6.13349C7.40456 5.52991 7.72221 4.97374 8.14435 4.50138C8.56649 4.02903 9.0836 3.65112 9.66187 3.3924C10.2401 3.13367 10.8665 2.99996 11.5 3ZM17 8.28L14.242 8.97L14.122 8.993L14 9H10.5C9.48887 8.99933 8.50698 9.33922 7.71265 9.96486C6.91832 10.5905 6.35785 11.4654 6.12159 12.4486C5.88534 13.4317 5.98708 14.4658 6.4104 15.384C6.83373 16.3022 7.55397 17.0512 8.455 17.51C8.60017 17.5842 8.725 17.6928 8.81859 17.8263C8.91219 17.9598 8.97172 18.1142 8.992 18.276L9 18.4V19H10C10 18.7551 10.09 18.5187 10.2527 18.3356C10.4155 18.1526 10.6397 18.0357 10.883 18.007L11 18H14C14.2449 18 14.4813 18.09 14.6644 18.2527C14.8474 18.4155 14.9643 18.6397 14.993 18.883L15 19H16V18.4C16.0001 18.2159 16.051 18.0353 16.1472 17.8783C16.2434 17.7212 16.381 17.5938 16.545 17.51C17.4626 17.0402 18.1922 16.2711 18.613 15.33C18.688 15.1617 18.8081 15.0173 18.96 14.913L19.079 14.843L20 14.382V13H19.793C19.5753 12.9999 19.3635 12.9288 19.1899 12.7974C19.0162 12.666 18.8902 12.4815 18.831 12.272C18.5808 11.3923 18.0688 10.6096 17.363 10.028C17.1672 9.86621 17.0402 9.63596 17.008 9.384L17 9.257V8.28ZM16 11C16.2652 11 16.5196 11.1054 16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071C16.5196 12.8946 16.2652 13 16 13C15.7348 13 15.4804 12.8946 15.2929 12.7071C15.1054 12.5196 15 12.2652 15 12C15 11.7348 15.1054 11.4804 15.2929 11.2929C15.4804 11.1054 15.7348 11 16 11ZM11.5 5C10.8943 5 10.3092 5.2199 9.85341 5.61884C9.39763 6.01778 9.1022 6.56862 9.022 7.169C9.50661 7.05646 10.0025 6.99976 10.5 7H13.877L13.947 6.983C13.8284 6.42196 13.5206 5.91874 13.075 5.5577C12.6295 5.19666 12.0734 4.99976 11.5 5Z" fill="white" />
              </g>
              <defs>
                <clipPath id="clip0_684_31624">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <span className="font-medium text-base">Conto di risparmio</span>
        </div>
        <div className="text-right">
          <span className="text-base mr-1">€</span>
          <span className="text-2xl font-medium" style={{ fontFamily: 'Apfel Grotezk, system-ui, sans-serif' }}>
            {currentAmount}
          </span>
          <span className="text-base" style={{ fontFamily: 'Apfel Grotezk, system-ui, sans-serif' }}>
            ,00
          </span>
        </div>
      </div>

      {/* Progress Container */}
      <div className="space-y-3">
        <div className="bg-white/30 h-2 rounded-full overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {phase === 'celebrating' || isComplete ? (
            <span className="font-medium animate-pulse">🎉 Hai raggiunto il tuo obiettivo!</span>
          ) : phase === 'loading' ? (
            <span>
              Hai accumulato <span className="font-medium">€ {currentAmount},00</span>, ti mancano <span className="font-medium">€ {remaining},00</span> per l'obiettivo
            </span>
          ) : phase === 'resetting' ? (
            <span className="opacity-50">Riavvio in corso...</span>
          ) : (
            <span className="opacity-75">Pronto per iniziare</span>
          )}
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-white/5 rounded-full" />
      </div>
    </div>
  );
};

export default SavingsAnimation; 