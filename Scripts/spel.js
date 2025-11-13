
// Handle clicks on the game container and swap the state classes on .game once and changes display state from none to block for the dice div
function startGame() {
    const container = document.querySelector('.game-container');
    if (!container) {
        return;
    }

    const gameElement = container.querySelector('.game');
    if (!gameElement || gameElement.classList.contains('started')) {
        return;
    }

    if (!gameElement.dataset.initialMarkup) {
        gameElement.dataset.initialMarkup = gameElement.innerHTML;
    }

    // Remove the paragraph
    const paragraph = gameElement.querySelector('p');
    if (paragraph) {
        paragraph.remove();
    }

    // Change the heading text
    const heading = gameElement.querySelector('h1');
    if (heading) {
        heading.textContent = 'Kasta tärningen';
        heading.style.lineHeight = '1';
    }

    const diceElement = gameElement.querySelector('.dice');
    if (diceElement) {
        diceElement.style.display = 'block';
    }

    gameElement.classList.remove('cta');
    gameElement.classList.add('started');

    attachDiceListener(gameElement);
}

function attachDiceListener(gameElement) {
    const diceElement = gameElement.querySelector('.dice');
    if (!diceElement) {
        return;
    }

    diceElement.removeEventListener('click', getRandomDiceImage);
    diceElement.addEventListener('click', getRandomDiceImage);
}

function initGame() {
    const container = document.querySelector('.game-container');
    if (!container) {
        return;
    }

    const gameElement = container.querySelector('.game');
    if (gameElement && !gameElement.dataset.initialMarkup) {
        gameElement.dataset.initialMarkup = gameElement.innerHTML;
    }

    container.addEventListener('click', startGame, { once: true });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

const ROLL_DELAY = 300;

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getRandomDiceImage(event) {
    const diceElement = event.currentTarget;
    diceElement.removeEventListener('click', getRandomDiceImage);

    const gameElement = diceElement.closest('.game');
    if (!gameElement) {
        return;
    }

    const img = diceElement.querySelector('.imgdice1');
    if (!img) {
        return;
    }

    const randomNumber = Math.floor(Math.random() * 6) + 1;
    const randomDiceImage = `dice${randomNumber}.png`;
    img.setAttribute('src', `../Styles/images/${randomDiceImage}`);

    await delay(ROLL_DELAY);

    showResult(gameElement, randomNumber);
}

function showResult(gameElement, randomNumber) {
    const isWorthy = randomNumber >= 4;
    gameElement.innerHTML = '';

    const heading = document.createElement('h1');
    heading.style.lineHeight = '1';
    heading.textContent = isWorthy ? 'Du är värdig.' : 'Du är inte värdig.';

    const paragraph = document.createElement('p');
    paragraph.textContent = isWorthy
        ? 'Du klarade din första prövning och får fortsätta mot ditt mål.'
        : 'och har redan förlorat spelet.';

    const resultImage = document.createElement('img');
    resultImage.className = 'result-image';
    resultImage.src = `../Styles/images/dice${randomNumber}.png`;
    resultImage.alt = `Dice showing ${randomNumber}`;

    gameElement.append(heading, paragraph);

    if (!isWorthy) {
        const retryButton = document.createElement('button');
        retryButton.type = 'button';
        retryButton.className = 'retry-button';
        retryButton.textContent = 'Försök igen';
        retryButton.addEventListener('click', () => resetGame(gameElement));

        gameElement.append(retryButton, resultImage);
        return;
    }

    const continueButton = document.createElement('button');
    continueButton.type = 'button';
    continueButton.classList.add('cta', 'worthy-button');
    continueButton.textContent = 'Fortsätt till nästa prövning';
    continueButton.addEventListener('click', worthy);

    gameElement.append(continueButton, resultImage);
}

function worthy() {
    const gameElement = document.querySelector('.game.started');
    if (!gameElement) {
        return;
    }

    const heading = gameElement.querySelector('h1');
    heading.style.lineHeight = '1';

    if (heading) {
        heading.textContent = 'Nästa prövning.';
    }

    const paragraph = gameElement.querySelector('p');
    if (paragraph) {
        paragraph.textContent = 'Du går vidare djupare in i spelet, i jakt på att få bevisa dig själv som värdig för kungariket... Är du den utvalda som profetiorna talar om?';
    }

    const button = gameElement.querySelector('.worthy-button');
    if (button) {
        button.removeEventListener('click', worthy);
        button.remove();
    }

    const existingImage = gameElement.querySelector('.result-image');
    if (existingImage) {
        existingImage.remove();
    }

    const stepTwoDiv = document.createElement('div');
    stepTwoDiv.className = 'steptwo';
    // Set background image directly when creating the element
    stepTwoDiv.style.backgroundImage = "url('../Styles/images/deeper.jpg')";
    stepTwoDiv.style.backgroundSize = 'cover';
    stepTwoDiv.style.borderRadius = '12px';
    stepTwoDiv.style.backgroundPosition = 'center';

    gameElement.appendChild(stepTwoDiv);
    const deeperButton = document.createElement('button');
    deeperButton.type = 'button';
    deeperButton.classList.add('ghost', 'deeper-button');
    deeperButton.textContent = 'Gå djupare..';
    deeperButton.style.fontWeight = '600';
    deeperButton.addEventListener('click', challenger);
    stepTwoDiv.appendChild(deeperButton);

}


function challenger() {
    const gameElement = document.querySelector('.game.started');
    if (!gameElement) {
        return;
    }
    gameElement.innerHTML = '';

    const heading = document.createElement('h1');
    heading.style.lineHeight = '1';
    heading.textContent = 'Utmanaren står i din väg.';
   
    const utmanare = document.createElement('img');
    utmanare.src = '../Styles/images/challenger.png';
    utmanare.alt = 'utmanare';
    utmanare.style.width = '150px';
    utmanare.style.height = '150px';
    utmanare.style.margin = '10px';

    const paragraph = document.createElement('p');
    paragraph.textContent = 'Fort, välj ditt vapen och besegra denna best!';

    const utmanareDiv = document.createElement('div');
    utmanareDiv.className = 'utmanare-div';
    utmanareDiv.style.display = 'flex';
    utmanareDiv.style.flexDirection = 'column';
    utmanareDiv.appendChild(utmanare);
    gameElement.appendChild(utmanareDiv);

    
    const vapenDiv = document.createElement('div');
    vapenDiv.className = 'vapen';
    vapenDiv.style.display = 'flex';
    vapenDiv.style.flexDirection = 'row';
    vapenDiv.style.justifyContent = 'center';
    vapenDiv.style.margin = '10px';
    
    const vapen1 = document.createElement('img');
    vapen1.src = '../Styles/images/sword.png';
    vapen1.alt = 'Sword';
    vapen1.style.width = '80px';
    vapen1.style.height = '80px';
    vapen1.style.margin = '5px';
    vapen1.style.border = '2px solid #FFCC00';
    vapen1.style.borderRadius = '12px';
    vapen1.style.cursor = 'pointer';
    vapen1.addEventListener('click', showNotWorthy);
    
    const vapen2 = document.createElement('img');
    vapen2.src = '../Styles/images/spear.png';
    vapen2.alt = 'Spear';
    vapen2.style.width = '80px';
    vapen2.style.height = '80px';
    vapen2.style.margin = '5px';
    vapen2.style.border = '2px solid #FFCC00';
    vapen2.style.borderRadius = '12px';
    vapen2.style.cursor = 'pointer';
    vapen2.addEventListener('click', quiz);
    
    const vapen3 = document.createElement('img');
    vapen3.src = '../Styles/images/bow.png';
    vapen3.alt = 'Bow';
    vapen3.style.width = '80px';
    vapen3.style.height = '80px';
    vapen3.style.margin = '5px';
    vapen3.style.border = '2px solid #FFCC00';
    vapen3.style.borderRadius = '12px';
    vapen3.style.cursor = 'pointer';
    vapen3.addEventListener('click', showNotWorthy);

    vapenDiv.append(vapen1, vapen2, vapen3);
    gameElement.append(heading, paragraph, vapenDiv);
}

// Show "You are not worthy" message with retry button
function showNotWorthy() {
    const gameElement = document.querySelector('.game.started');
    if (!gameElement) {
        return;
    }
    
    gameElement.innerHTML = '';
    
    const heading = document.createElement('h1');
    heading.style.lineHeight = '1';
    heading.textContent = 'Du är inte värdig.';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Du valde fel vapen och förlorade mot utmanaren.';
    
    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.className = 'retry-button';
    retryButton.textContent = 'Spela igen';
    retryButton.addEventListener('click', () => resetGame(gameElement));
    
    gameElement.append(heading, paragraph, retryButton);
}

// Quiz function with prompt input
function quiz() {
    const gameElement = document.querySelector('.game.started');
    if (!gameElement) {
        return;
    }
    
    // Clear the game element and create new quiz UI
    gameElement.innerHTML = '';
    
    const heading = document.createElement('h1');
    heading.style.lineHeight = '1';
    heading.textContent = 'Utmanaren besegrad!';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Svara rätt på Filosofens prövning för att bevisa att du inte bara är modig och kan slåss, utan att du också är vis och kunnig.';

    const questionPara = document.createElement('p');
    questionPara.textContent = 'Fråga: Vad är din karaktärs namn? (har du varit uppmärksam?)';
    questionPara.style.margin = '10px 0';
    questionPara.style.fontWeight = '600';
    questionPara.style.color = '#ffffff';
    
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Skriv ditt svar här...';
    inputField.className = 'quiz-input';
    inputField.style.padding = '10px';
    inputField.style.margin = '10px 0';
    inputField.style.borderRadius = '6px';
    inputField.style.border = '2px solid #FFCC00';
    inputField.style.fontSize = '16px';
    inputField.style.width = '80%';
    inputField.style.maxWidth = '300px';
    inputField.style.color = '#ffffff';
    inputField.style.backgroundColor = 'transparent';
    
    // Add placeholder styling
    if (!document.getElementById('quiz-input-styles')) {
        const style = document.createElement('style');
        style.id = 'quiz-input-styles';
        style.textContent = `
            .quiz-input::placeholder {
                color: #ffffff;
                opacity: 0.7;
            }
        `;
        document.head.appendChild(style);
    }
    
    const submitButton = document.createElement('button');
    submitButton.type = 'button';
    submitButton.className = 'cta';
    submitButton.textContent = 'Skicka svar';
    
    submitButton.addEventListener('click', () => {
        const answer = inputField.value;
        
        // Check if the answer is correct (you can change the correct answer here)
        const correctAnswer = 'kido'; // Example correct answer
        
        if (answer.toLowerCase().trim() === correctAnswer.toLowerCase()) {
            afterquiz();
        } else {
            showNotWorthy();
        }
    });
    
    // Allow pressing Enter to submit
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitButton.click();
        }
    });
    
    gameElement.append(heading, paragraph, questionPara, inputField, submitButton);
}

