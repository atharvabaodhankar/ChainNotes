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
    const contract = await getContract();
    const myNotes = await contract.getMyNotes();
    setNotes(myNotes);
  };

  const addNote = async () => {
    if (!noteInput) return;

    // 1. Upload to Pinata
    const ipfsHash = await uploadNoteToIPFS(noteInput);

    // 2. Save hash in contract
    const contract = await getContract();
    await contract.addNote(ipfsHash, {
      gasLimit: 300000, // add this
    });

    await tx.wait();

    setNoteInput("");
    loadNotes();
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
