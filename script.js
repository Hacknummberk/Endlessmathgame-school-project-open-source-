// Game State Variables
let level = 1;
let score = 0;
let correctAnswer = 0;
let timer = 600; // 10 minutes in seconds
let countdownInterval;
let currentPlayer = "Guest";
let usersScores = JSON.parse(localStorage.getItem('mathGameHighScores')) || {};

// Secret code
const SECRET_CODE = "061129.08";

// Profanity list for username filter (case-insensitive)
const BAD_WORDS = ['kuy', 'hum', 'hee', 'sus', 'dick', 'cock'];

// DOM Elements
const loadingScreen = document.getElementById('loading-screen'); // New: Loading screen element
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username-input');
const currentPlayerSpan = document.getElementById('current-player');
const levelSpan = document.getElementById('level');
const scoreSpan = document.getElementById('score');
const timerSpan = document.getElementById('timer');
const questionElement = document.getElementById('question');
const answerInput = document.getElementById('answer');
const statusDiv = document.getElementById('status');
const submitButton = document.querySelector('.submit-button'); // Use specific class
const howToDiv = document.getElementById('howto');

const wrongAnswerPopup = document.getElementById('wrong-answer-popup');
const correctAnswerDisplay = document.getElementById('correct-answer-display');
const leaderboardPopup = document.getElementById('leaderboard-popup');
const leaderboardList = document.getElementById('leaderboard-list');
const leaderboardListPreview = document.getElementById('leaderboard-list-preview');

const secretMessagePopup = document.getElementById('secret-message-popup');
const secretMessageTitle = document.getElementById('secret-message-title');
const secretMessageText = document.getElementById('secret-message-text');


// --- Utility Functions ---
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundToDecimal(num, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
}

// --- Login & Score Management ---
function loginUser() {
    const username = usernameInput.value.trim();

    // --- Profanity Filter Check ---
    const lowerCaseUsername = username.toLowerCase();
    if (BAD_WORDS.some(word => lowerCaseUsername.includes(word))) {
        alert("ไม่เอาคำไม่ดี (Don't use bad words)");
        usernameInput.value = ''; // Reset input
        usernameInput.focus();
        return; // Stop the function here
    }
    // --- End Profanity Filter ---

    if (username) {
        currentPlayer = username;
        currentPlayerSpan.innerText = currentPlayer;
        localStorage.setItem('currentUser', currentPlayer); // Store current user for persistence
        
        // Initialize score if new user, otherwise load existing high score
        if (!usersScores[currentPlayer]) {
            usersScores[currentPlayer] = 0; // New user starts with 0 high score
            saveScores();
        }
        
        showGameScreen();
        generateQuestion();
        startTimer();
    } else {
        alert("Please enter your name to start the game!");
        usernameInput.focus();
    }
}

function saveScores() {
    localStorage.setItem('mathGameHighScores', JSON.stringify(usersScores));
}

function updateScore(points) {
    score += points;
    scoreSpan.innerText = score;
    // Update high score for current player if exceeded
    if (score > usersScores[currentPlayer]) {
        usersScores[currentPlayer] = score;
        saveScores();
    }
}

function displayLeaderboard(listElement) {
    listElement.innerHTML = ''; // Clear existing list
    const sortedScores = Object.entries(usersScores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
    const topScores = sortedScores.slice(0, 10); // Display top 10

    if (topScores.length === 0) {
        listElement.innerHTML = '<li>No scores yet. Be the first!</li>';
        return;
    }

    topScores.forEach(([user, userScore], index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span>${index + 1}. ${user}</span><span>${userScore}</span>`;
        listElement.appendChild(listItem);
    });
}

function showLeaderboard() {
    displayLeaderboard(leaderboardList);
    hideWrongAnswerPopup(); // Ensure wrong answer popup is hidden
    hideSecretMessagePopup(); // Ensure secret message popup is hidden
    leaderboardPopup.classList.add('active');
}

function hideLeaderboard() {
    leaderboardPopup.classList.remove('active');
}

// --- Screen Management ---
function showLoginScreen() {
    loginScreen.classList.add('active');
    gameScreen.classList.remove('active');
    wrongAnswerPopup.classList.remove('active');
    leaderboardPopup.classList.remove('active');
    secretMessagePopup.classList.remove('active');
    displayLeaderboard(leaderboardListPreview); // Show preview on login screen
}

function showGameScreen() {
    loginScreen.classList.remove('active');
    gameScreen.classList.add('active');
    answerInput.focus();
}

// --- Game Logic ---
function generateQuestion() {
    // Re-trigger question animation
    questionElement.classList.remove('question-animation');
    void questionElement.offsetWidth; // Trigger reflow
    questionElement.classList.add('question-animation');

    let maxNum = level * 3 + 7; // Basic max for simple ops
    let opList = ['+', '-', '*', '/', 'sin', 'cos', 'sqrt', 'pow'];
    let op = opList[Math.floor(Math.random() * opList.length)];

    let a, b, questionText;

    switch (op) {
        case 'sin':
        case 'cos':
            // Generate angles across the full 360 degrees for variety.
            // Result will be rounded to 2 decimal places.
            let angle = getRandomInt(0, 360);
            let angleRadians = angle * (Math.PI / 180);
            if (op === 'sin') {
                correctAnswer = Math.sin(angleRadians);
            } else { // cos
                correctAnswer = Math.cos(angleRadians);
            }
            questionText = `${op}(${angle}°) = ?`;
            correctAnswer = roundToDecimal(correctAnswer, 2);
            break;
        case 'sqrt':
            // Increase max for sqrt up to a reasonable limit (e.g., 900 for sqrt(900)=30)
            a = getRandomInt(1, Math.min(level * 15 + 50, 900));
            correctAnswer = Math.sqrt(a);
            questionText = `√${a} = ?`;
            correctAnswer = roundToDecimal(correctAnswer, 2);
            break;
        case 'pow':
            // Increase complexity for power problems:
            // Base can go up to 12. Exponent up to 5.
            // Ensure results don't exceed a reasonable max (e.g., 100,000 to prevent overflow/too large numbers)
            let baseMax = Math.min(level + 7, 12); // Base up to 12
            let expMax = Math.min(Math.floor(level / 2) + 2, 5); // Exponent up to 5

            a = getRandomInt(2, baseMax);
            b = getRandomInt(2, expMax);
            
            // Prevent excessively large numbers for higher levels (e.g., 12^5 is already big)
            // Limit to values that won't result in numbers over, say, 1,000,000 for quick calculation.
            // This is a rough heuristic. Adjust as needed.
            if (a > 6 && b > 3 && level < 15) { // If base and exp are somewhat large, and level isn't super high, reduce.
                a = getRandomInt(2, 6);
                b = getRandomInt(2, 3);
            }

            correctAnswer = Math.pow(a, b);
            // If correctAnswer is extremely large, re-generate.
            if (correctAnswer > 1000000 || !Number.isFinite(correctAnswer)) { // Cap at 1 million, or if it becomes infinity
                console.warn("Generated too large power, regenerating...");
                generateQuestion(); // Recursive call to get a new question
                return; // Exit this call
            }

            questionText = `${a}<sup>${b}</sup> = ?`; // HTML for superscript
            break;
        default: // +, -, *, /
            // Max number can increase more significantly
            maxNum = level * 10 + 10;
            a = getRandomInt(1, maxNum);
            b = getRandomInt(1, maxNum);
            if (op === '/') {
                // Ensure 'a' is a multiple of 'b' for cleaner division results
                // Or allow floats and round them
                const multiple = getRandomInt(1, Math.floor(maxNum / b) || 1);
                a = b * multiple;
            }
            switch (op) {
                case '+': correctAnswer = a + b; break;
                case '-': correctAnswer = a - b; break;
                case '*': correctAnswer = a * b; break;
                case '/': correctAnswer = a / b; break;
            }
            questionText = `${a} ${op} ${b} = ?`;
            correctAnswer = roundToDecimal(correctAnswer, 2); // Round for division, just in case
            break;
    }

    questionElement.innerHTML = questionText;
    answerInput.value = '';
    answerInput.focus();
    statusDiv.classList.remove('show-status', 'status-correct', 'status-wrong');
}

function checkAnswer() {
    const inputVal = answerInput.value.trim();

    // --- Secret Code Check ---
    if (inputVal === SECRET_CODE) {
        clearInterval(countdownInterval); // Pause game
        submitButton.disabled = true; // Disable submit button
        showSecretMessage();
        return; // Exit function, don't treat as a regular answer
    }
    // --- End Secret Code Check ---

    const input = parseFloat(inputVal);

    if (isNaN(input)) {
        statusDiv.innerText = "Please enter a number!";
        statusDiv.classList.add('status-wrong', 'show-status');
        return;
    }

    if (Math.abs(input - correctAnswer) < 0.01) {
        level++;
        updateScore(1); // Increment score for correct answer
        levelSpan.innerText = level;
        statusDiv.innerText = "✅ Correct! Keep going!";
        statusDiv.classList.remove('status-wrong');
        statusDiv.classList.add('status-correct', 'show-status');
        generateQuestion();
    } else {
        clearInterval(countdownInterval);
        submitButton.disabled = true;
        
        correctAnswerDisplay.innerText = correctAnswer;
        wrongAnswerPopup.classList.add('active');

        // Update high score if current score is higher
        if (score > usersScores[currentPlayer]) {
            usersScores[currentPlayer] = score;
            saveScores();
        }
    }
}

function retryGame() {
    // Reset game state
    level = 1;
    score = 0;
    timer = 600;

    levelSpan.innerText = level;
    scoreSpan.innerText = score;
    timerSpan.innerText = '10:00';
    
    submitButton.disabled = false;
    hideWrongAnswerPopup();

    startTimer();
    generateQuestion();
}

function hideWrongAnswerPopup() {
    wrongAnswerPopup.classList.remove('active');
}

// --- Secret Message Logic ---
function showSecretMessage() {
    if (score >= 5) {
        secretMessageTitle.innerText = "Wow! You're Smart! 😉";
        secretMessageText.innerText = "อิจฉาคนฉลาดอะ"; // Envy smart people
    } else {
        secretMessageTitle.innerText = "Keep Practicing! 👍";
        secretMessageText.innerText = "สู้ไปน้องเดะก็ฉลาดเอง"; // Fight on, little one, you'll be smart too
    }
    secretMessagePopup.classList.add('active');
}

function hideSecretMessagePopup() {
    secretMessagePopup.classList.remove('active');
    // After secret message, resume game if it was active
    if (timer > 0 && !submitButton.disabled) { // Only if game wasn't over
        startTimer(); // Resume timer
        answerInput.focus(); // Re-focus input
    }
}


// --- Timer Functionality ---
function startTimer() {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        timer--;
        let min = Math.floor(timer / 60);
        let sec = timer % 60;
        timerSpan.innerText = `${min}:${sec.toString().padStart(2, '0')}`;

        if (timer <= 0) {
            clearInterval(countdownInterval);
            submitButton.disabled = true;
            statusDiv.innerText = "⏰ Time's up! Game Over!";
            statusDiv.classList.remove('status-correct');
            statusDiv.classList.add('status-wrong', 'show-status');

            correctAnswerDisplay.innerText = correctAnswer;
            wrongAnswerPopup.classList.add('active');
            
            // Update high score even if time runs out
            if (score > usersScores[currentPlayer]) {
                usersScores[currentPlayer] = score;
                saveScores();
            }
        }
    }, 1000);
}

// --- How To Play Toggle ---
function toggleHowTo() {
    howToDiv.classList.toggle('show-howto');
}

// --- Event Listeners ---
answerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !submitButton.disabled) {
        event.preventDefault();
        checkAnswer();
    }
});

// --- Initial Setup & Loading Screen ---
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen after a short delay to allow content to render
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
    }, 500); // 500ms delay for the fade-out to begin

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        usernameInput.value = storedUser;
        currentPlayer = storedUser;
        currentPlayerSpan.innerText = currentPlayer;
        showGameScreen();
        generateQuestion();
        startTimer();
    } else {
        showLoginScreen();
    }
});

// Initialize leaderboard preview on login screen
displayLeaderboard(leaderboardListPreview);
    
