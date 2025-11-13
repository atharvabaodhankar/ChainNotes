import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { requestSepoliaETH, checkFaucetEligibility, getUserBalance, formatFaucetError } from '../utils/faucet';

const FaucetButton = ({ userAddress, isConnected }) => {
  const [isEligible, setIsEligible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [balance, setBalance] = useState('0');
  const [lastRequest, setLastRequest] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check eligibility and balance on mount and when address changes
  useEffect(() => {
    if (isConnected && userAddress) {
      checkEligibilityAndBalance();
    }
  }, [isConnected, userAddress]);

  const checkEligibilityAndBalance = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const eligible = await checkFaucetEligibility(userAddress, provider);
      const currentBalance = await getUserBalance(userAddress, provider);
      
      setIsEligible(eligible);
      setBalance(currentBalance);
    } catch (error) {
      console.error('Error checking faucet eligibility:', error);
    }
  };

  const handleFaucetRequest = async () => {
    if (!isConnected || !userAddress || isRequesting) return;

    setIsRequesting(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const result = await requestSepoliaETH(userAddress, signer);
      
      if (result.success) {
        setShowSuccess(true);
        setLastRequest(result);
        setIsEligible(false);
        
        // Update balance after successful request
        setTimeout(() => {
          checkEligibilityAndBalance();
        }, 3000);
        
        // Hide success message after 10 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 10000);
      }
    } catch (error) {
      console.error('Faucet request failed:', error);
      alert(formatFaucetError(error));
    } finally {
      setIsRequesting(false);
    }
  };

  // Don't show if not connected
  if (!isConnected || !userAddress) {
    return null;
  }

  // Don't show if not eligible (has enough ETH)
  if (!isEligible && !showSuccess) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
      {showSuccess && lastRequest ? (
        // Success state
        <div className="text-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-green-400 font-semibold mb-2">ETH Sent Successfully! 🎉</h3>
          <p className="text-gray-300 text-sm mb-3">
            {lastRequest.amount} ETH has been sent to your wallet
          </p>
          <a
            href={lastRequest.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Transaction
          </a>
        </div>
      ) : (
        // Request state
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h3 className="text-blue-300 font-semibold">Need Sepolia ETH?</h3>
              <p className="text-gray-400 text-sm">
                Balance: {parseFloat(balance).toFixed(4)} ETH
              </p>
            </div>
          </div>
          <button
            onClick={handleFaucetRequest}
            disabled={isRequesting}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-400 hover:to-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isRequesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Requesting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Get Free ETH
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FaucetButton;