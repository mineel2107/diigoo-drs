// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/ReputationSystem.sol";
import "../src/SoulBoundToken.sol";

contract ReputationSystemTest is Test {
    ReputationSystem public repSystem;
    address public owner;
    address public user1;
    address public user2;

    event ENSNameRegistered(address indexed user, string name);
    event AccountVerified(address indexed user);
    event TaskCompleted(address indexed user);
    event VoteSubmitted(address indexed user);

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);

        // Initialize the contract
        repSystem = new ReputationSystem();

        // Get SBT reference
        SoulBoundToken sbt = repSystem.sbt();

        // Set test cooldown periods for faster testing
        repSystem.setTaskCooldownPeriod(1);
        repSystem.setVoteCooldownPeriod(1);
    }

    function testVerifyAccount() public {
        vm.startPrank(user1);
        vm.expectEmit(true, false, false, false);
        emit AccountVerified(user1);
        repSystem.verifyAccount();
        assertTrue(repSystem.isVerified(user1));
        assertEq(repSystem.reputationScores(user1), 10);
        vm.stopPrank();
    }

    function testVerifyAccountTwice() public {
        // Verify user1's account
        vm.prank(user1);
        repSystem.verifyAccount();

        // Try to verify again, should revert
        vm.prank(user1);
        vm.expectRevert("Account already verified");
        repSystem.verifyAccount();
    }

    function testCompleteTask() public {
        vm.startPrank(user1);
        repSystem.verifyAccount();
        vm.expectEmit(true, false, false, false);
        emit TaskCompleted(user1);
        repSystem.completeTask();
        assertEq(repSystem.reputationScores(user1), 30);
        assertTrue(repSystem.hasCompletedTask(user1));
        vm.stopPrank();
    }

    function testTaskCooldown() public {
        // First verify the account
        vm.prank(user1);
        repSystem.verifyAccount();

        // Complete a task
        vm.prank(user1);
        repSystem.completeTask();

        // Try to complete another task immediately
        vm.prank(user1);
        vm.expectRevert("Task cooldown period not elapsed");
        repSystem.completeTask();

        // Wait for cooldown (we set it to 1 second in setUp)
        vm.warp(block.timestamp + 2);

        // Now it should work
        vm.prank(user1);
        repSystem.completeTask();

        // Check results
        assertEq(repSystem.reputationScores(user1), 50); // 10 (verification) + 20 + 20 (tasks)
    }

    function testVoteInDAO() public {
        vm.startPrank(user1);
        repSystem.verifyAccount();
        repSystem.completeTask();
        vm.expectEmit(true, false, false, false);
        emit VoteSubmitted(user1);
        repSystem.voteInDAO();
        assertEq(repSystem.reputationScores(user1), 60);
        vm.stopPrank();
    }

    function testVoteCooldown() public {
        // First verify the account
        vm.prank(user1);
        repSystem.verifyAccount();

        // Complete a task
        vm.prank(user1);
        repSystem.completeTask();

        // Vote in DAO
        vm.prank(user1);
        repSystem.voteInDAO();

        // Try to vote again immediately
        vm.prank(user1);
        vm.expectRevert("Vote cooldown period not elapsed");
        repSystem.voteInDAO();

        // Wait for cooldown (we set it to 1 second in setUp)
        vm.warp(block.timestamp + 2);

        // Now it should work
        vm.prank(user1);
        repSystem.voteInDAO();

        // Check results
        assertEq(repSystem.reputationScores(user1), 90); // 10 (verification) + 20 (task) + 30 + 30 (votes)
    }

    function testMustCompleteTaskBeforeVoting() public {
        // First verify the account
        vm.prank(user1);
        repSystem.verifyAccount();

        // Try to vote without completing a task
        vm.prank(user1);
        vm.expectRevert("Must complete at least one task first");
        repSystem.voteInDAO();
    }

    function testTokenPromotionBasedOnReputation() public {
        vm.startPrank(user1);

        // Verify (10 rep) - Human level
        repSystem.verifyAccount();
        repSystem.completeTask(); // +20 = 30 total

        vm.warp(block.timestamp + 2);
        repSystem.completeTask(); // +20 = 50 total

        vm.warp(block.timestamp + 2);
        repSystem.voteInDAO(); // +30 = 80 total

        vm.warp(block.timestamp + 2);
        repSystem.voteInDAO(); // +30 = 110 total

        vm.warp(block.timestamp + 2);
        repSystem.voteInDAO(); // +30 = 140 total

        vm.warp(block.timestamp + 2);
        repSystem.voteInDAO(); // +30 = 170 total

        vm.warp(block.timestamp + 2);
        repSystem.voteInDAO(); // +30 = 200 total

        vm.stopPrank();

        assertEq(repSystem.reputationScores(user1), 200);

        SoulBoundToken sbt = repSystem.sbt();
        uint256 tokenId = repSystem.tokenIds(user1);
        string
            memory expectedURI = "ipfs://QmSyNZbMVHBuXu7UJZDoMR2wqVx5gYeXXYtkSP99NLGUmf"; // Leader URI
        assertEq(sbt.tokenURI(tokenId), expectedURI);
    }

    function testRegisterENSName() public {
        vm.startPrank(user1);
        string memory name = "test.eth";
        vm.expectEmit(true, false, false, true);
        emit ENSNameRegistered(user1, name);
        repSystem.registerENSName(name);
        assertEq(repSystem.ensNames(user1), name);
        assertEq(repSystem.ensNameToAddress(name), user1);
        vm.stopPrank();
    }

    function testCannotRegisterDuplicateENSName() public {
        string memory name = "test.eth";
        vm.prank(user1);
        repSystem.registerENSName(name);

        vm.prank(user2);
        vm.expectRevert("ENS name already taken");
        repSystem.registerENSName(name);
    }

    function testCannotRegisterEmptyENSName() public {
        vm.prank(user1);
        vm.expectRevert("ENS name cannot be empty");
        repSystem.registerENSName("");
    }

    function testCannotRegisterMultipleENSNames() public {
        vm.startPrank(user1);
        repSystem.registerENSName("test1.eth");
        vm.expectRevert("User already has an ENS name");
        repSystem.registerENSName("test2.eth");
        vm.stopPrank();
    }
}
