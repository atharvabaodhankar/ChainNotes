import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { uploadNoteToIPFS } from "./utils/pinata";
import NotesABI from "./abis/NotesABI.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(true);

  let contract;

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, NotesABI, signer);
    return contract;
  };

  const fetchNoteContent = async (ipfsHash) => {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      const jsonData = await response.json(); // Parse as JSON instead of text
      return jsonData.content || "No content found"; // Extract the content field
    } catch (error) {
      console.error("Error fetching note content:", error);
      return "Error loading content";
    }
  };

  const loadNotes = async () => {
    try {
      // Check if MetaMask is connected
      if (!window.ethereum) {
        console.error("MetaMask not found");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      console.log("Connected to network:", network.chainId.toString());
      
      // Check if contract exists at the address
      const code = await provider.getCode(contractAddress);
      if (code === '0x') {
        console.error("No contract found at address:", contractAddress);
        console.error("Make sure your contract is deployed and you're on the right network");
        setNotes([]);
        return;
      }

      const contract = await getContract();
      
      // Get notes and convert from proxy objects to regular objects
      try {
        const myNotes = await contract.getMyNotes();
        
        // Convert proxy objects and fetch content from IPFS
        const notesArray = await Promise.all(
          myNotes.map(async (note) => {
            const content = await fetchNoteContent(note.ipfsHash);
            return {
              id: note.id.toString(),
              ipfsHash: note.ipfsHash,
              owner: note.owner,
              timestamp: note.timestamp.toString(),
              content: content
            };
          })
        );
        
        setNotes(notesArray);
        console.log("Loaded notes with content:", notesArray);
      } catch (error) {
        // Any error (including BAD_DATA for empty arrays) just means no notes
        console.log("No notes found or empty array:", error.message);
        setNotes([]);
      }
      setLoadingNotes(false);
    } catch (error) {
      console.error("Error loading notes:", error);
      setNotes([]);
      setLoadingNotes(false);
    }
  };

  const addNote = async () => {
    if (!noteInput) return;

    try {
      // 1. Upload to Pinata
      const ipfsHash = await uploadNoteToIPFS(noteInput);

      // 2. Save hash in contract
      const contract = await getContract();
      const tx = await contract.addNote(ipfsHash, {
        gasLimit: 300000,
      });

      await tx.wait();

      setNoteInput("");
      loadNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Web3 Notes 🚀</h1>

      <div className="flex gap-2 mt-4">
        <input
          type="text"
          className="border p-2 rounded w-full"
          placeholder="Write a note..."
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={addNote}
        >
          Add
        </button>
      </div>

      {loadingNotes ? (
        <div className="mt-6 text-gray-500">Loading notes...</div>
      ) : (
        <div className="mt-6">
          {notes.length === 0 ? (
            <p className="text-gray-500">No notes yet. Add your first note above!</p>
          ) : (
            <div className="space-y-4">
              {notes.map((note, i) => (
                <div key={i} className="border rounded-lg p-4 bg-gray-50">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Note #{note.id}</span>
                    <span className="text-sm text-gray-400 ml-2">
                      {new Date(Number(note.timestamp) * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-2 text-gray-800">{note.content}</div>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${note.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm hover:underline"
                  >
                    View on IPFS →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
