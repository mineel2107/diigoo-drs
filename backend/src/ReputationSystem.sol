// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SoulBoundToken.sol";

contract ReputationSystem is Ownable {
    mapping(address => string) public ensNames;
    mapping(string => address) public ensNameToAddress;
    mapping(address => uint256) public reputationScores;
    mapping(address => bool) public isVerified;
    mapping(address => uint256) public lastTaskCompletion;
    mapping(address => uint256) public lastVote;
    mapping(address => bool) public hasCompletedTask;
    mapping(address => uint256) public tokenIds;

    // Timing parameters
    uint256 public taskCooldownPeriod = 2 minutes;
    uint256 public voteCooldownPeriod = 5 minutes;

    // Token counter
    uint256 private _tokenIdCounter;

    // Reputation thresholds
    uint256 public constant HUMAN_THRESHOLD = 10;
    uint256 public constant MEMBER_THRESHOLD = 30;
    uint256 public constant VOTER_THRESHOLD = 60;
    uint256 public constant NATIVE_THRESHOLD = 100;
    uint256 public constant LEADER_THRESHOLD = 200;

    // Events
    event ENSNameRegistered(address indexed user, string name);
    event AccountVerified(address indexed user);
    event TaskCompleted(address indexed user);
    event VoteSubmitted(address indexed user);

    SoulBoundToken public sbt;

    constructor() Ownable(msg.sender) {
        sbt = new SoulBoundToken("DiigooDAO", "DDAO");
    }

    function verifyAccount() external {
        require(!isVerified[msg.sender], "Account already verified");
        isVerified[msg.sender] = true;
        reputationScores[msg.sender] += 10;

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        sbt.mint(msg.sender, tokenId);
        tokenIds[msg.sender] = tokenId;
        _updateTokenURI(msg.sender);

        emit AccountVerified(msg.sender);
    }

    function completeTask() external {
        require(isVerified[msg.sender], "Account not verified");
        require(
            block.timestamp >=
                lastTaskCompletion[msg.sender] + taskCooldownPeriod,
            "Task cooldown period not elapsed"
        );

        lastTaskCompletion[msg.sender] = block.timestamp;
        hasCompletedTask[msg.sender] = true;
        reputationScores[msg.sender] += 20;
        _updateTokenURI(msg.sender);

        emit TaskCompleted(msg.sender);
    }

    function voteInDAO() external {
        require(isVerified[msg.sender], "Account not verified");
        require(
            hasCompletedTask[msg.sender],
            "Must complete at least one task first"
        );
        require(
            block.timestamp >= lastVote[msg.sender] + voteCooldownPeriod,
            "Vote cooldown period not elapsed"
        );

        lastVote[msg.sender] = block.timestamp;
        reputationScores[msg.sender] += 30;
        _updateTokenURI(msg.sender);

        emit VoteSubmitted(msg.sender);
    }

    function _updateTokenURI(address user) private {
        uint256 tokenId = tokenIds[user];
        uint256 reputation = reputationScores[user];
        sbt.promoteToken(tokenId, reputation);
    }

    function setTaskCooldownPeriod(uint256 period) external onlyOwner {
        taskCooldownPeriod = period;
    }

    function setVoteCooldownPeriod(uint256 period) external onlyOwner {
        voteCooldownPeriod = period;
    }

    function registerENSName(string calldata ensName) external {
        require(bytes(ensName).length > 0, "ENS name cannot be empty");
        require(
            ensNameToAddress[ensName] == address(0),
            "ENS name already taken"
        );
        require(
            bytes(ensNames[msg.sender]).length == 0,
            "User already has an ENS name"
        );

        ensNames[msg.sender] = ensName;
        ensNameToAddress[ensName] = msg.sender;

        emit ENSNameRegistered(msg.sender, ensName);
    }

    function getENSName(address user) public view returns (string memory) {
        return ensNames[user];
    }
}
