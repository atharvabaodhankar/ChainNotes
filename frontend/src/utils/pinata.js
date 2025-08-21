import axios from "axios";
import { encryptNoteData } from "./encryption.js";

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;

export const uploadNoteToIPFS = async (noteData, walletAddress) => {
  try {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    // Encrypt the note data before uploading
    const encryptedData = encryptNoteData(noteData, walletAddress);
    
    // Add metadata for identification
    const uploadData = {
      ...encryptedData,
      timestamp: Date.now(),
      walletHash: walletAddress.slice(0, 10) // First 10 chars for identification (not security)
    };

    const response = await axios.post(
      url,
      uploadData,
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    console.log("✅ Note encrypted and uploaded to IPFS");
    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata: ", error);
    throw error;
  }
};

export const deleteNoteFromIPFS = async (ipfsHash) => {
  try {
    const url = `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`;

    await axios.delete(url, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    console.log(`Successfully unpinned ${ipfsHash} from Pinata`);
    return true;
  } catch (error) {
    console.error("Error deleting from Pinata: ", error);
    // Don't throw error - blockchain deletion should still work even if Pinata fails
    return false;
  }
};
