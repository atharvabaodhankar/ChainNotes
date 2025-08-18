import { useState, useEffect } from "react";
import { ethers } from "ethers";
import NotesABI from "./abis/NotesABI.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");

  async function getContract() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, NotesABI, signer);
  }

  async function addNote() {
    if (!input) return;
    const contract = await getContract();
    const tx = await contract.addNote(input);
    await tx.wait();
    setInput("");
    loadNotes();
  }

  async function loadNotes() {
    const contract = await getContract();
    const myNotes = await contract.getMyNotes();
    setNotes(myNotes);
  }

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">Decentralized Notes 📒</h1>

      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter note (ipfsHash)"
          className="px-3 py-2 rounded-lg text-white w-80 "
        />
        <button
          onClick={addNote}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
        >
          Add Note
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">My Notes</h2>
      <ul className="space-y-2 w-full max-w-md">
        {notes.map((note, i) => (
          <li
            key={i}
            className="p-3 rounded-lg bg-gray-800 border border-gray-700"
          >
            <p className="text-sm text-gray-400">ID: {note.id.toString()}</p>
            <p className="text-lg">{note.ipfsHash}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
