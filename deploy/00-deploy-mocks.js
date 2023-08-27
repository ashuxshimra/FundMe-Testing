const { network } = require("hardhat");
// here we are creating a mock price feed contract and we will deploy it
// so chainlink provides a contract which is a mock for price feed , under test folder in contratcs import that contract and deploy here
const DECIMALS = "8"; //thesew are the contructor args for the Mock contract so we are defining it here since it is constant
const INITIAL_PRICE = "200000000000"; // 2000
module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  // If we are on a local development network, we need to deploy mocks!
  if (chainId == 31337) {
    //hardhat chainid then we will deploy
    log("Local network detected! Deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    log("Mocks Deployed!");
    log("------------------------------------------------");
    log(
      "You are deploying to a local network, you'll need a local network running to interact"
    );
    log(
      "Please run `npx hardhat console` to interact with the deployed smart contracts!"
    );
    log("------------------------------------------------");
  }
};
module.exports.tags = ["all", "mocks"];
