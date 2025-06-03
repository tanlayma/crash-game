document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const betAmountInput = document.getElementById('bet-amount');
    const placeBetButton = document.getElementById('place-bet-button');
    const currentMultiplierDisplay = document.getElementById('current-multiplier');
    const userBankrollDisplay = document.getElementById('user-bankroll');
    const siteBankrollDisplay = document.getElementById('site-bankroll-value');
    const previousMultipliersList = document.getElementById('previous-multipliers-list');
    const leaderboardList = document.getElementById('leaderboard-list');
    const chatMessagesContainer = document.getElementById('chat-messages'); // Renamed for clarity
    const chatInput = document.getElementById('chat-input');
    const sendChatMessageButton = document.getElementById('send-chat-message');

    // Game State
    let userBankroll = 1000.00; // Starting bankroll
    let siteBankroll = 1000000.00; // Mock site bankroll
    let currentBet = 0;
    let currentMultiplier = 1.00;
    let gameInterval = null;
    let isBetPlaced = false;
    let hasCashedOut = false;

    const MAX_WIN_PER_BET_PERCENTAGE = 0.01; // Max win as 1% of site bankroll

    // --- Initialization ---
    function initializeGame() {
        updateBankrollDisplay();
        if (siteBankrollDisplay) {
            siteBankrollDisplay.textContent = siteBankroll.toFixed(2);
        }
        populateMockLeaderboard();
        populateMockPreviousMultipliers();
        currentMultiplierDisplay.textContent = "1.00x";
        placeBetButton.textContent = "Place Bet";
    }

    // --- UI Update Functions ---
    function updateBankrollDisplay() {
        if (userBankrollDisplay) {
            userBankrollDisplay.textContent = userBankroll.toFixed(2);
        }
    }

    function showMaxWinDisclaimer(maxWin) {
        console.warn(`Max win for this bet is capped at ${maxWin.toFixed(2)}`);
        const existingDisclaimer = document.querySelector('.max-win-disclaimer');
        if (existingDisclaimer) {
            existingDisclaimer.remove();
        }

        const disclaimer = document.createElement('p');
        disclaimer.textContent = `Note: Max possible win for this bet is approx. ${maxWin.toFixed(2)}.`;
        disclaimer.style.color = 'orange';
        disclaimer.style.fontSize = '0.8em';
        disclaimer.style.marginTop = '5px';
        disclaimer.classList.add('max-win-disclaimer');

        if (placeBetButton && placeBetButton.parentNode) {
            placeBetButton.parentNode.insertBefore(disclaimer, placeBetButton.nextSibling); // Insert after button
        }
        setTimeout(() => {
            if (disclaimer) disclaimer.remove();
        }, 7000); // Remove after 7s
    }

    // --- Game Logic ---
    function handlePlaceBet() {
        if (isBetPlaced) { // This button is now for "Cashout"
            cashOut();
            return;
        }

        // Placing a new bet
        const bet = parseFloat(betAmountInput.value);
        if (isNaN(bet) || bet <= 0) {
            alert("Please enter a valid bet amount.");
            return;
        }
        if (bet > userBankroll) {
            alert("Insufficient funds.");
            return;
        }

        // Max win check (simplified)
        const potentialMaxWinOnSite = siteBankroll * MAX_WIN_PER_BET_PERCENTAGE;
        // If a very high multiplier (e.g., 100x) on the current bet would exceed this, show disclaimer.
        // This is a very rough check for the frontend simulation.
        if (bet * 100 > potentialMaxWinOnSite) { // Example: if bet implies potential to exceed with 100x
            showMaxWinDisclaimer(potentialMaxWinOnSite);
        }

        userBankroll -= bet;
        currentBet = bet;
        updateBankrollDisplay();
        isBetPlaced = true;
        hasCashedOut = false;

        placeBetButton.textContent = "Cashout @ 1.00x";
        placeBetButton.disabled = false; // It's now the cashout button
        betAmountInput.disabled = true;

        currentMultiplier = 1.00;
        currentMultiplierDisplay.textContent = `${currentMultiplier.toFixed(2)}x`;
        currentMultiplierDisplay.style.color = 'white';

        startGameRound();
    }

    function startGameRound() {
        // Simulate a crash point (e.g., between 1.01x and 15x)
        const crashPoint = parseFloat((Math.random() * 14) + 1.01).toFixed(2);
        console.log(`Simulated game will crash at: ${crashPoint}x`);

        gameInterval = setInterval(() => {
            currentMultiplier += 0.01;
            currentMultiplierDisplay.textContent = `${currentMultiplier.toFixed(2)}x`;

            if (isBetPlaced && !hasCashedOut) {
                placeBetButton.textContent = `Cashout @ ${currentMultiplier.toFixed(2)}x`;
            }

            if (currentMultiplier >= crashPoint) {
                clearInterval(gameInterval);
                gameInterval = null;
                handleCrash(crashPoint); // Pass the actual crash point
            }
        }, 75); // Multiplier increases every 75ms
    }

    function handleCrash(finalMultiplier) {
        currentMultiplierDisplay.textContent = `CRASHED @ ${finalMultiplier}x`;
        currentMultiplierDisplay.style.color = 'salmon';
        addPreviousMultiplier(parseFloat(finalMultiplier), true); // true for crashed

        if (isBetPlaced && !hasCashedOut) {
            // Bet was active and not cashed out, so it's lost
            console.log("Bet lost due to crash.");
            // User bankroll was already debited when bet was placed.
        }
        resetGameControls();
    }

    function cashOut() {
        if (!isBetPlaced || hasCashedOut) return;

        clearInterval(gameInterval); // Stop the multiplier
        gameInterval = null;
        hasCashedOut = true;

        const winnings = currentBet * currentMultiplier;
        userBankroll += winnings;
        updateBankrollDisplay();
        addPreviousMultiplier(currentMultiplier, false); // false for not crashed (cashed out successfully)

        currentMultiplierDisplay.textContent = `CASHED OUT @ ${currentMultiplier.toFixed(2)}x`;
        currentMultiplierDisplay.style.color = 'lightgreen';
        console.log(`Cashed out at ${currentMultiplier.toFixed(2)}x. Won: ${winnings.toFixed(2)}`);
        resetGameControls();
    }

    function resetGameControls() {
        isBetPlaced = false;
        // hasCashedOut is already set or remains false
        currentBet = 0;
        // currentMultiplier is left showing the final result of the round
        placeBetButton.textContent = "Place Bet";
        placeBetButton.disabled = false;
        betAmountInput.disabled = false;
        betAmountInput.value = ''; // Clear the input for the next bet

        // Remove max win disclaimer if it exists
        const existingDisclaimer = document.querySelector('.max-win-disclaimer');
        if (existingDisclaimer) {
            existingDisclaimer.remove();
        }
    }

    // --- Mock Data Population ---
    function populateMockLeaderboard() {
        if (!leaderboardList) return;
        const mockLeaders = [
            { name: "Player123", bet: 50, multiplier: "10.50x" },
            { name: "HighRoller", bet: 200, multiplier: "5.20x" },
            { name: "LuckyDuck", bet: 10, multiplier: "25.00x" },
            { name: "CrashKing", bet: 100, multiplier: "2.10x" },
            { name: "Newbie", bet: 5,
