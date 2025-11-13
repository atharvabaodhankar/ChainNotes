import { useState } from 'react';

const SearchFilter = ({ onFilterChange, categories, noteCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: 'all',
    showFavoritesOnly: false,
    sortBy: 'newest'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4 sm:p-6 mb-6 shadow-2xl shadow-purple-500/10">
      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search notes..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="w-full bg-gray-700/50 text-gray-100 px-4 py-3 pl-12 rounded-xl border border-purple-500/20 focus:border-emerald-500/40 focus:outline-none transition-colors"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gray-700/50 hover:bg-gray-700 text-gray-300 px-4 py-3 rounded-xl border border-purple-500/20 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-700/50">
          {/* Category Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full bg-gray-700/50 text-gray-100 px-4 py-2 rounded-lg border border-purple-500/20 focus:border-emerald-500/40 focus:outline-none transition-colors"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full bg-gray-700/50 text-gray-100 px-4 py-2 rounded-lg border border-purple-500/20 focus:border-emerald-500/40 focus:outline-none transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="modified">Recently Modified</option>
              <option value="favorites">Favorites First</option>
            </select>
          </div>

          {/* Favorites Toggle */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Show Only
            </label>
            <button
              onClick={() => handleFilterChange('showFavoritesOnly', !filters.showFavoritesOnly)}
              className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 ${
                filters.showFavoritesOnly
                  ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                  : 'bg-gray-700/50 border-purple-500/20 text-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill={filters.showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Favorites
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mt-4 text-center text-gray-400 text-sm">
        {noteCount} {noteCount === 1 ? 'note' : 'notes'} found
      </div>
    </div>
  );
};

export default SearchFilter;