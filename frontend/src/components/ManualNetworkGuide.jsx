import { useState } from 'react';

const ManualNetworkGuide = ({ onClose }) => {
  const [copied, setCopied] = useState('');

  const networkConfig = {
    'Network Name': 'Sepolia test network',
    'New RPC URL': 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    'Chain ID': '11155111',
    'Currency Symbol': 'ETH',
    'Block Explorer URL': 'https://sepolia.etherscan.io/'
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl border border-blue-500/20 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-100 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Manual Network Setup</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-300 text-sm">
            If automatic network addition failed, you can manually add Sepolia network in MetaMask:
          </p>

          <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
            <p className="text-gray-200 text-sm font-medium">Steps:</p>
            <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
              <li>Open MetaMask</li>
              <li>Tap the network dropdown (top center)</li>
              <li>Tap "Add Network" or "Custom RPC"</li>
              <li>Fill in the details below:</li>
            </ol>
          </div>

          <div className="space-y-3">
            {Object.entries(networkConfig).map(([field, value]) => (
              <div key={field} className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-400 text-xs font-medium">{field}:</label>
                  <button
                    onClick={() => copyToClipboard(value, field)}
                    className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                  >
                    {copied === field ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="text-gray-200 text-sm font-mono bg-gray-800/50 rounded px-2 py-1 break-all">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-400 hover:to-purple-500 transition-all duration-300"
          >
            Got it, thanks!
          </button>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-300 text-xs">
              💡 Tip: After adding the network, make sure to switch to it before connecting your wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualNetworkGuide;