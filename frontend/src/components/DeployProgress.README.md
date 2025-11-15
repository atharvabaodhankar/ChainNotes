# DeployProgress Component

A beautiful, animated progress indicator for Web3 deployment workflows.

## Features

- ✨ Smooth step-by-step animations
- 🎨 Purple gradient theme matching app design
- 📱 Fully responsive
- ♻️ Reusable for any multi-step async process
- 🎯 Professional, minimal design

## Usage

### Basic Implementation

```jsx
import DeployProgress from './components/DeployProgress';
import { useDeployProgress } from './hooks/useDeployProgress';

function MyComponent() {
  const deployProgress = useDeployProgress();

  const handleDeploy = async () => {
    deployProgress.start(); // Show modal, step 0
    
    try {
      // Step 1: Encrypting
      await encryptData();
      deployProgress.nextStep();
      
      // Step 2: Uploading to IPFS
      await uploadToIPFS();
      deployProgress.nextStep();
      
      // Step 3: Blockchain transaction
      await sendTransaction();
      deployProgress.nextStep();
      
      // Step 4: Confirmation
      await waitForConfirmation();
      deployProgress.nextStep();
      
      // Step 5: Finalizing
      await finalize();
      deployProgress.nextStep();
      
      // Success screen shows automatically
      // Modal auto-closes after 2 seconds
    } catch (error) {
      deployProgress.reset(); // Close modal on error
      // Handle error
    }
  };

  return (
    <>
      <button onClick={handleDeploy}>Deploy</button>
      
      <DeployProgress
        isOpen={deployProgress.isOpen}
        currentStep={deployProgress.currentStep}
        onComplete={deployProgress.complete}
      />
    </>
  );
}
```

## Hook API

### `useDeployProgress()`

Returns an object with:

- `isOpen` (boolean) - Whether the modal is visible
- `currentStep` (number) - Current step index (0-4)
- `start()` - Open modal and reset to step 0
- `nextStep()` - Advance to next step
- `reset()` - Close modal immediately
- `complete()` - Called after success animation (auto-closes)

## Steps

The component shows 5 steps:

1. **Encrypting** - Lock icon, purple gradient
2. **Uploading to IPFS** - Cloud upload icon, blue gradient
3. **Storing on Blockchain** - Server icon, indigo gradient
4. **Confirming** - Clock icon, cyan gradient
5. **Finalizing** - Lightning icon, purple-pink gradient

After step 5, shows success screen with checkmark.

## Customization

To customize steps, edit the `steps` array in `DeployProgress.jsx`:

```jsx
const steps = [
  {
    id: 'step1',
    title: 'Your Title...',
    subtitle: 'Your description...',
    icon: <YourIcon />,
    color: 'from-color-500 to-color-600'
  },
  // ... more steps
];
```

## Styling

Uses Tailwind CSS with:
- Purple/gradient theme (#A855F7 / #7C3AED)
- Glassmorphism effect
- Smooth transitions
- Responsive design

## Integration Examples

### Delete Note

```jsx
const handleDelete = async (noteId) => {
  deployProgress.start();
  
  try {
    await deleteFromBlockchain(noteId);
    deployProgress.nextStep();
    
    await deleteFromIPFS(noteId);
    deployProgress.nextStep();
    
    // ... more steps
  } catch (error) {
    deployProgress.reset();
  }
};
```

### Import Notes

```jsx
const handleImport = async (file) => {
  deployProgress.start();
  
  try {
    const data = await parseFile(file);
    deployProgress.nextStep();
    
    for (const note of data) {
      await uploadNote(note);
      deployProgress.nextStep();
    }
  } catch (error) {
    deployProgress.reset();
  }
};
```

## Animation Details

- **fadeIn**: 0.2s ease-out
- **slideUp**: 0.3s ease-out  
- **scaleIn**: 0.4s cubic-bezier bounce
- **Progress bar**: 0.5s ease-out transition
- **Icon pulse**: Continuous animation
- **Loading dots**: Staggered bounce (0ms, 150ms, 300ms)

## Browser Support

Works in all modern browsers that support:
- CSS animations
- Backdrop filter
- CSS Grid/Flexbox
