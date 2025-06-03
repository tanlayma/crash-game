document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const betAmountInput = document.getElementById('betAmount');
    const cashoutAtInput = document.getElementById('cashoutAt');
    const netGainDisplay = document.getElementById('netGainDisplay');
    const playButton = document.getElementById('playButton');
    const currentMultiplierDisplay = document.getElementById('currentMultiplierDisplay');
    const gameStatusDisplay = document.getElementById('gameStatus');
    const balanceDisplay = document.getElementById('balanceDisplay');
    const leaderboardList = document.getElementById('leaderboardList');
    const activeBetsCountDisplay = document.getElementById('activeBetsCount');
    const maxWinDisclaimer = document.getElementById('maxWinDisclaimer');
    const siteBankrollDisplay = document.getElementById('siteBankrollDisplay'); // User-facing bankroll
    const adminBankrollDisplay = document.getElementById('adminBankrollDisplay'); // Admin panel bankroll

    // Modals
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const adminModal = document.getElementById('adminModal');
    const fairnessModal = document.getElementById('fairnessModal');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    const fairnessBtn = document.getElementById('fairnessBtn');
    const closeButtons = document.querySelectorAll('.close-button');

    // Chat
    const chatMessagesContainer = document.getElementById('chatMessages');
    const chatMessageInput = document.getElementById('chatMessageInput');
    const sendChatMessageButton = document.getElementById('sendChatMessage');

    // Graph (placeholder for now)
    const graphCanvas = document.getElementById('crashGraph');
    const ctx = graphCanvas.getContext('2d');
    const graphPlaceholder = document.querySelector('.graph-placeholder');


    // --- Game State & Settings (Mock) ---
    let currentBalance = 1000.00;
    let currentMultiplier = 1.00;
    let gameRunning = false;
    let betPlaced = false;
    let playerBetAmount = 0;
    let playerCashoutAt = 0;
    let gameInterval;
    let mockServerSeedHash = "SERVER_SEED_HASH_PLACEHOLDER_" + Date.now(); // Will be updated by "backend"

    // Bankroll related (mock)
    const MOCK_SITE_BANKROLL = 1250000.00;
    const MAX_WIN_PERCENTAGE_OF_BANKROLL = 0.01; // e.g., 1% of bankroll per bet

    // --- Initialize ---
    updateBalanceDisplay();
    updateNetGainDisplay();
    updateBankrollDisplays();
    document.getElementById('fairnessServerSeedHash').textContent = mockServerSeedHash.substring(0, 20) + "...";
    graphPlaceholder.style.display = 'block'; // Show placeholder
    graphCanvas.style.display = 'none'; // Hide canvas initially


    // --- Event Listeners ---
    betAmountInput.addEventListener('input', updateNetGainDisplay);
    cashoutAtInput.addEventListener('input', updateNetGainDisplay);

    playButton.addEventListener('click', () => {
        if (!gameRunning && !betPlaced) { // Place bet for next round
            handlePlaceBet();
        } else if (gameRunning && betPlaced) { // Cash out
            handleCashOut();
        }
    });

    // Amount modifiers
    document.getElementById('betHalf').addEventListener('click', () => {
        betAmountInput.value = (parseFloat(betAmountInput.value) / 2).toFixed(2);
        updateNetGainDisplay();
    });
    document.getElementById('betDouble').addEventListener('click', () => {
        betAmountInput.value = (parseFloat(betAmountInput.value) * 2).toFixed(2);
        updateNetGainDisplay();
    });
    document.getElementById('betMax').addEventListener('click', () => {
        betAmountInput.value = currentBalance.toFixed(2);
        updateNetGainDisplay();
    });

    // Modal Controls
    loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
    signupBtn.addEventListener('click', () => signupModal.style.display = 'flex');
    adminPanelBtn.addEventListener('click', () => adminModal.style.display = 'flex'); // Typically shown only if admin
    fairnessBtn.addEventListener('click', () => fairnessModal.style.display = 'flex');

    closeButtons.
