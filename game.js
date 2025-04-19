class Game {
    constructor() {
        console.log('Game constructor started');
        
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        console.log('Canvas found');
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get canvas context');
            return;
        }
        console.log('Canvas context created');
        
        // Initialize physics
        console.log('Creating Physics instance');
        this.physics = new Physics();
        if (!this.physics) {
            console.error('Physics instance not created');
            return;
        }
        console.log('Physics instance created');
        
        // Get UI elements
        console.log('Getting UI elements');
        this.startMenu = document.getElementById('startMenu');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.startButton = document.getElementById('startButton');
        this.playAgainButton = document.getElementById('playAgainButton');
        this.finalScore = document.getElementById('finalScore');
        this.leaderboardButton = document.getElementById('leaderboardButton');
        this.leaderboardPopup = document.getElementById('leaderboardPopup');
        this.closeLeaderboardButton = document.getElementById('closeLeaderboardButton');
        this.startLeaderboard = document.getElementById('startLeaderboard');
        this.gameOverLeaderboard = document.getElementById('gameOverLeaderboard');
        this.scoreElement = document.querySelector('.score');
        
        // Style the leaderboard button
        if (this.leaderboardButton) {
            this.leaderboardButton.style.backgroundColor = '#3498db';
            this.leaderboardButton.style.color = 'white';
            this.leaderboardButton.style.padding = '15px 30px';
            this.leaderboardButton.style.border = 'none';
            this.leaderboardButton.style.borderRadius = '5px';
            this.leaderboardButton.style.fontSize = '24px';
            this.leaderboardButton.style.cursor = 'pointer';
            this.leaderboardButton.style.marginTop = '-80px'; // Changed from -150px to -80px
            this.leaderboardButton.style.transition = 'background-color 0.3s';
            this.leaderboardButton.onmouseover = () => this.leaderboardButton.style.backgroundColor = '#2980b9';
            this.leaderboardButton.onmouseout = () => this.leaderboardButton.style.backgroundColor = '#3498db';
        }
        
        // Create wallet info container for start menu
        this.startMenuWalletInfo = document.createElement('div');
        this.startMenuWalletInfo.id = 'start-menu-wallet-info';
        this.startMenuWalletInfo.style.position = 'absolute';
        this.startMenuWalletInfo.style.top = '20px';
        this.startMenuWalletInfo.style.right = '20px';
        this.startMenuWalletInfo.style.display = 'flex';
        this.startMenuWalletInfo.style.flexDirection = 'column';
        this.startMenuWalletInfo.style.gap = '10px';
        this.startMenuWalletInfo.style.zIndex = '1000';
        this.startMenu.appendChild(this.startMenuWalletInfo);
        
        // Show start menu
        this.showStartMenu();
        
        // Get wallet UI elements
        this.walletConnectButton = document.getElementById('walletConnect');
        this.walletAddressDisplay = document.getElementById('walletAddress');
        
        if (!this.startMenu || !this.gameOverScreen || !this.startButton || !this.playAgainButton || !this.finalScore || !this.leaderboardButton || !this.leaderboardPopup || !this.closeLeaderboardButton || !this.startLeaderboard || !this.gameOverLeaderboard || !this.scoreElement || !this.walletConnectButton || !this.walletAddressDisplay) {
            console.error('One or more UI elements not found:', {
                startMenu: !!this.startMenu,
                gameOverScreen: !!this.gameOverScreen,
                startButton: !!this.startButton,
                playAgainButton: !!this.playAgainButton,
                finalScore: !!this.finalScore,
                leaderboardButton: !!this.leaderboardButton,
                leaderboardPopup: !!this.leaderboardPopup,
                closeLeaderboardButton: !!this.closeLeaderboardButton,
                startLeaderboard: !!this.startLeaderboard,
                gameOverLeaderboard: !!this.gameOverLeaderboard,
                scoreElement: !!this.scoreElement,
                walletConnectButton: !!this.walletConnectButton,
                walletAddressDisplay: !!this.walletAddressDisplay
            });
            return;
        }
        console.log('All UI elements found');
        
        // Initialize game state
        console.log('Initializing game state');
        this.score = 0;
        this.coffeeLevel = 100;
        this.gameOver = false;
        this.coffeeBeans = [];
        this.obstacles = [];
        this.powerUpActive = false;
        this.powerUpEndTime = 0;
        this.originalMaxSpeed = 5;
        this.originalRadius = 0;  // Will be set in resizeCanvas
        this.currentRadius = 0;   // Will be set in resizeCanvas
        this.magnetActive = false;
        this.magnetEndTime = 0;
        this.magnetRadius = 0;    // Will be set in resizeCanvas
        this.tailAngle = 0;
        this.tailWagSpeed = 0.05;
        this.tailWagAmplitude = 0.3;
        this.gameStartTime = 0;

        // Initialize ball with base size
        this.ball = {
            x: 0,  // Will be set in resizeCanvas
            y: 0,  // Will be set in resizeCanvas
            radius: 0,  // Will be set in resizeCanvas
            vx: 0,
            vy: 0,
            groundY: 0,  // Will be set in resizeCanvas
            maxX: 0      // Will be set in resizeCanvas
        };

        // Store original values for power-up scaling
        this.originalMaxSpeed = 5;
        this.originalRadius = 0;  // Will be set in resizeCanvas
        this.currentRadius = 0;   // Will be set in resizeCanvas
        this.magnetRadius = 0;    // Will be set in resizeCanvas
        
        // Set up canvas and event listeners
        console.log('Setting up canvas and event listeners');
        this.gameOverScreen.style.display = 'none';
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Set up input handling
        console.log('Setting up input handling');
        this.setupInput();
        
        // Initialize game state
        this.lastTime = 0;
        this.gameState = 'menu';
        
        // Set up button event listeners
        console.log('Setting up button event listeners');
        this.startButton.addEventListener('click', () => this.startGame());
        this.playAgainButton.addEventListener('click', () => this.restartGame());
        this.leaderboardButton.addEventListener('click', () => this.showLeaderboard());
        this.closeLeaderboardButton.addEventListener('click', () => this.hideLeaderboard());
        
        // Create power-up timers
        this.caffeineRushTimer = document.createElement('div');
        this.caffeineRushTimer.className = 'power-up-timer caffeine-rush';
        this.caffeineRushTimer.style.display = 'none';
        
        this.magnetTimer = document.createElement('div');
        this.magnetTimer.className = 'power-up-timer magnet';
        this.magnetTimer.style.display = 'none';
        
        document.querySelector('.hud').appendChild(this.caffeineRushTimer);
        document.querySelector('.hud').appendChild(this.magnetTimer);
        
        // Initialize player profile
        this.playerName = localStorage.getItem('playerName') || '';
        if (!this.playerName) {
            this.showNamePrompt();
        }

        // Initialize high scores
        this.highScores = this.loadHighScores();
        this.updateLeaderboards();
        
        // Set constant spawn intervals
        this.beanSpawnInterval = 600; // 0.6 seconds for coins (20% slower)
        this.obstacleSpawnInterval = 5000; // 5 seconds for coffee beans
        this.powerUpSpawnInterval = 6900; // 6.9 seconds for power-ups (15% slower)
        
        // Initialize spawn timing variables
        this.lastBeanSpawn = 0;
        this.lastObstacleSpawn = 0;
        this.lastCoffeePowerUpSpawn = 0;
        this.lastMagnetPowerUpSpawn = 0;
        
        // Initialize laser beams
        this.laserBeams = [];
        this.lastLaserSpawn = 0;
        this.laserSpawnInterval = 3000; // 3 seconds between laser patterns
        this.laserPatternDuration = 2000; // 2 seconds for each laser pattern
        this.laserPatternActive = false;
        this.laserPatternStartTime = 0;
        
        // Initialize oil spills
        this.oilSpills = [];
        this.lastOilSpawn = 0;
        this.oilSpawnInterval = 8000; // 8 seconds between oil spawns
        
        // Initialize wallet state
        this.walletConnected = false;
        this.walletAddress = null;
        
        // Initialize token state
        this.tokenState = {
            contract: null,
            provider: null,
            signer: null,
            decimals: 18,
            balance: '0',
            isInitialized: false,
            error: null
        };
        
        // Token contract integration
        this.GRIND_TOKEN_ADDRESS = '0x1Eb1aA4079606E1cD70ea6b50D30a10575957aA5';
        this.BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';
        this.GRIND_TOKEN_ABI = [
            {
                "constant": true,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {"name": "_to", "type": "address"},
                    {"name": "_value", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "type": "function"
            }
        ];
        
        this.gameCost = 100;
        
        // Add reward contract integration
        this.REWARD_CONTRACT_ADDRESS = '0x...'; // Replace with deployed contract address
        this.REWARD_CONTRACT_ABI = [
            {
                "inputs": [{"name": "score", "type": "uint256"}],
                "name": "claimReward",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "player", "type": "address"}],
                "name": "isEligibleForReward",
                "outputs": [{"name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        
        this.rewardContract = null;
        
        // Wait for ethers.js to be available before initializing token integration
        this.waitForEthers().then(() => {
            // Initialize token integration
            this.initializeTokenIntegration();
        }).catch(error => {
            console.error('Failed to initialize token integration:', error);
            this.tokenState.error = error.message;
        });
        
        // Start game loop
        console.log('Starting game loop');
        this.animate();
        
        console.log('Game initialization complete');
    }

    async waitForEthers() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds total
            
            const checkEthers = setInterval(() => {
                attempts++;
                if (typeof ethers !== 'undefined') {
                    clearInterval(checkEthers);
                    console.log('ethers.js loaded successfully');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkEthers);
                    reject(new Error('ethers.js failed to load after 5 seconds'));
                }
            }, 100);
        });
    }

    async initializeTokenIntegration() {
        try {
            console.log('Starting token integration...');
            
            // Verify ethers.js is available
            if (typeof ethers === 'undefined') {
                console.error('ethers.js not loaded');
                throw new Error('ethers.js not loaded');
            }

            // Check if MetaMask is installed
            if (!window.ethereum) {
                throw new Error('MetaMask not installed');
            }

            // Request account access
            console.log('Requesting account access...');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }
            console.log('Account access granted:', accounts);

            // Set up provider and signer
            console.log('Setting up provider and signer...');
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            this.walletAddress = await signer.getAddress();
            console.log('Wallet address:', this.walletAddress);

            // Initialize token contract
            console.log('Initializing token contract...');
            const tokenContract = new ethers.Contract(
                this.GRIND_TOKEN_ADDRESS,
                this.GRIND_TOKEN_ABI,
                signer
            );

            // Get token decimals
            let decimals = 18;
            try {
                decimals = await tokenContract.decimals();
                console.log('Token decimals:', decimals);
            } catch (error) {
                console.warn('Could not fetch token decimals, using default 18');
            }

            // Check balance
            console.log('Checking token balance...');
            const balance = await tokenContract.balanceOf(this.walletAddress);
            const formattedBalance = ethers.utils.formatUnits(balance, decimals);
            console.log('Token balance:', formattedBalance);

            // Update token state
            this.tokenState = {
                contract: tokenContract,
                provider: provider,
                signer: signer,
                decimals: decimals,
                balance: formattedBalance,
                isInitialized: true,
                error: null
            };

            // Set wallet as connected and show start button
            this.walletConnected = true;
            if (this.startButton) {
                this.startButton.style.display = 'block';
            }

            // Update the start menu wallet info
            this.updateStartMenuWalletInfo();

            // Set up event listeners
            window.ethereum.on('accountsChanged', async (accounts) => {
                console.log('Accounts changed:', accounts);
                if (accounts.length === 0) {
                    this.walletConnected = false;
                    this.walletAddress = null;
                    this.tokenState.balance = '0';
                    if (this.startButton) {
                        this.startButton.style.display = 'none';
                    }
                } else {
                    this.walletAddress = accounts[0];
                    await this.updateTokenBalance();
                    if (this.startButton) {
                        this.startButton.style.display = 'block';
                    }
                }
                this.updateStartMenuWalletInfo();
                this.updateHUD();
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            console.log('Token integration initialized successfully');

            // Initialize reward contract
            this.rewardContract = new ethers.Contract(
                this.REWARD_CONTRACT_ADDRESS,
                this.REWARD_CONTRACT_ABI,
                this.tokenState.signer
            );
        } catch (error) {
            console.error('Failed to initialize token integration:', error);
            this.walletConnected = false;
            if (this.startButton) {
                this.startButton.style.display = 'none';
            }
            this.tokenState = {
                contract: null,
                provider: null,
                signer: null,
                decimals: 18,
                balance: '0',
                isInitialized: false,
                error: error.message
            };
            this.updateStartMenuWalletInfo();
            this.updateHUD();
        }
    }

    async updateTokenBalance() {
        try {
            if (!this.tokenState.contract || !this.walletAddress) {
                throw new Error('Contract or wallet not initialized');
            }

            const balance = await this.tokenState.contract.balanceOf(this.walletAddress);
            this.tokenState.balance = ethers.utils.formatUnits(balance, this.tokenState.decimals);
            console.log('Updated token balance:', this.tokenState.balance);
            this.updateStartMenuWalletInfo();
            this.updateHUD();
        } catch (error) {
            console.error('Error updating token balance:', error);
            this.tokenState.error = error.message;
            this.updateStartMenuWalletInfo();
            this.updateHUD();
        }
    }

    // Helper function to abbreviate wallet address
    abbreviateAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 3)}...${address.slice(-4)}`;
    }

    updateStartMenuWalletInfo() {
        // Clear existing content
        this.startMenuWalletInfo.innerHTML = '';

        // Update wallet connect button visibility
        if (this.walletConnectButton) {
            this.walletConnectButton.style.display = this.walletConnected ? 'none' : 'block';
        }

        // Update start button visibility
        if (this.startButton) {
            this.startButton.style.display = this.walletConnected ? 'block' : 'none';
        }

        // Create wallet status display
        const walletStatus = document.createElement('div');
        walletStatus.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        walletStatus.style.padding = '10px 20px';
        walletStatus.style.borderRadius = '10px';
        walletStatus.style.textAlign = 'right';
        walletStatus.style.color = '#fff';
        walletStatus.style.fontSize = '16px';
        walletStatus.style.fontFamily = 'Arial, sans-serif';
        walletStatus.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';

        if (this.walletConnected && this.walletAddress) {
            walletStatus.innerHTML = `
                <div style="color: #4CAF50;">Wallet Connected</div>
                <div style="font-size: 14px; color: #90CAF9; margin-top: 4px;">${this.abbreviateAddress(this.walletAddress)}</div>
            `;
            
            // Also hide the wallet address display in the center
            if (this.walletAddressDisplay) {
                this.walletAddressDisplay.style.display = 'none';
            }
        } else {
            walletStatus.innerHTML = `
                <div style="color: #FF5252;">Wallet Not Connected</div>
            `;
            
            // Show the wallet connect button and address display
            if (this.walletAddressDisplay) {
                this.walletAddressDisplay.style.display = 'block';
            }
        }

        // Create balance display
        const balanceDisplay = document.createElement('div');
        balanceDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        balanceDisplay.style.padding = '10px 20px';
        balanceDisplay.style.borderRadius = '10px';
        balanceDisplay.style.textAlign = 'right';
        balanceDisplay.style.color = '#fff';
        balanceDisplay.style.fontSize = '18px';
        balanceDisplay.style.fontFamily = 'Arial, sans-serif';
        balanceDisplay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        
        const formattedBalance = this.tokenState.balance ? parseFloat(this.tokenState.balance).toFixed(2) : '0.00';
        balanceDisplay.textContent = `$GRIND Balance: ${formattedBalance}`;

        // Add elements to container
        this.startMenuWalletInfo.appendChild(walletStatus);
        this.startMenuWalletInfo.appendChild(balanceDisplay);
    }

    async startGame() {
        let loadingMessage = null;
        try {
            // Check if token integration is initialized
            if (!this.tokenState.isInitialized) {
                console.log('Token integration not initialized, attempting to initialize...');
                await this.initializeTokenIntegration();
                
                // Check if initialization was successful
                if (!this.tokenState.isInitialized) {
                    alert('Failed to initialize token integration. Please try again.');
                    return;
                }
            }

            // Check if wallet is connected
            if (!this.walletConnected) {
                alert('Please connect your wallet first!');
                return;
            }

            // Check token balance
            const balance = await this.tokenState.contract.balanceOf(this.walletAddress);
            const formattedBalance = ethers.utils.formatUnits(balance, this.tokenState.decimals);
            
            if (parseFloat(formattedBalance) < this.gameCost) {
                alert(`You need at least ${this.gameCost} $GRIND tokens to play!`);
                return;
            }

            // Show loading message
            loadingMessage = document.createElement('div');
            loadingMessage.id = 'loading-message';
            loadingMessage.style.position = 'fixed';
            loadingMessage.style.top = '50%';
            loadingMessage.style.left = '50%';
            loadingMessage.style.transform = 'translate(-50%, -50%)';
            loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            loadingMessage.style.color = 'white';
            loadingMessage.style.padding = '20px';
            loadingMessage.style.borderRadius = '10px';
            loadingMessage.style.zIndex = '1000';
            loadingMessage.textContent = 'Burning tokens... Please wait for transaction confirmation.';
            document.body.appendChild(loadingMessage);
            
            // Transfer tokens to burn address
            const tx = await this.tokenState.contract.transfer(
                this.BURN_ADDRESS,
                ethers.utils.parseUnits(this.gameCost.toString(), this.tokenState.decimals)
            );
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            
            // Update balance after burn
            await this.updateTokenBalance();
            
            // Show success message with transaction hash
            this.showContractPopup(
                'Tokens Burned',
                `${this.gameCost} $GRIND tokens burned successfully!\nTransaction: ${receipt.transactionHash.slice(0, 6)}...${receipt.transactionHash.slice(-4)}`
            );
            
            // Hide start menu
            this.startMenu.style.display = 'none';
            
            // Reset game state
            this.gameState = 'starting';
            this.score = 0;
            this.coffeeLevel = 100;
            this.coffeeBeans = [];
            this.obstacles = [];
            this.powerUpActive = false;
            this.magnetActive = false;
            this.caffeineRushTimer.style.display = 'none';
            this.magnetTimer.style.display = 'none';
            this.gameStartTime = Date.now();
            
            // Reset ball position and velocity
            this.ball.x = this.canvas.width / 2;
            this.ball.y = this.canvas.height / 2;
            this.ball.vx = 0;
            this.ball.vy = 0;
            this.currentRadius = this.originalRadius;
            
            // Reset spawn timing variables
            this.lastBeanSpawn = Date.now();
            this.lastObstacleSpawn = Date.now();
            this.lastCoffeePowerUpSpawn = Date.now();
            this.lastMagnetPowerUpSpawn = Date.now();
            
            // Reset oil spills
            this.oilSpills = [];
            this.lastOilSpawn = 0;
            
            // Update HUD
            this.updateHUD();
            
            // Start game loop
            this.lastTime = Date.now();
            this.animate();
            
        } catch (error) {
            console.error('Error starting game:', error);
            alert(`Failed to start game: ${error.message}`);
        } finally {
            // Always remove loading message
            if (loadingMessage && document.body.contains(loadingMessage)) {
                document.body.removeChild(loadingMessage);
            }
        }
    }

    async restartGame() {
        console.log('Restarting game');
        
        try {
            // Check if token integration is initialized
            if (!this.tokenState.isInitialized) {
                console.log('Token integration not initialized, attempting to initialize...');
                await this.initializeTokenIntegration();
                
                // Check if initialization was successful
                if (!this.tokenState.isInitialized) {
                    alert('Failed to initialize token integration. Please try again.');
                    return;
                }
            }

            // Check if wallet is connected
            if (!this.walletConnected) {
                alert('Please connect your wallet first!');
                return;
            }

            // Check token balance
            const balance = await this.tokenState.contract.balanceOf(this.walletAddress);
            const formattedBalance = ethers.utils.formatUnits(balance, this.tokenState.decimals);
            
            if (parseFloat(formattedBalance) < this.gameCost) {
                alert(`You need at least ${this.gameCost} $GRIND tokens to play!`);
                return;
            }

            // Show loading message
            const loadingMessage = document.createElement('div');
            loadingMessage.id = 'loading-message';
            loadingMessage.style.position = 'fixed';
            loadingMessage.style.top = '50%';
            loadingMessage.style.left = '50%';
            loadingMessage.style.transform = 'translate(-50%, -50%)';
            loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            loadingMessage.style.color = 'white';
            loadingMessage.style.padding = '20px';
            loadingMessage.style.borderRadius = '10px';
            loadingMessage.style.zIndex = '1000';
            loadingMessage.textContent = 'Burning tokens... Please wait for transaction confirmation.';
            document.body.appendChild(loadingMessage);
            
            // Transfer tokens to burn address
            const tx = await this.tokenState.contract.transfer(
                this.BURN_ADDRESS,
                ethers.utils.parseUnits(this.gameCost.toString(), this.tokenState.decimals)
            );
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            
            // Update balance after burn
            await this.updateTokenBalance();
            
            // Show success message with transaction hash
            this.showContractPopup(
                'Tokens Burned',
                `${this.gameCost} $GRIND tokens burned successfully!\nTransaction: ${receipt.transactionHash.slice(0, 6)}...${receipt.transactionHash.slice(-4)}`
            );
            
            // Remove loading message
            if (document.body.contains(loadingMessage)) {
                document.body.removeChild(loadingMessage);
            }
            
            // Hide game over screen
            this.gameOverScreen.style.display = 'none';
            
            // Reset game state
            this.gameState = 'starting';
            this.score = 0;
            this.coffeeLevel = 100;
            this.coffeeBeans = [];
            this.obstacles = [];
            this.powerUpActive = false;
            this.magnetActive = false;
            this.caffeineRushTimer.style.display = 'none';
            this.magnetTimer.style.display = 'none';
            this.gameStartTime = Date.now();
            
            // Reset ball position and velocity
            this.ball.x = this.canvas.width / 2;
            this.ball.y = this.canvas.height / 2;
            this.ball.vx = 0;
            this.ball.vy = 0;
            this.currentRadius = this.originalRadius;
            
            // Reset spawn timing variables
            this.lastBeanSpawn = Date.now();
            this.lastObstacleSpawn = Date.now();
            this.lastCoffeePowerUpSpawn = Date.now();
            this.lastMagnetPowerUpSpawn = Date.now();
            
            // Reset laser beams and pattern state
            this.laserBeams = [];
            this.lastLaserSpawn = Date.now();
            this.laserPatternActive = false;
            this.laserPatternStartTime = 0;
            
            // Reset oil spills
            this.oilSpills = [];
            this.lastOilSpawn = Date.now();
            
            // Update HUD
            this.updateHUD();
            
            // Start game loop if not already running
            if (!this.animationFrameId) {
                this.lastTime = Date.now();
                this.animate();
            }
            
            console.log('Game restarted successfully');
            
        } catch (error) {
            console.error('Error restarting game:', error);
            alert(`Failed to restart game: ${error.message}`);
            
            // Remove loading message in case of error
            const loadingMessage = document.getElementById('loading-message');
            if (loadingMessage && document.body.contains(loadingMessage)) {
                document.body.removeChild(loadingMessage);
            }
        }
    }

    resizeCanvas() {
        // Set canvas size to window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Calculate base size for scaling
        const baseSize = Math.min(600, this.canvas.width);
        
        // Update ball properties with proper scaling
        this.ball.groundY = this.canvas.height - 50;
        this.ball.maxX = this.canvas.width;
        
        // Set ball radius proportional to screen size (50% larger)
        this.originalRadius = Math.min(45, Math.max(30, baseSize * 0.045)); // Increased by 50%
        this.currentRadius = this.originalRadius;
        this.ball.radius = this.currentRadius;
        
        // Set magnet radius proportional to screen size (scaled with player size)
        this.magnetRadius = Math.min(225, Math.max(150, baseSize * 0.3)); // Increased by 50%
        
        // Center ball
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        
        console.log('Canvas resized:', this.canvas.width, this.canvas.height);
    }

    setupInput() {
        // Keyboard state tracking
        const keys = {
            w: false, a: false, s: false, d: false,
            ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
        };

        // Key down event
        window.addEventListener('keydown', (e) => {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = true;
            }
        });

        // Key up event
        window.addEventListener('keyup', (e) => {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = false;
            }
        });

        // Add keyboard input handling to the update loop
        const originalUpdate = this.update.bind(this);
        this.update = (deltaTime) => {
            if (this.gameState !== 'playing' && this.gameState !== 'starting') return;

            // Handle keyboard input
            const forceX = (keys.d || keys.ArrowRight ? 1 : 0) - (keys.a || keys.ArrowLeft ? 1 : 0);
            const forceY = (keys.s || keys.ArrowDown ? 1 : 0) - (keys.w || keys.ArrowUp ? 1 : 0);

            // Apply force with a constant multiplier
            this.physics.applyForce(this.ball, forceX * 2, forceY * 2);

            // Call the original update method
            originalUpdate(deltaTime);
        };
    }

    showGameOver() {
        this.gameOver = true;
        this.gameOverScreen.style.display = 'block';
        
        // Update game over text and score
        const gameOverContent = this.gameOverScreen.querySelector('.menu-content');
        if (gameOverContent) {
            gameOverContent.style.color = 'white'; // Set default text color to white
            gameOverContent.innerHTML = `
                <h1 style="font-size: 48px; margin-bottom: 20px; color: #3498db;">Game Over</h1>
                <p style="font-size: 32px; margin-bottom: 20px; color: white;">Your Score: ${this.score}</p>
                <p style="font-size: 24px; margin-bottom: 20px; color: white;">Final Score: <span id="finalScore" style="color: white; font-weight: bold;">${this.score}</span></p>
                ${this.score >= 1500 ? `
                    <div style="background-color: rgba(52, 73, 94, 0.95); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #3498db;">
                        <h2 style="color: #3498db; margin-bottom: 10px;">Congratulations!</h2>
                        <p style="font-size: 20px; color: white;">You've earned a reward!</p>
                        ${this.score >= 5000 ? `
                            <p style="font-size: 24px; color: #3498db;">Tier 4: 1,000 $GRIND</p>
                        ` : this.score >= 3500 ? `
                            <p style="font-size: 24px; color: #3498db;">Tier 3: 500 $GRIND</p>
                        ` : this.score >= 2500 ? `
                            <p style="font-size: 24px; color: #3498db;">Tier 2: 200 $GRIND</p>
                        ` : `
                            <p style="font-size: 24px; color: #3498db;">Tier 1: 100 $GRIND</p>
                        `}
                    </div>
                ` : ''}
                <div style="margin-top: 20px;">
                    <button id="playAgainBtn" style="
                        background-color: #3498db;
                        border: none;
                        color: white;
                        padding: 15px 32px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;
                        border-radius: 5px;
                        transition: background-color 0.3s;
                    ">Play Again</button>
                </div>
                <div id="gameOverLeaderboard" style="
                    background-color: rgba(52, 73, 94, 0.95);
                    padding: 20px;
                    border-radius: 10px;
                    margin-top: 20px;
                    border: 2px solid #3498db;
                    max-height: 300px;
                    overflow-y: auto;
                    width: 100%;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                ">
                    <h2 style="color: #3498db; margin-bottom: 15px; text-align: center;">High Scores</h2>
                    ${this.createLeaderboardHTML()}
                </div>
            `;
        }

        // Add event listener for play again button
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.gameOverScreen.style.display = 'none';
            this.showStartMenu();
        });

        // Update the leaderboard
        this.updateLeaderboards();
    }

    updateHUD() {
        // Update score display
        this.scoreElement.textContent = `Score: ${this.score}`;
        
        // Update coffee meter
        const meterFill = document.querySelector('.meter-fill');
        meterFill.style.width = `${this.coffeeLevel}%`;
        
        // Update token display
        this.updateStartMenuWalletInfo();
    }

    update(deltaTime) {
        if (this.gameState !== 'playing' && this.gameState !== 'starting') return;

        // Update tail wagging animation when moving
        if (Math.abs(this.ball.vx) > 0.1 || Math.abs(this.ball.vy) > 0.1) {
            this.tailAngle = Math.sin(Date.now() * this.tailWagSpeed) * this.tailWagAmplitude;
        } else {
            this.tailAngle = 0;
        }

        // Generate game objects
        this.generateCoffeeBeans();
        this.generateObstacles();
        this.generatePowerUps();
        this.generateLaserBeams();
        this.generateOilSpills();

        // Update physics
        this.physics.updateBall(this.ball);

        // Handle starting state
        if (this.gameState === 'starting') {
            const timeElapsed = Date.now() - this.gameStartTime;
            if (timeElapsed >= 3000) { // 3 second grace period
                this.gameState = 'playing';
            }
        }

        // Only deplete health after grace period
        if (this.gameState === 'playing') {
            // Update coffee level with power-up effect
            const depletionRate = this.powerUpActive ? 0.22 : 0.225; // Normal state decreased by 10%, power-up increased by 10%
            this.coffeeLevel = Math.max(0, this.coffeeLevel - depletionRate);
        }
        
        this.updateHUD();

        // Check power-up status
        if (this.powerUpActive && Date.now() > this.powerUpEndTime) {
            this.deactivatePowerUp();
        }
        if (this.magnetActive && Date.now() > this.magnetEndTime) {
            this.deactivateMagnet();
        }

        // Update oil spills position and check collisions
        let inOil = false;
        for (let i = this.oilSpills.length - 1; i >= 0; i--) {
            const oil = this.oilSpills[i];
            oil.y += oil.speed;
            
            // Check collision with ball using point-in-polygon algorithm
            const dx = this.ball.x - oil.x;
            const dy = this.ball.y - oil.y;
            
            // First quick check using bounding circle
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < oil.radius + this.currentRadius) {
                // More precise check using point-in-polygon
                let inside = false;
                for (let j = 0, k = oil.points.length - 1; j < oil.points.length; k = j++) {
                    const xi = oil.points[j].x + oil.x;
                    const yi = oil.points[j].y + oil.y;
                    const xj = oil.points[k].x + oil.x;
                    const yj = oil.points[k].y + oil.y;
                    
                    const intersect = ((yi > this.ball.y) !== (yj > this.ball.y)) &&
                        (this.ball.x < (xj - xi) * (this.ball.y - yi) / (yj - yi) + xi);
                    
                    if (intersect) inside = !inside;
                }
                
                if (inside) {
                    inOil = true;
                }
            }
            
            // Remove if off screen
            if (oil.y - oil.radius > this.canvas.height) {
                this.oilSpills.splice(i, 1);
            }
        }
        
        // Apply slowdown if in oil
        if (inOil) {
            this.physics.maxSpeed = this.originalMaxSpeed * 0.5; // 50% slower
        } else if (!this.powerUpActive) { // Only reset speed if not in power-up mode
            this.physics.maxSpeed = this.originalMaxSpeed;
        }

        // Update coffee beans and check collisions
        for (let i = this.coffeeBeans.length - 1; i >= 0; i--) {
            const bean = this.coffeeBeans[i];
            
            // Apply magnet effect if active
            if (this.magnetActive && !bean.isPowerUp) {
                const dx = this.ball.x - bean.x;
                const dy = this.ball.y - bean.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.magnetRadius) {
                    const speed = 4;
                    bean.x += (dx / distance) * speed;
                    bean.y += (dy / distance) * speed * 0.5 + 1;
                } else {
                    bean.y += bean.speed;
                }
            } else {
                bean.y += bean.speed;
            }

            // Check collision with ball
            const dx = bean.x - this.ball.x;
            const dy = bean.y - this.ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < bean.radius + this.currentRadius) {
                if (bean.isPowerUp) {
                    if (bean.type === 'coffee') {
                        // Coffee bean power-up
                        this.coffeeLevel = 100;
                        this.score += 20;
                        this.activatePowerUp();
                    } else if (bean.type === 'magnet') {
                        // Magnet power-up
                        this.score += 20;
                        this.activateMagnet();
                    }
                } else {
                    // Regular coffee bean
                    this.coffeeLevel = Math.min(100, this.coffeeLevel + 10);
                    this.score += 10;
                }
                this.coffeeBeans.splice(i, 1);
                this.updateHUD();
            }

            if (bean.y > this.canvas.height) {
                this.coffeeBeans.splice(i, 1);
            }
        }

        // Check game over condition
        if (this.coffeeLevel <= 0) {
            this.handleGameOver();
        }

        // Generate and update laser beams
        this.generateLaserBeams();
        
        // Check laser beam collisions
        for (const laser of this.laserBeams) {
            if (!laser.active) continue;
            
            // Calculate distance from ball to laser
            const dx = this.ball.x - laser.currentX;
            const dy = this.ball.y - laser.currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If ball is within laser width + ball radius, take damage
            if (distance < this.currentRadius + laser.width) {
                this.coffeeLevel = Math.max(0, this.coffeeLevel - 30); // Remove 30% health
                laser.active = false; // Deactivate laser after hitting
                this.updateHUD();
            }
        }
    }

    activatePowerUp() {
        this.powerUpActive = true;
        this.powerUpEndTime = Date.now() + 7000; // 7 seconds
        this.physics.maxSpeed = this.originalMaxSpeed * 1.25; // 25% faster
        this.currentRadius = this.originalRadius * 1.25; // 25% larger
        this.ball.radius = this.currentRadius;
        this.ball.vx *= 1.25; // Give an immediate boost
        this.ball.vy *= 1.25;
    }

    deactivatePowerUp() {
        this.powerUpActive = false;
        this.physics.maxSpeed = this.originalMaxSpeed;
        this.currentRadius = this.originalRadius;
        this.ball.radius = this.currentRadius;
    }

    activateMagnet() {
        this.magnetActive = true;
        this.magnetEndTime = Date.now() + 10000; // 10 seconds
        this.magnetTimer.style.display = 'block';
    }

    deactivateMagnet() {
        this.magnetActive = false;
        this.magnetTimer.style.display = 'none';
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing' || this.gameState === 'starting') {
            // Draw background
            this.ctx.fillStyle = '#34495e';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw ground
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.fillRect(0, this.ball.groundY, this.canvas.width, this.canvas.height - this.ball.groundY);

            // Draw oil spills first (behind hamster)
            for (const oil of this.oilSpills) {
                this.drawOilSpill(oil);
            }

            // Draw hamster ball
            this.drawHamsterBall();

            // Draw magnet effect radius when active
            if (this.magnetActive) {
                this.ctx.beginPath();
                this.ctx.arc(this.ball.x, this.ball.y, this.magnetRadius, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }

            // Draw coffee beans and power-ups
            this.coffeeBeans.forEach(bean => {
                if (bean.isMagnet) {
                    this.drawMagnetPowerUp(bean);
                } else {
                    this.drawCoffeeBean(bean);
                }
            });

            // Show countdown during starting state
            if (this.gameState === 'starting') {
                const timeLeft = Math.ceil((3000 - (Date.now() - this.gameStartTime)) / 1000);
                this.ctx.fillStyle = 'white';
                this.ctx.font = '48px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`Starting in ${timeLeft}...`, this.canvas.width / 2, this.canvas.height / 2);
            }

            // Update power-up timer displays
            if (this.powerUpActive) {
                const timeLeft = Math.ceil((this.powerUpEndTime - Date.now()) / 1000);
                this.caffeineRushTimer.textContent = `Caffeine Rush: ${timeLeft}s`;
                this.caffeineRushTimer.style.display = 'block';
            } else {
                this.caffeineRushTimer.style.display = 'none';
            }

            if (this.magnetActive) {
                const timeLeft = Math.ceil((this.magnetEndTime - Date.now()) / 1000);
                this.magnetTimer.textContent = `Magnet: ${timeLeft}s`;
                this.magnetTimer.style.display = 'block';
            } else {
                this.magnetTimer.style.display = 'none';
            }

            // Draw laser beams
            for (const laser of this.laserBeams) {
                if (!laser.active) continue;
                
                // Draw laser trail
                if (laser.trail.length > 1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(laser.trail[0].x, laser.trail[0].y);
                    for (let i = 1; i < laser.trail.length; i++) {
                        this.ctx.lineTo(laser.trail[i].x, laser.trail[i].y);
                    }
                    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                    this.ctx.lineWidth = laser.width * 2;
                    this.ctx.stroke();
                }
                
                // Draw main laser beam
                this.ctx.beginPath();
                this.ctx.moveTo(laser.currentX - laser.dx, laser.currentY - laser.dy);
                this.ctx.lineTo(laser.currentX, laser.currentY);
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)';
                this.ctx.lineWidth = laser.width;
                this.ctx.stroke();
                
                // Draw laser head
                this.ctx.beginPath();
                this.ctx.arc(laser.currentX, laser.currentY, laser.width * 1.5, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
                this.ctx.fill();
                
                // Draw laser glow
                this.ctx.beginPath();
                this.ctx.arc(laser.currentX, laser.currentY, laser.width * 3, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                this.ctx.fill();
            }
        }
    }

    drawHamsterBall() {
        const { x, y } = this.ball;
        const radius = this.currentRadius;
        
        // Draw mouse body (more oval shape)
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, radius * 0.8, radius * 1.2, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffa500'; // Orange color
        this.ctx.fill();
        
        // Draw mouse outline
        this.ctx.strokeStyle = '#cc8400'; // Darker orange outline
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw mouse ears
        this.ctx.fillStyle = '#ffa500';
        // Left ear
        this.ctx.beginPath();
        this.ctx.ellipse(x - radius * 0.4, y - radius * 0.6, radius * 0.25, radius * 0.3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // Right ear
        this.ctx.beginPath();
        this.ctx.ellipse(x + radius * 0.4, y - radius * 0.6, radius * 0.25, radius * 0.3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw inner ears
        this.ctx.fillStyle = '#ffd700';
        // Left inner ear
        this.ctx.beginPath();
        this.ctx.ellipse(x - radius * 0.4, y - radius * 0.6, radius * 0.15, radius * 0.2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // Right inner ear
        this.ctx.beginPath();
        this.ctx.ellipse(x + radius * 0.4, y - radius * 0.6, radius * 0.15, radius * 0.2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw mouse face (top view)
        this.ctx.fillStyle = '#8b4513';
        // Eyes
        this.ctx.beginPath();
        this.ctx.ellipse(x - radius * 0.2, y - radius * 0.3, radius * 0.08, radius * 0.1, 0, 0, Math.PI * 2);
        this.ctx.ellipse(x + radius * 0.2, y - radius * 0.3, radius * 0.08, radius * 0.1, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Nose
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - radius * 0.2, radius * 0.12, radius * 0.08, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Whiskers (top view)
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 1;
        // Left whiskers
        this.ctx.beginPath();
        this.ctx.moveTo(x - radius * 0.2, y - radius * 0.4);
        this.ctx.lineTo(x - radius * 0.8, y - radius * 0.5);
        this.ctx.moveTo(x - radius * 0.2, y - radius * 0.4);
        this.ctx.lineTo(x - radius * 0.8, y - radius * 0.4);
        this.ctx.moveTo(x - radius * 0.2, y - radius * 0.4);
        this.ctx.lineTo(x - radius * 0.8, y - radius * 0.3);
        this.ctx.stroke();
        // Right whiskers
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius * 0.2, y - radius * 0.4);
        this.ctx.lineTo(x + radius * 0.8, y - radius * 0.5);
        this.ctx.moveTo(x + radius * 0.2, y - radius * 0.4);
        this.ctx.lineTo(x + radius * 0.8, y - radius * 0.4);
        this.ctx.moveTo(x + radius * 0.2, y - radius * 0.4);
        this.ctx.lineTo(x + radius * 0.8, y - radius * 0.3);
        this.ctx.stroke();
        
        // Draw tail with wagging animation
        this.ctx.save();
        this.ctx.translate(x, y + radius * 1.1);
        this.ctx.rotate(this.tailAngle); // Apply wagging angle
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(
            radius * 0.5, radius * 0.2,
            radius * 0.3, radius * 0.4
        );
        this.ctx.strokeStyle = '#ffa500';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawCoffeeBean(bean) {
        const { x, y, radius, isPowerUp } = bean;
        
        // Save context state
        this.ctx.save();
        
        // Translate to bean position
        this.ctx.translate(x, y);
        
        if (isPowerUp) {
            // Draw coffee bean shape
            this.ctx.rotate(Math.PI / 4);
            
            // Main bean shape
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, radius, radius * 0.6, 0, 0, Math.PI * 2);
            this.ctx.fillStyle = '#8B4513'; // Changed to brown
            this.ctx.fill();
            
            // Bean crease
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, radius * 0.8, radius * 0.4, 0, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#654321'; // Darker brown for crease
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Bean highlight
            this.ctx.beginPath();
            this.ctx.ellipse(-radius * 0.3, -radius * 0.2, radius * 0.2, radius * 0.1, 0, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fill();
        } else {
            // Draw $GRIND token (doubled size)
            this.ctx.rotate(Math.PI / 4);
            
            // Token base
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2); // Doubled from 0.4 to 0.8
            this.ctx.fillStyle = '#8e44ad';
            this.ctx.fill();
            
            // Token border
            this.ctx.strokeStyle = '#6c3483';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Token symbol ($)
            this.ctx.fillStyle = 'white';
            this.ctx.font = `${radius * 0.96}px Arial`; // Doubled from 0.48 to 0.96
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('$', 0, 0);
            
            // Token shine effect
            this.ctx.beginPath();
            this.ctx.arc(-radius * 0.24, -radius * 0.24, radius * 0.16, 0, Math.PI * 2); // Doubled from 0.12/0.08 to 0.24/0.16
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fill();
        }
        
        // Restore context state
        this.ctx.restore();
    }

    drawMagnetPowerUp(bean) {
        const { x, y, radius } = bean;
        
        // Save context state
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Draw horseshoe magnet base
        this.ctx.beginPath();
        
        // Draw the main horseshoe shape using ellipses
        // Left pole (vertical ellipse)
        this.ctx.ellipse(-radius * 0.3, 0, radius * 0.15, radius * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fill();
        
        // Right pole (vertical ellipse)
        this.ctx.beginPath();
        this.ctx.ellipse(radius * 0.3, 0, radius * 0.15, radius * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bottom curve (horizontal ellipse)
        this.ctx.beginPath();
        this.ctx.ellipse(0, radius * 0.4, radius * 0.3, radius * 0.15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Top curve (horizontal ellipse)
        this.ctx.beginPath();
        this.ctx.ellipse(0, -radius * 0.4, radius * 0.3, radius * 0.15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw magnet poles (white tips)
        this.ctx.fillStyle = 'white';
        // Left pole tip
        this.ctx.beginPath();
        this.ctx.ellipse(-radius * 0.3, -radius * 0.4, radius * 0.1, radius * 0.1, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // Right pole tip
        this.ctx.beginPath();
        this.ctx.ellipse(radius * 0.3, -radius * 0.4, radius * 0.1, radius * 0.1, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw magnetic field lines
        this.ctx.strokeStyle = '#c0392b';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, radius * 0.4, radius * 0.2, 0, i * Math.PI/3, (i + 0.5) * Math.PI/3);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    drawOilSpill(oil) {
        const { x, y, radius, points } = oil;
        
        // Save context state
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Draw main oil spill with random shape
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fill();
        
        // Draw oil shine effect
        this.ctx.beginPath();
        this.ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fill();
        
        // Draw oil rainbow effect
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(points[0].x * (0.8 - i * 0.1), points[0].y * (0.8 - i * 0.1));
            for (let j = 1; j < points.length; j++) {
                this.ctx.lineTo(points[j].x * (0.8 - i * 0.1), points[j].y * (0.8 - i * 0.1));
            }
            this.ctx.closePath();
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - i * 0.03})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    animate() {
        const deltaTime = Date.now() - this.lastTime;
        this.lastTime = Date.now();

        this.update(deltaTime);
        this.draw();

        // Continue animation if game is in playing or starting state
        if (this.gameState === 'playing' || this.gameState === 'starting') {
            this.animationFrameId = requestAnimationFrame(() => this.animate());
        } else {
            this.animationFrameId = null;
        }
    }

    handleGameOver() {
        console.log('Game over');
        this.gameState = 'gameOver';
        this.saveHighScore(this.score);
        this.gameOverScreen.style.display = 'flex';
        this.finalScore.textContent = this.score;
        
        // Stop animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Check for reward eligibility
        this.checkAndClaimReward();
    }

    saveHighScore(score) {
        console.log('Saving high score:', score);
        const newScore = {
            score: score,
            date: new Date().toISOString(),
            player: this.playerName
        };

        // Load existing scores
        let highScores = this.loadHighScores();
        
        // Add new score
        highScores.push(newScore);
        
        // Sort by score in descending order
        highScores.sort((a, b) => b.score - a.score);
        
        // Save all scores to localStorage
        localStorage.setItem('coffeeRushHighScores', JSON.stringify(highScores));
        
        // Update leaderboards
        this.updateLeaderboards();
    }

    loadHighScores() {
        const savedScores = localStorage.getItem('coffeeRushHighScores');
        return savedScores ? JSON.parse(savedScores) : [];
    }

    updateLeaderboards() {
        const highScores = this.loadHighScores();
        const createLeaderboardHTML = () => {
            return highScores.map((score, index) => `
                <div class="leaderboard-entry" style="
                    background: rgba(52, 73, 94, 0.8);
                    margin: 5px 0;
                    padding: 10px 15px;
                    border-radius: 5px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #fff;
                    font-family: Arial, sans-serif;
                    transition: background 0.3s;
                    border: 1px solid #3498db;">
                    <span>
                        <span class="rank" style="
                            color: #3498db;
                            font-weight: bold;
                            margin-right: 10px;
                            font-size: 18px;">
                            #${index + 1}
                        </span>
                        <span style="color: #ecf0f1;">${score.player}</span>
                        <span style="color: #bdc3c7; margin-left: 10px; font-size: 0.9em;">
                            ${new Date(score.date).toLocaleDateString()}
                        </span>
                    </span>
                    <span class="score" style="
                        color: #3498db;
                        font-weight: bold;
                        font-size: 20px;">
                        ${score.score}
                    </span>
                </div>
            `).join('');
        };

        // Style and update the leaderboard containers
        const styleLeaderboard = (leaderboardElement) => {
            if (leaderboardElement) {
                leaderboardElement.style.backgroundColor = 'rgba(52, 73, 94, 0.95)';
                leaderboardElement.style.padding = '20px';
                leaderboardElement.style.borderRadius = '10px';
                leaderboardElement.style.maxHeight = '300px';
                leaderboardElement.style.overflowY = 'auto';
                leaderboardElement.style.width = '100%';
                leaderboardElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                leaderboardElement.style.border = '2px solid #3498db';
                
                // Style the scrollbar
                leaderboardElement.style.scrollbarWidth = 'thin';
                leaderboardElement.style.scrollbarColor = '#3498db #2c3e50';
                
                // Webkit scrollbar styles
                leaderboardElement.style.cssText += `
                    &::-webkit-scrollbar {
                        width: 8px;
                    }
                    &::-webkit-scrollbar-track {
                        background: #2c3e50;
                        border-radius: 4px;
                    }
                    &::-webkit-scrollbar-thumb {
                        background: #3498db;
                        border-radius: 4px;
                    }
                    &::-webkit-scrollbar-thumb:hover {
                        background: #2980b9;
                    }
                `;
            }
        };

        const leaderboardHTML = createLeaderboardHTML();
        
        // Update start menu leaderboard
        if (this.startLeaderboard) {
            this.startLeaderboard.innerHTML = leaderboardHTML;
            styleLeaderboard(this.startLeaderboard);
        }
        
        // Update game over leaderboard
        if (this.gameOverLeaderboard) {
            this.gameOverLeaderboard.innerHTML = leaderboardHTML;
            styleLeaderboard(this.gameOverLeaderboard);
        }
    }

    showNamePrompt() {
        const name = prompt('Welcome to Coffee Rush! Please enter your name for the leaderboard:');
        if (name && name.trim() !== '') {
            this.playerName = name.trim();
            localStorage.setItem('playerName', this.playerName);
        } else {
            this.playerName = 'Player';
            localStorage.setItem('playerName', this.playerName);
        }
    }

    showLeaderboard() {
        // Style the leaderboard popup
        if (this.leaderboardPopup) {
            const content = this.leaderboardPopup.querySelector('.menu-content');
            if (content) {
                content.style.backgroundColor = 'rgba(52, 73, 94, 0.95)';
                content.style.padding = '30px';
                content.style.borderRadius = '15px';
                content.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                content.style.border = '2px solid #3498db';
                
                // Style the title
                const title = content.querySelector('h2');
                if (title) {
                    title.style.color = '#ecf0f1';
                    title.style.textAlign = 'center';
                    title.style.marginBottom = '20px';
                    title.style.fontSize = '24px';
                    title.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)';
                }
                
                // Style the close button
                const closeButton = content.querySelector('#closeLeaderboardButton');
                if (closeButton) {
                    closeButton.style.backgroundColor = '#3498db';
                    closeButton.style.color = '#fff';
                    closeButton.style.border = 'none';
                    closeButton.style.padding = '10px 20px';
                    closeButton.style.borderRadius = '5px';
                    closeButton.style.marginTop = '20px';
                    closeButton.style.cursor = 'pointer';
                    closeButton.style.transition = 'background 0.3s';
                    closeButton.style.fontSize = '16px';
                    closeButton.onmouseover = () => closeButton.style.backgroundColor = '#2980b9';
                    closeButton.onmouseout = () => closeButton.style.backgroundColor = '#3498db';
                }
            }
        }
        this.leaderboardPopup.style.display = 'flex';
    }

    hideLeaderboard() {
        this.leaderboardPopup.style.display = 'none';
    }

    generateCoffeeBeans() {
        const now = Date.now();
        if (now - this.lastBeanSpawn > this.beanSpawnInterval) {
            // Use a smaller base size for larger screens
            const baseSize = Math.min(600, this.canvas.width);
            const beanSize = Math.min(70, Math.max(50, baseSize * 0.04)); // Restored to original size
            const bean = {
                x: Math.random() * (this.canvas.width - beanSize),
                y: -beanSize,
                width: beanSize,
                height: beanSize,
                speed: Math.min(4, Math.max(2, baseSize * 0.003)),
                isPowerUp: false,
                isMagnet: false,
                radius: beanSize / 2
            };
            this.coffeeBeans.push(bean);
            this.lastBeanSpawn = now;
        }
    }

    generateObstacles() {
        const now = Date.now();
        if (now - this.lastObstacleSpawn > this.obstacleSpawnInterval) {
            // Use a smaller base size for larger screens
            const baseSize = Math.min(600, this.canvas.width);
            const obstacleSize = Math.min(45, Math.max(35, baseSize * 0.03));
            const obstacle = {
                x: Math.random() * (this.canvas.width - obstacleSize),
                y: -obstacleSize,
                width: obstacleSize,
                height: obstacleSize,
                speed: Math.min(5, Math.max(3, baseSize * 0.004)),
                radius: obstacleSize / 2
            };
            this.obstacles.push(obstacle);
            this.lastObstacleSpawn = now;
        }
    }

    generatePowerUps() {
        const now = Date.now();
        
        // Generate coffee power-up independently
        if (now - this.lastCoffeePowerUpSpawn > this.powerUpSpawnInterval) {
            const baseSize = Math.min(600, this.canvas.width);
            const powerUpSize = Math.min(80, Math.max(60, baseSize * 0.05)); // Doubled from 40/30 to 80/60
            
            const coffeePowerUp = {
                x: Math.random() * (this.canvas.width - powerUpSize),
                y: -powerUpSize,
                width: powerUpSize,
                height: powerUpSize,
                speed: Math.min(3, Math.max(2, baseSize * 0.002)),
                type: 'coffee',
                radius: powerUpSize / 2,
                isPowerUp: true,
                isMagnet: false
            };
            
            this.coffeeBeans.push(coffeePowerUp);
            this.lastCoffeePowerUpSpawn = now;
        }
        
        // Generate magnet power-up independently
        if (now - this.lastMagnetPowerUpSpawn > this.powerUpSpawnInterval) {
            const baseSize = Math.min(600, this.canvas.width);
            const powerUpSize = Math.min(80, Math.max(60, baseSize * 0.05)); // Doubled from 40/30 to 80/60
            
            const magnetPowerUp = {
                x: Math.random() * (this.canvas.width - powerUpSize),
                y: -powerUpSize,
                width: powerUpSize,
                height: powerUpSize,
                speed: Math.min(3, Math.max(2, baseSize * 0.002)),
                type: 'magnet',
                radius: powerUpSize / 2,
                isPowerUp: true,
                isMagnet: true
            };
            
            this.coffeeBeans.push(magnetPowerUp);
            this.lastMagnetPowerUpSpawn = now;
        }
    }

    generateLaserBeams() {
        const now = Date.now();
        
        // Only generate lasers if score is above 500
        if (this.score < 500) return;
        
        // Check if it's time to start a new laser pattern
        if (!this.laserPatternActive && now - this.lastLaserSpawn > this.laserSpawnInterval) {
            this.laserPatternActive = true;
            this.laserPatternStartTime = now;
            this.laserBeams = [];
            
            // Calculate speed multiplier based on score
            const pointsBeyond500 = Math.max(0, this.score - 500);
            const speedMultiplier = 1 + (Math.floor(pointsBeyond500 / 250) * 0.05); // 5% increase per 250 points
            const baseLaserSpeed = 10.5; // Base speed (50% slower than original)
            const laserSpeed = baseLaserSpeed * speedMultiplier;
            
            // Calculate number of lasers with 35% increase per 500 points
            const baseNumLasers = 2;
            const pointsMultiplier = Math.floor(pointsBeyond500 / 500);
            const numLasers = Math.floor(baseNumLasers * Math.pow(1.35, pointsMultiplier));
            
            // Generate laser beams
            for (let i = 0; i < numLasers; i++) {
                // Choose a random edge (0: top, 1: right, 2: bottom, 3: left)
                const edge = Math.floor(Math.random() * 4);
                let startX, startY, endX, endY;
                
                // Calculate start position on the chosen edge
                switch (edge) {
                    case 0: // Top edge
                        startX = Math.random() * this.canvas.width;
                        startY = 0;
                        endX = startX;
                        endY = this.canvas.height;
                        break;
                    case 1: // Right edge
                        startX = this.canvas.width;
                        startY = Math.random() * this.canvas.height;
                        endX = 0;
                        endY = startY;
                        break;
                    case 2: // Bottom edge
                        startX = Math.random() * this.canvas.width;
                        startY = this.canvas.height;
                        endX = startX;
                        endY = 0;
                        break;
                    case 3: // Left edge
                        startX = 0;
                        startY = Math.random() * this.canvas.height;
                        endX = this.canvas.width;
                        endY = startY;
                        break;
                }
                
                // Calculate speed and direction
                const dx = endX - startX;
                const dy = endY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                this.laserBeams.push({
                    startX,
                    startY,
                    endX,
                    endY,
                    currentX: startX,
                    currentY: startY,
                    dx: dx / distance * laserSpeed,
                    dy: dy / distance * laserSpeed,
                    width: 8,
                    active: true,
                    trail: [],
                    speed: laserSpeed
                });
            }
        }
        
        // Update laser positions and trails
        for (const laser of this.laserBeams) {
            if (!laser.active) continue;
            
            // Add current position to trail
            laser.trail.push({ x: laser.currentX, y: laser.currentY });
            
            // Keep only last 3 trail points for shorter trails
            if (laser.trail.length > 3) {
                laser.trail.shift();
            }
            
            // Move laser
            laser.currentX += laser.dx;
            laser.currentY += laser.dy;
            
            // Check if laser has reached its end point
            const dx = laser.endX - laser.currentX;
            const dy = laser.endY - laser.currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < laser.speed) {
                laser.active = false;
            }
        }
        
        // Check if laser pattern should end
        if (this.laserPatternActive && now - this.laserPatternStartTime > this.laserPatternDuration) {
            this.laserPatternActive = false;
            this.lastLaserSpawn = now;
            this.laserBeams = [];
        }
    }

    generateOilSpills() {
        const now = Date.now();
        
        // Only generate oil spills if score is above 1000
        if (this.score < 1000) return;
        
        // Calculate number of oil spills with 35% increase per 500 points
        const pointsBeyond1000 = Math.max(0, this.score - 1000);
        const pointsMultiplier = Math.floor(pointsBeyond1000 / 500);
        const numSpills = Math.floor(1 * Math.pow(1.35, pointsMultiplier));
        
        // Generate oil spills every 8 seconds
        if (now - this.lastOilSpawn > 8000) {
            for (let i = 0; i < numSpills; i++) {
                const radius = this.ball.radius * 3; // Oil spill is 3x the size of the hamster
                
                // Create random shape points for the oil spill
                const points = [];
                const numPoints = 8;
                for (let i = 0; i < numPoints; i++) {
                    const angle = (i / numPoints) * Math.PI * 2;
                    const variation = 0.3; // 30% size variation
                    const r = radius * (1 + (Math.random() * variation * 2 - variation));
                    points.push({
                        x: Math.cos(angle) * r,
                        y: Math.sin(angle) * r
                    });
                }
                
                const oilSpill = {
                    x: Math.random() * (this.canvas.width - radius * 2) + radius,
                    y: -radius, // Start above the screen
                    radius: radius,
                    points: points,
                    speed: 2,
                    active: true
                };
                
                this.oilSpills.push(oilSpill);
            }
            this.lastOilSpawn = now;
        }
        
        // Update existing oil spills
        for (let i = this.oilSpills.length - 1; i >= 0; i--) {
            const oil = this.oilSpills[i];
            oil.y += oil.speed;
            
            // Remove oil spills that are off screen
            if (oil.y - oil.radius > this.canvas.height) {
                this.oilSpills.splice(i, 1);
            }
        }
    }

    async checkAndClaimReward() {
        try {
            if (!this.walletConnected) {
                console.log('Wallet not connected');
                return;
            }

            // Determine reward amount based on score
            let rewardAmount;
            if (this.score >= 5000) {
                rewardAmount = 1000;
            } else if (this.score >= 3500) {
                rewardAmount = 500;
            } else if (this.score >= 2500) {
                rewardAmount = 200;
            } else if (this.score >= 1500) {
                rewardAmount = 100;
            } else {
                console.log('Score too low for reward');
                return;
            }

            // Show reward popup first
            this.showContractPopup(
                'Reward Available',
                `Congratulations! You've earned ${rewardAmount} $GRIND tokens for your high score!\n\nPlease confirm the transaction in MetaMask to claim your reward.`
            );

            // Create provider with ENS disabled
            const provider = new ethers.providers.Web3Provider(window.ethereum, {
                name: CONFIG.NETWORK.name,
                chainId: CONFIG.NETWORK.chainId,
                ensAddress: null // Disable ENS
            });
            
            // Get signer
            const signer = provider.getSigner();
            
            // Create contract instance
            const rewardContract = new ethers.Contract(
                CONFIG.REWARD_CONTRACT_ADDRESS,
                [
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

            console.log('Attempting to claim reward for score:', this.score);
            const tx = await rewardContract.claimReward(this.score);
            await tx.wait();
            
            console.log('Reward claimed successfully!');
            this.showContractPopup(
                'Reward Claimed',
                `Success! ${rewardAmount} $GRIND tokens have been sent to your wallet.`
            );
        } catch (error) {
            console.error('Error claiming reward:', error);
            this.showContractPopup(
                'Claim Failed',
                'Failed to claim reward. Please try again later.'
            );
        }
    }

    showStartMenu() {
        this.startMenu.style.display = 'block';
        
        // Get the existing start button
        const startButton = document.getElementById('startButton');
        if (startButton) {
            // Update the button text to include the cost
            startButton.innerHTML = 'START<br><span style="font-size: 14px; color: #fff;">Cost: 100 $GRIND</span>';
            startButton.style.display = 'block';
            startButton.style.backgroundColor = '#3498db';
            startButton.style.color = 'white';
            startButton.style.padding = '15px 30px';
            startButton.style.border = 'none';
            startButton.style.borderRadius = '5px';
            startButton.style.fontSize = '24px';
            startButton.style.cursor = 'pointer';
            startButton.style.marginTop = '20px';
            startButton.style.transition = 'background-color 0.3s';
            startButton.onmouseover = () => startButton.style.backgroundColor = '#2980b9';
            startButton.onmouseout = () => startButton.style.backgroundColor = '#3498db';
        }
    }

    hideStartMenu() {
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.style.display = 'none';
        }
    }

    showContractPopup(title, message, type = 'info') {
        const popup = document.createElement('div');
        popup.className = 'overlay';
        popup.style.zIndex = '1002';
        popup.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        
        const content = document.createElement('div');
        content.className = 'menu-content';
        content.style.backgroundColor = 'rgba(52, 73, 94, 0.95)';
        content.style.padding = '30px';
        content.style.borderRadius = '15px';
        content.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        content.style.border = '2px solid #3498db';
        content.style.maxWidth = '500px';
        content.style.width = '90%';
        content.style.textAlign = 'center';
        
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        titleElement.style.color = '#ecf0f1';
        titleElement.style.textAlign = 'center';
        titleElement.style.marginBottom = '20px';
        titleElement.style.fontSize = '24px';
        titleElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)';
        
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.style.color = '#ecf0f1';
        messageElement.style.fontSize = '18px';
        messageElement.style.marginBottom = '30px';
        messageElement.style.lineHeight = '1.5';
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.backgroundColor = '#3498db';
        closeButton.style.color = '#fff';
        closeButton.style.border = 'none';
        closeButton.style.padding = '10px 20px';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.transition = 'background 0.3s';
        closeButton.style.fontSize = '16px';
        closeButton.onmouseover = () => closeButton.style.backgroundColor = '#2980b9';
        closeButton.onmouseout = () => closeButton.style.backgroundColor = '#3498db';
        closeButton.onclick = () => {
            document.body.removeChild(popup);
        };
        
        content.appendChild(titleElement);
        content.appendChild(messageElement);
        content.appendChild(closeButton);
        popup.appendChild(content);
        document.body.appendChild(popup);
    }
}

// Initialize game when page loads
console.log('Setting up window load event');
// Remove duplicate initialization since it's handled in init.js
// window.addEventListener('load', () => {
//     console.log('Window loaded, creating game instance');
//     const game = new Game();
// }); 