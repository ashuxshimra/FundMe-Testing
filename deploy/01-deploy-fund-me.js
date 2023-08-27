const { network } = require("hardhat");

module.exports = async (hre) => {
  //here we are having a anonymous function which is exdported and passing hre , now when in terminal done yarn hardhat deploy , then this function will be runninhg by default for deployment
  const { getNamedAccounts, deployments } = hre; //we are grabbing and accessing these two things as needeed from the hre , since we need it much like hre.deployments etc
  const { deploy, log } = deployments; //we are pullingh deploy function and log function from the deployments ibject
  const { deployer } = getNamedAccounts(); //this we are getting deployer from getnamedaccounts , you can also go to config file and customise the namedaccounts as done there
  const { chainId } = network.config.chainId;
  const { networkConfig } = require("../helper-hardhat-config"); //importimng this object
  // when we uysed remix to deploy the fundme contract we used real testnet and deployed , since this contract uses price feed contract address of chainlink , it has to be a real n.w
  // however deployoing on real testnet is like the last thing that shoudl be done only after testing everything on local n.w
  // but since this contract uses real chainlink data , how will we deploy/work with it locally since here we have hardhat n.w?
  // for this we can do one thing and that is to use Mocking , mock is like creating an object which simulates real objetcs
  // and hence we in a way will use mocks to create our own price feed contract which in a way will simulate the real pricefeed so that we can test locally
  // when going for localhost or hardhat n.w we want to use a mock
  // also in current fundme code , some changes needs to be done as we only have address of contractss for eth/usd price ,so we need flexbility for any chain
  // well what happens when we want to change chains ?
  // for deployment: if chainId is X and address Y and if chainId is Z and address is A that is when done hardhat deploy --network polygon , we want to have price feeed of polygon chain address which will be encoded in our fundme for further prices
  // this is achieved with the help of aave , its a protocol which is implemented in various chain and so we make a helper-hardhat-config , where we define addresses for the n.w and this way price feed contract address will be ready made
  //   now using the address based on the chain we have and this way we have paramateirzed
  //   note we are trying to deploy our contract on any chain be it test n.w or hardhat ,for testnetwork we have done in helper config file , we dibt wanna go and change the soliodity code hardcode anything , so now what if this contract needs to be deployted in hardhat ,. so we create a mock as discussed for fake simplestorae contract , hence 00-
  let ethUsdPriceFeedAddress; //now when u type hardhat deploy --nw , then here while the script runs we are grabbing in networkConfig then its chaindId and the relevant address for it so --n.w sepolia then in helper config , the pricefeed for sepolia will be taken for address this way everythinhg is setup for local environment
  if (chainId == 31337) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator"); //then get this deployed in 00- and getting itsn address here
    ethUsdPriceFeedAddress = ethUsdAggregator.target;
  } else {
    //that is in terminal some real testnet provided sepolia exa
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  log("----------------------------------------------------");
  log("Deploying FundMe and waiting for confirmations...");
  const fundMe = await deploy("FundMe", {
    //simply now deploying
    from: deployer,
    args: [ethUsdPriceFeedAddress], //here the constructor args and will be passed acc to the fund me contract constructor
    log: true,
  });
};
// once we deploy this code lcoally on hardhat , then when done yarn hardhat node , alomg with addresses it will also show the address of deployed mockv3 contract and fundme contract too , so you can access the previous deployments like this
module.exports.tags = ["all", "fundme"]; //now if u do yarn hardhat deploy --tags fundme , then this script will only be deployed
