/**
 * Game Script - Refactored with jQuery
 * 
 * Requirements: jQuery library must be loaded before this script
 * Add to your HTML: <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
 */

// ===== UTILITIES =====
const ROLL_DELAY = 300;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Input sanitization helper to prevent XSS attacks
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};

// Helper to create elements with common patterns
const createElement = (tag, className, text) => $(`<${tag}>`).addClass(className).text(text);

// Helper to clear game and set new content
const setGameContent = ($game, ...elements) => $game.empty().append(...elements);

// Get game element helper
const getGame = () => $('.game.started');

// ===== INITIALIZATION =====
function startGame() {
    const $container = $('.game-container');
    if (!$container.length) return;

    const $gameElement = $container.find('.game');
    if (!$gameElement.length || $gameElement.hasClass('started')) return;

    if (!$gameElement.data('initialMarkup')) {
        $gameElement.data('initialMarkup', $gameElement.html());
    }

    $gameElement.find('p:not(.dice p)').first().remove();
    $gameElement.find('h1').text('Kasta tärningen');
    $gameElement.find('.dice').addClass('active');
    $gameElement.removeClass('cta').addClass('started');

    $gameElement.find('.dice').off('click', getRandomDiceImage).on('click', getRandomDiceImage);
}

function initGame() {
    const $container = $('.game-container');
    if (!$container.length) return;

    const $gameElement = $container.find('.game');
    if ($gameElement.length && !$gameElement.data('initialMarkup')) {
        $gameElement.data('initialMarkup', $gameElement.html());
    }

    $container.one('click', startGame);
}

(document.readyState === 'loading') 
    ? document.addEventListener('DOMContentLoaded', initGame)
    : initGame();

// ===== DICE GAME =====
async function getRandomDiceImage(event) {
    const $diceElement = $(event.currentTarget);
    $diceElement.off('click', getRandomDiceImage);

    const $gameElement = $diceElement.closest('.game');
    if (!$gameElement.length) return;

    const $img = $diceElement.find('.imgdice1');
    if (!$img.length) return;

    const randomNumber = Math.floor(Math.random() * 6) + 1;
    $img.attr('src', `../Styles/images/dice${randomNumber}.png`);

    await delay(ROLL_DELAY);
    showResult($gameElement, randomNumber);
}

function showResult($gameElement, randomNumber) {
    const isWorthy = randomNumber >= 4;
    const $heading = createElement('h1', '', isWorthy ? 'Du är värdig.' : 'Du är inte värdig.');
    const $paragraph = createElement('p', '', isWorthy
        ? 'Du klarade din första prövning och får fortsätta mot ditt mål.'
        : 'och har redan förlorat spelet.');
    const $resultImage = $('<img>').addClass('result-image')
        .attr({src: `../Styles/images/dice${randomNumber}.png`, alt: `Dice showing ${randomNumber}`});

    if (!isWorthy) {
        const $retryButton = createElement('button', 'retry-button', 'Försök igen')
            .attr('type', 'button').on('click', () => resetGame($gameElement));
        setGameContent($gameElement, $heading, $paragraph, $retryButton, $resultImage);
    } else {
        const $continueButton = createElement('button', 'cta worthy-button', 'Försätt till nästa prövning')
            .attr('type', 'button').on('click', worthy);
        setGameContent($gameElement, $heading, $paragraph, $continueButton, $resultImage);
    }
}

// ===== CHALLENGE STAGES =====
function worthy() {
    const $gameElement = getGame();
    if (!$gameElement.length) return;

    $gameElement.find('h1').text('Nästa prövning.');
    $gameElement.find('p').text('Du går vidare djupare in i spelet, i jakt på att få bevisa dig själv som värdig för kungariket... Är du den utvalda som profetiorna talar om?');
    $gameElement.find('.worthy-button, .result-image').remove();

    const $deeperButton = createElement('button', 'ghost deeper-button', 'Gå djupare..')
        .attr('type', 'button').on('click', challenger);
    $gameElement.append($('<div>').addClass('steptwo').append($deeperButton));
}


function challenger() {
    const $gameElement = getGame();
    if (!$gameElement.length) return;

    const weapons = [
        {src: 'sword.png', alt: 'Sword', onClick: () => showDefeat('Du valde fel vapen och förlorade mot den överlägsna utmanaren.')},
        {src: 'spear.png', alt: 'Spear', onClick: quiz},
        {src: 'bow.png', alt: 'Bow', onClick: () => showDefeat('Du valde fel vapen och förlorade mot den överlägsna utmanaren.')}
    ];

    const $vapenDiv = $('<div>').addClass('vapen');
    weapons.forEach(w => {
        $vapenDiv.append($('<img>').attr({src: `../Styles/images/${w.src}`, alt: w.alt}).on('click', w.onClick));
    });

    const $utmanare = $('<img>').attr({src: '../Styles/images/challenger.png', alt: 'utmanare'});
    
    setGameContent($gameElement,
        createElement('h1', '', 'Utmanaren står i din väg.'),
        createElement('p', '', 'Fort, välj ditt vapen och besegra denna best!'),
        $('<div>').addClass('utmanare-div').append($utmanare),
        $vapenDiv
    );
}

// Generic defeat screen
function showDefeat(message) {
    const $gameElement = getGame();
    if (!$gameElement.length) return;

    const $heading = createElement('h1', '', 'Du är inte värdig.').css('lineHeight', '1');
    const $paragraph = createElement('p', '', message);
    const $retryButton = createElement('button', 'retry-button', 'Spela igen')
        .attr('type', 'button').on('click', () => resetGame($gameElement));
    
    setGameContent($gameElement, $heading, $paragraph, $retryButton);
}

// ===== QUIZ STAGE =====
function quiz() {
    const $gameElement = getGame();
    if (!$gameElement.length) return;
    
    $gameElement.empty();
    
    const $heading = $('<h1>').text('Utmanaren besegrad!');
    const $paragraph = $('<p>').text('Svara rätt på Filosofens prövning för att bevisa att du inte bara är modig och kan slåss, utan att du också är vis och kunnig.');
    const $questionPara = $('<p>').addClass('quiz-question').text('Fråga: Vad är din karaktärs namn? (har du varit uppmärksam?)');
    const $inputField = $('<input type="text">').addClass('quiz-input').attr('placeholder', 'Skriv ditt svar här...');
    const $submitButton = $('<button type="button">').addClass('cta').text('Skicka svar');
    
    $submitButton.on('click', () => {
        const rawAnswer = $inputField.val();
        const answer = sanitizeInput(rawAnswer);
        const correctAnswer = 'kido';
        
        if (answer.toLowerCase().trim() === correctAnswer.toLowerCase()) {
            afterquiz();
        } else {
            showDefeat('Du har ett uselt minne och har redan glömt bort ditt mål.');
        }
    });
    
    $inputField.on('keypress', (e) => {
        if (e.key === 'Enter') {
            $submitButton.click();
        }
    });
    
    $gameElement.append($heading, $paragraph, $questionPara, $inputField, $submitButton);
}

function afterquiz() {
    const $gameElement = getGame();
    if (!$gameElement.length) return;
    
    const $continueButton = createElement('button', 'cta', 'Fortsätt äventyret')
        .attr('type', 'button').on('click', findit);
    
    setGameContent($gameElement,
        createElement('h1', '', 'Kido är sannerligen ditt namn.'),
        createElement('p', '', 'Du har bevisat att du är mentalt kapabel att leda ett land och får nu fortsätta din resa.'),
        $continueButton
    );
}

// ===== FIND IT GAME =====
function findit() {
    const $gameElement = getGame();
    if (!$gameElement.length) return;
    
    setGameContent($gameElement, createElement('h1', '', 'Find it.'));
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const correctIndex = Math.floor(Math.random() * 5);
    
    colors.forEach((color, i) => {
        const $div = $('<div>').addClass('hiddenDiv').css({
            top: `${Math.random() * 70 + 10}%`,
            left: `${Math.random() * 70 + 10}%`,
            backgroundColor: color
        }).on('click', i === correctIndex ? showFindItSuccess : secondChance);
        
        $gameElement.append($div);
    });
}

function showFindItSuccess() {
    const $gameElement = getGame();
    if (!$gameElement.length) return;
    
    const $continueButton = createElement('button', 'cta', 'Nästa utmaning')
        .attr('type', 'button').on('click', lastStep);
    
    setGameContent($gameElement,
        createElement('h1', '', 'Du hittade den!'),
        createElement('p', '', 'Tack! Den är väldigt viktig för mig, jag lovar.'),
        $continueButton
    );
}

function lastStep() {
    const $gameElement = getGame();
    if (!$gameElement.length) return;
    
    const $continueButton = createElement('button', 'cta', 'Bevisa din värdighet')
        .attr('type', 'button').on('click', finalChallenge);
    
    setGameContent($gameElement,
        createElement('h1', '', 'Det sista steget'),
        createElement('p', '', 'Du har kommit längre än de flesta före dig och legenden verkar komma närmre sanning för varje steg. Nu väntar den sista prövningen... Är du värdig?'),
        $continueButton
    );
}

function secondChance() {
    const $gameElement = getGame();
    if (!$gameElement.length) return;
    
    const $retryButton = createElement('button', 'cta', 'Försök igen')
        .attr('type', 'button').on('click', findit);
    const $giveUpButton = createElement('button', 'retry-button give-up-button', 'Ge upp')
        .attr('type', 'button').on('click', () => resetGame($gameElement));
    
    setGameContent($gameElement,
        createElement('h1', '', 'Fel val!'),
        createElement('p', '', 'Du klickade på fel sak. Försök igen?'),
        $retryButton,
        $giveUpButton
    );
}


// ===== FINAL CHALLENGE =====
function finalChallenge() {
    const $gameElement = getGame();
    if (!$gameElement.length) return;
    const gameElement = $gameElement[0]; // Keep native reference for particle system
    
    $gameElement.empty().addClass('final-challenge');
    
    const $heading = $('<h1>').text('Den sista prövningen');
    const $paragraph = $('<p>').text('Hitta den dolda fienden genom att använda rök-partiklarna...');
    
    $gameElement.append($heading, $paragraph);
    
    // After 3 seconds, animate heading and paragraph to top left
    setTimeout(() => {
        $heading.addClass('positioned');
        $paragraph.addClass('positioned');
    }, 3000);
    
    // Create custom cursor dot
    const $cursorDot = $('<div>').addClass('cursor-dot');
    $gameElement.append($cursorDot);
    
    // Create finalLevel div for particles
    const $finalLevel = $('<div>').addClass('finalLevel');
    $gameElement.append($finalLevel);
    const finalLevel = $finalLevel[0];
    
    // Create hidden enemy div with complex shape
    const $hiddenEnemy = $('<div>').addClass('hiddenEnemy');
    $gameElement.append($hiddenEnemy);
    const hiddenEnemy = $hiddenEnemy[0];
    
    // Health bar container
    const $healthBarContainer = $('<div>').addClass('health-bar-container');
    const $healthBar = $('<div>').addClass('health-bar');
    const $healthBarText = $('<span>').addClass('health-bar-text').text('H E A L T H   B A R');
    
    $healthBarContainer.append($healthBar, $healthBarText);
    $gameElement.append($healthBarContainer);
    
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
            this.element.className = 'particle';
            this.element.style.width = this.size + 'px';
            this.element.style.height = this.size + 'px';
            this.element.style.backgroundColor = `rgba(255, 204, 0, ${this.opacity})`;
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
                flash.className = 'collision-flash';
                flash.style.left = this.x + 'px';
                flash.style.top = this.y + 'px';
                finalLevel.appendChild(flash);
                
                setTimeout(() => {
                    if (flash.parentNode) {
                        flash.parentNode.removeChild(flash);
                    }
                }, 100);
                
                // Reveal enemy briefly - only if not red from click
                if (!isEnemyRedFromClick) {
                    hiddenEnemy.classList.add('collision');
                    
                    setTimeout(() => {
                        if (!isEnemyRedFromClick) {
                            hiddenEnemy.classList.remove('collision');
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
    $gameElement.on('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseInGame = true;
        
        const rect = gameElement.getBoundingClientRect();
        $cursorDot.css({
            left: (mouseX - rect.left) + 'px',
            top: (mouseY - rect.top) + 'px'
        });
    });
    
    $gameElement.on('mouseleave', () => {
        isMouseInGame = false;
        $cursorDot.hide();
    });
    
    $gameElement.on('mouseenter', () => {
        $cursorDot.show();
    });
    
    // Change cursor dot color when hovering enemy
    $hiddenEnemy.on('mouseenter', () => {
        $cursorDot.addClass('enemy-hover');
    });
    
    $hiddenEnemy.on('mouseleave', () => {
        $cursorDot.removeClass('enemy-hover');
    });
    
    // Click on hidden enemy to damage it
    $hiddenEnemy.on('click', () => {
        enemyHealth--;
        
        // Update health bar
        const healthPercent = (enemyHealth / maxHealth) * 100;
        $healthBar.css('width', healthPercent + '%');
        
        // Flash effect on click - red for 300ms
        isEnemyRedFromClick = true;
        $hiddenEnemy.addClass('damaged');
        
        setTimeout(() => {
            isEnemyRedFromClick = false;
            $hiddenEnemy.removeClass('damaged');
        }, 300);
        
        // Check if enemy is defeated
        if (enemyHealth <= 0) {
            particles.forEach(p => p.remove());
            particles.length = 0;
            $finalLevel.remove();
            $hiddenEnemy.remove();
            $cursorDot.remove();
            $healthBarContainer.remove();
            
            $gameElement.empty().removeClass('final-challenge').addClass('cta');
            
            const $winHeading = $('<h1>').text('Du är den utvalda!');
            const $winParagraph = $('<p>').text('Du har klarat alla prövningar och bevisat din värdighet. Legenden var sann!');
            
            $gameElement.append($winHeading, $winParagraph);
            
            // Trigger the "Den utvalda" achievement
            $gameElement.addClass('game-victory');
            // Simulate a click to trigger the achievement
            setTimeout(() => {
                $gameElement.click();
            }, 100);
        }
    });
    
    animate();
}

// ===== GAME RESET =====
function resetGame($gameElement) {
    const $container = $gameElement.closest('.game-container');
    if (!$container.length) return;

    const initialMarkup = $gameElement.data('initialMarkup');
    if (!initialMarkup) return;

    $gameElement.html(initialMarkup).removeClass('started').addClass('cta');
    $gameElement.find('.imgdice1').attr('src', '../Styles/images/dice6.png');

    $container.one('click', startGame);
}