// Function called after correct quiz answer
function afterquiz() {
    const gameElement = document.querySelector('.game.started');
    if (!gameElement) {
        return;
    }
    
    gameElement.innerHTML = '';
    
    const heading = document.createElement('h1');
    heading.style.lineHeight = '1';
    heading.textContent = 'Kido är sannerligen ditt namn.';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Du har bevisat att du är mentalt kapabel att leda ett land och får nu fortsätta din resa.';
    
    const continueButton = document.createElement('button');
    continueButton.type = 'button';
    continueButton.classList.add('cta');
    continueButton.textContent = 'Fortsätt äventyret';
    continueButton.addEventListener('click', findit);
    
    gameElement.append(heading, paragraph, continueButton);
}

// Find it game function
function findit() {
    const gameElement = document.querySelector('.game.started');
    if (!gameElement) {
        return;
    }
    
    gameElement.innerHTML = '';
    gameElement.style.position = 'relative';
    gameElement.style.minHeight = '500px';
    
    const heading = document.createElement('h1');
    heading.style.lineHeight = '1';
    heading.style.position = 'relative';
    heading.style.zIndex = '2';
    heading.textContent = 'Find it.';
    
    gameElement.appendChild(heading);
    
    // Generate random colors for divs
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
        '#F8B195', '#C06C84', '#6C5B7B', '#355C7D'
    ];
    
    // Randomly select which div will be the correct one (0-11)
    const correctDivIndex = Math.floor(Math.random() * 12);
    
    // Create 6 hidden divs
    for (let i = 0; i < 5; i++) {
        const hiddenDiv = document.createElement('div');
        hiddenDiv.className = 'hiddenDiv';
        
        // Random positioning within the game element
        const randomTop = Math.random() * 70 + 10; // 10% to 80%
        const randomLeft = Math.random() * 70 + 10; // 10% to 80%
        
        hiddenDiv.style.position = 'absolute';
        hiddenDiv.style.top = `${randomTop}%`;
        hiddenDiv.style.left = `${randomLeft}%`;
        hiddenDiv.style.width = '60px';
        hiddenDiv.style.height = '60px';
        hiddenDiv.style.backgroundColor = colors[i];
        hiddenDiv.style.borderRadius = '8px';
        hiddenDiv.style.cursor = 'pointer';
        hiddenDiv.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        hiddenDiv.style.zIndex = '1';
        
        // Add hover effect
        hiddenDiv.addEventListener('mouseenter', () => {
            hiddenDiv.style.transform = 'scale(1.1)';
            hiddenDiv.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.3)';
        });
        
        hiddenDiv.addEventListener('mouseleave', () => {
            hiddenDiv.style.transform = 'scale(1)';
            hiddenDiv.style.boxShadow = 'none';
        });
        
        // Check if this is the correct div
        if (i === correctDivIndex) {
            hiddenDiv.addEventListener('click', showFindItSuccess);
        } else {
            hiddenDiv.addEventListener('click', secondChance);
        }
        
        gameElement.appendChild(hiddenDiv);
    }
}

