// Casino Slot Machine Application - DOM-based version
const maxLines = 3;
const minLines = 1;
const maxBet = 10000;
const minBet = 1;

const rows = 3;
const columns = 3;

const symbols = ["🍒", "🍋", "🍊", "🍉", "⭐", "💎"];

const symbolCount = {
  "🍒": 30,
  "🍋": 28,
  "🍊": 25,
  "🍉": 25,
  "⭐": 22,
  "💎": 20
};

const symbolValues = {
  "🍒": 6,
  "🍋": 8,
  "🍊": 16,
  "🍉": 32,
  "⭐": 64,
  "💎": 300
};

// Game state
let balance = 0;
let currentLines = 1;
let currentBet = 100;
let isSpinning = false;

// DOM elements
let balanceDisplay, messageBox, messageText;
let linesInput, betInput, totalBetDisplay;
let depositBtn, spinBtn, cashoutBtn;
let depositModal, depositInput, confirmDepositBtn, cancelDepositBtn;
let bettingControls;
let slotCells = [];
let winLineElements = [];
let leverArm, leverHandle;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeDOM();
  setupEventListeners();
  updateDisplay();
});

// Initialize DOM element references
function initializeDOM() {
  balanceDisplay = document.getElementById('balance-display');
  messageBox = document.getElementById('message-box');
  messageText = document.getElementById('message-text');
  
  linesInput = document.getElementById('lines-input');
  betInput = document.getElementById('bet-input');
  totalBetDisplay = document.getElementById('total-bet-display');
  
  depositBtn = document.getElementById('deposit-btn');
  spinBtn = document.getElementById('spin-btn');
  cashoutBtn = document.getElementById('cashout-btn');
  
  depositModal = document.getElementById('deposit-modal');
  depositInput = document.getElementById('deposit-input');
  confirmDepositBtn = document.getElementById('confirm-deposit-btn');
  cancelDepositBtn = document.getElementById('cancel-deposit-btn');
  
  bettingControls = document.getElementById('betting-controls');
  
  // Get all slot cells
  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < rows; row++) {
      slotCells.push(document.getElementById(`slot-${col}-${row}`));
    }
  }
  
  // Get win line elements
  for (let i = 1; i <= maxLines; i++) {
    winLineElements.push(document.getElementById(`line-${i}`));
  }
  
  // Get lever elements
  leverArm = document.getElementById('lever-arm');
  leverHandle = document.getElementById('lever-handle');
}

// Setup event listeners
function setupEventListeners() {
  // Deposit button
  depositBtn.addEventListener('click', openDepositModal);
  confirmDepositBtn.addEventListener('click', confirmDeposit);
  cancelDepositBtn.addEventListener('click', closeDepositModal);
  
  // Allow Enter key in deposit modal
  depositInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      confirmDeposit();
    }
  });
  
  // Spin button
  spinBtn.addEventListener('click', handleSpin);
  
  // Cashout button
  cashoutBtn.addEventListener('click', handleCashout);
  
  // Lines controls
  document.getElementById('lines-decrease').addEventListener('click', () => {
    if (currentLines > minLines) {
      currentLines--;
      updateDisplay();
    }
  });
  
  document.getElementById('lines-increase').addEventListener('click', () => {
    if (currentLines < maxLines) {
      currentLines++;
      updateDisplay();
    }
  });
  
  // Bet controls
  document.getElementById('bet-decrease').addEventListener('click', () => {
    if (currentBet > minBet) {
      currentBet = Math.max(minBet, currentBet - 50);
      updateDisplay();
    }
  });
  
  document.getElementById('bet-increase').addEventListener('click', () => {
    if (currentBet < maxBet) {
      currentBet = Math.min(maxBet, currentBet + 100);
      updateDisplay();
    }
  });
  
  // Bet input direct change
  betInput.addEventListener('input', () => {
    let value = parseInt(betInput.value);
    if (!isNaN(value)) {
      currentBet = Math.max(minBet, Math.min(maxBet, value));
      updateDisplay();
    }
  });
  
  // Close modal on overlay click
  depositModal.addEventListener('click', (e) => {
    if (e.target === depositModal) {
      closeDepositModal();
    }
  });
  
  // Lever click/pull
  leverArm.addEventListener('click', handleLeverPull);
}

