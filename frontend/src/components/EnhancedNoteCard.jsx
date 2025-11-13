const EnhancedNoteCard = ({ note, onDelete, onToggleFavorite, onClick }) => {
  return (
    <div
      className="bg-gray-700/30 border border-purple-500/20 rounded-xl p-6 hover:border-emerald-500/40 hover:bg-gray-700/50 transition-all duration-300 group backdrop-blur-sm shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
      onClick={() => onClick(note)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-emerald-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
            #{note.id}
          </span>
          {note.category && (
            <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-500/30">
              {note.category}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs font-mono">
            {new Date(Number(note.timestamp) * 1000).toLocaleDateString()}
          </span>
          
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(note.id);
            }}
            className="text-gray-500 hover:text-yellow-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 p-2 sm:p-1 rounded-lg hover:bg-yellow-500/10 touch-manipulation"
            title={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              className="w-4 h-4"
              fill={note.isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            className="text-gray-500 hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 p-2 sm:p-1 rounded-lg hover:bg-red-500/10 touch-manipulation"
            title="Delete note"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-gray-100 font-semibold truncate flex-1">
          {note.title}
        </h3>
        <div className="flex items-center gap-1 text-emerald-400 text-xs">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Encrypted</span>
        </div>
      </div>

      <p className="text-gray-300 text-sm line-clamp-3 mb-4">
        {note.content}
      </p>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {new Date(Number(note.timestamp) * 1000).toLocaleTimeString()}
        </div>
        
        {note.lastModified && note.lastModified !== note.timestamp && (
          <div className="text-gray-500">
            Modified: {new Date(Number(note.lastModified) * 1000).toLocaleDateString()}
          </div>
        )}
      </div>

      <a
        href={`https://gateway.pinata.cloud/ipfs/${note.ipfsHash}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-emerald-400 hover:text-emerald-300 text-xs inline-flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 mt-2"
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
        View on IPFS
      </a>
    </div>
  );
};

export default EnhancedNoteCard;