// Success screen for Find It game
function showFindItSuccess() {
    const gameElement = document.querySelector('.game.started');
    if (!gameElement) {
        return;
    }
    
    gameElement.innerHTML = '';
    gameElement.style.position = '';
    gameElement.style.minHeight = '';
    
    const heading = document.createElement('h1');
    heading.style.lineHeight = '1';
    heading.textContent = 'Du hittade den!';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Tack! Den är väldigt viktig för mig, jag lovar.';
    
    const continueButton = document.createElement('button');
    continueButton.type = 'button';
    continueButton.classList.add('cta');
    continueButton.textContent = 'Nästa utmaning';
    continueButton.addEventListener('click', lastStep);
    
    gameElement.append(heading, paragraph, continueButton);
}

// Last step function - steget innan sista utmaningen
function lastStep() {
    const gameElement = document.querySelector('.game.started');
    if (!gameElement) {
        return;
    }
    
    gameElement.innerHTML = '';
    
    const heading = document.createElement('h1');
    heading.style.lineHeight = '1';
    heading.textContent = 'Det sista steget';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Du har kommit längre än de flesta före dig och legenden verkar komma närmre sanning för varje steg. Nu väntar den sista prövningen... Är du värdig?';
    
    const continueButton = document.createElement('button');
    continueButton.type = 'button';
    continueButton.className = 'cta';
    continueButton.textContent = 'Bevisa din värdighet';
    continueButton.addEventListener('click', finalChallenge);
    
    gameElement.append(heading, paragraph, continueButton);
}



