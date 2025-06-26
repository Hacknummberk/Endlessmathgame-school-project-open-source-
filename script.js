let level = 1;
let correctAnswer = 0;
let timer = 3600;

function generateQuestion() {
  let max = level * 5 + 5;
  let a = Math.floor(Math.random() * max);
  let b = Math.floor(Math.random() * max);
  let opList = ['+', '-', '*', '/'];
  let op = opList[Math.floor(Math.random() * opList.length)];
  if (op === '/' && b !== 0) {
    a = a * b;
  } else if (op === '/' && b === 0) {
    b = 1;
  }
  correctAnswer = eval(`${a} ${op} ${b}`);
  correctAnswer = parseFloat(correctAnswer.toFixed(2));
  document.getElementById('question').innerText = `${a} ${op} ${b} = ?`;
}

function checkAnswer() {
  const input = parseFloat(document.getElementById('answer').value);
  if (Math.abs(input - correctAnswer) < 0.01) {
    level++;
    document.getElementById('level').innerText = level;
    document.getElementById('status').innerText = "✅ ถูกต้อง! ไปต่อเลย!";
    document.getElementById('answer').value = '';
    generateQuestion();
  } else {
    document.getElementById('status').innerText = "❌ ผิด! เกมจบแล้ว";
    document.querySelector('button').disabled = true;
    clearInterval(countdown);
  }
}

const countdown = setInterval(() => {
  timer--;
  let min = Math.floor(timer / 60);
  let sec = timer % 60;
  document.getElementById('timer').innerText = `${min}:${sec.toString().padStart(2, '0')}`;
  if (timer <= 0) {
    document.getElementById('status').innerText = "⏰ หมดเวลา!";
    document.querySelector('button').disabled = true;
    clearInterval(countdown);
  }
}, 1000);

generateQuestion();
