import axios from "axios";

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;

export const uploadNoteToIPFS = async (noteData) => {
  try {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    const response = await axios.post(
      url,
      noteData, // Now accepts both title and content
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    // This is the IPFS hash (CID)
    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata: ", error);
    throw error;
  }
};
