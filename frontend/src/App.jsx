import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { uploadNoteToIPFS } from "./utils/pinata";
import NotesABI from "./abis/NotesABI.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [networkError, setNetworkError] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // Check if on localhost network (31337)
      if (network.chainId.toString() !== "31337") {
        setNetworkError("Please switch to localhost network (Chain ID: 31337)");
        return;
      }

      setIsConnected(true);
      setUserAddress(accounts[0]);
      setNetworkError("");
      loadNotes();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, NotesABI, signer);
  };

  const checkConnection = async () => {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();

        if (network.chainId.toString() === "31337") {
          setIsConnected(true);
          setUserAddress(accounts[0]);
          loadNotes();
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const fetchNoteContent = async (ipfsHash) => {
    try {
      const response = await fetch(
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      );
      const jsonData = await response.json(); // Parse as JSON instead of text
      return jsonData.content || "No content found"; // Extract the content field
    } catch (error) {
      console.error("Error fetching note content:", error);
      return "Error loading content";
    }
  };

  const loadNotes = async () => {
    if (!isConnected) return;

    setLoadingNotes(true);
    try {
      const contract = await getContract();
      const myNotes = await contract.getMyNotes();

      const notesArray = await Promise.all(
        myNotes.map(async (note) => {
          const content = await fetchNoteContent(note.ipfsHash);
          return {
            id: note.id.toString(),
            ipfsHash: note.ipfsHash,
            owner: note.owner,
            timestamp: note.timestamp.toString(),
            content: content,
          };
        })
      );

      setNotes(notesArray);
    } catch (error) {
      console.log("No notes found or error loading:", error.message);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const addNote = async () => {
    if (!noteInput.trim() || !isConnected) return;

    setIsAddingNote(true);
    try {
      const ipfsHash = await uploadNoteToIPFS(noteInput.trim());
      const contract = await getContract();
      const tx = await contract.addNote(ipfsHash, { gasLimit: 300000 });
      await tx.wait();

      setNoteInput("");
      loadNotes();
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note. Please try again.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };

  useEffect(() => {
    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setUserAddress("");
          setNotes([]);
        } else {
          setUserAddress(accounts[0]);
          loadNotes();
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, [isConnected]);

  if (!window.ethereum) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-10 max-w-md w-full text-center shadow-2xl shadow-purple-500/10">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-100 mb-3">
            MetaMask Required
          </h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Install MetaMask to access the decentralized Web3 ecosystem.
          </p>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:from-emerald-400 hover:to-emerald-300 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25"
          >
            Install MetaMask
          </a>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-10 max-w-md w-full text-center shadow-2xl shadow-purple-500/10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-100 mb-3 bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
            Web3 Notes
          </h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Connect your wallet to enter the decentralized future.
          </p>

          {networkError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
              <p className="text-red-300 text-sm">{networkError}</p>
            </div>
          )}

          <button
            onClick={connectWallet}
            className="w-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-emerald-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 mb-6 shadow-2xl shadow-purple-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-100 mb-2 bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Web3 Notes
              </h1>
              <p className="text-gray-300">
                Decentralized • Immutable • Secure
              </p>
            </div>
            <div className="text-right">
              <div className="text-emerald-400 text-sm mb-1 font-medium">
                ● Connected
              </div>
              <div className="text-gray-100 font-mono text-sm bg-gray-700/50 px-4 py-2 rounded-lg border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </div>
            </div>
          </div>
        </div>

        {/* Add Note Section */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 mb-6 shadow-2xl shadow-purple-500/10">
          <div className="flex gap-4">
            <textarea
              className="flex-1 bg-gray-700/50 border border-purple-500/30 rounded-xl p-4 text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all duration-300 backdrop-blur-sm"
              placeholder="Enter the matrix... write your note here ✨"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              disabled={isAddingNote}
            />
            <button
              onClick={addNote}
              disabled={!noteInput.trim() || isAddingNote}
              className="bg-gradient-to-r from-emerald-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 whitespace-nowrap shadow-lg shadow-emerald-500/25"
            >
              {isAddingNote ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Deploying...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Deploy Note
                </>
              )}
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Press Enter to deploy • Stored on IPFS & Blockchain
          </p>
        </div>

        {/* Notes List */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 shadow-2xl shadow-purple-500/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
              <span className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-purple-400 rounded-full animate-pulse"></span>
              Your Notes
            </h2>
            <span className="text-gray-300 text-sm bg-gradient-to-r from-emerald-500/20 to-purple-500/20 px-4 py-2 rounded-full border border-emerald-500/30 backdrop-blur-sm">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </span>
          </div>

          {loadingNotes ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
              <span className="text-gray-300 ml-3">
                Syncing with blockchain...
              </span>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <svg
                  className="w-8 h-8 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-300 mb-2 text-lg">
                No notes in the matrix
              </p>
              <p className="text-gray-400 text-sm">
                Deploy your first decentralized note above ↑
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note, i) => (
                <div
                  key={i}
                  className="bg-gray-700/30 border border-purple-500/20 rounded-xl p-6 hover:border-emerald-500/40 hover:bg-gray-700/50 transition-all duration-300 group backdrop-blur-sm shadow-lg hover:shadow-emerald-500/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-gradient-to-r from-emerald-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                        #{note.id}
                      </span>
                      <span className="text-gray-400 text-sm font-mono">
                        {new Date(
                          Number(note.timestamp) * 1000
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${note.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-emerald-400 text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      IPFS
                    </a>
                  </div>
                  <div className="text-gray-100 leading-relaxed text-lg">
                    {note.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
