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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Manual Network Setup</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-600 text-sm">
            If automatic network addition failed, you can manually add Sepolia network in MetaMask:
          </p>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
            <p className="text-purple-900 text-sm font-semibold">Steps:</p>
            <ol className="text-gray-700 text-sm space-y-2 list-decimal list-inside">
              <li>Open MetaMask</li>
              <li>Click the network dropdown (top center)</li>
              <li>Click "Add Network" or "Custom RPC"</li>
              <li>Fill in the details below:</li>
            </ol>
          </div>

          <div className="space-y-3">
            {Object.entries(networkConfig).map(([field, value]) => (
              <div key={field} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-700 text-xs font-semibold">{field}:</label>
                  <button
                    onClick={() => copyToClipboard(value, field)}
                    className={`text-xs font-medium px-3 py-1 rounded-md transition-all ${
                      copied === field
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {copied === field ? (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </span>
                    ) : (
                      'Copy'
                    )}
                  </button>
                </div>
                <div className="text-gray-900 text-sm font-mono bg-white border border-gray-200 rounded px-3 py-2 break-all">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30"
          >
            Got it, thanks!
          </button>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-800 text-xs">
                <strong>Tip:</strong> After adding the network, make sure to switch to it before connecting your wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualNetworkGuide;