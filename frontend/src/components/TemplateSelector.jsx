import { NOTE_TEMPLATES } from '../utils/noteFilters';

const TemplateSelector = ({ onSelectTemplate, onClose }) => {
  const templates = [
    { 
      id: 'blank', 
      name: 'Blank Note', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Start from scratch',
      color: 'from-gray-500 to-gray-600'
    },
    { 
      id: 'meeting', 
      name: 'Meeting Notes', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Structured meeting template',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      id: 'todo', 
      name: 'To-Do List', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      description: 'Task checklist',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      id: 'idea', 
      name: 'Idea', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      description: 'Capture your ideas',
      color: 'from-yellow-500 to-orange-600'
    },
    { 
      id: 'journal', 
      name: 'Daily Journal', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: 'Daily reflection',
      color: 'from-purple-500 to-pink-600'
    },
    { 
      id: 'code', 
      name: 'Code Snippet', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      description: 'Save code snippets',
      color: 'from-cyan-500 to-blue-600'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6 max-w-3xl w-full shadow-2xl shadow-blue-500/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-100 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
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
              className="bg-gray-700/30 hover:bg-gray-700/50 border border-blue-500/20 hover:border-blue-500/40 rounded-xl p-6 transition-all duration-300 text-left group"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${template.color} text-white mb-3`}>
                {template.icon}
              </div>
              <h3 className="text-gray-100 font-semibold mb-2 group-hover:text-blue-400 transition-colors">
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