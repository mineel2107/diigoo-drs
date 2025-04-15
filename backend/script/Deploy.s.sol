// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/ReputationSystem.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        // Get the private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the ReputationSystem contract
        // The SoulBoundToken will be deployed automatically in the constructor
        ReputationSystem repSystem = new ReputationSystem();

        // Log the deployed addresses
        console.log("ReputationSystem deployed at:", address(repSystem));
        console.log("SoulBoundToken deployed at:", address(repSystem.sbt()));

        // End broadcasting
        vm.stopBroadcast();
    }
}
