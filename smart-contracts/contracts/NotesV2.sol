// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NotesV2 {
    struct Note {
        uint id;
        string ipfsHash;
        address owner;
        uint timestamp;
        string category;
        bool isFavorite;
        uint lastModified;
    }

    uint public nextId;
    mapping(uint => Note) public notes;
    mapping(address => uint[]) public userNotes;
    mapping(address => string[]) public userCategories;

    event NoteCreated(uint id, string ipfsHash, address owner, uint timestamp, string category);
    event NoteDeleted(uint id, address owner);
    event NoteUpdated(uint id, uint timestamp);
    event NoteFavorited(uint id, bool isFavorite);
    event CategoryAdded(address owner, string category);

    function addNote(string memory _ipfsHash, string memory _category) external {
        notes[nextId] = Note(
            nextId, 
            _ipfsHash, 
            msg.sender, 
            block.timestamp,
            _category,
            false,
            block.timestamp
        );
        userNotes[msg.sender].push(nextId);
        
        // Add category if it doesn't exist
        if (bytes(_category).length > 0) {
            _addCategoryIfNew(msg.sender, _category);
        }
        
        emit NoteCreated(nextId, _ipfsHash, msg.sender, block.timestamp, _category);
        nextId++;
    }

    function updateNote(uint _id, string memory _ipfsHash, string memory _category) external {
        require(notes[_id].owner == msg.sender, "Not your note");
        
        notes[_id].ipfsHash = _ipfsHash;
        notes[_id].category = _category;
        notes[_id].lastModified = block.timestamp;
        
        if (bytes(_category).length > 0) {
            _addCategoryIfNew(msg.sender, _category);
        }
        
        emit NoteUpdated(_id, block.timestamp);
    }

    function toggleFavorite(uint _id) external {
        require(notes[_id].owner == msg.sender, "Not your note");
        
        notes[_id].isFavorite = !notes[_id].isFavorite;
        emit NoteFavorited(_id, notes[_id].isFavorite);
    }

    function getMyNotes() external view returns (Note[] memory) {
        uint[] memory ids = userNotes[msg.sender];
        Note[] memory result = new Note[](ids.length);
        for (uint i = 0; i < ids.length; i++) {
            result[i] = notes[ids[i]];
        }
        return result;
    }

    function getNotesByCategory(string memory _category) external view returns (Note[] memory) {
        uint[] memory ids = userNotes[msg.sender];
        uint count = 0;
        
        // Count matching notes
        for (uint i = 0; i < ids.length; i++) {
            if (keccak256(bytes(notes[ids[i]].category)) == keccak256(bytes(_category))) {
                count++;
            }
        }
        
        // Create result array
        Note[] memory result = new Note[](count);
        uint index = 0;
        for (uint i = 0; i < ids.length; i++) {
            if (keccak256(bytes(notes[ids[i]].category)) == keccak256(bytes(_category))) {
                result[index] = notes[ids[i]];
                index++;
            }
        }
        
        return result;
    }

    function getFavoriteNotes() external view returns (Note[] memory) {
        uint[] memory ids = userNotes[msg.sender];
        uint count = 0;
        
        // Count favorites
        for (uint i = 0; i < ids.length; i++) {
            if (notes[ids[i]].isFavorite) {
                count++;
            }
        }
        
        // Create result array
        Note[] memory result = new Note[](count);
        uint index = 0;
        for (uint i = 0; i < ids.length; i++) {
            if (notes[ids[i]].isFavorite) {
                result[index] = notes[ids[i]];
                index++;
            }
        }
        
        return result;
    }

    function getMyCategories() external view returns (string[] memory) {
        return userCategories[msg.sender];
    }

    function deleteNote(uint _id) external {
        require(notes[_id].owner == msg.sender, "Not your note");
        
        delete notes[_id];
        
        uint[] storage userNoteIds = userNotes[msg.sender];
        for (uint i = 0; i < userNoteIds.length; i++) {
            if (userNoteIds[i] == _id) {
                userNoteIds[i] = userNoteIds[userNoteIds.length - 1];
                userNoteIds.pop();
                break;
            }
        }
        
        emit NoteDeleted(_id, msg.sender);
    }

    function _addCategoryIfNew(address _owner, string memory _category) private {
        string[] storage categories = userCategories[_owner];
        
        // Check if category already exists
        for (uint i = 0; i < categories.length; i++) {
            if (keccak256(bytes(categories[i])) == keccak256(bytes(_category))) {
                return;
            }
        }
        
        // Add new category
        categories.push(_category);
        emit CategoryAdded(_owner, _category);
    }
}
