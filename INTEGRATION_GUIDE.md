# 🔧 Integration Guide - New Features

## Quick Start: Adding New Features to Your App

### 1. Import New Components

```javascript
// In your App.jsx
import SearchFilter from './components/SearchFilter';
import TemplateSelector from './components/TemplateSelector';
import ExportImport from './components/ExportImport';
import ThemeToggle from './components/ThemeToggle';
import EnhancedNoteCard from './components/EnhancedNoteCard';
import StatsCard from './components/StatsCard';
import { filterNotes, sortNotes, getCategories } from './utils/noteFilters';
```

### 2. Add State Management

```javascript
const [filters, setFilters] = useState({
  searchQuery: '',
  category: 'all',
  showFavoritesOnly: false,
  sortBy: 'newest'
});
const [showTemplateSelector, setShowTemplateSelector] = useState(false);
const [showExportImport, setShowExportImport] = useState(false);
```

### 3. Implement Filter Logic

```javascript
// Filter and sort notes
const filteredNotes = useMemo(() => {
  let result = filterNotes(notes, filters);
  result = sortNotes(result, filters.sortBy);
  return result;
}, [notes, filters]);

// Get categories
const categories = useMemo(() => getCategories(notes), [notes]);
```

### 4. Add UI Components

```javascript
return (
  <div>
    {/* Theme Toggle in Header */}
    <ThemeToggle />

    {/* Stats Dashboard */}
    <StatsCard notes={notes} />

    {/* Search & Filter */}
    <SearchFilter
      onFilterChange={setFilters}
      categories={categories}
      noteCount={filteredNotes.length}
    />

    {/* Notes Grid with Enhanced Cards */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {filteredNotes.map(note => (
        <EnhancedNoteCard
          key={note.id}
          note={note}
          onDelete={handleDeleteClick}
          onToggleFavorite={toggleFavorite}
          onClick={openFullscreen}
        />
      ))}
    </div>

    {/* Template Selector Modal */}
    {showTemplateSelector && (
      <TemplateSelector
        onSelectTemplate={applyTemplate}
        onClose={() => setShowTemplateSelector(false)}
      />
    )}

    {/* Export/Import Modal */}
    {showExportImport && (
      <ExportImport
        notes={notes}
        onImport={handleImport}
        onClose={() => setShowExportImport(false)}
      />
    )}
  </div>
);
```

### 5. Implement Handler Functions

```javascript
// Toggle favorite
const toggleFavorite = async (noteId) => {
  try {
    const contract = await getContract();
    const tx = await contract.toggleFavorite(noteId);
    await tx.wait();
    loadNotes(); // Refresh notes
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
};

// Apply template
const applyTemplate = (template) => {
  setNoteTitle(template.title);
  setNoteContent(template.content);
  setNoteCategory(template.category);
  setShowAddModal(true);
};

// Handle import
const handleImport = async (importedNotes) => {
  for (const note of importedNotes) {
    try {
      // Re-upload to IPFS
      const ipfsHash = await uploadNoteToIPFS(note, userAddress);
      
      // Add to blockchain
      const contract = await getContract();
      const tx = await contract.addNote(ipfsHash, note.category || '');
      await tx.wait();
    } catch (error) {
      console.error('Error importing note:', error);
    }
  }
  loadNotes();
};
```

## 🎨 Styling with Themes

### Add Theme CSS

```css
/* In your App.css or index.css */
:root[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

:root[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
}

/* Apply theme variables */
.bg-primary {
  background-color: var(--bg-primary);
}

.text-primary {
  color: var(--text-primary);
}
```

## 📊 Using the Stats Component

```javascript
import { getNoteStats } from './utils/noteFilters';

// Get statistics
const stats = getNoteStats(notes);

console.log(stats);
// {
//   total: 25,
//   favorites: 8,
//   categories: 5,
//   thisWeek: 3,
//   thisMonth: 12
// }
```

## 🔍 Advanced Search Examples

```javascript
// Search by text
setFilters({ searchQuery: 'meeting' });

// Filter by category
setFilters({ category: 'Work' });

// Show only favorites
setFilters({ showFavoritesOnly: true });

// Combine filters
setFilters({
  searchQuery: 'project',
  category: 'Work',
  showFavoritesOnly: true,
  sortBy: 'modified'
});
```

## 📤 Export Examples

```javascript
import { exportNotes } from './utils/noteFilters';

// Export as JSON
const jsonUrl = exportNotes(notes, 'json');
downloadFile(jsonUrl, 'notes.json');

// Export as Markdown
const mdUrl = exportNotes(notes, 'markdown');
downloadFile(mdUrl, 'notes.md');

// Export as Text
const txtUrl = exportNotes(notes, 'txt');
downloadFile(txtUrl, 'notes.txt');
```

## 🏷️ Category Management

```javascript
// Get all categories
const categories = getCategories(notes);

// Filter by category
const workNotes = notes.filter(n => n.category === 'Work');

// Add category to new note
const addNoteWithCategory = async (title, content, category) => {
  const noteData = { title, content };
  const ipfsHash = await uploadNoteToIPFS(noteData, userAddress);
  
  const contract = await getContract();
  const tx = await contract.addNote(ipfsHash, category);
  await tx.wait();
};
```

## ⭐ Favorites Management

```javascript
// Toggle favorite status
const toggleFavorite = async (noteId) => {
  const contract = await getContract();
  const tx = await contract.toggleFavorite(noteId);
  await tx.wait();
};

// Get only favorites
const contract = await getContract();
const favorites = await contract.getFavoriteNotes();

// Sort favorites first
const sorted = sortNotes(notes, 'favorites');
```

## 📋 Template Usage

```javascript
import { NOTE_TEMPLATES } from './utils/noteFilters';

// Use a template
const meetingTemplate = NOTE_TEMPLATES.meeting;
setNoteTitle(meetingTemplate.title);
setNoteContent(meetingTemplate.content);
setNoteCategory(meetingTemplate.category);

// Create custom template
const customTemplate = {
  title: 'Custom Template',
  content: 'Your content here...',
  category: 'Custom'
};
```

## 🔄 Update Existing Notes

```javascript
// Update note content
const updateNote = async (noteId, newTitle, newContent, newCategory) => {
  // Create updated note data
  const noteData = { title: newTitle, content: newContent };
  
  // Upload to IPFS
  const ipfsHash = await uploadNoteToIPFS(noteData, userAddress);
  
  // Update on blockchain
  const contract = await getContract();
  const tx = await contract.updateNote(noteId, ipfsHash, newCategory);
  await tx.wait();
  
  loadNotes();
};
```

## 🎯 Best Practices

### 1. Performance Optimization
```javascript
// Use useMemo for expensive operations
const filteredNotes = useMemo(() => {
  return filterNotes(notes, filters);
}, [notes, filters]);

// Debounce search input
const debouncedSearch = useDebounce(searchQuery, 300);
```

### 2. Error Handling
```javascript
try {
  await toggleFavorite(noteId);
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    alert('Transaction cancelled');
  } else {
    alert('Failed to update favorite status');
  }
}
```

### 3. Loading States
```javascript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    // Your action here
  } finally {
    setIsLoading(false);
  }
};
```

### 4. User Feedback
```javascript
// Success notification
toast.success('Note added to favorites!');

// Error notification
toast.error('Failed to delete note');

// Loading notification
toast.loading('Uploading to IPFS...');
```

## 🚀 Deployment Checklist

- [ ] Update smart contract (deploy NotesV2.sol)
- [ ] Update contract ABI in frontend
- [ ] Test all new features locally
- [ ] Update environment variables
- [ ] Deploy frontend
- [ ] Test on mobile devices
- [ ] Update documentation
- [ ] Announce new features

## 📱 Mobile Testing

```javascript
// Test mobile detection
import { isMobileBrowser } from './utils/mobileDetection';

if (isMobileBrowser()) {
  console.log('Mobile browser detected');
}

// Test touch events
<button
  onTouchStart={handleTouch}
  className="touch-manipulation"
>
  Touch Me
</button>
```

## 🎓 Learning Resources

- **Smart Contract:** `smart-contracts/contracts/NotesV2.sol`
- **Filter Utils:** `frontend/src/utils/noteFilters.js`
- **Components:** `frontend/src/components/`
- **Features Doc:** `FEATURES.md`
- **Main README:** `README.md`

---

## 💡 Tips

1. **Start Small:** Implement one feature at a time
2. **Test Thoroughly:** Test on different devices and browsers
3. **User Feedback:** Get feedback before adding more features
4. **Performance:** Monitor app performance with new features
5. **Documentation:** Keep docs updated as you add features

## 🆘 Troubleshooting

### Issue: Filters not working
```javascript
// Check filter state
console.log('Current filters:', filters);
console.log('Filtered notes:', filteredNotes);
```

### Issue: Categories not showing
```javascript
// Verify contract has category support
const note = await contract.notes(noteId);
console.log('Note category:', note.category);
```

### Issue: Export not downloading
```javascript
// Check blob URL creation
const url = exportNotes(notes, 'json');
console.log('Export URL:', url);
```

---

**Need Help?** Check the full documentation in `FEATURES.md` and `README.md`