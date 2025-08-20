import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { uploadNoteToIPFS, deleteNoteFromIPFS } from "./utils/pinata";
import NotesABI from "./abis/NotesABI.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [networkError, setNetworkError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard, calendar
  const [selectedDate, setSelectedDate] = useState(null);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

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
      // Check if ipfsHash is valid
      if (!ipfsHash || ipfsHash.trim() === '') {
        console.warn("Empty IPFS hash provided");
        return {
          title: "Invalid Note",
          content: "No IPFS hash found",
        };
      }

      // Try multiple IPFS gateways to avoid CORS and rate limiting
      const gateways = [
        `https://ipfs.io/ipfs/${ipfsHash}`,
        `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        `https://dweb.link/ipfs/${ipfsHash}`
      ];

      for (const gateway of gateways) {
        try {
          console.log(`Trying gateway: ${gateway}`);
          const response = await fetch(gateway, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });

          if (response.ok) {
            const jsonData = await response.json();
            console.log(`✅ Successfully fetched from: ${gateway}`);
            return {
              title: jsonData.title || "Untitled Note",
              content: jsonData.content || "No content found",
            };
          }
        } catch (gatewayError) {
          console.warn(`Gateway ${gateway} failed:`, gatewayError.message);
          continue; // Try next gateway
        }
      }

      // If all gateways fail, return fallback
      throw new Error("All IPFS gateways failed");
    } catch (error) {
      console.error("Error fetching note content:", error);
      return {
        title: "Error loading title",
        content: "Error loading content - IPFS temporarily unavailable",
      };
    }
  };

  const loadNotes = async () => {
    if (!isConnected) return;

    setLoadingNotes(true);
    try {
      const contract = await getContract();
      const myNotes = await contract.getMyNotes();

      // Process notes sequentially with delay to avoid rate limiting
      const notesArray = [];
      for (let i = 0; i < myNotes.length; i++) {
        const note = myNotes[i];
        
        // Skip deleted notes (empty IPFS hash or empty owner)
        if (!note.ipfsHash || note.ipfsHash.trim() === '' || !note.owner || note.owner === '0x0000000000000000000000000000000000000000') {
          console.log(`Skipping deleted note #${note.id}`);
          continue;
        }
        
        // Add delay between requests to avoid rate limiting
        if (notesArray.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }
        
        const noteData = await fetchNoteContent(note.ipfsHash);
        notesArray.push({
          id: note.id.toString(),
          ipfsHash: note.ipfsHash,
          owner: note.owner,
          timestamp: note.timestamp.toString(),
          title: noteData.title,
          content: noteData.content,
        });
      }

      setNotes(notesArray);
    } catch (error) {
      console.log("No notes found or error loading:", error.message);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const addNote = async () => {
    if (!noteContent.trim() || !isConnected) return;

    setIsAddingNote(true);
    try {
      const noteData = {
        title: noteTitle.trim() || "Untitled Note",
        content: noteContent.trim(),
      };
      const ipfsHash = await uploadNoteToIPFS(noteData);
      const contract = await getContract();
      const tx = await contract.addNote(ipfsHash, { gasLimit: 300000 });
      await tx.wait();

      setNoteTitle("");
      setNoteContent("");
      setShowAddModal(false);
      loadNotes();
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note. Please try again.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const deleteNote = async (noteId) => {
    if (!isConnected) return;

    setDeletingNoteId(noteId);
    try {
      // Find the note to get its IPFS hash
      const noteToDeleteData = notes.find(note => note.id === noteId);
      
      // 1. Delete from blockchain first
      const contract = await getContract();
      const tx = await contract.deleteNote(noteId, { gasLimit: 300000 });
      await tx.wait();
      
      // 2. Delete from Pinata/IPFS (optional - won't fail if this fails)
      if (noteToDeleteData?.ipfsHash) {
        const pinataDeleted = await deleteNoteFromIPFS(noteToDeleteData.ipfsHash);
        if (pinataDeleted) {
          console.log("✅ Note deleted from both blockchain and IPFS");
        } else {
          console.log("⚠️ Note deleted from blockchain, but IPFS deletion failed");
        }
      }
      
      setShowDeleteModal(false);
      setNoteToDelete(null);
      loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setShowDeleteModal(true);
  };

  const getNotesForDate = (date) => {
    return notes.filter((note) => {
      const noteDate = new Date(Number(note.timestamp) * 1000);
      return noteDate.toDateString() === date.toDateString();
    });
  };

  const getCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }

    return days;
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
      <div className="max-w-6xl mx-auto p-6">
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
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-700/50 rounded-xl p-1 border border-purple-500/20">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === "dashboard"
                      ? "bg-gradient-to-r from-emerald-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView("calendar")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === "calendar"
                      ? "bg-gradient-to-r from-emerald-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Calendar
                </button>
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
        </div>

        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-2xl shadow-purple-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <div>
                    <p className="text-gray-400 text-sm">Total Notes</p>
                    <p className="text-2xl font-bold text-gray-100">
                      {notes.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-2xl shadow-purple-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-gray-100">
                      {
                        notes.filter((note) => {
                          const noteDate = new Date(
                            Number(note.timestamp) * 1000
                          );
                          const now = new Date();
                          return (
                            noteDate.getMonth() === now.getMonth() &&
                            noteDate.getFullYear() === now.getFullYear()
                          );
                        }).length
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 shadow-2xl shadow-purple-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <div>
                    <p className="text-gray-400 text-sm">On Chain</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      Secure
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Notes */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 shadow-2xl shadow-purple-500/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                  <span className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-purple-400 rounded-full animate-pulse"></span>
                  Recent Notes
                </h2>
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
                    Click the + button to create your first note
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notes.slice(0, 6).map((note, i) => (
                    <div
                      key={i}
                      className="bg-gray-700/30 border border-purple-500/20 rounded-xl p-6 hover:border-emerald-500/40 hover:bg-gray-700/50 transition-all duration-300 group backdrop-blur-sm shadow-lg hover:shadow-emerald-500/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="bg-gradient-to-r from-emerald-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                          #{note.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs font-mono">
                            {new Date(
                              Number(note.timestamp) * 1000
                            ).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleDeleteClick(note)}
                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 p-1 rounded-lg hover:bg-red-500/10"
                            title="Delete note"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <h3 className="text-gray-100 font-semibold mb-2 truncate">
                        {note.title}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${note.ipfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 text-xs inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <svg
                            className="w-3 h-3"
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
                          View on IPFS
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Calendar View */}
        {currentView === "calendar" && (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 shadow-2xl shadow-purple-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-100">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-gray-400 text-sm font-medium py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {getCalendarDays().map((date, index) => {
                if (!date) {
                  return <div key={index} className="h-20"></div>;
                }

                const dayNotes = getNotesForDate(date);
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`h-20 border border-purple-500/20 rounded-lg p-2 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer ${
                      isToday
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-gray-700/20"
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="text-gray-100 text-sm font-medium">
                      {date.getDate()}
                    </div>
                    {dayNotes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dayNotes.slice(0, 2).map((note, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-purple-400 rounded-full"
                          ></div>
                        ))}
                        {dayNotes.length > 2 && (
                          <div className="text-xs text-emerald-400">
                            +{dayNotes.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedDate && (
              <div className="mt-6 p-4 bg-gray-700/30 rounded-xl border border-purple-500/20">
                <h3 className="text-gray-100 font-semibold mb-3">
                  Notes for {selectedDate.toLocaleDateString()}
                </h3>
                {getNotesForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No notes for this date
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getNotesForDate(selectedDate).map((note, i) => (
                      <div key={i} className="bg-gray-600/30 rounded-lg p-3">
                        <h4 className="text-gray-100 font-medium text-sm">
                          {note.title}
                        </h4>
                        <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                          {note.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Floating Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-emerald-500 to-purple-500 text-white rounded-full shadow-2xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-110 flex items-center justify-center z-50"
        >
          <svg
            className="w-8 h-8"
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
        </button>

        {/* Add Note Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 max-w-2xl w-full shadow-2xl shadow-purple-500/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-100 bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                  Create New Note
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-700/50 border border-purple-500/30 rounded-xl p-4 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all duration-300"
                    placeholder="Enter note title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Content
                  </label>
                  <textarea
                    className="w-full bg-gray-700/50 border border-purple-500/30 rounded-xl p-4 text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all duration-300"
                    placeholder="Write your note content here..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-700/50 text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-700/70 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addNote}
                  disabled={!noteContent.trim() || isAddingNote}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
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
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {showDeleteModal && noteToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-red-500/20 p-8 max-w-md w-full shadow-2xl shadow-red-500/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-100 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                  Delete Note
                </h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setNoteToDelete(null);
                  }}
                  className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-100 font-semibold">Are you sure?</h3>
                    <p className="text-gray-400 text-sm">This action cannot be undone.</p>
                  </div>
                </div>
                
                <div className="bg-gray-700/30 rounded-xl p-4 border border-red-500/20">
                  <h4 className="text-gray-100 font-medium mb-2">#{noteToDelete.id} - {noteToDelete.title}</h4>
                  <p className="text-gray-300 text-sm line-clamp-3">{noteToDelete.content}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setNoteToDelete(null);
                  }}
                  className="flex-1 bg-gray-700/50 text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-700/70 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteNote(noteToDelete.id)}
                  disabled={deletingNoteId === noteToDelete.id}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-400 hover:to-pink-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {deletingNoteId === noteToDelete.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Note
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
