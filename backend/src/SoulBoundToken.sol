// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulBoundToken is ERC721, Ownable {
    // Token URIs for different reputation levels
    string private _humanURI;
    string private _memberURI;
    string private _voterURI;
    string private _organizerURI;
    string private _leaderURI;

    // Mapping from token ID to token URI
    mapping(uint256 => string) private _tokenURIs;

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        // Default IPFS URIs
        _humanURI = "ipfs://QmYBDsrwserGrTj7r5kfnEYb8DDhKkLgsP8KkVJFF8qwpy";
        _memberURI = "ipfs://Qmdaot7r6v1cRsTLsNo54bvAbip3mXo3i8yEZkXuetdsiV";
        _voterURI = "ipfs://QmT2P6QXJ5HuJNJNY1sepeKtW8v5R4NxrYTvD6icYtc6uh";
        _organizerURI = "ipfs://QmNrLWMU3B6DMQjGuDGYMRPaNRegtoqwDXB9yRsJ5xfiJK";
        _leaderURI = "ipfs://QmSyNZbMVHBuXu7UJZDoMR2wqVx5gYeXXYtkSP99NLGUmf";
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        revert("SBT: Transfers not allowed - tokens are soulbound");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override {
        revert("SBT: Transfers not allowed - tokens are soulbound");
    }

    function mint(address to, uint256 tokenId) external onlyOwner {
        _mint(to, tokenId);
        _tokenURIs[tokenId] = _humanURI; // Default to human level
    }

    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        _burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            ownerOf(tokenId) != address(0),
            "URI query for nonexistent token"
        );
        return _tokenURIs[tokenId];
    }

    function promoteToken(
        uint256 tokenId,
        uint256 reputationScore
    ) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        if (reputationScore >= 200) {
            _tokenURIs[tokenId] = _leaderURI;
        } else if (reputationScore >= 100) {
            _tokenURIs[tokenId] = _organizerURI;
        } else if (reputationScore >= 60) {
            _tokenURIs[tokenId] = _voterURI;
        } else if (reputationScore >= 30) {
            _tokenURIs[tokenId] = _memberURI;
        } else if (reputationScore >= 10) {
            _tokenURIs[tokenId] = _humanURI;
        }
    }

    function setHumanURI(string memory newURI) external onlyOwner {
        _humanURI = newURI;
    }

    function setMemberURI(string memory newURI) external onlyOwner {
        _memberURI = newURI;
    }

    function setVoterURI(string memory newURI) external onlyOwner {
        _voterURI = newURI;
    }

    function setOrganizerURI(string memory newURI) external onlyOwner {
        _organizerURI = newURI;
    }

    function setLeaderURI(string memory newURI) external onlyOwner {
        _leaderURI = newURI;
    }
}
