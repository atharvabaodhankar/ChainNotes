import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
const privateKey = process.env.DEPLOYER_PRIVATE_KEY; 
const signer = new ethers.Wallet(privateKey, provider);

const abi = [
  "function addNote(string memory _ipfsHash) public",
  "function getMyNotes() public view returns (tuple(uint id, string ipfsHash, address owner, uint timestamp)[])"
];

const contractAddress = "0xa18215949e70d9045620af5d9ee5564308690321";
const contract = new ethers.Contract(contractAddress, abi, signer);

async function main() {
  try {
    const tx = await contract.addNote("QmTestHash123456", { gasLimit: 500000 });
    console.log("✅ Tx hash:", tx.hash);
    await tx.wait();
    console.log("Confirmed on-chain!");

    // 🔎 Now fetch notes
    const notes = await contract.getMyNotes();
    console.log("📒 Notes:", notes);
  } catch (err) {
    console.error("❌ Error:", err.reason || err);
  }
}


main();
