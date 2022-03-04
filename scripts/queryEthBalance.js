const { ethers } = require("ethers");
const contractData = require("../utils/contractData.json");

const main = async () => {
  const network = "rinkeby";
  const provider = ethers.getDefaultProvider(network);
  const address = contractData.address;

  let balance = ethers.utils.formatEther(await provider.getBalance(address));
  console.log("Contract balance: %s ETH", balance);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
