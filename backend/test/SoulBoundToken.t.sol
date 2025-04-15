// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/SoulBoundToken.sol";

contract SoulBoundTokenTest is Test {
    SoulBoundToken public sbt;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);

        // Initialize the contract
        sbt = new SoulBoundToken("DiigooDAO", "DDAO");
    }

    function testMint() public {
        // Mint a token to user1
        sbt.mint(user1, 1);

        // Check the owner of the token
        assertEq(sbt.ownerOf(1), user1);

        // Check the default token URI (human level)
        assertEq(
            sbt.tokenURI(1),
            "ipfs://QmYBDsrwserGrTj7r5kfnEYb8DDhKkLgsP8KkVJFF8qwpy"
        );
    }

    function testTransfer() public {
        // Mint a token to user1
        sbt.mint(user1, 1);

        // Try to transfer and expect revert
        vm.prank(user1);
        vm.expectRevert("SBT: Transfers not allowed - tokens are soulbound");
        sbt.transferFrom(user1, user2, 1);
    }

    function testBurn() public {
        // Mint a token to user1
        sbt.mint(user1, 1);

        // Burn the token as user1
        vm.prank(user1);
        sbt.burn(1);

        // Check that the token no longer exists
        vm.expectRevert();
        sbt.ownerOf(1);
    }

    function testPromoteToken() public {
        // Mint a token to user1
        sbt.mint(user1, 1);

        // Promote token to different levels
        sbt.promoteToken(1, 15); // Human level
        assertEq(
            sbt.tokenURI(1),
            "ipfs://QmYBDsrwserGrTj7r5kfnEYb8DDhKkLgsP8KkVJFF8qwpy"
        );

        sbt.promoteToken(1, 40); // Member level
        assertEq(
            sbt.tokenURI(1),
            "ipfs://Qmdaot7r6v1cRsTLsNo54bvAbip3mXo3i8yEZkXuetdsiV"
        );

        sbt.promoteToken(1, 70); // Voter level
        assertEq(
            sbt.tokenURI(1),
            "ipfs://QmT2P6QXJ5HuJNJNY1sepeKtW8v5R4NxrYTvD6icYtc6uh"
        );

        sbt.promoteToken(1, 150); // Organizer level
        assertEq(
            sbt.tokenURI(1),
            "ipfs://QmNrLWMU3B6DMQjGuDGYMRPaNRegtoqwDXB9yRsJ5xfiJK"
        );

        sbt.promoteToken(1, 250); // Leader level
        assertEq(
            sbt.tokenURI(1),
            "ipfs://QmSyNZbMVHBuXu7UJZDoMR2wqVx5gYeXXYtkSP99NLGUmf"
        );
    }

    function testUpdateURIs() public {
        // Update URIs
        string memory newHumanURI = "ipfs://new-human-uri";
        sbt.setHumanURI(newHumanURI);

        // Mint and check if the new URI is applied
        sbt.mint(user1, 1);
        sbt.promoteToken(1, 15);
        assertEq(sbt.tokenURI(1), newHumanURI);
    }

    function testOnlyOwnerCanMint() public {
        // Try to mint as non-owner
        vm.prank(user1);
        vm.expectRevert();
        sbt.mint(user1, 1);
    }
}
