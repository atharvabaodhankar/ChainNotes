require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const AMOY_RPC = process.env.AMOY_RPC || "https://rpc-amoy.polygon.technology/";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    amoy: {
      url: AMOY_RPC,
      chainId: 80002,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
