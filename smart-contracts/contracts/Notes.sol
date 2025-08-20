// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Notes {
    struct Note {
        uint id;
        string ipfsHash;
        address owner;
        uint timestamp;
    }

    uint public nextId;
    mapping(uint => Note) public notes;
    mapping(address => uint[]) public userNotes;

    event NoteCreated(uint id, string ipfsHash, address owner, uint timestamp);
    event NoteDeleted(uint id, address owner);

    function addNote(string memory _ipfsHash) external {
        notes[nextId] = Note(nextId, _ipfsHash, msg.sender, block.timestamp);
        userNotes[msg.sender].push(nextId);
        emit NoteCreated(nextId, _ipfsHash, msg.sender, block.timestamp);
        nextId++;
    }

    function getMyNotes() external view returns (Note[] memory) {
        uint[] memory ids = userNotes[msg.sender];
        Note[] memory result = new Note[](ids.length);
        for (uint i = 0; i < ids.length; i++) {
            result[i] = notes[ids[i]];
        }
        return result;
    }

    function deleteNote(uint _id) external {
        require(notes[_id].owner == msg.sender, "Not your note");
        
        // Remove from notes mapping
        delete notes[_id];
        
        // Remove from userNotes array
        uint[] storage userNoteIds = userNotes[msg.sender];
        for (uint i = 0; i < userNoteIds.length; i++) {
            if (userNoteIds[i] == _id) {
                // Move last element to current position and remove last element
                userNoteIds[i] = userNoteIds[userNoteIds.length - 1];
                userNoteIds.pop();
                break;
            }
        }
        
        emit NoteDeleted(_id, msg.sender);
    }
}
