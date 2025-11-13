import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying NotesV2 contract to Sepolia...\n");

  // Get the contract factory
  const NotesV2 = await hre.ethers.getContractFactory("NotesV2");
  
  console.log("📝 Deploying contract...");
  
  // Deploy the contract
  const notesV2 = await NotesV2.deploy();
  
  await notesV2.waitForDeployment();
  
  const address = await notesV2.getAddress();
  
  console.log("\n✅ NotesV2 deployed successfully!");
  console.log("📍 Contract Address:", address);
  console.log("\n📋 Next Steps:");
  console.log("1. Update frontend/.env with new contract address:");
  console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
  console.log("\n2. Update the ABI file:");
  console.log("   Copy artifacts/contracts/NotesV2.sol/NotesV2.json");
  console.log("   to frontend/src/abis/NotesABI.json");
  console.log("\n3. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${address}`);
  console.log("\n🔗 View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
