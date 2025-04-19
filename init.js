// Debug logging utility
const debug = {
    log: (message, data) => {
        console.log(`[DEBUG] ${message}`, data || '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${message}`, error || '');
    }
};

// Check if wallet is connected
function checkWalletConnection() {
    const walletConnect = document.getElementById('walletConnect');
    const walletAddress = document.getElementById('walletAddress');
    const startButton = document.getElementById('startButton');

    if (window.ethereum && window.ethereum.selectedAddress) {
        // Wallet is connected
        walletConnect.textContent = 'Wallet Connected';
        walletConnect.classList.add('wallet-connected');
        walletAddress.textContent = window.ethereum.selectedAddress;
        startButton.style.display = 'block';
    } else {
        // Wallet is not connected
        walletConnect.textContent = 'Connect Wallet';
        walletConnect.classList.remove('wallet-connected');
        walletAddress.textContent = '';
        startButton.style.display = 'none';
    }
}

// Load ethers.js if not already loaded
async function loadEthers() {
    return new Promise((resolve, reject) => {
        if (typeof ethers !== 'undefined') {
            debug.log('ethers.js already loaded');
            resolve();
            return;
        }

        debug.log('Loading ethers.js...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js';
        script.type = 'text/javascript';
        script.async = true;

        script.onload = () => {
            debug.log('ethers.js loaded successfully');
            resolve();
        };

        script.onerror = (error) => {
            debug.error('Failed to load ethers.js', error);
            reject(new Error('Failed to load ethers.js'));
        };

        document.head.appendChild(script);
    });
}

// Initialize reward contract
async function initializeRewardContract(provider, signer) {
    try {
        debug.log('Initializing reward contract...');
        
        // Check if we're on the correct network
        const network = await provider.getNetwork();
        if (network.chainId !== CONFIG.NETWORK.chainId) {
            // Try to switch to the correct network
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${CONFIG.NETWORK.chainId.toString(16)}`,
                        chainName: CONFIG.NETWORK.name,
                        rpcUrls: [CONFIG.NETWORK.rpcUrl],
                        nativeCurrency: {
                            name: 'ETH',
                            symbol: 'ETH',
                            decimals: 18
                        }
                    }]
                });
            } catch (switchError) {
                debug.error('Failed to switch network', switchError);
                throw new Error(`Please switch to ${CONFIG.NETWORK.name} network`);
            }
        }
        
        const rewardContract = new ethers.Contract(
            CONFIG.REWARD_CONTRACT_ADDRESS,
            [
                {
                    "inputs": [{"name": "player", "type": "address"}],
                    "name": "isEligibleForReward",
                    "outputs": [{"name": "", "type": "bool"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [{"name": "score", "type": "uint256"}],
                    "name": "claimReward",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ],
            signer
        );
        
        // Test the contract connection
        try {
            const testAddress = await signer.getAddress();
            await rewardContract.isEligibleForReward(testAddress);
            debug.log('Reward contract initialized successfully');
            return rewardContract;
        } catch (testError) {
            debug.error('Contract test failed', testError);
            throw new Error('Failed to connect to reward contract. Please ensure you are on the correct network and the contract is deployed.');
        }
    } catch (error) {
        debug.error('Failed to initialize reward contract', error);
        throw error;
    }
}

// Wait for all dependencies to load
async function initializeGame() {
    try {
        debug.log('Starting game initialization...');

        // Load ethers.js
        await loadEthers();

        // Verify ethers.js is loaded
        if (typeof ethers === 'undefined') {
            throw new Error('ethers.js not loaded after loading attempt');
        }
        debug.log('ethers.js verified');

        // Verify MetaMask is available
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask not available. Please ensure MetaMask is installed and unlocked.');
        }
        debug.log('MetaMask available');

        // Verify Game class is loaded
        if (typeof Game === 'undefined') {
            throw new Error('Game class not loaded. Please ensure game.js is properly included.');
        }
        debug.log('Game class loaded successfully');

        // Create game instance
        debug.log('Creating game instance...');
        const game = new Game();
        debug.log('Game instance created successfully');

        // Show start menu
        game.showStartMenu();

        // Initialize wallet connection check
        debug.log('Initializing wallet connection check...');
        checkWalletConnection();

        // Add wallet connection event listener
        const walletConnect = document.getElementById('walletConnect');
        walletConnect.addEventListener('click', async () => {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                checkWalletConnection();
                
                // Create provider with ENS disabled
                const provider = new ethers.providers.Web3Provider(window.ethereum, {
                    name: CONFIG.NETWORK.name,
                    chainId: CONFIG.NETWORK.chainId,
                    ensAddress: null // Disable ENS
                });
                
                // Get signer from provider
                const signer = provider.getSigner();
                
                // Initialize reward contract
                const rewardContract = await initializeRewardContract(provider, signer);
                game.rewardContract = rewardContract;
                game.walletConnected = true;
                
                debug.log('Wallet connected and reward contract initialized');
            } catch (error) {
                debug.error('Failed to connect wallet', error);
                alert('Failed to connect wallet. Please try again.');
            }
        });

        // Add network change listener
        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });

        // Add account change listener
        window.ethereum.on('accountsChanged', () => {
            checkWalletConnection();
        });

        debug.log('Game initialization complete');
    } catch (error) {
        debug.error('Game initialization failed', error);
        alert('Failed to initialize game. Please check the console for details.');
    }
}

// Start initialization when the page loads
window.addEventListener('load', initializeGame); 