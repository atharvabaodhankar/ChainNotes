import { useState, useEffect } from 'react';

const FaucetStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFaucetStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchFaucetStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFaucetStatus = async () => {
    try {
      const response = await fetch('/api/faucet-status');
      const data = await response.json();
      
      if (response.ok) {
        setStatus(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch status');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-2xl shadow-purple-500/10">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !status?.configured) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-red-300 font-semibold">Faucet Unavailable</h3>
            <p className="text-red-200 text-sm">{error || 'Faucet not configured'}</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'healthy': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const statusColor = getStatusColor();

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-2xl shadow-purple-500/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Faucet Status</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-500/20 text-${statusColor}-300 border border-${statusColor}-500/30`}>
          <div className={`w-2 h-2 rounded-full bg-${statusColor}-400 animate-pulse`}></div>
          {status.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Balance Info */}
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm font-medium mb-2">Balance</h4>
          <div className="text-2xl font-bold text-gray-100 mb-1">
            {parseFloat(status.faucet.balance).toFixed(4)} ETH
          </div>
          {status.faucet.isLowBalance && (
            <div className="text-yellow-400 text-xs">⚠️ Low balance - refill needed</div>
          )}
        </div>

        {/* Capacity Info */}
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm font-medium mb-2">Capacity</h4>
          <div className="text-2xl font-bold text-gray-100 mb-1">
            {status.capacity.requestsRemaining}
          </div>
          <div className="text-gray-400 text-xs">
            requests remaining (~{status.capacity.estimatedDaysRemaining} days)
          </div>
        </div>

        {/* Settings */}
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm font-medium mb-2">Settings</h4>
          <div className="space-y-1 text-sm">
            <div className="text-gray-100">
              Amount: <span className="font-mono">{status.settings.amountPerRequest} ETH</span>
            </div>
            <div className="text-gray-100">
              Rate limit: <span className="font-mono">{status.settings.rateLimitHours}h</span>
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm font-medium mb-2">Network</h4>
          <div className="space-y-1 text-sm">
            <div className="text-gray-100">
              Chain: <span className="font-mono">{status.network.name}</span>
            </div>
            <div className="text-gray-100">
              Block: <span className="font-mono">#{status.network.blockNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Faucet Address */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Faucet Address:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-300">
              {status.faucet.address.slice(0, 6)}...{status.faucet.address.slice(-4)}
            </span>
            <a
              href={`https://sepolia.etherscan.io/address/${status.faucet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Last updated: {new Date(status.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default FaucetStatus;