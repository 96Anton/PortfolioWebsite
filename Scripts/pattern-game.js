// ============================================
// GAME STATE CONSTANTS
// ============================================
const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over'
};

const DIFFICULTY_LEVELS = {
  EASY: { name: 'Easy', threshold: 0, speedMultiplier: 1, flashDuration: 200, class: 'difficulty-easy' },
  MEDIUM: { name: 'Medium', threshold: 5, speedMultiplier: 0.85, flashDuration: 150, class: 'difficulty-medium' },
  HARD: { name: 'Hard', threshold: 10, speedMultiplier: 0.7, flashDuration: 120, class: 'difficulty-hard' },
  EXPERT: { name: 'Expert', threshold: 15, speedMultiplier: 0.55, flashDuration: 100, class: 'difficulty-expert' }
};

// ============================================
// GAME STATE VARIABLES
// ============================================
let gameState = GAME_STATES.MENU;
let sequence = [];
let playerSequence = [];
let score = 0;
let combo = 0;
let lives = 3;
let acceptingInput = false;
let highScore = 0;
let currentDifficulty = DIFFICULTY_LEVELS.EASY;
let peekAvailable = true;
let slowMoAvailable = true;
let useSlowMo = false;

// ============================================
// DOM ELEMENTS
// ============================================
const buttons = $('.game-btn');
const startBtn = $('#start-btn');
const pauseBtn = $('#pause-btn');
const peekBtn = $('#peek-btn');
const slowMoBtn = $('#slowmo-btn');
const scoreDisplay = $('#score');
const highScoreDisplay = $('#high-score');
const comboDisplay = $('#combo');
const comboDisplayText = $('#combo-display');
const difficultyDisplay = $('#difficulty');
const livesContainer = $('#lives-container');
const gameOverModal = $('#game-over-modal');
const pauseModal = $('#pause-modal');
const playAgainBtn = $('#play-again-btn');
const resumeBtn = $('#resume-btn');
const quitBtn = $('#quit-btn');
const finalScoreDisplay = $('#final-score');
const newHighScoreMsg = $('#new-high-score-msg');
const leaderboardDiv = $('#leaderboard');
const colorblindCheckbox = $('#colorblind-mode');

// ============================================
// AUDIO & SOUND MANAGEMENT
// ============================================
function playSound(color) {
  const audio = new Audio(`../Scripts/sounds/${color}.mp3`);
  audio.volume = 0.5;
  audio.play().catch(() => {
    // Audio play failed, continue without sound
  });
}

function playSuccessSound() {
  const audio = new Audio(`../Scripts/sounds/success.mp3`);
  audio.volume = 0.3;
  audio.play().catch(() => {});
}

function playErrorSound() {
  const audio = new Audio(`../Scripts/sounds/error.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => {});
}

function playComboSound() {
  const audio = new Audio(`../Scripts/sounds/combo.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => {});
}

// ============================================
// VISUAL EFFECTS & ANIMATIONS
// ============================================
function createParticles(x, y, color) {
  for (let i = 0; i < 8; i++) {
    const particle = $('<div class="particle"></div>');
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 50 + Math.random() * 30;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    particle.css({
      left: x + 'px',
      top: y + 'px',
      width: '10px',
      height: '10px',
      background: color,
      borderRadius: '50%',
      '--tx': tx + 'px',
      '--ty': ty + 'px'
    });
    
    $('.game-container-pattern').append(particle);
    setTimeout(() => particle.remove(), 1000);
  }
}

function shakeScreen() {
  $('.game-container-pattern').addClass('shake');
  setTimeout(() => $('.game-container-pattern').removeClass('shake'), 500);
}

function flashButton(color, duration = null) {
  const button = $(`#${color}`);
  const flashDuration = duration || currentDifficulty.flashDuration;
  
  button.addClass('active');
  setTimeout(() => {
    button.removeClass('active');
  }, flashDuration);
}

function showError(wrongColor, correctColor) {
  const wrongButton = $(`#${wrongColor}`);
  const correctButton = $(`#${correctColor}`);
  
  wrongButton.addClass('error');
  correctButton.addClass('correct-answer');
  
  setTimeout(() => {
    wrongButton.removeClass('error');
    correctButton.removeClass('correct-answer');
  }, 1000);
}

function updateLivesDisplay() {
  const hearts = livesContainer.find('.heart');
  hearts.each((index, heart) => {
    if (index >= lives) {
      $(heart).addClass('lost');
    } else {
      $(heart).removeClass('lost');
    }
  });
}

function updateComboDisplay() {
  comboDisplay.text(combo);
  
  if (combo >= 3 && combo % 3 === 0) {
    comboDisplayText.text(`🔥 ${combo}x COMBO! 🔥`);
    comboDisplayText.removeClass('show');
    setTimeout(() => comboDisplayText.addClass('show'), 10);
    playComboSound();
    setTimeout(() => comboDisplayText.text(''), 2000);
  }
}

