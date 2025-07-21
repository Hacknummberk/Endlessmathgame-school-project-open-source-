# 📘 คู่มือสำหรับโค้ด Endless Math Game (แบบละเอียด)
## 🧩 โครงสร้างโปรเจกต์

```
/index.html        ← หน้าเว็บหลัก
/styles.css        ← กำหนดรูปลักษณ์ (CSS)
/script.js         ← โค้ดประมวลผลเกม (JavaScript)
```

---

## 1. `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Endless Math Game</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="game">
    <div id="question"></div>
    <div id="answers"></div>
    <div id="score">Score: <span id="scoreValue">0</span></div>
  </div>
  <script src="script.js"></script>
</body>
</html>
```
อธิบาย

``<!DOCTYPE html>``: กำหนดว่าใช้ HTML5

``<html lang="en">``: เอกสารนี้ใช้ภาษาอังกฤษ

``<meta charset="UTF-8">``: ใช้ UTF-8 สำหรับ encoding ตัวอักษร

``<title>``: ชื่อหน้าในแท็บ

``<meta name="viewport">``: ทำให้ responsive บนอุปกรณ์พกพา

``<link rel="stylesheet">``: เชื่อมโยงไปยังไฟล์ CSS

``<div id="game">``: ส่วนหลักของเกม ประกอบด้วย:

#question: แสดงโจทย์

#answers: ปุ่มคำตอบ

#score: คะแนนรวม


``<script src="script.js">``: โหลดไฟล์ JavaScript เมื่อหน้าเว็บเสร็จ



---

2. styles.css
```css
body {
  font-family: Arial, sans-serif;
  background: #f0f0f0;
  margin: 0;
  padding: 20px;
}

#game {
  max-width: 400px;
  margin: auto;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

#question {
  font-size: 24px;
  margin-bottom: 20px;
}

#answers button {
  display: block;
  width: 100%;
  margin: 5px 0;
  padding: 10px;
  font-size: 18px;
  cursor: pointer;
}

button:hover {
  background-color: #e0e0e0;
}
```
อธิบาย

``body``: จัดพื้นหลัง สี และระยะขอบ

``#game``: กล่องเกมอยู่กลางจอ มีเงาและมุมโค้ง

``#question``: แสดงโจทย์ ขนาดใหญ่

``#answers button``: ปรับปุ่มให้ใช้งานง่าย

``:hover:`` เปลี่ยนสีปุ่มเมื่อวางเมาส์



---

3. script.js
```javascript
let score = 0;

function generateQuestion() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const correct = a + b;

  document.getElementById("question").textContent = `${a} + ${b}`;

  const wrong1 = correct + Math.floor(Math.random() * 5) + 1;
  const wrong2 = correct - (Math.floor(Math.random() * 5) + 1);
  const answers = [correct, wrong1, wrong2];
  answers.sort(() => Math.random() - 0.5);

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  answers.forEach(ans => {
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.onclick = () => checkAnswer(ans, correct);
    answersDiv.appendChild(btn);
  });
}

function checkAnswer(selected, correct) {
  if (selected === correct) {
    score++;
    alert("ถูกต้อง!");
  } else {
    alert("ผิด ลองอีกครั้ง");
  }
  document.getElementById("scoreValue").textContent = score;
  generateQuestion();
}

window.onload = () => generateQuestion();
```
อธิบาย

```let score = 0;```: เก็บคะแนนปัจจุบัน

``generateQuestion()``:

สุ่มเลข a กับ b

คำนวณผลบวก correct

สร้างคำตอบผิดอีก 2 ค่า

สลับลำดับคำตอบแบบสุ่ม

สร้างปุ่มคำตอบใน DOM พร้อม onclick


``checkAnswer()``:

ตรวจคำตอบ ถ้าถูก เพิ่มคะแนนและแจ้ง

ถ้าผิด แจ้งเตือน

อัปเดตคะแนนและเรียก ``generateQuestion()`` ใหม่


window.onload: สั่งให้โหลดคำถามแรกเมื่อเข้าเกม



---

🔁 ลำดับการทำงาน

1. หน้าเว็บโหลด → เรียก ``generateQuestion()``


2. คำถามและตัวเลือกปรากฏ


3. ผู้ใช้คลิกคำตอบ → ``checkAnswer()`` ทำงาน


4. อัปเดตคะแนน → เริ่มคำถามใหม่




---

🧾 สรุปโดยย่อ

ส่วนของระบบ	หน้าที่หลัก

HTML	สร้างโครงสร้างเว็บ
CSS	ตกแต่งและจัดหน้า
JavaScript	จัดการตรรกะเกม


---
