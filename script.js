
let level = 1;
let score = 0;
let correctAnswer = 0;
let timer = 600; let countdownInterval;
let currentPlayer = "Guest";
let usersScores = JSON.parse(localStorage.getItem('mathGameHighScores')) || {};

const SECRET_CODE = "061129.08";

const BAD_WORDS = ['kuy', 'hum', 'hee', 'sus', 'dick', 'cock'];

const loadingScreen = document.getElementById('loading-screen'); const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username-input');
const currentPlayerSpan = document.getElementById('current-player');
const levelSpan = document.getElementById('level');
const scoreSpan = document.getElementById('score');
const timerSpan = document.getElementById('timer');
const questionElement = document.getElementById('question');
const answerInput = document.getElementById('answer');
const statusDiv = document.getElementById('status');
const submitButton = document.querySelector('.submit-button'); const howToDiv = document.getElementById('howto');

const wrongAnswerPopup = document.getElementById('wrong-answer-popup');
const correctAnswerDisplay = document.getElementById('correct-answer-display');
const leaderboardPopup = document.getElementById('leaderboard-popup');
const leaderboardList = document.getElementById('leaderboard-list');
const leaderboardListPreview = document.getElementById('leaderboard-list-preview');

const secretMessagePopup = document.getElementById('secret-message-popup');
const secretMessageTitle = document.getElementById('secret-message-title');
const secretMessageText = document.getElementById('secret-message-text');


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundToDecimal(num, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
}

function loginUser() {
    const username = usernameInput.value.trim();

        const lowerCaseUsername = username.toLowerCase();
    if (BAD_WORDS.some(word => lowerCaseUsername.includes(word))) {
        alert("ไม่เอาคำไม่ดี (Don't use bad words)");
        usernameInput.value = '';         usernameInput.focus();
        return;     }
    
    if (username) {
        currentPlayer = username;
        currentPlayerSpan.innerText = currentPlayer;
        localStorage.setItem('currentUser', currentPlayer);         
                if (!usersScores[currentPlayer]) {
            usersScores[currentPlayer] = 0;             saveScores();
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
        if (score > usersScores[currentPlayer]) {
        usersScores[currentPlayer] = score;
        saveScores();
    }
}

function displayLeaderboard(listElement) {
    listElement.innerHTML = '';     const sortedScores = Object.entries(usersScores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
    const topScores = sortedScores.slice(0, 10); 
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
    hideWrongAnswerPopup();     hideSecretMessagePopup();     leaderboardPopup.classList.add('active');
}

function hideLeaderboard() {
    leaderboardPopup.classList.remove('active');
}

function showLoginScreen() {
    loginScreen.classList.add('active');
    gameScreen.classList.remove('active');
    wrongAnswerPopup.classList.remove('active');
    leaderboardPopup.classList.remove('active');
    secretMessagePopup.classList.remove('active');
    displayLeaderboard(leaderboardListPreview); }

function showGameScreen() {
    loginScreen.classList.remove('active');
    gameScreen.classList.add('active');
    answerInput.focus();
}

function generateQuestion() {
        questionElement.classList.remove('question-animation');
    void questionElement.offsetWidth;     questionElement.classList.add('question-animation');

    let maxNum = level * 3 + 7;     let opList = ['+', '-', '*', '/', 'sin', 'cos', 'sqrt', 'pow'];
    let op = opList[Math.floor(Math.random() * opList.length)];

    let a, b, questionText;

    switch (op) {
        case 'sin':
        case 'cos':
                                    let angle = getRandomInt(0, 360);
            let angleRadians = angle * (Math.PI / 180);
            if (op === 'sin') {
                correctAnswer = Math.sin(angleRadians);
            } else {                 correctAnswer = Math.cos(angleRadians);
            }
            questionText = `${op}(${angle}°) = ?`;
            correctAnswer = roundToDecimal(correctAnswer, 2);
            break;
        case 'sqrt':
                        a = getRandomInt(1, Math.min(level * 15 + 50, 900));
            correctAnswer = Math.sqrt(a);
            questionText = `√${a} = ?`;
            correctAnswer = roundToDecimal(correctAnswer, 2);
            break;
        case 'pow':
                                                let baseMax = Math.min(level + 7, 12);             let expMax = Math.min(Math.floor(level / 2) + 2, 5); 
            a = getRandomInt(2, baseMax);
            b = getRandomInt(2, expMax);
            
                                                if (a > 6 && b > 3 && level < 15) {                 a = getRandomInt(2, 6);
                b = getRandomInt(2, 3);
            }

            correctAnswer = Math.pow(a, b);
                        if (correctAnswer > 1000000 || !Number.isFinite(correctAnswer)) {                 console.warn("Generated too large power, regenerating...");
                generateQuestion();                 return;             }

            questionText = `${a}<sup>${b}</sup> = ?`;             break;
        default:                         maxNum = level * 10 + 10;
            a = getRandomInt(1, maxNum);
            b = getRandomInt(1, maxNum);
            if (op === '/') {
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
            correctAnswer = roundToDecimal(correctAnswer, 2);             break;
    }

    questionElement.innerHTML = questionText;
    answerInput.value = '';
    answerInput.focus();
    statusDiv.classList.remove('show-status', 'status-correct', 'status-wrong');
}

function checkAnswer() {
    const inputVal = answerInput.value.trim();

        if (inputVal === SECRET_CODE) {
        clearInterval(countdownInterval);         submitButton.disabled = true;         showSecretMessage();
        return;     }
    
    const input = parseFloat(inputVal);

    if (isNaN(input)) {
        statusDiv.innerText = "Please enter a number!";
        statusDiv.classList.add('status-wrong', 'show-status');
        return;
    }

    if (Math.abs(input - correctAnswer) < 0.01) {
        level++;
        updateScore(1);         levelSpan.innerText = level;
        statusDiv.innerText = "✅ Correct! Keep going!";
        statusDiv.classList.remove('status-wrong');
        statusDiv.classList.add('status-correct', 'show-status');
        generateQuestion();
    } else {
        clearInterval(countdownInterval);
        submitButton.disabled = true;
        
        correctAnswerDisplay.innerText = correctAnswer;
        wrongAnswerPopup.classList.add('active');

                if (score > usersScores[currentPlayer]) {
            usersScores[currentPlayer] = score;
            saveScores();
        }
    }
}

function retryGame() {
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

function showSecretMessage() {
    if (score >= 5) {
        secretMessageTitle.innerText = "Wow! You're Smart! 😉";
        secretMessageText.innerText = "อิจฉาคนฉลาดอะ";     } else {
        secretMessageTitle.innerText = "Keep Practicing! 👍";
        secretMessageText.innerText = "สู้ไปน้องเดะก็ฉลาดเอง";     }
    secretMessagePopup.classList.add('active');
}

function hideSecretMessagePopup() {
    secretMessagePopup.classList.remove('active');
        if (timer > 0 && !submitButton.disabled) {         startTimer();         answerInput.focus();     }
}


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
            
                        if (score > usersScores[currentPlayer]) {
                usersScores[currentPlayer] = score;
                saveScores();
            }
        }
    }, 1000);
}

function toggleHowTo() {
    howToDiv.classList.toggle('show-howto');
}

answerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !submitButton.disabled) {
        event.preventDefault();
        checkAnswer();
    }
});

document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
        loadingScreen.classList.add('fade-out');
    }, 500); 
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

displayLeaderboard(leaderboardListPreview);
    
