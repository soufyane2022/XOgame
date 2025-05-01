const cells = document.querySelectorAll('.cyber-cell');
const status = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const bgMusic = document.getElementById('bgMusic');
const muteBtn = document.getElementById('muteBtn');

let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let isMuted = true; // Start muted to comply with autoplay policies
let audioInitialized = false;

const winCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const sounds = {
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    win: new Audio('https://assets.mixkit.co/active_storage/sfx/2591/2591-preview.mp3'),
    draw: new Audio('https://assets.mixkit.co/active_storage/sfx/2590/2590-preview.mp3')
};

// Initialize audio system
function initAudio() {
    if (audioInitialized) return;
    audioInitialized = true;
    
    try {
        // Set initial volume and mute state
        bgMusic.volume = 0.3;
        bgMusic.muted = isMuted;
        
        // Initialize sound effects
        Object.values(sounds).forEach(sound => {
            sound.volume = 0.5;
            sound.muted = isMuted;
        });
        
        // Try to start background music
        bgMusic.play().catch(error => {
            console.log('Autoplay prevented. Click MUTE button to start audio.');
        });
        
    } catch (error) {
        console.error('Audio initialization error:', error);
    }
}

// Audio control functions
function playSound(sound) {
    if (!audioInitialized || isMuted) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
    setTimeout(() => sound.pause(), 2000);
}

function toggleMute() {
    if (!audioInitialized) {
        initAudio();
        setTimeout(() => toggleMute(), 100);
        return;
    }
    
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    muteBtn.classList.toggle('muted', isMuted);
    
    // Update sound effects mute state
    Object.values(sounds).forEach(sound => {
        sound.muted = isMuted;
    });
    
    // If unmuting, try to resume playback
    if (!isMuted) {
        bgMusic.play().catch(error => {
            console.log('Audio playback error:', error);
        });
    }
}

// Game logic functions
function handleMove(cell, index) {
    if (!gameActive || gameState[index] !== '') return;
    
    gameState[index] = currentPlayer;
    cell.classList.add(currentPlayer === 'X' ? 'x-symbol' : 'o-symbol');
    cell.textContent = currentPlayer;
    playSound(sounds.click);

    if (checkWin()) {
        endGame(currentPlayer);
        return;
    }

    if (checkDraw()) {
        endGame();
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `PLAYER ${currentPlayer} TURN`;
}

function checkWin() {
    return winCombos.some(combo => 
        combo.every(index => gameState[index] === currentPlayer)
    );
}

function checkDraw() {
    return gameState.every(cell => cell !== '');
}

function endGame(winner = null) {
    gameActive = false;
    status.classList[winner ? 'add' : 'remove']('win-animation');
    
    if (winner) {
        status.textContent = `PLAYER ${winner} VICTORY`;
        playSound(sounds.win);
        createWinEffects();
    } else {
        status.textContent = 'SYSTEM DRAW';
        playSound(sounds.draw);
    }
}

function createWinEffects() {
    for (let i = 0; i < 50; i++) {
        createParticle();
    }
}

function createParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: ${currentPlayer === 'X' ? '#00f3ff' : '#ff00ff'};
        border-radius: 50%;
        pointer-events: none;
    `;
    document.body.appendChild(particle);

    anime({
        targets: particle,
        translateX: (Math.random() - 0.5) * 500,
        translateY: (Math.random() - 0.5) * 500,
        opacity: [1, 0],
        scale: [1, 3],
        duration: 1000 + Math.random() * 500,
        easing: 'easeOutExpo',
        complete: () => particle.remove()
    });
}

function resetGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    status.textContent = 'PLAYER X TURN';
    status.classList.remove('win-animation');
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x-symbol', 'o-symbol');
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio system on first user interaction
    document.addEventListener('click', initAudio, { once: true });
});

cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleMove(cell, index));
});

resetBtn.addEventListener('click', resetGame);
muteBtn.addEventListener('click', toggleMute);