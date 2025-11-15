const EnhancedNoteCard = ({ note, onDelete, onToggleFavorite, onClick }) => {
  return (
    <div
      className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 group cursor-pointer"
      onClick={() => onClick(note)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-purple-200 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
            #{note.id}
          </span>
          {note.category && (
            <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
              {note.category}
            </span>
          )}
        </div>
        
        <span className="text-xs text-gray-500">
          {new Date(Number(note.timestamp) * 1000).toLocaleDateString()}
        </span>
      </div>

      <h3 className="font-bold text-gray-900 mb-1">{note.title}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{note.content}</p>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {new Date(Number(note.timestamp) * 1000).toLocaleTimeString()}
        </div>
        <div className="flex items-center gap-1.5 text-blue-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Encrypted</span>
        </div>
      </div>

      {/* Animated action buttons */}
      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(note.id);
          }}
          className="text-gray-400 hover:text-yellow-500 hover:scale-110 transition-all duration-200 p-1.5 rounded-md hover:bg-yellow-50"
          title={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg className="w-4 h-4" fill={note.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note);
          }}
          className="text-gray-400 hover:text-red-500 hover:scale-110 transition-all duration-200 p-1.5 rounded-md hover:bg-red-50"
          title="Delete note"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <a
          href={`https://gateway.pinata.cloud/ipfs/${note.ipfsHash}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-blue-500 hover:scale-110 transition-all duration-200 p-1.5 rounded-md hover:bg-blue-50"
          title="View on IPFS"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default EnhancedNoteCard;