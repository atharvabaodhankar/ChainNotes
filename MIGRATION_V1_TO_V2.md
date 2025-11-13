# 🔄 Migration Guide: Notes V1 → V2

## What Changed?

You're now using **NotesV2.sol** instead of **Notes.sol**. Here's what's different:

### ✅ **Contract Addresses**

| Version | Contract Address | Status |
|---------|-----------------|--------|
| **V1** (Notes.sol) | `0x6bB99D51c002a421D5930EAdCcbf124d7c6EE713` | ⚠️ Old (still works) |
| **V2** (NotesV2.sol) | `0xc95BC91D0e0Bcb13F288d2341a289D9b0c281b03` | ✅ **Active** |

### 🆕 **New Features in V2**

#### 1. **Categories**
```solidity
// V1: No categories
addNote(string ipfsHash)

// V2: With categories
addNote(string ipfsHash, string category)
```

#### 2. **Favorites**
```solidity
// V2 only
toggleFavorite(uint id)
getFavoriteNotes()
```

#### 3. **Update Notes**
```solidity
// V2 only
updateNote(uint id, string ipfsHash, string category)
```

#### 4. **Advanced Queries**
```solidity
// V2 only
getNotesByCategory(string category)
getMyCategories()
```

### 📊 **Data Structure Comparison**

#### V1 Note Structure:
```solidity
struct Note {
    uint id;
    string ipfsHash;
    address owner;
    uint timestamp;
}
```

#### V2 Note Structure:
```solidity
struct Note {
    uint id;
    string ipfsHash;
    address owner;
    uint timestamp;
    string category;      // ✨ NEW
    bool isFavorite;      // ✨ NEW
    uint lastModified;    // ✨ NEW
}
```

## 🔧 **What Was Updated**

### 1. Contract Deployment
- ✅ NotesV2 deployed to: `0xc95BC91D0e0Bcb13F288d2341a289D9b0c281b03`
- ✅ Verified on Sepolia testnet

### 2. Frontend Configuration
- ✅ `frontend/.env` updated with new contract address
- ✅ ABI file updated with NotesV2 interface
- ✅ Import fixed to use `NotesArtifact.abi`

### 3. Code Changes
```javascript
// Before (V1)
import NotesABI from "./abis/NotesABI.json";
return new ethers.Contract(CONTRACT_ADDRESS, NotesABI, signer);

// After (V2)
import NotesArtifact from "./abis/NotesABI.json";
const NotesABI = NotesArtifact.abi;
return new ethers.Contract(CONTRACT_ADDRESS, NotesABI, signer);
```

## 🚀 **How to Use V2 Features**

### Create Note with Category
```javascript
const noteData = { title: "My Note", content: "Content here" };
const ipfsHash = await uploadNoteToIPFS(noteData, userAddress);

const contract = await getContract();
const tx = await contract.addNote(ipfsHash, "Work"); // ✨ Category added
await tx.wait();
```

### Toggle Favorite
```javascript
const contract = await getContract();
const tx = await contract.toggleFavorite(noteId);
await tx.wait();
```

### Update Existing Note
```javascript
const updatedData = { title: "Updated", content: "New content" };
const newIpfsHash = await uploadNoteToIPFS(updatedData, userAddress);

const contract = await getContract();
const tx = await contract.updateNote(noteId, newIpfsHash, "Personal");
await tx.wait();
```

### Get Notes by Category
```javascript
const contract = await getContract();
const workNotes = await contract.getNotesByCategory("Work");
```

### Get Favorite Notes
```javascript
const contract = await getContract();
const favorites = await contract.getFavoriteNotes();
```

## 📝 **Handling Existing Notes**

### Option 1: Fresh Start (Current Setup)
- ✅ **Recommended for testing**
- All new notes use V2 features
- Old V1 notes remain on old contract
- Users start with clean slate

### Option 2: Dual Contract Support
Keep both contracts active:
```javascript
const V1_CONTRACT = "0x6bB99D51c002a421D5930EAdCcbf124d7c6EE713";
const V2_CONTRACT = "0xc95BC91D0e0Bcb13F288d2341a289D9b0c281b03";

// Load notes from both
const v1Notes = await getV1Notes();
const v2Notes = await getV2Notes();
const allNotes = [...v1Notes, ...v2Notes];
```

### Option 3: Manual Migration
Export from V1, import to V2:
1. Export all notes from V1 (use export feature)
2. For each note, create in V2 with category
3. Delete from V1 if desired

## ⚠️ **Important Notes**

### Backward Compatibility
- ❌ V2 contract is **NOT** backward compatible with V1
- ❌ Cannot read V1 notes from V2 contract
- ✅ V1 contract still works independently
- ✅ Can run both contracts simultaneously

### Data Migration
- Notes are **NOT** automatically migrated
- Each contract maintains its own data
- Users need to manually migrate if desired

### Gas Costs
V2 functions cost slightly more due to additional features:
- V1 `addNote`: ~100,000 gas
- V2 `addNote`: ~150,000 gas (+50% for categories)

## 🎯 **Current Status**

### What's Working:
- ✅ V2 contract deployed and verified
- ✅ Frontend configured for V2
- ✅ ABI properly imported
- ✅ All V2 features available
- ✅ Build successful

### What You Can Do Now:
1. ✅ Create notes with categories
2. ✅ Mark notes as favorites
3. ✅ Update existing notes
4. ✅ Filter by category
5. ✅ Get favorite notes
6. ✅ Track last modified time

### What's Not Yet Integrated:
- ⏳ UI components for new features (optional)
- ⏳ Search & filter UI (optional)
- ⏳ Template selector (optional)
- ⏳ Export/import UI (optional)

See `INTEGRATION_GUIDE.md` to add these features.

## 🔍 **Testing Checklist**

Test these V2 features:

- [ ] Create note without category
- [ ] Create note with category
- [ ] Toggle favorite on/off
- [ ] Update note content
- [ ] Update note category
- [ ] Get all notes (should show categories)
- [ ] Get notes by specific category
- [ ] Get only favorite notes
- [ ] Delete note (should still work)

## 📚 **Documentation**

- **Features:** `FEATURES.md` - All 30+ features
- **Integration:** `INTEGRATION_GUIDE.md` - How to add UI components
- **Deployment:** `DEPLOYMENT_SUCCESS.md` - Deployment details
- **Main README:** `README.md` - Project overview

## 🆘 **Troubleshooting**

### Error: "abi is not iterable"
**Fixed!** We updated the import to use `NotesArtifact.abi`

### Error: "Contract not found"
Make sure you're using the V2 address:
```
0xc95BC91D0e0Bcb13F288d2341a289D9b0c281b03
```

### Error: "Function not found"
Make sure the ABI file is from NotesV2.json, not Notes.json

### Notes not showing
- Check you're connected to Sepolia network
- Check contract address in `.env`
- Check you have notes in V2 contract (not V1)

## 🎉 **Summary**

You're now using **NotesV2** with:
- ✅ Categories for organization
- ✅ Favorites for quick access
- ✅ Note updates capability
- ✅ Advanced filtering
- ✅ Better data structure
- ✅ More features coming soon!

**Contract Address:** `0xc95BC91D0e0Bcb13F288d2341a289D9b0c281b03`

**Ready to test!** 🚀