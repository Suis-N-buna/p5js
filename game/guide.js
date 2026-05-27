// guide.js

let guidePlatform = null;

let guideSpawnX = 0;
let guideSpawnY = 0;

let guideReady = false;
let guideLastW = 0;
let guideLastH = 0;

// =========================
// 지구 포탈
// =========================

let earthX = 0;
let earthY = 0;
let earthR = 300;

// 지구에 닿으면 움직임 정지
let earthLocked = false;

// UFO 컷신
let guideUFO = false;
let guideUFOFrame = 0;
let guideIntroStarted = false;

function fullscreenGuide()
{
  push();
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(50);
  text("게임을 시작하기 위해 P키를 눌러 전체화면으로 전환하십시오.", width / 2, height / 2);
  pop();
}

function initGuide()
{
  // =========================
  // 플랫폼 크기
  // =========================

  let guideW = 900;
  let guideH = 180;

  // =========================
  // 플랫폼 위치
  // =========================

  let guideX = 250;
  let guideY = 250;

  // =========================
  // 플랫폼 생성
  // =========================

  guidePlatform =
  {
    x: guideX,
    y: guideY,
    w: guideW,
    h: guideH
  };

  // guide 전용 플랫폼
  platforms = [guidePlatform];

  // =========================
  // 플레이어 시작 위치
  // =========================

  guideSpawnX = guideX + 20;
  guideSpawnY = guideY - dia;

  rectX = guideSpawnX;
  rectY = guideSpawnY;

  speedY = 0;

  isGround = false;

  earthLocked = false;

  guideUFO = false;
  guideUFOFrame = 0;
  guideIntroStarted = false;

  // =========================
  // 지구 위치
  // =========================

  earthX = width * 12 / 13;
  earthY = height;

  guideReady = true;

  guideLastW = width;
  guideLastH = height;
}

function resetGuideSpawn()
{
  rectX = guideSpawnX;
  rectY = guideSpawnY;

  speedY = 0;

  isGround = false;

  earthLocked = false;

  guideUFO = false;
  guideUFOFrame = 0;
  guideIntroStarted = false;
}

function drawGuide()
{
  // =========================
  // 화면 크기 변경 대응
  // =========================

  if(!guideReady || guideLastW !== width || guideLastH !== height)
  {
    initGuide();
  }

  // =========================
  // 배경
  // =========================

  image(backgroundImg, 0, 0, width, height);

  // =========================
  // 플레이어 업데이트
  // =========================

  if(!earthLocked && !guideUFO)
  {
    updatePlayer();
  }

  // =========================
  // 지구 포탈 충돌
  // =========================

  let d = dist(
    rectX + dia / 2,
    rectY + dia / 2,
    earthX,
    earthY
  );

  if(d < earthR && !guideUFO)
  {
    earthLocked = true;

    guideUFO = true;

    guideUFOFrame = 0;

    speedY = 0;
  }

  // =========================
  // 떨어지면 리스폰
  // =========================

  if(!guideUFO && rectY > height + 100)
  {
    resetGuideSpawn();
  }

  // =========================
  // 플랫폼
  // =========================

  fill(0);

  stroke(0);

  strokeWeight(4);

  rect(
    guidePlatform.x,
    guidePlatform.y,
    guidePlatform.w,
    guidePlatform.h,
    30
  );
  fill(255);
  // =========================
  // 플레이어
  // =========================

  

  // =========================
  // 제목
  // =========================

  push();

  // 시작 화면 제목 이미지
  imageMode(CENTER);

  if(titleImg)
  {
    image(
      titleImg,
      guidePlatform.x + guidePlatform.w / 2,
      guidePlatform.y + guidePlatform.h / 2,
      guidePlatform.w + 100 ,
      guidePlatform.h + 150
    );
  }
  else
  {
    fill(0);
    noStroke();
    textSize(80);
    textAlign(CENTER, CENTER);
    text("랩이스케이프", guidePlatform.x + guidePlatform.w / 2, guidePlatform.y + guidePlatform.h / 2);
  }

  imageMode(CORNER);
  drawPlayer();
  pop();

  push();

  let textX = width * 1 / 7;
  let keyX = width * 1.5 / 9;

  let moveY = height * 1.95 / 3;
  let jumpY = height * 2.2 / 3;
  let itemY = height * 2.45 / 3;

  // 이동 키
  image(arrowImg, keyX, moveY, 200, 150);

  // 점프 키
  image(arrow2Img, keyX, jumpY, 200, 140);

  // 아이템 1, 2, 3 키
  image(arrow3Img, keyX + 10, itemY+40, 60, 60);
  image(arrow4Img, keyX + 80, itemY+40, 60, 60);
  image(arrow5Img, keyX + 150, itemY+40, 60, 60);

  fill(255);
  textAlign(CENTER, BASELINE);
  textSize(20);
  text("목표 : 지구에 가기", 100, 20);

  textSize(50);
  text("튜토리얼", width / 4, height * 5 / 8);

  textSize(30);
  text("이동 :", textX, moveY + 70);
  text("점프 :", textX, jumpY + 70);
  text("아이템 :", textX, itemY + 70);

  text("제작자 : 김강민, 박경민", width * 8 / 9, height / 15);

  pop();

  // =========================
  // UFO 컷신
  // =========================

  if(guideUFO)
  {
    drawGuideUFOScene();
  }

  // =========================
  // 디버그 원
  // =========================

  // noFill();
  // stroke(255, 0, 0);
  // strokeWeight(3);
  // circle(earthX, earthY, earthR * 2);
}

