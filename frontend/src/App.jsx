import { useState, useEffect } from "react";
import { ethers } from "ethers";
import NotesABI from "./abis/NotesABI.json";

// paste your deployed contract address here (from Hardhat deploy logs)
const contractAddress = "0xYourDeployedContractAddress";

function App() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");

  // connect to contract
  async function getContract() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, NotesABI, signer);
  }

  // add a note (here ipfsHash is just text, later we’ll replace with real IPFS hash)
  async function addNote() {
    const contract = await getContract();
    const tx = await contract.addNote(input);
    await tx.wait();
    loadNotes();
  }

  // load notes from blockchain
  async function loadNotes() {
    const contract = await getContract();
    const myNotes = await contract.getMyNotes();
    setNotes(myNotes);
  }

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Decentralized Notes 📒</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter note (ipfsHash)"
      />
      <button onClick={addNote}>Add Note</button>

      <h2>My Notes:</h2>
      <ul>
        {notes.map((note, i) => (
          <li key={i}>
            ID: {note.id.toString()} — {note.ipfsHash}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
