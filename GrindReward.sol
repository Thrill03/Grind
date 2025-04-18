// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GrindReward is Ownable, ReentrancyGuard {
    IERC20 public grindToken;
    uint256 public constant MIN_SCORE = 2500;
    uint256 public constant REWARD_AMOUNT = 200 * 10**18; // 200 tokens with 18 decimals
    mapping(address => bool) public hasClaimedReward;
    
    event RewardClaimed(address indexed player, uint256 score, uint256 amount);
    
    constructor(address _grindTokenAddress) {
        grindToken = IERC20(_grindTokenAddress);
    }
    
    function claimReward(uint256 score) external nonReentrant {
        require(score >= MIN_SCORE, "Score too low");
        require(!hasClaimedReward[msg.sender], "Already claimed reward");
        
        // Verify the score (in a real implementation, you'd want to verify this with a signature from your game server)
        // For now, we'll trust the score provided by the user
        
        // Check if contract has enough tokens
        uint256 contractBalance = grindToken.balanceOf(address(this));
        require(contractBalance >= REWARD_AMOUNT, "Insufficient tokens in contract");
        
        // Transfer tokens to player
        require(grindToken.transfer(msg.sender, REWARD_AMOUNT), "Token transfer failed");
        
        // Mark as claimed
        hasClaimedReward[msg.sender] = true;
        
        emit RewardClaimed(msg.sender, score, REWARD_AMOUNT);
    }
    
    // Function to withdraw tokens (only owner)
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(grindToken.transfer(owner(), amount), "Token transfer failed");
    }
    
    // Function to check if a player is eligible for reward
    function isEligibleForReward(address player) external view returns (bool) {
        return !hasClaimedReward[player];
    }
} 