// Second chance function for wrong selection
function secondChance() {
    const gameElement = document.querySelector('.game.started');
    if (!gameElement) {
        return;
    }
    
    gameElement.innerHTML = '';
    gameElement.style.position = '';
    gameElement.style.minHeight = '';
    
    const heading = document.createElement('h1');
    heading.style.lineHeight = '1';
    heading.textContent = 'Fel val!';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Du klickade på fel sak. Försök igen?';
    
    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.className = 'cta';
    retryButton.textContent = 'Försök igen';
    retryButton.addEventListener('click', findit);
    
    const giveUpButton = document.createElement('button');
    giveUpButton.type = 'button';
    giveUpButton.className = 'retry-button';
    giveUpButton.textContent = 'Ge upp';
    giveUpButton.style.marginTop = '10px';
    giveUpButton.addEventListener('click', () => resetGame(gameElement));
    
    gameElement.append(heading, paragraph, retryButton, giveUpButton);
}


// finalChallenge function - Den sista utmaningen
function finalChallenge() {
    const gameElement = document.querySelector('.game.started');
    if (!gameElement) {
        return;
    }
    
    gameElement.innerHTML = '';
    gameElement.style.position = 'relative';
    gameElement.style.minHeight = '600px';
    gameElement.style.overflow = 'hidden';
    gameElement.style.cursor = 'none';
    
    const heading = document.createElement('h1');
    heading.style.lineHeight = '1';
    heading.style.position = 'relative';
    heading.style.zIndex = '10';
    heading.style.transition = 'all 1s ease';
    heading.textContent = 'Den sista prövningen';
    
    const paragraph = document.createElement('p');
    paragraph.style.position = 'relative';
    paragraph.style.zIndex = '10';
    paragraph.style.transition = 'all 1s ease';
    paragraph.textContent = 'Hitta den dolda fienden genom att använda rök-partiklarna...';
    
    gameElement.append(heading, paragraph);
    
    // After 3 seconds, animate heading and paragraph to top left
    setTimeout(() => {
        heading.style.position = 'absolute';
        heading.style.top = '50px';
        heading.style.left = '10px';
        heading.style.fontSize = '22px';
        heading.style.margin = '0';
        heading.style.textAlign = 'left';
        
        paragraph.style.position = 'absolute';
        paragraph.style.top = '75px';
        paragraph.style.left = '10px';
        paragraph.style.fontSize = '10px';
        paragraph.style.margin = '0';
        paragraph.style.textAlign = 'left';
        paragraph.style.maxWidth = '180px';
    }, 3000);
    
    // Create custom cursor dot
    const cursorDot = document.createElement('div');
    cursorDot.style.position = 'absolute';
    cursorDot.style.width = '8px';
    cursorDot.style.height = '8px';
    cursorDot.style.borderRadius = '50%';
    cursorDot.style.backgroundColor = '#ffffff';
    cursorDot.style.pointerEvents = 'none';
    cursorDot.style.zIndex = '100';
    cursorDot.style.transition = 'background-color 0.2s ease';
    gameElement.appendChild(cursorDot);
    
    // Create finalLevel div for particles
    const finalLevel = document.createElement('div');
    finalLevel.className = 'finalLevel';
    finalLevel.style.position = 'absolute';
    finalLevel.style.top = '0';
    finalLevel.style.left = '0';
    finalLevel.style.width = '100%';
    finalLevel.style.height = '100%';
    finalLevel.style.zIndex = '5';
    finalLevel.style.pointerEvents = 'none';
    
    gameElement.appendChild(finalLevel);
    
    // Create hidden enemy div with complex shape
    const hiddenEnemy = document.createElement('div');
    hiddenEnemy.className = 'hiddenEnemy';
    hiddenEnemy.style.position = 'absolute';
    hiddenEnemy.style.width = '35px';
    hiddenEnemy.style.height = '35px';
    hiddenEnemy.style.top = '50%';
    hiddenEnemy.style.left = '50%';
    hiddenEnemy.style.transform = 'translate(-50%, -50%)';
    hiddenEnemy.style.backgroundColor = 'transparent';
    hiddenEnemy.style.border = '2px solid transparent';
    hiddenEnemy.style.padding = '10px';
    // Complex star-like shape using clip-path
    hiddenEnemy.style.clipPath = 'polygon(30% 0%, 40% 20%, 50% 0%, 60% 20%, 70% 0%, 80% 40%, 70% 50%, 80% 80%, 60% 100%, 50% 70%, 40% 100%, 20% 80%, 30% 50%, 20% 40%)';
    hiddenEnemy.style.zIndex = '8';
    hiddenEnemy.style.pointerEvents = 'auto';
    hiddenEnemy.style.cursor = 'pointer';
    
    gameElement.appendChild(hiddenEnemy);
    
    // Health bar container
    const healthBarContainer = document.createElement('div');
    healthBarContainer.style.position = 'absolute';
    healthBarContainer.style.top = '10px';
    healthBarContainer.style.left = '50%';
    healthBarContainer.style.transform = 'translateX(-50%)';
    healthBarContainer.style.width = '200px';
    healthBarContainer.style.height = '20px';
    healthBarContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    healthBarContainer.style.border = '2px solid #FFCC00';
    healthBarContainer.style.borderRadius = '10px';
    healthBarContainer.style.zIndex = '11';
    healthBarContainer.style.overflow = 'hidden';
    healthBarContainer.style.display = 'flex';
    healthBarContainer.style.alignItems = 'center';
    healthBarContainer.style.justifyContent = 'center';
    
    const healthBar = document.createElement('div');
    healthBar.style.position = 'absolute';
    healthBar.style.left = '0';
    healthBar.style.top = '0';
    healthBar.style.width = '100%';
    healthBar.style.height = '100%';
    healthBar.style.backgroundColor = '#FFCC00';
    healthBar.style.transition = 'width 0.3s ease';
    healthBar.style.zIndex = '1';
    
    const healthBarText = document.createElement('span');
    healthBarText.textContent = 'H E A L T H   B A R';
    healthBarText.style.fontSize = '9px';
    healthBarText.style.fontWeight = '600';
    healthBarText.style.color = '#ffffff';
    healthBarText.style.textShadow = '0 0 3px rgba(0, 0, 0, 0.8)';
    healthBarText.style.position = 'relative';
    healthBarText.style.zIndex = '2';
    healthBarText.style.letterSpacing = '1px';
    
    healthBarContainer.appendChild(healthBar);
    healthBarContainer.appendChild(healthBarText);
    gameElement.appendChild(healthBarContainer);
    
    // Enemy movement variables
    let enemyX = 50; // percentage
    let enemyY = 50; // percentage
    let enemySpeedX = (Math.random() - 0.5) * 0.5;
    let enemySpeedY = (Math.random() - 0.5) * 0.5;
    let enemyHealth = 10;
    const maxHealth = 10;
    let isEnemyRedFromClick = false;
    
    // Particle system
    const particles = [];
    const maxParticles = 250;
    let mouseX = 0;
    let mouseY = 0;
    let isMouseInGame = false;
    const collisionFlashes = [];
    
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3 + 2;
            // Particles only move upward with wave motion
            this.speedY = -(Math.random() * 1.5 + 0.5); // Negative for upward
            this.life = 1;
            this.decay = Math.random() * 0.006 + 0.004; // Decreased decay for longer life
            this.angle = Math.random() * Math.PI * 2;
            this.angleSpeed = (Math.random() - 0.5) * 0.15;
            this.waveAmplitude = Math.random() * 2 + 1;
            this.opacity = 0.7;
            
            this.element = document.createElement('div');
            this.element.style.position = 'absolute';
            this.element.style.width = this.size + 'px';
            this.element.style.height = this.size + 'px';
            this.element.style.borderRadius = '50%';
            this.element.style.backgroundColor = `rgba(255, 204, 0, ${this.opacity})`;
            this.element.style.boxShadow = '0 0 6px rgba(255, 204, 0, 0.4)';
            this.element.style.pointerEvents = 'none';
            finalLevel.appendChild(this.element);
        }
        
        update() {
            // Wave motion using sine
            this.angle += this.angleSpeed;
            const waveOffset = Math.sin(this.angle) * this.waveAmplitude;
            
            // Move upward with wave
            this.y += this.speedY;
            this.x += waveOffset * 0.2;
            
            // Check collision with hidden enemy
            const rect = gameElement.getBoundingClientRect();
            const enemyAbsX = rect.left + (rect.width * enemyX / 100);
            const enemyAbsY = rect.top + (rect.height * enemyY / 100);
            const particleAbsX = this.x + rect.left;
            const particleAbsY = this.y + rect.top;
            
            const dx = particleAbsX - enemyAbsX;
            const dy = particleAbsY - enemyAbsY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
                // Create collision flash
                const flash = document.createElement('div');
                flash.style.position = 'absolute';
                flash.style.left = this.x + 'px';
                flash.style.top = this.y + 'px';
                flash.style.width = '5px';
                flash.style.height = '5px';
                flash.style.backgroundColor = '#FFCC00';
                flash.style.borderRadius = '50%';
                flash.style.boxShadow = '0 0 10px #FFCC00';
                flash.style.pointerEvents = 'none';
                flash.style.zIndex = '9';
                finalLevel.appendChild(flash);
                
                setTimeout(() => {
                    if (flash.parentNode) {
                        flash.parentNode.removeChild(flash);
                    }
                }, 100);
                
                // Reveal enemy briefly - only if not red from click
                if (!isEnemyRedFromClick) {
                    hiddenEnemy.style.border = '2px solid #FFCC00';
                    hiddenEnemy.style.backgroundColor = 'rgba(255, 204, 0, 0.2)';
                    hiddenEnemy.style.boxShadow = '0 0 15px rgba(255, 204, 0, 0.6)';
                    
                    setTimeout(() => {
                        if (!isEnemyRedFromClick) {
                            hiddenEnemy.style.border = '2px solid transparent';
                            hiddenEnemy.style.backgroundColor = 'transparent';
                            hiddenEnemy.style.boxShadow = 'none';
                        }
                    }, 100);
                }
                
                // Kill particle on collision
                this.life = 0;
            }
            
            // Remove particles that go off screen
            if (this.y < 0 || this.x < 0 || this.x > rect.width) {
                this.life = 0;
            }
            
            this.life -= this.decay;
            this.opacity = this.life * 0.7;
            
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
            this.element.style.opacity = this.opacity;
            this.element.style.transform = `scale(${this.life})`;
        }
        
        isDead() {
            return this.life <= 0;
        }
        
        remove() {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }
    }
    
    function updateEnemy() {
        // Move enemy
        enemyX += enemySpeedX;
        enemyY += enemySpeedY;
        
        // Bounce off walls with unpredictable angle changes
        if (enemyX <= 5 || enemyX >= 95) {
            enemySpeedX *= -1;
            enemySpeedX += (Math.random() - 0.5) * 0.2;
            enemySpeedY += (Math.random() - 0.5) * 0.2;
        }
        if (enemyY <= 15 || enemyY >= 95) {
            enemySpeedY *= -1;
            enemySpeedX += (Math.random() - 0.5) * 0.2;
            enemySpeedY += (Math.random() - 0.5) * 0.2;
        }
        
        // Keep speed within bounds
        const maxSpeed = 0.8;
        const minSpeed = 0.3;
        const speed = Math.sqrt(enemySpeedX * enemySpeedX + enemySpeedY * enemySpeedY);
        if (speed > maxSpeed) {
            enemySpeedX = (enemySpeedX / speed) * maxSpeed;
            enemySpeedY = (enemySpeedY / speed) * maxSpeed;
        }
        if (speed < minSpeed) {
            enemySpeedX = (enemySpeedX / speed) * minSpeed;
            enemySpeedY = (enemySpeedY / speed) * minSpeed;
        }
        
        hiddenEnemy.style.left = enemyX + '%';
        hiddenEnemy.style.top = enemyY + '%';
    }
    
    function animate() {
        // Update enemy position
        updateEnemy();
        
        // Create new particles from mouse position
        if (isMouseInGame && particles.length < maxParticles) {
            const rect = gameElement.getBoundingClientRect();
            const localX = mouseX - rect.left;
            const localY = mouseY - rect.top;
            particles.push(new Particle(localX, localY));
        }
        
        // Update and remove dead particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].isDead()) {
                particles[i].remove();
                particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Mouse tracking
    gameElement.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseInGame = true;
        
        const rect = gameElement.getBoundingClientRect();
        cursorDot.style.left = (mouseX - rect.left) + 'px';
        cursorDot.style.top = (mouseY - rect.top) + 'px';
    });
    
    gameElement.addEventListener('mouseleave', () => {
        isMouseInGame = false;
        cursorDot.style.display = 'none';
    });
    
    gameElement.addEventListener('mouseenter', () => {
        cursorDot.style.display = 'block';
    });
    
    // Change cursor dot color when hovering enemy
    hiddenEnemy.addEventListener('mouseenter', () => {
        cursorDot.style.backgroundColor = '#fa0000';
    });
    
    hiddenEnemy.addEventListener('mouseleave', () => {
        cursorDot.style.backgroundColor = '#ffffff';
    });
    
    // Click on hidden enemy to damage it
    hiddenEnemy.addEventListener('click', () => {
        enemyHealth--;
        
        // Update health bar
        const healthPercent = (enemyHealth / maxHealth) * 100;
        healthBar.style.width = healthPercent + '%';
        
        // Flash effect on click - red for 300ms
        isEnemyRedFromClick = true;
        hiddenEnemy.style.border = '3px solid #ff0000';
        hiddenEnemy.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        hiddenEnemy.style.boxShadow = '0 0 25px rgba(255, 0, 0, 0.8)';
        
        setTimeout(() => {
            isEnemyRedFromClick = false;
            hiddenEnemy.style.border = '2px solid transparent';
            hiddenEnemy.style.backgroundColor = 'transparent';
            hiddenEnemy.style.boxShadow = 'none';
        }, 300);
        
        // Check if enemy is defeated
        if (enemyHealth <= 0) {
            gameElement.style.cursor = 'default';
            particles.forEach(p => p.remove());
            particles.length = 0;
            finalLevel.remove();
            hiddenEnemy.remove();
            cursorDot.remove();
            healthBarContainer.remove();
            
            gameElement.innerHTML = '';
            gameElement.style.position = '';
            gameElement.style.minHeight = '';
            gameElement.style.overflow = '';
            gameElement.classList.add('cta');
            
            const winHeading = document.createElement('h1');
            winHeading.style.lineHeight = '1';
            winHeading.textContent = 'Du är den utvalda!';
            
            const winParagraph = document.createElement('p');
            winParagraph.textContent = 'Du har klarat alla prövningar och bevisat din värdighet. Legenden var sann!';
            
            gameElement.append(winHeading, winParagraph);
            
            // Trigger the "Den utvalda" achievement
            gameElement.classList.add('game-victory');
            // Simulate a click to trigger the achievement
            setTimeout(() => {
                gameElement.click();
            }, 100);
        }
    });
    
    animate();
}







// GAME OVER - Reset the game to its initial state
function resetGame(gameElement) {
    const container = gameElement.closest('.game-container');
    if (!container) {
        return;
    }

    const initialMarkup = gameElement.dataset.initialMarkup;
    if (!initialMarkup) {
        return;
    }

    gameElement.innerHTML = initialMarkup;
    gameElement.classList.remove('started');
    gameElement.classList.add('cta');

    // Reset the dice image to default state
    const diceImg = gameElement.querySelector('.imgdice1');
    if (diceImg) {
        diceImg.setAttribute('src', '../Styles/images/dice6.png');
    }

    container.addEventListener('click', startGame, { once: true });
}
