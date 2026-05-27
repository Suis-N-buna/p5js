// ============================================================
// 🎬 인트로 및 스테이지 전환 시스템
// ============================================================

let introFrame = 0;
let stage2IntroFrame = 0;

// ============================================================
// 1️⃣ 게임 시작 초반 인트로 (원본 유지)
// ============================================================
function startIntro()
{
  introFrame++;

  background(5, 8, 25);

  drawIntroSpace();
  drawIntroUFO();
  drawIntroPlayer();
  drawIntroText();

  // 인트로 끝나면 1스테이지 시작
  if(introFrame > 420)
  {
    introFrame = 0;
    gameState = "stage1Playing";
    loadStage();
    respawnPlayer();
  }
}

function drawIntroSpace()
{
  noStroke();
  for(let i = 0; i < 80; i++)
  {
    let x = (i * 97 + introFrame * 0.2) % width;
    let y = (i * 53) % height;
    fill(255, 200);
    circle(x, y, 2);
  }

  fill(30, 120, 230);
  circle(width * 0.8, height * 0.85, 250);

  fill(80, 200, 100);
  ellipse(width * 0.76, height * 0.82, 80, 40);
  ellipse(width * 0.84, height * 0.9, 100, 50);
}

function drawIntroUFO()
{
  let ufoX;
  let ufoY;

  if(introFrame < 120)
  {
    ufoX = map(introFrame, 0, 120, -150, width / 2);
    ufoY = height * 0.25;
  }
  else
  {
    ufoX = width / 2;
    ufoY = height * 0.25;
  }

  push();
  translate(ufoX, ufoY);
  noStroke();
  fill(160);
  ellipse(0, 0, 180, 50);

  fill(90, 180, 255);
  ellipse(0, -20, 80, 45);

  fill(255, 255, 100);
  circle(-55, 5, 12);
  circle(0, 10, 12);
  circle(55, 5, 12);

  if(introFrame > 120 && introFrame < 300)
  {
    fill(120, 220, 255, 80);
    triangle(0, 20, -35, height * 0.55, 35, height * 0.55);
  }
  pop();
}

function drawIntroPlayer()
{
  let playerX = width / 2;
  let playerY;

  if(introFrame < 120)
  {
    playerY = height * 0.78;
  }
  else if(introFrame < 300)
  {
    playerY = map(introFrame, 120, 300, height * 0.78, height * 0.32);
  }
  else
  {
    playerY = height * 0.32;
  }

  if(introFrame < 320)
  {
    push();
    rectMode(CENTER);
    stroke(0);
    strokeWeight(3);
    fill(255);
    rect(playerX, playerY, 45, 45);

    fill(0);
    noStroke();
    circle(playerX - 10, playerY - 5, 5);
    circle(playerX + 10, playerY - 5, 5);
    ellipse(playerX, playerY + 10, 8, 12);
    pop();
  }

  if(introFrame > 300)
  {
    fill(0, map(introFrame, 300, 420, 0, 220));
    rect(0, 0, width, height);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(28);
    text("외계 연구소에 납치되었다...", width / 2, height / 2);
  }
}

function drawIntroText()
{
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);

  if(introFrame < 120)
  {
    text("평화로운 우주 근처...", width / 2, height - 80);
  }
  else if(introFrame < 300)
  {
    text("갑자기 UFO가 주인공을 끌고 간다!", width / 2, height - 80);
  }
  else
  {
    text("탈출해야 한다.", width / 2, height - 80);
  }
}


