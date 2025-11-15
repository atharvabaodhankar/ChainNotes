import { useState, useEffect } from 'react';

const DeployProgress = ({ isOpen, currentStep, onComplete }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const steps = [
    {
      id: 'encrypting',
      title: 'Encrypting your note...',
      subtitle: 'Applying AES-256 client-side encryption',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'uploading',
      title: 'Uploading to IPFS...',
      subtitle: 'Pinning encrypted content to IPFS via Pinata',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'blockchain',
      title: 'Storing metadata on Blockchain...',
      subtitle: 'Sending transaction to Ethereum Sepolia testnet',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'confirming',
      title: 'Waiting for confirmation...',
      subtitle: 'Mining and confirming your transaction...',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      id: 'finalizing',
      title: 'Almost done...',
      subtitle: 'Preparing your decentralized note',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-600'
    }
  ];

  useEffect(() => {
    if (currentStep === steps.length) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length, onComplete]);

  if (!isOpen) return null;

  const activeStep = steps[currentStep] || steps[steps.length - 1];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full animate-slideUp">
        {showSuccess ? (
          // Success State
          <div className="text-center animate-scaleIn">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Note Deployed Successfully!
            </h3>
            <p className="text-gray-600">
              Your note is now on the blockchain
            </p>
          </div>
        ) : (
          // Progress State
          <div className="text-center">
            {/* Animated Icon */}
            <div className={`w-20 h-20 bg-gradient-to-r ${activeStep.color} rounded-full flex items-center justify-center mx-auto mb-6 text-white animate-pulse shadow-lg`}>
              {activeStep.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 animate-fadeIn">
              {activeStep.title}
            </h3>

            {/* Subtitle */}
            <p className="text-gray-600 text-sm mb-6 animate-fadeIn">
              {activeStep.subtitle}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${activeStep.color} rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Step Counter */}
            <p className="text-gray-500 text-xs">
              Step {currentStep + 1} of {steps.length}
            </p>

            {/* Loading Dots */}
            <div className="flex justify-center gap-1 mt-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeployProgress;
