import { NOTE_TEMPLATES } from '../utils/noteFilters';

const TemplateSelector = ({ onSelectTemplate, onClose }) => {
  const templates = [
    { id: 'blank', name: 'Blank Note', icon: '📝', description: 'Start from scratch' },
    { id: 'meeting', name: 'Meeting Notes', icon: '👥', description: 'Structured meeting template' },
    { id: 'todo', name: 'To-Do List', icon: '✅', description: 'Task checklist' },
    { id: 'idea', name: 'Idea', icon: '💡', description: 'Capture your ideas' },
    { id: 'journal', name: 'Daily Journal', icon: '📔', description: 'Daily reflection' },
    { id: 'code', name: 'Code Snippet', icon: '💻', description: 'Save code snippets' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 max-w-3xl w-full shadow-2xl shadow-purple-500/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-100 bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
            Choose a Template
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => {
                onSelectTemplate(NOTE_TEMPLATES[template.id]);
                onClose();
              }}
              className="bg-gray-700/30 hover:bg-gray-700/50 border border-purple-500/20 hover:border-emerald-500/40 rounded-xl p-6 transition-all duration-300 text-left group"
            >
              <div className="text-4xl mb-3">{template.icon}</div>
              <h3 className="text-gray-100 font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
                {template.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {template.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;