function scoreScaleUpOnIncrease() {
  scoreDisplay.addClass('scale-up');
  setTimeout(() => {
    scoreDisplay.removeClass('scale-up');
  }, 300);
}

// ============================================
// DIFFICULTY & PROGRESSION
// ============================================
function updateDifficulty() {
  let newDifficulty = DIFFICULTY_LEVELS.EASY;
  
  if (score >= DIFFICULTY_LEVELS.EXPERT.threshold) {
    newDifficulty = DIFFICULTY_LEVELS.EXPERT;
  } else if (score >= DIFFICULTY_LEVELS.HARD.threshold) {
    newDifficulty = DIFFICULTY_LEVELS.HARD;
  } else if (score >= DIFFICULTY_LEVELS.MEDIUM.threshold) {
    newDifficulty = DIFFICULTY_LEVELS.MEDIUM;
  }
  
  if (newDifficulty !== currentDifficulty) {
    currentDifficulty = newDifficulty;
    difficultyDisplay.text(newDifficulty.name);
    difficultyDisplay.removeClass('difficulty-easy difficulty-medium difficulty-hard difficulty-expert');
    difficultyDisplay.addClass(newDifficulty.class);
  }
}

function getSequenceDelay() {
  return useSlowMo ? 1000 : 500 * currentDifficulty.speedMultiplier;
}

// ============================================
// GAME SEQUENCE & LOGIC
// ============================================
function playSequence() {
  if (gameState !== GAME_STATES.PLAYING) return;
  
  acceptingInput = false;
  let delay = 0;
  const sequenceDelay = getSequenceDelay();
  
  sequence.forEach((color, index) => {
    setTimeout(() => {
      if (gameState !== GAME_STATES.PLAYING) return;
      flashButton(color);
      playSound(color);
      if (index === sequence.length - 1) {
        setTimeout(() => {
          acceptingInput = true;
        }, sequenceDelay);
      }
    }, delay);
    delay += sequenceDelay;
  });
  
  useSlowMo = false;
  updatePowerUpButtons();
}

function addToSequence() {
  const colors = ['red', 'green', 'blue', 'yellow'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  sequence.push(randomColor);
}

function checkPlayerInput() {
  const currentMoveIndex = playerSequence.length - 1;
  const isCorrect = playerSequence[currentMoveIndex] === sequence[currentMoveIndex];
  
  if (!isCorrect) {
    handleWrongInput(currentMoveIndex);
  } else if (playerSequence.length === sequence.length) {
    handleCorrectSequence();
  } else {
    // Correct input so far, continue
    combo++;
    updateComboDisplay();
  }
}

function handleWrongInput(currentMoveIndex) {
  const wrongColor = playerSequence[currentMoveIndex];
  const correctColor = sequence[currentMoveIndex];
  
  playErrorSound();
  shakeScreen();
  showError(wrongColor, correctColor);
  
  lives--;
  updateLivesDisplay();
  combo = 0;
  updateComboDisplay();
  
  if (lives <= 0) {
    endGame();
  } else {
    playerSequence = [];
    acceptingInput = false;
    setTimeout(() => {
      playSequence();
    }, 1500);
  }
}

function handleCorrectSequence() {
  score++;
  combo++;
  scoreScaleUpOnIncrease();
  scoreDisplay.text(score);
  updateComboDisplay();
  updateDifficulty();
  playSuccessSound();
  
  playerSequence = [];
  
  setTimeout(() => {
    if (gameState === GAME_STATES.PLAYING) {
      addToSequence();
      playSequence();
    }
  }, 1000);
}

// ============================================
// GAME STATE MANAGEMENT
// ============================================
function startGame() {
  gameState = GAME_STATES.PLAYING;
  sequence = [];
  playerSequence = [];
  score = 0;
  combo = 0;
  lives = 3;
  currentDifficulty = DIFFICULTY_LEVELS.EASY;
  peekAvailable = true;
  slowMoAvailable = true;
  
  scoreDisplay.text(score);
  comboDisplay.text(combo);
  difficultyDisplay.text(currentDifficulty.name);
  difficultyDisplay.removeClass('difficulty-easy difficulty-medium difficulty-hard difficulty-expert');
  difficultyDisplay.addClass(currentDifficulty.class);
  updateLivesDisplay();
  updatePowerUpButtons();
  
  startBtn.hide();
  pauseBtn.show();
  
  addToSequence();
  playSequence();
}

function pauseGame() {
  if (gameState !== GAME_STATES.PLAYING) return;
  gameState = GAME_STATES.PAUSED;
  acceptingInput = false;
  pauseModal.addClass('show');
}

function resumeGame() {
  gameState = GAME_STATES.PLAYING;
  pauseModal.removeClass('show');
  acceptingInput = true;
}

function endGame() {
  gameState = GAME_STATES.GAME_OVER;
  acceptingInput = false;
  
  updateHighScore();
  saveScoreToLeaderboard();
  
  finalScoreDisplay.text(score);
  
  if (score === highScore && score > 0) {
    newHighScoreMsg.show();
  } else {
    newHighScoreMsg.hide();
  }
  
  displayLeaderboard();
  gameOverModal.addClass('show');
  pauseBtn.hide();
}

function resetToMenu() {
  gameState = GAME_STATES.MENU;
  gameOverModal.removeClass('show');
  pauseModal.removeClass('show');
  startBtn.show();
  pauseBtn.hide();
}

// ============================================
// POWER-UPS
// ============================================
function usePeek() {
  if (!peekAvailable || !acceptingInput) return;
  peekAvailable = false;
  acceptingInput = false;
  updatePowerUpButtons();
  playSequence();
}

function useSlowMoFunc() {
  if (!slowMoAvailable || !acceptingInput) return;
  slowMoAvailable = false;
  useSlowMo = true;
  acceptingInput = false;
  updatePowerUpButtons();
  playSequence();
}

function updatePowerUpButtons() {
  peekBtn.prop('disabled', !peekAvailable);
  slowMoBtn.prop('disabled', !slowMoAvailable);
}

// ============================================
// LOCAL STORAGE & LEADERBOARD
// ============================================
function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('patternGameHighScore', highScore);
    highScoreDisplay.text(highScore);
  }
}

