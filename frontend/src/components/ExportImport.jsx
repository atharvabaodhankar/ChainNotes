import { useState } from 'react';
import { exportNotes } from '../utils/noteFilters';

const ExportImport = ({ notes, onImport, onClose }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [importFile, setImportFile] = useState(null);

  const handleExport = (format) => {
    const url = exportNotes(notes, format);
    const link = document.createElement('a');
    link.href = url;
    link.download = `web3-notes-${Date.now()}.${format === 'markdown' ? 'md' : format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        onImport(data);
        alert(`Successfully imported ${data.length} notes!`);
        onClose();
      } catch (error) {
        alert('Failed to import notes. Please check the file format.');
      }
    };
    reader.readAsText(importFile);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 max-w-2xl w-full shadow-2xl shadow-purple-500/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-100 bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
            Export / Import Notes
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'export'
                ? 'bg-gradient-to-r from-emerald-500 to-purple-500 text-white'
                : 'bg-gray-700/50 text-gray-400 hover:text-gray-200'
            }`}
          >
            Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'import'
                ? 'bg-gradient-to-r from-emerald-500 to-purple-500 text-white'
                : 'bg-gray-700/50 text-gray-400 hover:text-gray-200'
            }`}
          >
            Import
          </button>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <p className="text-gray-300 mb-4">
              Export your notes in different formats. You have <span className="font-bold text-emerald-400">{notes.length}</span> notes to export.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleExport('json')}
                className="bg-gray-700/30 hover:bg-gray-700/50 border border-purple-500/20 hover:border-emerald-500/40 rounded-xl p-6 transition-all duration-300 group"
              >
                <div className="text-3xl mb-2">📄</div>
                <h3 className="text-gray-100 font-semibold mb-1 group-hover:text-emerald-400 transition-colors">
                  JSON
                </h3>
                <p className="text-gray-400 text-sm">
                  Full data export
                </p>
              </button>

              <button
                onClick={() => handleExport('markdown')}
                className="bg-gray-700/30 hover:bg-gray-700/50 border border-purple-500/20 hover:border-emerald-500/40 rounded-xl p-6 transition-all duration-300 group"
              >
                <div className="text-3xl mb-2">📝</div>
                <h3 className="text-gray-100 font-semibold mb-1 group-hover:text-emerald-400 transition-colors">
                  Markdown
                </h3>
                <p className="text-gray-400 text-sm">
                  Formatted text
                </p>
              </button>

              <button
                onClick={() => handleExport('txt')}
                className="bg-gray-700/30 hover:bg-gray-700/50 border border-purple-500/20 hover:border-emerald-500/40 rounded-xl p-6 transition-all duration-300 group"
              >
                <div className="text-3xl mb-2">📋</div>
                <h3 className="text-gray-100 font-semibold mb-1 group-hover:text-emerald-400 transition-colors">
                  Plain Text
                </h3>
                <p className="text-gray-400 text-sm">
                  Simple format
                </p>
              </button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
              <p className="text-blue-300 text-sm">
                💡 <strong>Tip:</strong> JSON format preserves all metadata and can be re-imported later.
              </p>
            </div>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <p className="text-gray-300 mb-4">
              Import notes from a previously exported JSON file.
            </p>

            <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center">
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-gray-300 font-medium mb-2">
                  {importFile ? importFile.name : 'Click to select file'}
                </span>
                <span className="text-gray-500 text-sm">
                  JSON files only
                </span>
              </label>
            </div>

            {importFile && (
              <button
                onClick={handleImport}
                className="w-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-105"
              >
                Import Notes
              </button>
            )}

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-6">
              <p className="text-yellow-300 text-sm">
                ⚠️ <strong>Warning:</strong> Imported notes will be added to your existing notes. This action cannot be undone.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportImport;