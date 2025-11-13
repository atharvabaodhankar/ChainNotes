/**
 * Note filtering and search utilities
 */

export const filterNotes = (notes, filters) => {
  let filtered = [...notes];

  // Search by text
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  }

  // Filter by category
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(note => note.category === filters.category);
  }

  // Filter by favorites
  if (filters.showFavoritesOnly) {
    filtered = filtered.filter(note => note.isFavorite);
  }

  // Filter by date range
  if (filters.dateFrom) {
    const fromTimestamp = new Date(filters.dateFrom).getTime() / 1000;
    filtered = filtered.filter(note => note.timestamp >= fromTimestamp);
  }

  if (filters.dateTo) {
    const toTimestamp = new Date(filters.dateTo).getTime() / 1000;
    filtered = filtered.filter(note => note.timestamp <= toTimestamp);
  }

  return filtered;
};

export const sortNotes = (notes, sortBy = 'newest') => {
  const sorted = [...notes];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => b.timestamp - a.timestamp);
    
    case 'oldest':
      return sorted.sort((a, b) => a.timestamp - b.timestamp);
    
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    
    case 'modified':
      return sorted.sort((a, b) => (b.lastModified || b.timestamp) - (a.lastModified || a.timestamp));
    
    case 'favorites':
      return sorted.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return b.timestamp - a.timestamp;
      });
    
    default:
      return sorted;
  }
};

export const getCategories = (notes) => {
  const categories = new Set();
  notes.forEach(note => {
    if (note.category) {
      categories.add(note.category);
    }
  });
  return Array.from(categories).sort();
};

export const getNoteStats = (notes) => {
  return {
    total: notes.length,
    favorites: notes.filter(n => n.isFavorite).length,
    categories: getCategories(notes).length,
    thisWeek: notes.filter(n => {
      const weekAgo = Date.now() / 1000 - (7 * 24 * 60 * 60);
      return n.timestamp > weekAgo;
    }).length,
    thisMonth: notes.filter(n => {
      const monthAgo = Date.now() / 1000 - (30 * 24 * 60 * 60);
      return n.timestamp > monthAgo;
    }).length
  };
};

export const exportNotes = (notes, format = 'json') => {
  if (format === 'json') {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    return URL.createObjectURL(dataBlob);
  }

  if (format === 'markdown') {
    let markdown = '# My Web3 Notes\n\n';
    notes.forEach(note => {
      markdown += `## ${note.title}\n\n`;
      markdown += `**Created:** ${new Date(note.timestamp * 1000).toLocaleDateString()}\n`;
      if (note.category) markdown += `**Category:** ${note.category}\n`;
      markdown += `\n${note.content}\n\n---\n\n`;
    });
    const dataBlob = new Blob([markdown], { type: 'text/markdown' });
    return URL.createObjectURL(dataBlob);
  }

  if (format === 'txt') {
    let text = 'MY WEB3 NOTES\n' + '='.repeat(50) + '\n\n';
    notes.forEach(note => {
      text += `${note.title}\n`;
      text += `Created: ${new Date(note.timestamp * 1000).toLocaleDateString()}\n`;
      if (note.category) text += `Category: ${note.category}\n`;
      text += `\n${note.content}\n\n`;
      text += '-'.repeat(50) + '\n\n';
    });
    const dataBlob = new Blob([text], { type: 'text/plain' });
    return URL.createObjectURL(dataBlob);
  }
};

export const NOTE_TEMPLATES = {
  blank: {
    title: '',
    content: '',
    category: ''
  },
  meeting: {
    title: 'Meeting Notes - ',
    content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 

## Agenda
- 

## Discussion Points
- 

## Action Items
- [ ] 

## Next Steps
- `,
    category: 'Meetings'
  },
  todo: {
    title: 'To-Do List - ',
    content: `# To-Do List

**Priority:** High / Medium / Low

## Tasks
- [ ] 
- [ ] 
- [ ] 

## Notes
`,
    category: 'Tasks'
  },
  idea: {
    title: 'Idea - ',
    content: `# Idea

**Category:** 
**Status:** Draft / In Progress / Complete

## Description


## Why This Matters


## Next Steps
- 
`,
    category: 'Ideas'
  },
  journal: {
    title: `Journal - ${new Date().toLocaleDateString()}`,
    content: `# Daily Journal

**Date:** ${new Date().toLocaleDateString()}
**Mood:** 😊 😐 😔

## Today's Highlights


## Challenges


## Grateful For


## Tomorrow's Goals
- 
`,
    category: 'Journal'
  },
  code: {
    title: 'Code Snippet - ',
    content: `# Code Snippet

**Language:** 
**Purpose:** 

\`\`\`
// Your code here

\`\`\`

## Notes


## Usage

`,
    category: 'Code'
  }
};