function loadHighScore() {
  const saved = localStorage.getItem('patternGameHighScore');
  if (saved) {
    highScore = parseInt(saved);
    highScoreDisplay.text(highScore);
  }
}

function saveScoreToLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem('patternGameLeaderboard') || '[]');
  
  leaderboard.push({
    score: score,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  });
  
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  
  localStorage.setItem('patternGameLeaderboard', JSON.stringify(leaderboard));
}

function displayLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('patternGameLeaderboard') || '[]');
  
  if (leaderboard.length === 0) {
    leaderboardDiv.html('<p>No scores yet!</p>');
    return;
  }
  
  let html = '<h3>🏆 Top 5 Scores</h3>';
  leaderboard.forEach((entry, index) => {
    html += `<div class="leaderboard-entry">
      <span>#${index + 1} - Score: ${entry.score}</span>
      <span>${entry.date}</span>
    </div>`;
  });
  
  leaderboardDiv.html(html);
}

// ============================================
// ACCESSIBILITY
// ============================================
function toggleColorblindMode() {
  if (colorblindCheckbox.is(':checked')) {
    buttons.addClass('colorblind-mode');
  } else {
    buttons.removeClass('colorblind-mode');
  }
}

function handleKeyPress(e) {
  if (gameState !== GAME_STATES.PLAYING || !acceptingInput) return;
  
  const keyMap = {
    '1': 'red',
    '2': 'blue',
    '3': 'yellow',
    '4': 'green'
  };
  
  const color = keyMap[e.key];
  if (color) {
    handleButtonClick(color);
  }
}

// ============================================
// INPUT HANDLERS
// ============================================
function handleButtonClick(color) {
  if (!acceptingInput || gameState !== GAME_STATES.PLAYING) return;
  
  const button = $(`#${color}`);
  const rect = button[0].getBoundingClientRect();
  const container = document.querySelector('.game-container-pattern');
  const containerRect = container.getBoundingClientRect();
  // Calculate position relative to the container
  const x = rect.left + rect.width / 2 - containerRect.left;
  const y = rect.top + rect.height / 2 - containerRect.top;
  
  playerSequence.push(color);
  flashButton(color);
  playSound(color);
  createParticles(x, y, button.css('background-color'));
  checkPlayerInput();
}

// ============================================
// EVENT LISTENERS
// ============================================
buttons.on('click', function() {
  const color = $(this).attr('id');
  handleButtonClick(color);
});

startBtn.on('click', function() {
  startGame();
});

pauseBtn.on('click', function() {
  pauseGame();
});

resumeBtn.on('click', function() {
  resumeGame();
});

quitBtn.on('click', function() {
  resetToMenu();
});

playAgainBtn.on('click', function() {
  gameOverModal.removeClass('show');
  startGame();
});

peekBtn.on('click', function() {
  usePeek();
});

slowMoBtn.on('click', function() {
  useSlowMoFunc();
});

colorblindCheckbox.on('change', function() {
  toggleColorblindMode();
});

$(document).on('keypress', function(e) {
  handleKeyPress(e);
});

// Prevent space bar from scrolling
$(document).on('keydown', function(e) {
  if (e.key === ' ' && gameState === GAME_STATES.PLAYING) {
    e.preventDefault();
  }
});

// ============================================
// INITIALIZATION
// ============================================
$(document).ready(function() {
  loadHighScore();
  updatePowerUpButtons();
  updateLivesDisplay();
});
