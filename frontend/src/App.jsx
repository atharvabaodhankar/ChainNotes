import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { uploadNoteToIPFS } from "./utils/pinata";
import NotesABI from "./abis/NotesABI.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");

  let contract;

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, NotesABI, signer);
    return contract;
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
      
      // Simple approach: just try to get notes and handle any error
      try {
        const myNotes = await contract.getMyNotes();
        setNotes(Array.isArray(myNotes) ? myNotes : []);
        console.log("Loaded notes:", myNotes);
      } catch (error) {
        // Any error (including BAD_DATA for empty arrays) just means no notes
        console.log("No notes found or empty array:", error.message);
        setNotes([]);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      setNotes([]);
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

      <ul className="mt-6">
        {notes.map((note, i) => (
          <li key={i} className="border-b py-2">
            <a
              href={`https://gateway.pinata.cloud/ipfs/${note.ipfsHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              View Note {note.id.toString()}
            </a>{" "}
            (added on {new Date(Number(note.timestamp) * 1000).toLocaleString()}
            )
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
