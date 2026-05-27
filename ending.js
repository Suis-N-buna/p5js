// ending.js

let endingFrame = 0;

function startEnding() {
  background(0); // 검은 배경
  
  // 페이드인 효과 (검은 화면에서 텍스트가 서서히 나타남)
  let textAlpha = map(endingFrame, 0, 200, 0, 255);
  textAlpha = constrain(textAlpha, 0, 255);

  push();
  fill(255, textAlpha);
  textAlign(CENTER, CENTER);
  
  // 엔딩 크레딧 내용
  textSize(50);
  text("ENDING CREDITS", width / 2, height / 2 - 100);
  
  textSize(25);
  text("Developed by [본인 이름/팀명]", width / 2, height / 2);
  text("Thank you for playing!", width / 2, height / 2 + 50);
  
  // 5초(약 300프레임) 후 클릭 시 타이틀로 돌아가는 안내
  if (endingFrame > 300) {
    let blink = map(sin(frameCount * 0.1), -1, 1, 100, 255);
    fill(200, blink);
    textSize(18);
    text("- 화면을 클릭하면 타이틀 화면으로 돌아갑니다 -", width / 2, height * 0.8);
  }
  pop();

  endingFrame++;
}

// 마우스 클릭 시 타이틀로 이동
function checkEndingClick() {
  if (endingFrame > 300) {
    endingFrame = 0;
    gameState = "title"; // 타이틀 화면 상태로 전환
  }
}