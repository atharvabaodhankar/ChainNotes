import { useState, useEffect } from "react";
import "./App.css";
import { ethers } from "ethers";
import { uploadNoteToIPFS, deleteNoteFromIPFS } from "./utils/pinata";
import { decryptNoteData } from "./utils/encryption";
import { shouldShowMobileMetaMaskPrompt, isMobileBrowser, openInMetaMaskApp } from "./utils/mobileDetection";
import { filterNotes, sortNotes, getCategories } from "./utils/noteFilters";
import MobileMetaMaskPrompt from "./components/MobileMetaMaskPrompt";
import ManualNetworkGuide from "./components/ManualNetworkGuide";
import FaucetButton from "./components/FaucetButton";
import SearchFilter from "./components/SearchFilter";
import EnhancedNoteCard from "./components/EnhancedNoteCard";
import StatsCard from "./components/StatsCard";
import TemplateSelector from "./components/TemplateSelector";
import ExportImport from "./components/ExportImport";
import NotesArtifact from "./abis/NotesABI.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const NotesABI = NotesArtifact.abi;

function App() {
  const [notes, setNotes] = useState([]);
  const [fullscreenNote, setFullscreenNote] = useState(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("");
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
  const [bypassMobileCheck, setBypassMobileCheck] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: 'all',
    showFavoritesOnly: false,
    sortBy: 'newest'
  });
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false);

  // Ethereum Sepolia testnet configuration
  const SEPOLIA_CHAIN_ID = "11155111";
  const SEPOLIA_NETWORK = {
    chainId: "0xAA36A7", // 11155111 in hex
    chainName: "Sepolia test network",
    nativeCurrency: {
      name: "SepoliaETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [
      "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      "https://rpc.sepolia.org",
      "https://ethereum-sepolia-rpc.publicnode.com",
      "https://sepolia.gateway.tenderly.co",
    ],
    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
  };
  useEffect(() => {
    const init = async () => {
      await checkConnection(); // ensures userAddress is set
      if (isConnected && userAddress) {
        await loadNotes(); // only load notes after wallet is ready
      }
    };
    init();
  }, [isConnected, userAddress]);

  // Listen for network changes and log out user if they switch away from Sepolia
  useEffect(() => {
    const handleNetworkChange = (chainId) => {
      const newChainId = parseInt(chainId, 16).toString();
      
      // If user is connected and switches away from Sepolia, log them out
      if (isConnected && newChainId !== SEPOLIA_CHAIN_ID) {
        setIsConnected(false);
        setUserAddress("");
        setNotes([]);
        setNetworkError("You switched networks. Please connect to Ethereum Sepolia to continue using the app.");
      }
      // If they switch back to Sepolia, clear the error
      else if (newChainId === SEPOLIA_CHAIN_ID) {
        setNetworkError("");
      }
    };

    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleNetworkChange);
      
      // Cleanup listener on unmount
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('chainChanged', handleNetworkChange);
        }
      };
    }
  }, [isConnected]);

  const addSepoliaNetworkInternal = async () => {
    try {
      // First try to switch to Sepolia if it already exists
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xAA36A7" }],
        });
        return true;
      } catch (switchError) {
        // If switch fails, the network doesn't exist, so add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SEPOLIA_NETWORK],
          });
          return true;
        }
        throw switchError;
      }
    } catch (error) {
      console.error("Error adding Sepolia network:", error);
      return false;
    }
  };

  // Function for the login page "Add Sepolia Network" button
  const addSepoliaNetwork = async () => {
    try {
      // First check if MetaMask is available
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install MetaMask first.");
        return;
      }

      // Try to add/switch to Sepolia network
      const success = await addSepoliaNetworkInternal();
      
      if (success) {
        // Clear any existing network errors
        setNetworkError("");
        alert("Sepolia network added successfully! You can now connect your wallet.");
      } else {
        throw new Error("Failed to add network");
      }
    } catch (error) {
      console.error("Error adding Sepolia network:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to add Sepolia network. ";
      
      if (error.code === 4001) {
        errorMessage += "You rejected the request. Please try again and approve the network addition.";
      } else if (error.code === -32002) {
        errorMessage += "A request is already pending. Please check MetaMask and approve any pending requests.";
      } else if (error.message && error.message.includes("User rejected")) {
        errorMessage += "You rejected the request. Please try again and approve the network addition.";
      } else {
        errorMessage += "Please make sure MetaMask is unlocked and try again.";
      }
      
      alert(errorMessage);
    }
  };

  const switchToSepoliaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${parseInt(SEPOLIA_CHAIN_ID).toString(16)}` }],
      });
      return true;
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        return await addSepoliaNetworkInternal();
      }
      console.error("Error switching to Amoy network:", error);
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      // Reset manual disconnect flag when user manually connects
      setManuallyDisconnected(false);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // Check if on Ethereum Sepolia testnet (11155111)
      if (network.chainId.toString() !== SEPOLIA_CHAIN_ID) {
        setNetworkError("Please switch to Ethereum Sepolia Testnet");

        // Prompt user to switch to Sepolia network
        const switched = await switchToSepoliaNetwork();
        if (!switched) {
          return;
        }

        // Verify the switch was successful
        const updatedNetwork = await provider.getNetwork();
        if (updatedNetwork.chainId.toString() !== SEPOLIA_CHAIN_ID) {
          setNetworkError("Failed to switch to Ethereum Sepolia Testnet");
          return;
        }
      }

      setIsConnected(true);
      setUserAddress(accounts[0]);
      setNetworkError("");
      loadNotes();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Memoize the contract to prevent infinite re-renders
  async function getContract() {
    if (!window.ethereum) throw new Error("MetaMask not installed");

    // ✅ Use MetaMask provider
    const provider = new ethers.BrowserProvider(window.ethereum);

    // ✅ Request account access
    await provider.send("eth_requestAccounts", []);

    // ✅ Get signer from MetaMask
    const signer = await provider.getSigner();

    return new ethers.Contract(CONTRACT_ADDRESS, NotesABI, signer);
  }

  const checkConnection = async () => {
    try {
      // Don't auto-reconnect if user manually disconnected
      if (manuallyDisconnected) {
        return;
      }

      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          // Check network before connecting
          const network = await provider.getNetwork();
          
          // Only connect if on Sepolia network
          if (network.chainId.toString() === SEPOLIA_CHAIN_ID) {
            setUserAddress(accounts[0].address);
            setIsConnected(true);
            setNetworkError("");
            console.log("✅ Connected to Sepolia network");
          } else {
            // User has accounts but wrong network
            setIsConnected(false);
            setUserAddress("");
            setNetworkError("Please switch to Ethereum Sepolia Testnet to use this app");
            console.log("❌ Wrong network detected");
          }
        } else {
          setIsConnected(false);
          setUserAddress("");
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
      setIsConnected(false);
      setUserAddress("");
    }
  };
  useEffect(() => {
    if (isConnected && userAddress) {
      console.log("📥 Loading notes for:", userAddress);
      loadNotes();
    }
  }, [isConnected, userAddress]);

  const fetchNoteContent = async (ipfsHash) => {
    try {
      // Check if ipfsHash is valid
      if (!ipfsHash || ipfsHash.trim() === "") {
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
        `https://dweb.link/ipfs/${ipfsHash}`,
      ];

      for (const gateway of gateways) {
        try {
          console.log(`Trying gateway: ${gateway}`);
          const response = await fetch(gateway, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });

          if (response.ok) {
            const encryptedData = await response.json();
            console.log(`✅ Successfully fetched from: ${gateway}`);

            // Decrypt the data using user's wallet address
            const decryptedData = decryptNoteData(encryptedData, userAddress);

            return {
              title: decryptedData.title || "Untitled Note",
              content: decryptedData.content || "No content found",
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
    try {
      const contract = await getContract();
      const myNotes = await contract.getMyNotes();
      if (!userAddress) {
        console.warn("⏳ Skipping decryption: wallet not ready yet");
        return;
      }

      if (!myNotes || myNotes.length === 0) {
        console.log("📭 No notes found on-chain yet.");
        setNotes([]);
        return;
      }

      const fetchedNotes = [];

      for (const note of myNotes) {
        try {
          const ipfsUrl = `https://ipfs.io/ipfs/${note.ipfsHash}`;
          const response = await fetch(ipfsUrl);

          if (!response.ok) {
            console.warn(`❌ Failed to fetch ${ipfsUrl}`, response.status);
            continue;
          }

          const ipfsJson = await response.json();

          // 🔑 Decrypt here
          const decrypted = decryptNoteData(ipfsJson, userAddress);

          fetchedNotes.push({
            id: Number(note.id),
            ipfsHash: note.ipfsHash,
            title: decrypted.title || "Untitled Note",
            content: decrypted.content || "(empty note)",
            owner: note.owner,
            timestamp: Number(note.timestamp),
          });
        } catch (err) {
          console.error(`❌ Failed to load note ${note.ipfsHash}`, err);
        }
      }

      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
      setNotes([]);
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
      const ipfsHash = await uploadNoteToIPFS(noteData, userAddress);
      const contract = await getContract();
      try {
        // V2 contract requires category as second parameter
        const tx = await contract.addNote(ipfsHash, noteCategory || "", { gasLimit: 500000 });
        await tx.wait();
      } catch (err) {
        console.error(
          "Revert reason:",
          err.reason || err.error?.message || err
        );
      }

      setNoteTitle("");
      setNoteContent("");
      setNoteCategory("");
      setShowAddModal(false);
      loadNotes();
    } catch (error) {
      console.error("Error adding note:", error);
      let errorMessage = "Failed to add note. Please try again.";
      if (error.code === "ACTION_REJECTED") {
        errorMessage = "Transaction rejected by user.";
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient funds for transaction.";
      } else if (error.data && error.data.message) {
        errorMessage = `Transaction failed: ${error.data.message}`;
      } else if (error.message) {
        errorMessage = `Transaction failed: ${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setIsAddingNote(false);
    }
  };

  const deleteNote = async (noteId) => {
    if (!isConnected) return;

    setDeletingNoteId(noteId);
    try {
      // Find the note to get its IPFS hash
      const noteToDeleteData = notes.find((note) => note.id === noteId);

      // 1. Delete from blockchain first
      const contract = await getContract();
      const tx = await contract.deleteNote(noteId, { gasLimit: 300000 });
      await tx.wait();

      // 2. Delete from Pinata/IPFS (optional - won't fail if this fails)
      if (noteToDeleteData?.ipfsHash) {
        const pinataDeleted = await deleteNoteFromIPFS(
          noteToDeleteData.ipfsHash
        );
        if (pinataDeleted) {
          console.log("✅ Note deleted from both blockchain and IPFS");
        } else {
          console.log(
            "⚠️ Note deleted from blockchain, but IPFS deletion failed"
          );
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

  const toggleFavorite = async (noteId) => {
    if (!isConnected) return;
    
    try {
      const contract = await getContract();
      const tx = await contract.toggleFavorite(noteId);
      await tx.wait();
      loadNotes(); // Refresh notes to show updated favorite status
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite status. Please try again.");
    }
  };

  const applyTemplate = (template) => {
    setNoteTitle(template.title);
    setNoteContent(template.content);
    setNoteCategory(template.category);
    setShowTemplateSelector(false);
    setShowAddModal(true);
  };

  const handleImport = async (importedNotes) => {
    for (const note of importedNotes) {
      try {
        const ipfsHash = await uploadNoteToIPFS(note, userAddress);
        const contract = await getContract();
        const tx = await contract.addNote(ipfsHash, note.category || "");
        await tx.wait();
      } catch (error) {
        console.error("Error importing note:", error);
      }
    }
    loadNotes();
    setShowExportImport(false);
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
  }, []); // Remove the dependencies that cause infinite loop

  // Check for mobile browsers without MetaMask
  if (shouldShowMobileMetaMaskPrompt() && !bypassMobileCheck) {
    return <MobileMetaMaskPrompt onContinueAnyway={() => setBypassMobileCheck(true)} />;
  }

  if (!window.ethereum) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <img src="/ChainNotes.png" alt="ChainNotes Logo" className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            MetaMask Required
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Install MetaMask to access ChainNotes and the decentralized Web3 ecosystem.
          </p>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-md"
          >
            Install MetaMask
          </a>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <img src="/ChainNotes.png" alt="ChainNotes Logo" className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            ChainNotes
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Connect your wallet to access your decentralized notes.
          </p>

          {networkError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
              <p className="text-red-300 text-sm">{networkError}</p>
              {networkError.includes("Ethereum Sepolia") && (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={switchToSepoliaNetwork}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-purple-400 hover:to-pink-400 transition-all duration-300"
                  >
                    Switch to Ethereum Sepolia
                  </button>
                  <button
                    onClick={() => setShowManualGuide(true)}
                    className="w-full bg-gray-600 hover:bg-gray-500 text-gray-200 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300"
                  >
                    Manual Setup Guide
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={connectWallet}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-md"
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

          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-gray-400 text-sm mb-3">
              Don't have Sepolia network in MetaMask?
            </p>
            <div className="space-y-2">
              <button
                onClick={addSepoliaNetwork}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-400 hover:to-indigo-400 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Sepolia Network to MetaMask
              </button>
              <button
                onClick={() => setShowManualGuide(true)}
                className="w-full bg-gray-600 hover:bg-gray-500 text-gray-200 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Manual Setup Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ...existing code...
  const openFullscreen = (note) => {
    setFullscreenNote(note);
    setFullscreenOpen(true);
  };
  const closeFullscreen = () => {
    setFullscreenOpen(false);
    setTimeout(() => setFullscreenNote(null), 300);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Mobile MetaMask Banner */}
        {isMobileBrowser() && bypassMobileCheck && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-orange-300 text-sm font-medium">Mobile Browser Detected</p>
                  <p className="text-orange-200 text-xs">For better experience, use MetaMask app</p>
                </div>
              </div>
              <button
                onClick={openInMetaMaskApp}
                className="bg-orange-500 hover:bg-orange-400 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200"
              >
                Open in MetaMask
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Title Section with Logo */}
            <a href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <img src="/ChainNotes.png" alt="ChainNotes Logo" className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ChainNotes
                </h1>
                <p className="text-sm text-gray-500">
                  Decentralized • Immutable • Secure
                </p>
              </div>
            </a>

            {/* Navigation and Wallet Section */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Tab Navigation */}
              <div className="flex items-center bg-white rounded-lg p-2 gap-2 shadow-sm order-2 sm:order-1">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className={`font-semibold py-2 px-4 rounded-md text-sm transition-all ${
                    currentView === "dashboard"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView("calendar")}
                  className={`font-semibold py-2 px-4 rounded-md text-sm transition-all ${
                    currentView === "calendar"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="text-gray-600 hover:bg-gray-100 p-2 rounded-md transition-colors"
                  title="Note Templates"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowExportImport(true)}
                  className="text-gray-600 hover:bg-gray-100 p-2 rounded-md transition-colors"
                  title="Export/Import"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </button>
              </div>

              {/* Wallet Info with Disconnect */}
              <div className="bg-white rounded-lg p-2 shadow-sm order-1 sm:order-2 flex-grow sm:flex-grow-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                  <div className="text-xs flex-grow">
                    <p className="font-medium text-gray-700">Connected <span className="hidden md:inline">(Ethereum Sepolia)</span></p>
                    <p className="text-gray-500 font-mono">{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setManuallyDisconnected(true);
                      setIsConnected(false);
                      setUserAddress("");
                      setNotes([]);
                    }}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                    title="Disconnect Wallet"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <>
            {/* Faucet Button */}
            <FaucetButton userAddress={userAddress} isConnected={isConnected} />

            {/* Enhanced Stats Dashboard */}
            <StatsCard notes={notes} />

            {/* Search & Filter */}
            <SearchFilter
              onFilterChange={setFilters}
              categories={getCategories(notes)}
              noteCount={filterNotes(notes, filters).length}
            />

            {/* Old Stats Cards - Keeping for now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6" style={{display: 'none'}}>
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

            {/* Note Count */}
            <p className="text-center text-sm text-gray-500 mb-8">
              {filterNotes(notes, filters).length} {filterNotes(notes, filters).length === 1 ? 'note' : 'notes'} found
            </p>

            {/* Recent Notes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"></span>
                <h2 className="text-xl font-bold text-gray-900">Recent Notes</h2>
              </div>

              {loadingNotes ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-gray-300 ml-3">
                    Syncing with blockchain...
                  </span>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                    <svg
                      className="w-8 h-8 text-blue-400"
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
                    No notes yet
                  </p>
                  <p className="text-gray-400 text-sm">
                    Click the + button to create your first note
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {sortNotes(filterNotes(notes, filters), filters.sortBy).slice(0, 6).map((note, i) => (
                    <EnhancedNoteCard
                      key={note.id}
                      note={note}
                      onDelete={handleDeleteClick}
                      onToggleFavorite={toggleFavorite}
                      onClick={openFullscreen}
                    />
                  ))}
                  {/* Old note card - keeping as backup
                  {notes.slice(0, 6).map((note, i) => (
                    <div
                      key={i}
                      className="bg-gray-700/30 border border-purple-500/20 rounded-xl p-6 hover:border-emerald-500/40 hover:bg-gray-700/50 transition-all duration-300 group backdrop-blur-sm shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
                      onClick={() => openFullscreen(note)}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(note);
                            }}
                            className="text-gray-500 hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 p-2 sm:p-1 rounded-lg hover:bg-red-500/10 touch-manipulation"
                            title="Delete note"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-gray-100 font-semibold truncate flex-1">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-1 text-emerald-400 text-xs">
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
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          <span>Encrypted</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${note.ipfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 text-xs inline-flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300"
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
                  ))} */}
                </div>
              )}
            </div>
            {fullscreenNote && (
              <div
                className={`centered-modal${fullscreenOpen ? " open" : ""}`}
                onClick={closeFullscreen}
              >
                <div
                  className="centered-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="centered-close-btn"
                    onClick={closeFullscreen}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-purple-100 text-purple-700 text-sm font-bold px-3 py-1 rounded-full">
                        #{fullscreenNote.id}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {new Date(Number(fullscreenNote.timestamp) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {fullscreenNote.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="font-medium">Encrypted</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                    <p className="text-gray-800 text-base whitespace-pre-line leading-relaxed">
                      {fullscreenNote.content}
                    </p>
                  </div>
                  
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${fullscreenNote.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on IPFS
                  </a>
                </div>
              </div>
            )}
          </>
        )}

        {/* Calendar View */}
        {currentView === "calendar" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-gray-500 text-sm font-semibold py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {getCalendarDays().map((date, index) => {
                if (!date) {
                  return <div key={index} className="aspect-square"></div>;
                }

                const dayNotes = getNotesForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square p-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                      isToday
                        ? "bg-purple-50 border-purple-500 text-purple-700 font-bold"
                        : isSelected
                        ? "bg-purple-100 border-purple-400 text-purple-800"
                        : dayNotes.length > 0
                        ? "bg-blue-50 border-blue-200 text-gray-900 hover:border-blue-400"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-sm font-medium">{date.getDate()}</span>
                      {dayNotes.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {dayNotes.slice(0, 3).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isToday ? "bg-purple-600" : "bg-blue-500"
                              }`}
                            ></div>
                          ))}
                        </div>
                      )}
                      {dayNotes.length > 3 && (
                        <span className="text-xs text-gray-500 mt-0.5">
                          +{dayNotes.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Date Notes */}
            {selectedDate && (
              <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {getNotesForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">No notes for this date</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getNotesForDate(selectedDate).map((note, i) => (
                      <div
                        key={i}
                        onClick={() => openFullscreen(note)}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-gray-900 font-semibold text-sm group-hover:text-purple-600 transition-colors">
                            {note.title}
                          </h4>
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                            #{note.id}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                          {note.content}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(Number(note.timestamp) * 1000).toLocaleTimeString()}
                        </div>
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
          className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 to-purple-600 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform z-50"
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Create New Note
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter note title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Content
                  </label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Write your note content here..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={8}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-500 text-xs">
                      {noteContent.length} characters
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Category <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Work, Personal, Ideas..."
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                  />
                  <p className="text-gray-500 text-xs mt-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Categories help you organize and filter your notes
                  </p>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-purple-900 text-sm font-semibold">End-to-End Encrypted</p>
                    <p className="text-purple-700 text-xs mt-1">
                      Your note will be encrypted with your wallet address before storing on IPFS. Only you can decrypt and read it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addNote}
                  disabled={!noteContent.trim() || isAddingNote}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  {isAddingNote ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deploying...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
            <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-red-500/20 p-4 sm:p-6 lg:p-8 max-w-md w-full shadow-2xl shadow-red-500/10 max-h-[90vh] overflow-y-auto">
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

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                    <svg
                      className="w-6 h-6 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-100 font-semibold">
                      Are you sure?
                    </h3>
                    <p className="text-gray-400 text-sm">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-700/30 rounded-xl p-4 border border-red-500/20">
                  <h4 className="text-gray-100 font-medium mb-2">
                    #{noteToDelete.id} - {noteToDelete.title}
                  </h4>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {noteToDelete.content}
                  </p>
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Note
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Network Guide Modal */}
        {showManualGuide && (
          <ManualNetworkGuide onClose={() => setShowManualGuide(false)} />
        )}

        {/* Template Selector Modal */}
        {showTemplateSelector && (
          <TemplateSelector
            onSelectTemplate={applyTemplate}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}

        {/* Export/Import Modal */}
        {showExportImport && (
          <ExportImport
            notes={notes}
            onImport={handleImport}
            onClose={() => setShowExportImport(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