// Update all display elements
function updateDisplay() {
  balanceDisplay.textContent = `${balance} kr`;
  linesInput.value = currentLines;
  betInput.value = currentBet;
  
  const totalBet = currentBet * currentLines;
  totalBetDisplay.textContent = `${totalBet} kr`;
  
  // Update win lines active state
  winLineElements.forEach((element, index) => {
    element.setAttribute('data-active', index < currentLines ? 'true' : 'false');
  });
  
  // Enable/disable buttons based on balance
  spinBtn.disabled = balance < totalBet || isSpinning;
  cashoutBtn.disabled = balance === 0;
  
  // Enable/disable lever
  if (balance < totalBet || isSpinning) {
    leverArm.classList.add('disabled');
  } else {
    leverArm.classList.remove('disabled');
  }
  
  // Disable controls during spin
  if (isSpinning) {
    bettingControls.classList.add('disabled');
  } else {
    bettingControls.classList.remove('disabled');
  }
}

// Show message with type
function showMessage(text, type = 'info') {
  messageText.textContent = text;
  messageBox.className = `message-box ${type}`;
  
  // Trigger scale animation
  messageBox.classList.add('message-update');
  setTimeout(() => {
    messageBox.classList.remove('message-update');
  }, 300);
}

// Open deposit modal
function openDepositModal() {
  depositModal.classList.add('active');
  depositInput.value = '1000';
  depositInput.focus();
}

// Close deposit modal
function closeDepositModal() {
  depositModal.classList.remove('active');
}

// Confirm deposit
function confirmDeposit() {
  const amount = parseInt(depositInput.value);
  
  if (isNaN(amount) || amount <= 0) {
    showMessage('Vänligen ange ett giltigt positivt belopp.', 'error');
    return;
  }
  
  balance += amount;
  updateDisplay();
  closeDepositModal();
  showMessage(`Du har satt in ${amount} kr. Lycka till!`, 'success');
}

// Handle cashout
function handleCashout() {
  if (balance > 0) {
    // Scroll to balance card
    document.querySelector('.balance-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    showMessage(`Du tog ut ${balance} kr. Tack för att du spelade!`, 'success');
    balance = 0;
    updateDisplay();
  }
}

// Generate a random spin result
function generateSpin() {
  let allSymbols = [];
  for (const [symbol, count] of Object.entries(symbolCount)) {
    for (let i = 0; i < count; i++) {
      allSymbols.push(symbol);
    }
  }
  
  let cols = [];
  for (let c = 0; c < columns; c++) {
    let col = [];
    let currentSymbols = allSymbols.slice();
    for (let r = 0; r < rows; r++) {
      let randomIndex = Math.floor(Math.random() * currentSymbols.length);
      let selectedSymbol = currentSymbols[randomIndex];
      col.push(selectedSymbol);
      currentSymbols.splice(randomIndex, 1);
    }
    cols.push(col);
  }
  return cols;
}

// Update slot display with results
function updateSlotDisplay(cols) {
  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < rows; row++) {
      const cellIndex = col * rows + row;
      slotCells[cellIndex].textContent = cols[col][row];
    }
  }
}

// Add spinning animation to slots
function addSpinningAnimation() {
  slotCells.forEach(cell => {
    cell.classList.add('spinning');
  });
  document.querySelector('.slot-machine').classList.add('spinning');
}

// Remove spinning animation
function removeSpinningAnimation() {
  slotCells.forEach(cell => {
    cell.classList.remove('spinning');
  });
  document.querySelector('.slot-machine').classList.remove('spinning');
}

// Animate spin with random symbols
async function animateSpin(finalCols) {
  addSpinningAnimation();
  
  // Show random symbols during spin
  const spinDuration = 2000;
  const intervalTime = 100;
  const iterations = spinDuration / intervalTime;
  
  for (let i = 0; i < iterations; i++) {
    const randomCols = generateSpin();
    updateSlotDisplay(randomCols);
    await sleep(intervalTime);
  }
  
  // Show final result
  updateSlotDisplay(finalCols);
  removeSpinningAnimation();
  await sleep(300);
}

