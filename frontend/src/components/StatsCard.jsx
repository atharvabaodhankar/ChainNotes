import { getNoteStats } from '../utils/noteFilters';

const StatsCard = ({ notes }) => {
  const stats = getNoteStats(notes);

  const statItems = [
    {
      label: 'Total Notes',
      value: stats.total,
      icon: 'folder',
      color: 'purple'
    },
    {
      label: 'Favorites',
      value: stats.favorites,
      icon: 'star',
      color: 'orange'
    },
    {
      label: 'Categories',
      value: stats.categories,
      icon: 'category',
      color: 'blue'
    },
    {
      label: 'This Week',
      value: stats.thisWeek,
      icon: 'calendar_view_week',
      color: 'pink'
    },
    {
      label: 'This Month',
      value: stats.thisMonth,
      icon: 'calendar_today',
      color: 'green'
    },
    {
      label: 'On Chain',
      value: stats.total > 0 ? '✓' : '-',
      icon: 'verified_user',
      color: 'cyan'
    }
  ];

  const colorClasses = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-500', dot: 'bg-purple-500' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-500', dot: 'bg-orange-500' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-500', dot: 'bg-blue-500' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-500', dot: 'bg-pink-500' },
    green: { bg: 'bg-green-100', text: 'text-green-500', dot: 'bg-green-500' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-500', dot: 'bg-cyan-500' }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      {statItems.map((stat, index) => {
        const colors = colorClasses[stat.color];
        return (
          <div key={index} className="bg-white p-5 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-md ${colors.bg}`}>
                <span className={`material-icons-outlined ${colors.text}`}>{stat.icon}</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${colors.dot} mt-1`}></span>
            </div>
            <p className="text-sm text-gray-500 mt-4">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCard;