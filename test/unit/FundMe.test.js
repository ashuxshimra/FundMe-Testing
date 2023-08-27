// unit tests are done locally
// stagibg tests are done on tesnets , that is just before deploying to mainnet

const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");

//lets test our fundme contract:

describe("FundMe", async function () {
  let fundMe;
  beforeEach(async function () {
    //deploy our fundme contract
    //using Hardhat-deploy
    //grab a deployer who will deploy , u can also use the key of wallet to deploy on n.w, using const accountZero=accounts[0]
    const { deployer } = await getNamedAccounts();
    await deployments.fixture["all"]; //this fixtuyre will actually run the deploy folder which consists of 2 scripts just with this one line
    fundMe = await ethers.getContract("FundMe", deployer); //now we connect our deployer and we obtain our contarct which is deployeed in the fundMe contract
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });
  describe("constructor", async function () {
    //this is used to test the constructor block, just testing the constructor
    it("sets the aggregator addresses correctly", async function () {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.target); //the address of pricefeed shall be same where mock is deployed
    });
  });
  //now lets tets the fund function
  describe("fund", async function () {
    it("Fails if you dont send enough ETH", async function () {
      await expect(fundMe.fund()).to.be.revertedWith(
        //that is below is the test if , the enough fund is not given then we need to display a revcert transaction with a message, here expect comes from chai packae
        "You need to spend more Eth" //here clearly when we are accessing the deployed contract . fundMe.fund() - this uis empty so itll fail
      );
    });
    it("updated the amount funded to data structure", async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmountFunded(deployer); //ACCESSING THE amount which is credited to funder when he funded the amount
      assert.equal(response.toString(), sendValue.toString()); //now this should be equal to what he funded and what he was credited
    });
    it("Adds funder to array of funders", async function () {
      await fundMe.fund({ value: sendValue }); //first running the fund funcction by funding adequate amount
      const funder = await fundMe.funders(0); //accessing the line of funders in fund function and testing that line , from above line this line was executed and in array funders were pushed
      assert.equal(funder, deployer);
    });
  });
  describe("withdraw", function () {
    //testing withdraw function
    beforeEach(async () => {
      //bnefore checking witrhdraw we need to fund the contract
      await fundMe.fund({ value: sendValue });
    });
    it("withdraws ETH from a single funder", async () => {
      // Arrange
      const startingFundMeBalance = //start balance of contract
        await fundMe.provider.getBalance(fundMe.address); //this is how we can get balacnce of contreact from bc
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const transactionResponse = await fundMe.withdraw(); //withdrawing from bc
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, effectiveGasPrice } = transactionReceipt; //pulling these two objects from another objects , since we are withdrawing from bc some gas will be used
      const gasCost = gasUsed.mul(effectiveGasPrice); //calculating total gas costed

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address //end balance of contract after withdraw
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer); //end balance of deployer/owner after withdraw

      // Assert
      // Maybe clean up to understand the testing
      assert.equal(endingFundMeBalance, 0);
      // since we are retrieving amount from the bc , thenumber will be a big number hence we can use . add etc used for bignumbner+somevalue
      assert.equal(
        startingFundMeBalance
          .add(startingDeployerBalance) //==.add=+
          .toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });
  });
  it("is allows us to withdraw with multiple funders", async () => {
    // Arrange
    const accounts = await ethers.getSigners(); //getting multiple accounts for fundi8ng
    for (i = 1; i < 6; i++) {
      //from 1 because 0 will be deplouyer
      const fundMeConnectedContract = await fundMe.connect(
        //connnecting cpobtract with these funders just as we did with deployer
        accounts[i]
      );
      await fundMeConnectedContract.fund({ value: sendValue }); //now from everyy account connecteed funding the amont
    }
    const startingFundMeBalance = await fundMe.provider.getBalance(
      fundMe.address
    );
    const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

    // Act
    const transactionResponse = await fundMe.cheaperWithdraw();
    // Let's comapre gas costs :)
    // const transactionResponse = await fundMe.withdraw()
    const transactionReceipt = await transactionResponse.wait();
    const { gasUsed, effectiveGasPrice } = transactionReceipt;
    const withdrawGasCost = gasUsed.mul(effectiveGasPrice);
    console.log(`GasCost: ${withdrawGasCost}`);
    console.log(`GasUsed: ${gasUsed}`);
    console.log(`GasPrice: ${effectiveGasPrice}`);
    const endingFundMeBalance = await fundMe.provider.getBalance(
      fundMe.address
    );
    const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
    // Assert
    assert.equal(
      startingFundMeBalance.add(startingDeployerBalance).toString(),
      endingDeployerBalance.add(withdrawGasCost).toString()
    );
    // Make a getter for storage variables , here w3e are ressetting the array of funders after money is withdrawn
    await expect(fundMe.getFunder(0)).to.be.reverted;

    for (i = 1; i < 6; i++) {
      assert.equal(
        await fundMe.getAddressToAmountFunded(
          //the values should be 0 now as oer contract
          accounts[i].address
        ),
        0
      );
    }
  });
  it("Only allows the owner to withdraw", async function () {
    const accounts = await ethers.getSigners();
    const fundMeConnectedContract = await fundMe.connect(
      //since we are connectibg to 1st account this wll be the attacker
      accounts[1]
    );
    await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith(
      "FundMe__NotOwner"
    ); //so if attacker tries to wiothdraw then , transaction will be reverted
  });
});
// whend done yarn hardhat test --grep "updated the amount"  then it will onlu run the equivalent word test
