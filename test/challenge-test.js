const { expect } = require("chai");
const { ethers } = require("hardhat");

let ethPoolFactory, ethPool;

describe("ETHPool", function () {
  this.beforeEach(async function () {
    accounts = await ethers.getSigners();
    ethPoolFactory = await hre.ethers.getContractFactory("ETHPool");
    ethPool = await ethPoolFactory.deploy();
    await ethPool.deployed();
    //console.log("Contract deployed to:", ethPool.address);
  });

  it("Should return true since account 0 is a Team Member", async function () {
    expect(await ethPool.isTeamMember(accounts[0].address)).to.equal(true);
  });

  it("Should return false since account 1 is not a Team Member", async function () {
    expect(await ethPool.isTeamMember(accounts[1].address)).to.equal(false);
  });

  it("Should return the amount deposited", async function () {
    await ethPool
      .connect(accounts[1])
      .deposit({ value: ethers.utils.parseEther("1") });

    let userBalance = ethers.utils.formatEther(
      await ethPool.connect(accounts[1]).deposits(accounts[1].address)
    );
    expect(userBalance).to.equal("1.0");
  });

  it("README first example", async function () {
    // User A deposit
    await ethPool
      .connect(accounts[1])
      .deposit({ value: ethers.utils.parseEther("100") });

    // User B deposit
    await ethPool
      .connect(accounts[2])
      .deposit({ value: ethers.utils.parseEther("300") });

    // Total deposited balance
    let totalSuppliedBalance = ethers.utils.formatEther(
      await ethPool.totalSuppliedBalance()
    );
    expect(totalSuppliedBalance).to.equal("400.0");

    // Rewards deposit
    await ethPool
      .connect(accounts[0])
      .depositRewards({ value: ethers.utils.parseEther("200") });

    // Reward pool balance
    let rewardPoolBalance = ethers.utils.formatEther(
      await ethPool.rewardPoolBalance()
    );
    expect(rewardPoolBalance).to.equal("200.0");

    // User A rewards
    let userARewards = ethers.utils.formatEther(
      await ethPool.getPendingRewards(accounts[1].address)
    );
    expect(userARewards).to.equal("50.0");

    // User B rewards
    let userBRewards = ethers.utils.formatEther(
      await ethPool.getPendingRewards(accounts[2].address)
    );
    expect(userBRewards).to.equal("150.0");

    // User A withdraw
    await ethPool.connect(accounts[1]).withdraw(ethers.utils.parseEther("100"));
    userARewards = ethers.utils.formatEther(
      await ethPool.getPendingRewards(accounts[1].address)
    );
    expect(userARewards).to.equal("0.0");

    userADeposit = ethers.utils.formatEther(
      await ethPool.deposits(accounts[1].address)
    );
    expect(userADeposit).to.equal("0.0");

    totalSuppliedBalance = ethers.utils.formatEther(
      await ethPool.totalSuppliedBalance()
    );
    expect(totalSuppliedBalance).to.equal("300.0");

    // User B withdraw
    await ethPool.connect(accounts[2]).withdraw(ethers.utils.parseEther("300"));
    userBRewards = ethers.utils.formatEther(
      await ethPool.getPendingRewards(accounts[2].address)
    );
    expect(userBRewards).to.equal("0.0");

    userBDeposit = ethers.utils.formatEther(
      await ethPool.deposits(accounts[2].address)
    );
    expect(userBDeposit).to.equal("0.0");

    totalSuppliedBalance = ethers.utils.formatEther(
      await ethPool.totalSuppliedBalance()
    );
    expect(totalSuppliedBalance).to.equal("0.0");
  });

  it("README second example", async function () {
    // User A deposit
    await ethPool
      .connect(accounts[1])
      .deposit({ value: ethers.utils.parseEther("100") });

    // Rewards deposit
    await ethPool
      .connect(accounts[0])
      .depositRewards({ value: ethers.utils.parseEther("200") });

    // User B deposit
    await ethPool
      .connect(accounts[2])
      .deposit({ value: ethers.utils.parseEther("300") });

    // Total deposited balance
    let totalSuppliedBalance = ethers.utils.formatEther(
      await ethPool.totalSuppliedBalance()
    );
    expect(totalSuppliedBalance).to.equal("400.0");

    // Reward pool balance
    let rewardPoolBalance = ethers.utils.formatEther(
      await ethPool.rewardPoolBalance()
    );
    expect(rewardPoolBalance).to.equal("200.0");

    // User A rewards
    let userARewards = ethers.utils.formatEther(
      await ethPool.getPendingRewards(accounts[1].address)
    );
    expect(userARewards).to.equal("200.0");

    // User B rewards
    let userBRewards = ethers.utils.formatEther(
      await ethPool.getPendingRewards(accounts[2].address)
    );
    expect(userBRewards).to.equal("0.0");

    // User A withdraw
    await ethPool.connect(accounts[1]).withdraw(ethers.utils.parseEther("100"));
    userARewards = ethers.utils.formatEther(
      await ethPool.getPendingRewards(accounts[1].address)
    );
    expect(userARewards).to.equal("0.0");

    userADeposit = ethers.utils.formatEther(
      await ethPool.deposits(accounts[1].address)
    );
    expect(userADeposit).to.equal("0.0");

    totalSuppliedBalance = ethers.utils.formatEther(
      await ethPool.totalSuppliedBalance()
    );
    expect(totalSuppliedBalance).to.equal("300.0");

    // User B withdraw
    await ethPool.connect(accounts[2]).withdraw(ethers.utils.parseEther("300"));
    userBRewards = ethers.utils.formatEther(
      await ethPool.getPendingRewards(accounts[2].address)
    );
    expect(userBRewards).to.equal("0.0");

    userBDeposit = ethers.utils.formatEther(
      await ethPool.deposits(accounts[2].address)
    );
    expect(userBDeposit).to.equal("0.0");

    totalSuppliedBalance = ethers.utils.formatEther(
      await ethPool.totalSuppliedBalance()
    );
    expect(totalSuppliedBalance).to.equal("0.0");

    let contractBalance = ethers.utils.formatEther(
      await ethers.provider.getBalance(ethPool.address)
    );
    expect(contractBalance).to.equal("0.0");
  });
});
