const CONFIG = {
    // Contract addresses
    GRIND_TOKEN_ADDRESS: "0x1Eb1aA4079606E1cD70ea6b50D30a10575957aA5",
    REWARD_CONTRACT_ADDRESS: "0xEe691F9d1e473D07B725B22D579c1228D60fc50A",
    
    // Network settings
    NETWORK: {
        name: "ABS Testnet",
        chainId: 11124,
        rpcUrl: "https://api.testnet.abs.xyz"
    },
    
    // Game settings
    GAME: {
        REWARD_THRESHOLD: 1500,
        REWARD_AMOUNT: 100
    }
};

const REWARD_TIERS = [
    { score: 1500, amount: 100 },
    { score: 2500, amount: 200 },
    { score: 3500, amount: 500 },
    { score: 5000, amount: 1000 }
]; 