import { useState } from 'react';
import { getMetaMaskDownloadUrl, openInMetaMaskApp, getMobileInstructions } from '../utils/mobileDetection';

const MobileMetaMaskPrompt = ({ onContinueAnyway }) => {
  const { platform, instructions } = getMobileInstructions();
  const [showContinueOption, setShowContinueOption] = useState(false);

  const handleDownloadMetaMask = () => {
    window.open(getMetaMaskDownloadUrl(), '_blank');
  };

  const handleOpenInMetaMask = () => {
    openInMetaMaskApp();
  };

  const handleContinueAnyway = () => {
    if (onContinueAnyway) {
      onContinueAnyway();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-10 max-w-md w-full text-center shadow-2xl shadow-purple-500/10">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/25">
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-100 mb-3">
          {platform} Browser Detected
        </h1>
        
        <p className="text-gray-300 mb-6 leading-relaxed">
          {instructions}
        </p>

        <div className="space-y-4">
          <button
            onClick={handleOpenInMetaMask}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-orange-400 hover:to-red-400 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open in MetaMask App
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          <button
            onClick={handleDownloadMetaMask}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download MetaMask
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            MetaMask is required to interact with this decentralized application. 
            Your private keys remain secure and never leave your device.
          </p>
          
          {!showContinueOption ? (
            <button
              onClick={() => setShowContinueOption(true)}
              className="text-gray-500 hover:text-gray-300 text-xs underline transition-colors duration-200"
            >
              Advanced: Continue with regular browser
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-yellow-400 text-xs">
                ⚠️ Warning: Regular mobile browsers may have limited Web3 functionality
              </p>
              <button
                onClick={handleContinueAnyway}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors duration-200"
              >
                Continue Anyway
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMetaMaskPrompt;