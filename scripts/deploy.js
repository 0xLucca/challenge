const main = async () => {
  const ethPoolFactory = await hre.ethers.getContractFactory("ETHPool");
  const ethPool = await ethPoolFactory.deploy();
  await ethPool.deployed();
  console.log("Contract deployed to:", ethPool.address);
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