// ============================================================
// 2️⃣ 🚀 1스테이지 → 2스테이지 전환 (설명 시간 연장 버전)
// ============================================================
function drawStage2Intro()
{
  stage2IntroFrame++;

  // 매 프레임 그리기 상태 초기화
  push();
  imageMode(CORNER);
  rectMode(CORNER);
  noStroke();
  background(10, 15, 30);

  // 간단한 별 배경
  fill(255, 210);
  for(let i = 0; i < 80; i++)
  {
    let sx = (i * 97 + stage2IntroFrame * 0.4) % width;
    let sy = (i * 53) % height;
    circle(sx, sy, 2);
  }

  pop();

  let shipX = width * 0.72;
  let shipY = height * 0.66;

  // 우주선 발사
  let currentShipY = shipY;

  if(stage2IntroFrame > 420)
  {
    currentShipY = map(stage2IntroFrame, 420, 520, shipY, -180);
  }

  if(stage2IntroFrame <= 520)
  {
    drawCutsceneShip(shipX, currentShipY, stage2IntroFrame > 420);
  }

  // 0~130: 폭탄 설치 후 우주선으로 이동
  if(stage2IntroFrame <= 130)
  {
    let playerX = map(stage2IntroFrame, 0, 130, width * 0.12, shipX - 40);

    drawBomb(width * 0.16, shipY + 25);

    push();
    rectMode(CENTER);
    stroke(0);
    strokeWeight(2);
    fill(255);
    rect(playerX, shipY + 25, 30, 30);
    pop();

    drawCutsceneText("폭탄 설치 완료. 우주선으로 탈출한다!");
  }

  // 130~300: 아이템 합체
  else if(stage2IntroFrame <= 300)
  {
    drawSimpleItemFusion(width / 2, height * 0.38);
    drawCutsceneText("3개의 아이템이 하나로 합쳐진다.");
  }

  // 300~420: 무적 보석 완성
  else if(stage2IntroFrame <= 420)
  {
    drawFusionGem(width / 2, height * 0.38);
    drawCutsceneText("무적 보석 완성. 보스전에서 획득하자!");
  }

  // 420~520: 발사
  else
  {
    drawCutsceneText("출격!");
  }

  if(stage2IntroFrame > 520)
  {
    stage2IntroFrame = 0;
    gameState = "stage2Playing";

    if(typeof loadStage2 === "function")
    {
      loadStage2();
    }
  }
}



function drawCutsceneText(msg)
{
  push();
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  text(msg, width / 2, height * 0.15);
  pop();
}

function drawCutsceneShip(x, y, launch)
{
  push();
  translate(x, y);
  rectMode(CENTER);
  noStroke();

  // 날개
  fill(95);
  triangle(-26, 10, -58, 45, -22, 38);
  triangle(26, 10, 58, 45, 22, 38);

  // 몸체
  fill(165);
  rect(0, 5, 54, 72, 10);

  // 대가리/기수
  fill(210);
  triangle(-27, -25, 27, -25, 0, -68);

  // 창문
  fill(70, 190, 255);
  ellipse(0, -16, 24, 20);

  // 엔진
  fill(70);
  rect(0, 43, 24, 12, 4);

  if(launch)
  {
    fill(255, 130, 0, 210);
    ellipse(0, 60, 28, random(45, 80));

    fill(255, 230, 0, 220);
    ellipse(0, 55, 14, random(25, 45));
  }

  pop();
}

function drawSimpleItemFusion(x, y)
{
  push();
  imageMode(CENTER);
  noStroke();

  let t = sin(frameCount * 0.08) * 8;

  if(gravityImg) image(gravityImg, x - 140 + t, y, 85, 85);
  if(sizeImg) image(sizeImg, x, y + t, 85, 85);
  if(micImg) image(micImg, x + 140 - t, y, 85, 85);

  // 노란색 원 제거: 아이템 이미지만 보이게 함
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("FUSION", x, y + 100);

  pop();
}

function drawFusionGem(x, y)
{
  push();

  noStroke();

  // 노란색 원 제거: 보석 모양만 표시
  fill(255, 245, 120);
  beginShape();
  vertex(x, y - 70);
  vertex(x + 55, y - 15);
  vertex(x + 35, y + 60);
  vertex(x - 35, y + 60);
  vertex(x - 55, y - 15);
  endShape(CLOSE);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("INVINCIBLE GEM", x, y + 110);

  pop();
}

function drawIntroUIBox(x, y, w, h, title) {
  push();
  rectMode(CENTER);
  fill(15, 24, 42, 235);
  stroke(0, 130, 255);
  strokeWeight(2);
  rect(x, y, w, h, 12);
  
  stroke(0, 255, 240);
  strokeWeight(3);
  line(x - w/2, y - h/2 + 20, x - w/2, y - h/2);
  line(x - w/2, y - h/2, x - w/2 + 20, y - h/2);
  line(x + w/2, y + h/2 - 20, x + w/2, y + h/2);
  line(x + w/2, y + h/2, x + w/2 - 20, y + h/2);

  noStroke();
  fill(0, 110, 255, 75);
  rect(x, y - h/2 + 22, w - 24, 28, 4);
  
  fill(0, 255, 240);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(title, x, y - h/2 + 22);
  pop();
}

function drawBomb(x, y)
{
  push();
  translate(x, y);
  noStroke();
  fill(35);
  ellipse(0, 0, 45, 45);

  stroke(255, 90, 0);
  strokeWeight(4);
  line(10, -20, 25, -38);

  noStroke();
  if(frameCount % 20 < 10) fill(255, 0, 0);
  else fill(90, 0, 0);
  circle(28, -42, 10);
  pop();
}