function drawGuideUFOScene()
{
  guideUFOFrame++;

  let playerCenterX = rectX + dia / 2;

  let ufoX;

  let ufoY = 120;

  // =========================
  // UFO 이동
  // =========================

  if(guideUFOFrame < 120)
  {
    ufoX = map(
      guideUFOFrame,
      0,
      120,
      -200,
      playerCenterX
    );
  }
  else
  {
    ufoX = playerCenterX;
  }

  // =========================
  // UFO 그리기
  // =========================

  push();

  translate(ufoX, ufoY);

  noStroke();

  // 몸체
  fill(160);

  ellipse(0, 0, 180, 50);

  fill(90, 180, 255);

  ellipse(0, -20, 80, 45);

  fill(255, 255, 100);

  circle(-55, 5, 12);
  circle(0, 10, 12);
  circle(55, 5, 12);

  // =========================
  // 아래로 퍼지는 광선
  // =========================

  if(guideUFOFrame > 120)
  {
    fill(120, 220, 255, 80);

    triangle(
      0, 20,
      -140, height * 0.70,
      140, height * 0.70
    );
  }

  pop();

  // =========================
  // 플레이어 빨려 올라감
  // =========================

  if(guideUFOFrame > 120)
  {
    rectY -= 2.2;
  }

  // =========================
  // 컷신 종료 → 스테이지1 시작
  // =========================

    if(guideUFOFrame > 260 && !guideIntroStarted)
    {
    guideIntroStarted = true;

    // =========================
    // 상태 초기화
    // =========================

    earthLocked = false;

    guideUFO = false;

    guideUFOFrame = 0;

    // 플레이어 상태 초기화
    speedY = 0;

    gravity = defaultGravity;

    jumpPower = defaultJumpPower;

    isReverseGravity = false;

    dia = defaultDia;

    camX = 0;

    useCam = false;

    worldStartLock = true;

    // 아이템 상태 초기화
    selectedItem = 0;
    selectedSlot = 0;

    // =========================
    // 스테이지 설정
    // =========================

    currentStage = 1;
    currentMap = 1;

    // guide 플랫폼 제거
    platforms = [];

    // stage1 직접 로드
    loadStage1Map1();

    // 정확한 스폰
    rectX = spawnX;
    rectY = spawnY;

    // 최종 안전 처리
    speedY = 0;

    // 게임 시작
    gameState = "intro";
    }
}