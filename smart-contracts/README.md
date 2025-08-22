# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

## Deploying to Polygon Amoy Testnet

You can deploy the contracts to the Polygon Amoy testnet using Hardhat. Add the following environment variables to a `.env` file in this folder:

- `AMOY_RPC` (optional) - RPC URL (defaults to https://rpc-amoy.polygon.technology/)
- `DEPLOYER_PRIVATE_KEY` - The private key of the account used to deploy (hex, 0x...)

Example `.env`:

```
AMOY_RPC=https://rpc-amoy.polygon.technology/
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

Deploy using Hardhat:

```shell
npx hardhat run scripts/deploy.js --network amoy
```

Network details:

- Network Name: Polygon Amoy Testnet
- RPC: https://rpc-amoy.polygon.technology/
- Chain ID: 80002
- Currency: MATIC
- Explorer: https://amoy.polygonscan.com/
- Faucet: https://faucet.polygon.technology/
