import { getNoteStats } from '../utils/noteFilters';

const StatsCard = ({ notes }) => {
  const stats = getNoteStats(notes);

  const statItems = [
    {
      label: 'Total Notes',
      value: stats.total,
      icon: '📝',
      color: 'from-emerald-500 to-purple-500'
    },
    {
      label: 'Favorites',
      value: stats.favorites,
      icon: '⭐',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      label: 'Categories',
      value: stats.categories,
      icon: '🏷️',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      label: 'This Week',
      value: stats.thisWeek,
      icon: '📅',
      color: 'from-pink-500 to-purple-500'
    },
    {
      label: 'This Month',
      value: stats.thisMonth,
      icon: '📊',
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'On Chain',
      value: '✓',
      icon: '⛓️',
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statItems.map((stat, index) => (
        <div
          key={index}
          className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 p-4 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color} animate-pulse`}></div>
          </div>
          <div className="text-gray-400 text-xs mb-1">{stat.label}</div>
          <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCard;