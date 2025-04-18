// Debug logging utility
const debug = {
    log: (message) => console.log(`[DEBUG] ${message}`),
    error: (message, error) => console.error(`[ERROR] ${message}`, error)
};

// Function to load ethers.js if not already loaded
async function loadEthers() {
    if (typeof ethers === 'undefined') {
        debug.log('Loading ethers.js...');
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js';
            script.onload = () => {
                debug.log('ethers.js loaded successfully');
                resolve();
            };
            script.onerror = (error) => {
                debug.error('Failed to load ethers.js:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }
    debug.log('ethers.js already loaded');
    return Promise.resolve();
}

// Function to check wallet connection
async function checkWalletConnection() {
    try {
        debug.log('Checking wallet connection...');
        
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        
        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }

        const signer = provider.getSigner();
        const address = await signer.getAddress();
        debug.log(`Connected to wallet: ${address}`);
        
        return true;
    } catch (error) {
        debug.error('Wallet connection failed:', error);
        return false;
    }
}

// Initialize game
async function initializeGame() {
    try {
        debug.log('Starting game initialization...');
        
        // Load ethers.js first
        await loadEthers();
        
        // Check if MetaMask is installed
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed. Please install MetaMask to play the game.');
        }
        
        // Check wallet connection
        const isConnected = await checkWalletConnection();
        if (!isConnected) {
            throw new Error('Failed to connect to wallet. Please make sure MetaMask is unlocked and try again.');
        }
        
        // Check if Game class is available
        if (typeof Game === 'undefined') {
            throw new Error('Game class not loaded');
        }
        
        // Create game instance
        const game = new Game();
        debug.log('Game instance created successfully');
        
        return game;
    } catch (error) {
        debug.error('Game initialization failed:', error);
        // Show error to user
        const errorMessage = document.createElement('div');
        errorMessage.style.position = 'fixed';
        errorMessage.style.top = '10px';
        errorMessage.style.left = '10px';
        errorMessage.style.right = '10px';
        errorMessage.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
        errorMessage.style.color = 'white';
        errorMessage.style.padding = '10px';
        errorMessage.style.borderRadius = '5px';
        errorMessage.style.zIndex = '1000';
        errorMessage.style.textAlign = 'center';
        errorMessage.textContent = `Error: ${error.message}`;
        document.body.appendChild(errorMessage);
        throw error;
    }
}

// Start initialization when window loads
window.addEventListener('load', async () => {
    debug.log('Window loaded, starting initialization...');
    try {
        await initializeGame();
    } catch (error) {
        debug.error('Initialization failed:', error);
    }
}); 