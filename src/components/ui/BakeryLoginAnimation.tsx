import React, { useEffect, useState } from 'react';

interface BakeryLoginAnimationProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

const BakeryLoginAnimation: React.FC<BakeryLoginAnimationProps> = ({ 
  isVisible, 
  onAnimationComplete 
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [breadInOven, setBreadInOven] = useState(false);
  const [ovenGlow, setOvenGlow] = useState(false);
  const [breadRising, setBreadRising] = useState(false);
  const [breadReady, setBreadReady] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setAnimationPhase(0);
      setBreadInOven(false);
      setOvenGlow(false);
      setBreadRising(false);
      setBreadReady(false);
      return;
    }

    // Start the animation sequence
    const animationSequence = async () => {
      // Phase 1: Put bread in oven
      await new Promise(resolve => setTimeout(resolve, 500));
      setBreadInOven(true);
      setAnimationPhase(1);

      // Phase 2: Oven starts glowing
      await new Promise(resolve => setTimeout(resolve, 800));
      setOvenGlow(true);
      setAnimationPhase(2);

      // Phase 3: Bread starts rising
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBreadRising(true);
      setAnimationPhase(3);

      // Phase 4: Bread is ready
      await new Promise(resolve => setTimeout(resolve, 1200));
      setBreadReady(true);
      setAnimationPhase(4);

      // Phase 5: Take bread out
      await new Promise(resolve => setTimeout(resolve, 800));
      setBreadInOven(false);
      setOvenGlow(false);
      setBreadRising(false);
      setBreadReady(false);
      setAnimationPhase(5);

      // Complete animation
      await new Promise(resolve => setTimeout(resolve, 500));
      onAnimationComplete?.();
    };

    animationSequence();
  }, [isVisible, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Animation Container */}
        <div className="relative h-64 mb-6 flex items-center justify-center">
          {/* Oven */}
          <div className={`relative w-48 h-32 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg border-4 border-gray-600 transition-all duration-1000 ${
            ovenGlow ? 'shadow-2xl shadow-orange-500/50' : ''
          }`}>
            {/* Oven Door */}
            <div className="absolute inset-2 bg-gradient-to-b from-gray-600 to-gray-800 rounded border-2 border-gray-500">
              {/* Oven Window */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gray-300 rounded border border-gray-400">
                {ovenGlow && (
                  <div className="w-full h-full bg-orange-400 animate-pulse rounded"></div>
                )}
              </div>
              
              {/* Bread Inside Oven */}
              {breadInOven && (
                <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ${
                  breadRising ? 'scale-110' : 'scale-100'
                }`}>
                  {/* Bread Loaf */}
                  <div className={`w-16 h-8 bg-amber-600 rounded-full border-2 border-amber-700 transition-all duration-1000 ${
                    breadReady ? 'bg-amber-500' : 'bg-amber-600'
                  }`}>
                    {/* Bread Texture */}
                    <div className="w-full h-full bg-gradient-to-b from-amber-500 to-amber-700 rounded-full opacity-80"></div>
                  </div>
                  
                  {/* Steam Effect */}
                  {breadReady && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-3 bg-gray-300 rounded-full animate-pulse opacity-60"></div>
                      <div className="w-1 h-2 bg-gray-300 rounded-full animate-pulse opacity-40 ml-1 -mt-1"></div>
                      <div className="w-1 h-2 bg-gray-300 rounded-full animate-pulse opacity-60 -ml-1 -mt-1"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Oven Handle */}
            <div className="absolute top-4 right-2 w-3 h-8 bg-gray-500 rounded-full"></div>
            
            {/* Oven Controls */}
            <div className="absolute bottom-2 left-2 flex space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Bread on Counter (when taken out) */}
          {animationPhase === 5 && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-20 h-10 bg-amber-500 rounded-full border-2 border-amber-600 shadow-lg">
                <div className="w-full h-full bg-gradient-to-b from-amber-400 to-amber-600 rounded-full opacity-90"></div>
              </div>
            </div>
          )}

          {/* Floating Flour Particles */}
          {breadRising && (
            <>
              <div className="absolute top-8 left-8 w-2 h-2 bg-white rounded-full animate-ping opacity-60"></div>
              <div className="absolute top-12 right-12 w-1 h-1 bg-white rounded-full animate-ping opacity-40"></div>
              <div className="absolute top-16 left-16 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-50"></div>
            </>
          )}
        </div>

        {/* Status Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-800">
            {animationPhase === 0 && 'Pregătim cuptorul...'}
            {animationPhase === 1 && 'Introducem pâinea...'}
            {animationPhase === 2 && 'Încălzim cuptorul...'}
            {animationPhase === 3 && 'Pâinea se coace...'}
            {animationPhase === 4 && 'Pâinea este gata! 🍞'}
            {animationPhase === 5 && 'Bon appétit! ✨'}
          </h3>
          
          <p className="text-gray-600">
            {animationPhase === 0 && 'Se inițializează sistemul...'}
            {animationPhase === 1 && 'Se verifică autentificarea...'}
            {animationPhase === 2 && 'Se validează credențialele...'}
            {animationPhase === 3 && 'Se procesează datele...'}
            {animationPhase === 4 && 'Se finalizează conectarea...'}
            {animationPhase === 5 && 'Redirecționare către dashboard...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(animationPhase / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BakeryLoginAnimation;