// Sleep utility
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check for winning lines and highlight them
function checkWinningLines(cols, lines) {
  let winningLines = [];
  let totalWinnings = 0;
  let winDetails = [];
  let winningColumns = [];
  let columnWinDetails = [];

  // Check rows (left to right)
  for (let line = 0; line < lines; line++) {
    let symbol = cols[0][line];
    let won = true;
    for (let col = 1; col < cols.length; col++) {
      if (cols[col][line] !== symbol) {
        won = false;
        break;
      }
    }
    if (won) {
      winningLines.push(line);
      let symbolValue = symbolValues[symbol];
      let winnings = Math.round(currentBet * symbolValue);
      totalWinnings += winnings;
      winDetails.push({ line: line + 1, symbol, winnings });
    }
  }

  // Check columns (top to bottom)
  for (let col = 0; col < cols.length; col++) {
    let symbol = cols[col][0];
    let won = true;
    for (let row = 1; row < rows; row++) {
      if (cols[col][row] !== symbol) {
        won = false;
        break;
      }
    }
    if (won) {
      winningColumns.push(col);
      let symbolValue = symbolValues[symbol];
      let winnings = Math.round(currentBet * symbolValue);
      totalWinnings += winnings;
      columnWinDetails.push({ column: col + 1, symbol, winnings });
    }
  }

  return { winningLines, totalWinnings, winDetails, winningColumns, columnWinDetails };
}

// Highlight winning cells
async function highlightWinningCells(winningLines) {
  if ((!winningLines || winningLines.length === 0) && (!arguments[1] || arguments[1].length === 0)) return;

  // Highlight winning rows
  if (winningLines && winningLines.length > 0) {
    for (let line of winningLines) {
      for (let col = 0; col < columns; col++) {
        const cellIndex = col * rows + line;
        slotCells[cellIndex].classList.add('winning');
      }
    }
  }

  // Highlight winning columns
  const winningColumns = arguments[1];
  if (winningColumns && winningColumns.length > 0) {
    for (let col of winningColumns) {
      for (let row = 0; row < rows; row++) {
        const cellIndex = col * rows + row;
        slotCells[cellIndex].classList.add('winning');
      }
    }
  }

  await sleep(2000);

  slotCells.forEach(cell => {
    cell.classList.remove('winning');
  });
}

// Handle lever pull
async function handleLeverPull() {
  if (isSpinning) return;
  
  const totalBet = currentBet * currentLines;
  
  if (balance < totalBet) {
    showMessage('Du har inte tillräckligt med pengar för denna insats!', 'error');
    return;
  }
  
  // Animate lever pull
  leverArm.classList.add('pulled');
  await sleep(300);
  leverArm.classList.remove('pulled');
  
  // Trigger spin
  handleSpin();
}

// Handle spin action
async function handleSpin() {
  if (isSpinning) return;
  
  const totalBet = currentBet * currentLines;
  
  if (balance < totalBet) {
    showMessage('Du har inte tillräckligt med pengar för denna insats!', 'error');
    return;
  }
  
  // Scroll to message box
  messageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  isSpinning = true;
  balance -= totalBet;
  updateDisplay();
  
  showMessage('Snurrar...', 'info');
  
  // Generate spin result
  const spinResult = generateSpin();
  
  // Animate the spin
  await animateSpin(spinResult);
  
  // Check for wins (rows and columns)
  const { winningLines, totalWinnings, winDetails, winningColumns, columnWinDetails } = checkWinningLines(spinResult, currentLines);

  if ((winningLines && winningLines.length > 0) || (winningColumns && winningColumns.length > 0)) {
    // Highlight winning cells (rows and columns)
    await highlightWinningCells(winningLines, winningColumns);

    // Update balance with winnings
    balance += totalWinnings;
    updateDisplay();

    // Show win message
    let winMessage = `🎉 Grattis! Du vann ${totalWinnings} kr! `;
    let details = [];
    if (winDetails && winDetails.length > 0) {
      details = details.concat(winDetails.map(detail => `Rad ${detail.line}: ${detail.symbol} × ${detail.winnings} kr`));
    }
    if (columnWinDetails && columnWinDetails.length > 0) {
      details = details.concat(columnWinDetails.map(detail => `Kolumn ${detail.column}: ${detail.symbol} × ${detail.winnings} kr`));
    }
    if (details.length === 1) {
      winMessage += `(${details[0]})`;
    } else if (details.length > 1) {
      winMessage += `(${details.join(", ")})`;
    }
    showMessage(winMessage, 'success');
  } else {
    showMessage(`Tyvärr ingen vinst den här gången. Balans: ${balance} kr`, 'error');
  }
  
  isSpinning = false;
  updateDisplay();
  
  // Check if player is out of money
  if (balance === 0) {
    await sleep(1500);
    showMessage('Du har fått slut på pengar! Sätt in mer för att fortsätta spela, eller erkänn att du har ett problem och skaffa hjälp.', 'error');
  }
}
