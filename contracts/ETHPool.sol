// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title An implementation of a fixed-income solution for Exactly Finance Smart Contract Challenge
 * @author 0xLucca
 */

contract ETHPool is AccessControl{

    using Address for address payable;

    /* ========== STATE VARIABLES ========== */

    // Role Identifier
    bytes32 public constant TEAM_MEMBER_ROLE = keccak256("TEAM_MEMBER");

    // Total deposits from all users
    uint256 public totalSuppliedBalance;

    // Total rewards in the pool
    uint256 public rewardPoolBalance;

    // Index of the last reward added
    uint256 public currentIndex;

    // All snapshots of each reward added, used to compute pendingRewards
    Reward[] public rewardUpdates;

    // Deposits of each user
    mapping (address => uint256) public deposits;

    // Index of the last deposit of each user
    mapping (address => uint256) public lastDepositIndex;

    /* ========== CONSTRUCTOR ========== */
    constructor(){
        // For admin managers to add other Team Members
        _setRoleAdmin(TEAM_MEMBER_ROLE, TEAM_MEMBER_ROLE);

        // Contract deployer is set as a Team Member
        if (!isTeamMember(msg.sender)) {
            _setupRole(TEAM_MEMBER_ROLE, msg.sender);  
        }
    }

    /* ========== FUNCTIONS ========== */

    /**
    * @notice Called to claim rewards.
    * @dev Updates the index which indicates that theres no more rewards for this user at the current time, and then it claims.
    */
    function claimRewards() public{
        uint claimableRewards = getPendingRewards(msg.sender);
        if(claimableRewards > 0){
            rewardPoolBalance -= claimableRewards;
            lastDepositIndex[msg.sender] = currentIndex;

            emit RewardsClaimed(msg.sender, claimableRewards);

            // https://diligence.consensys.net/blog/2019/09/stop-using-soliditys-transfer-now/
            payable(msg.sender).sendValue(claimableRewards);
        }
    }

    /**
    * @notice Called by the user or the contract to know the pending rewards.
    * @param account Specifies the address to get pending rewards.
    */
    function getPendingRewards(address account) public view returns (uint){
        uint pendingRewards;
        uint _lastDepositIndex = lastDepositIndex[account];
        uint _deposit = deposits[account];
        uint _currentIndex = currentIndex;
        
        if(_lastDepositIndex == _currentIndex){
            return 0;
        }
        
        for(uint i=_lastDepositIndex; i<_currentIndex; i++){
            pendingRewards += (_deposit*rewardUpdates[i].reward)/rewardUpdates[i].totalSupply;
        }

        return pendingRewards;
    }

    /**
    * @notice Called by the user to deposit funds.
    * @dev This function claims pending rewards and then updates the user deposits as well as the index.
    */
    function deposit() payable external{
        require(msg.value > 0,"Error: deposit amount can't be 0");
        
        claimRewards();

        deposits[msg.sender] += msg.value;
        totalSuppliedBalance += msg.value;
        lastDepositIndex[msg.sender] = currentIndex;
        emit Deposit(msg.sender,msg.value);
    }

    /**
    * @notice Called by the user to withdraw his funds.
    * @dev This function claims pending rewards and then withdraws the funds.
    * @param _amount Specifies the amount to withdraw.
    */
    function withdraw(uint _amount) external{
        uint _deposit = deposits[msg.sender];
        require(_amount <= _deposit,"Error: Can't withdraw more than deposited amount");
        claimRewards();

        deposits[msg.sender]-= _amount;
        totalSuppliedBalance -= _amount;

        emit Withdrawal(msg.sender,_amount);

        // https://diligence.consensys.net/blog/2019/09/stop-using-soliditys-transfer-now/
        payable(msg.sender).sendValue(_amount);
    }

    /**
    * @notice Called by a team member to add rewards to the pool.
    * @dev Takes a snapshot of the total supplied balance and the reward amount added.
    */
    function depositRewards() public payable onlyTeamMember(){
        rewardUpdates.push(Reward({totalSupply: totalSuppliedBalance, reward: msg.value}));
        rewardPoolBalance+=msg.value;
        currentIndex++;
        emit RewardsAdded(msg.sender, msg.value);
    }

     /**
    * @notice Called to verify if an address is a Team Member
    * @param account Specifies the address to check if is a Team Member
    */
    function isTeamMember(address account) public view returns (bool) {
        return hasRole(TEAM_MEMBER_ROLE, account);
    }

     /**
    * @notice Called by a Team Member to add a new Team Member.
    * @param account Specifies the address to grant the team member role to.
    */
    function addTeamMember(address account) public onlyTeamMember {
        grantRole(TEAM_MEMBER_ROLE, account);
        emit TeamMemberAdded(account);
    }

    /**
    * @notice Called by a Team Member to renounce its role.
    */
    function renounceTeamMember() public {
        renounceRole(TEAM_MEMBER_ROLE, msg.sender);
        emit TeamMemberRemoved(msg.sender);
    }

    /* ========== MODIFIERS ========== */

    // Ensure that the function is only called by a team member.
    modifier onlyTeamMember() {
        require( hasRole(TEAM_MEMBER_ROLE, msg.sender), "Error: Caller does not have the TeamMember role");
        _;
    }

    /* ========== STRUCTS ========== */

    // Snapshot of the state of the contract when a new reward is deposited.
    struct Reward{
        uint totalSupply;
        uint reward;
    }

    /* ========== EVENTS ========== */
    event Withdrawal(address account, uint amount);
    event Deposit(address account, uint amount);
    event RewardsClaimed(address account, uint amount);
    event RewardsAdded(address account, uint amount);
    event TeamMemberAdded(address indexed account);
    event TeamMemberRemoved(address indexed account);
}