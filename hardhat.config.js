require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-deploy"); //earlier we wrote manuals scripts to deploy the contract but for easier depl;oyment of contract there is a packaage from hardhat named hardhat-deploy altogether where we dont need to write scripts for deployment, so delete the deploy.js scripts folder , yarn add --dev hardhat-deploy
// if you use ethers.js we recommend you also install hardhat-deploy-ethers which add extra features to access deployments as ethers contract. hence do : npm install --save-dev  @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers to isntall hardhat-deploy-ethers by noomiclabs so that it can also give access to earlier deployments
// now u also create new folder named deploy , and define the order of deployments , there u will write scripts for deployments
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    //we can also inculde the list of n.w's so in terminal when we can run and specify the n.w it will refer here
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111, //now in terminal u can do yarn run hardhat scripts/deploy.js --network sepolia , then the deploy script will run with sepolia netwrok to deploy
    },
    localhost: {
      //now when run yarn hardhat run .. --network localhost , its gonna use the acc from local host to fund the deployment and transactions
      url: "http://127.0.0.1:8545/", //got from yarn hardhat node
      // accounts is given in yarn hardhat node
      chainId: 31337, //this is chainid for hardhat , this localhost runs on harhdat chyain but is different from default hardhat network
    },
  },
  gasReporter: {
    //after installoing the package of gas reporter , now by default it is not enabvled hence in order to use this gas reporter we need to do this,check documentation
    enabled: false,
    // lets further customise the gasReporter
    outputFile: "gas-report.txt", //this will give report in separate txt file , also in gitigboire mention it
    currency: "USD", //for every function which costs a certain gas , that will be converted to USD by eth comparison since this is deplouyed in eth mainnet and to get this price realtime , use coinmarketcap and signin and get the api
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    noColors: true, //make sure to add this as it will arerange evertthing oganized in reports
    token: "MATIC", //IF U wish to see the repiort when contract deployed in other bc n.w's
  },
  solidity: "0.8.19",
  namedAccounts: {
    //just creating the named accounts
    deployer: {
      //lets say name of acccount is deployer
      default: 0, //by defaylt the 0th account is ginnba be deployer
    },
    solidity: {
      compilers: [
        {
          version: "0.8.7",
        },
        {
          version: "0.6.0",
        },
      ],
    },
    user: {
      //creeating user
      default: 1,
    },
  },
};
