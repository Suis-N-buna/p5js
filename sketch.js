let img;

let gameWidth = 4000;
let gameHeight;

let camX = 0;
let useCam = false;
let worldStartLock = true;

// 아이템 이미지
let gravityImg;
let micImg;
let sizeImg;
let arrowImg;
let arrow2Img;
let arrow3Img;
let arrow4Img;
let arrow5Img;
let bossImg;
let titleImg;

let meteorImg;

let backgroundImg;

let poisonImg;
let wallCrack;
let ventOffImg;
let ventOnImg;
let vent2Open = false;

let mic;
let micStarted = false;
let micLevel = 0;
let micJumpCooldown = 0;
let micLoudCount = 0;

let fullscreenLocked = false;
let fullscreenGuideEnd = false;

function preload()
{
  img = loadImage('assets/lab3.png');

  gravityImg = loadImage('assets/gravity.png');
  micImg = loadImage('assets/mic.png');
  sizeImg = loadImage('assets/size.png');

  poisonImg = loadImage('assets/poison4.png');

  wallCrack = loadImage('assets/walls1.png');

  ventOffImg = loadImage('assets/VentOff.png');
  ventOnImg = loadImage('assets/VentOn.png');

  meteorImg = loadImage('assets/meteor.png');
  backgroundImg = loadImage('assets/background.png');

  arrowImg = loadImage('assets/arrow1.png');
  arrow2Img = loadImage('assets/arrow2.png');
  arrow3Img = loadImage('assets/arrow3.png');
  arrow4Img = loadImage('assets/arrow4.png');
  arrow5Img = loadImage('assets/arrow5.png');

  bossImg = loadImage('assets/boss.png');
  titleImg = loadImage('assets/title.png');
}

let showGuide = true;
let gameStart = false;

let defaultDia = 75;
let dia = defaultDia;

let prevY = 0;
let rectX = 0;
let rectY = 0;

let speedY = 0;

let gravity = 0.5;
let defaultGravity = 0.5;

let defaultJumpPower = -14;
let jumpPower = defaultJumpPower;

let isReverseGravity = false;

let groundRatio = 0.08;
let groundY = 0;

let uiRatio = 0.07;

let platforms = [];

let isGround = false;

let gameState = "fullscreenOn";

let spawnX = 0;
let spawnY = 0;

// 스테이지
let currentStage = 1;

// 맵
let currentMap = 1;

let item1X = 0;
let item1Y = 0;
let item1Size = 0;

let item2X = 0;
let item2Y = 0;
let item2Size = 0;

let item3X = 0;
let item3Y = 0;
let item3Size = 0;

let selectedItem = 0;

// 추가된 인벤토리 변수
let inventoryCount = 3;
let selectedSlot = 0;

let slotSize = 60;
let slotGap = 10;

let item1Get = false;
let item2Get = false;
let item3Get = false;

let inPortal = false;

// 스테이지 2용 보호막 변수 선언 (오류 방지)
let shieldActive = false;
let shieldTimer = 0;
let shieldCooldown = 0;

function setup()
{
  createCanvas(window.innerWidth, window.innerHeight);

  gameHeight = height;

  loadStage();

  updateGround();

  rectX = spawnX;
  rectY = spawnY;

  mic = new p5.AudioIn();
}

function loadStage()
{
  if(currentStage === 1)
  {
    if(currentMap === 1)
    {
      loadStage1Map1();
    }

    else if(currentMap === 2)
    {
      loadStage1Map2();
    }

    else if(currentMap === 3)
    {
      loadStage1Map3();
    }

    else if(currentMap === 4)
    {
      // 🚀 맵3 클리어 시, 바로 인게임으로 가지 않고 설명 인트로 화면으로 전환
      gameState = 'stage2Intro';
      stage2IntroFrame = 0; 
    }
  }
}

function updateGround()
{
  groundY = height * (1 - groundRatio);
}

function draw()
{
  background(0);

  if(!fullscreen())
  {
    if(fullscreenGuideEnd === true)
    {
      fullscreenLocked = false;
    }
  }

  rectMode(CORNER);
  imageMode(CORNER);
  stroke(0);
  strokeWeight(1);
  fill(255);

  if(gameState === 'fullscreenOn')
  {
    if (typeof fullscreenGuide === "function") {
      fullscreenGuide();
    } else {
      gameState = "guide";
    }
  }

  else if(gameState === "guide")
  {
    if (typeof drawGuide === "function") {
      drawGuide();
    } else {
      gameState = "intro";
    }
  }

  else if(gameState === "intro")
  {
    startIntro();
  }

  else if(gameState === "stage1Playing")
  {
    stage1GamePlay();
  }

  // 💥 2스테이지 설명 인트로 상태 분기
  else if(gameState === "stage2Intro")
  {
    drawStage2Intro();
  }

  else if(gameState === 'stage2Playing')
  {
    stage2GamePlay();
  }

  else if(gameState === "dead")
  {
    drawDeadScreen();
  }
}

function stage1GamePlay()
{
  image(img, 0, 0, width, height);

  createPlatform();

  drawItem1();
  drawItem2();
  drawItem3();

  itemInventory();
  itemGuide();
  drawPortal();

  updatePlayer();

  micJump();

  if(useCam)
  {
    updateCamera();
  }
  else
  {
    camX = 0;
  }

  drawPlayer();
  drawMicHint();
  
  checkItem1();
  checkItem2();
  checkItem3();
  checkDeath();

  drawMousePosition();
}

function createPlatform()
{
  push();
  rectMode(CORNER);
  fill(255);
  stroke(0);
  strokeWeight(4);

  for(let p of platforms)
  {
    rect(p.x - camX, p.y, p.w, p.h);
  }
  pop();
}

function drawItem1()
{
  if(currentStage === 1 && currentMap === 1)
  {
    if(item1Get === false)
    {
      image(gravityImg, item1X+5-camX, item1Y+5, item1Size-10, item1Size-10);
    }
  }
}

function drawItem2()
{
  if(currentStage === 1 && currentMap === 2)
  {
    if(item2Get === false)
    {
      image(sizeImg, item2X - camX, item2Y, item2Size, item2Size);
    }
  }
}

function drawItem3()
{
  if(currentStage === 1 && currentMap === 3)
  {
    if(item3Get === false)
    {
      image(micImg, item3X - camX, item3Y, item3Size, item3Size);
    }
  }
}

function itemInventory()
{
  push();

  let uiHeight = height * uiRatio;

  image(
    poisonImg,
    0,
    height - uiHeight * 2,
    width,
    uiHeight * 6
  );

  let x = 20;
  let startY = 60;

  let itemImages = [gravityImg, sizeImg, micImg];
  let itemGets = [item1Get, item2Get, item3Get];

  for(let i = 0; i < inventoryCount; i++)
  {
    if(itemGets[i] === false)
    {
      continue;
    }

    let slotNum = i + 1;
    let y = startY + i * (slotSize + slotGap);

    noStroke();
    fill(255);
    rect(x, y, slotSize, slotSize, 10);

    imageMode(CORNER);

    if((i === 0 || i === 1) && currentMap === 3)
    {
      tint(120);
    }
    else
    {
      tint(255);
    }

    image(itemImages[i], x + 2, y + 2, slotSize - 4, slotSize - 4);
    noTint();

    if(selectedSlot === slotNum)
    {
      stroke(0);
    }
    else
    {
      stroke(255);
    }

    strokeWeight(3);
    noFill();
    rect(x, y, slotSize, slotSize, 10);
  }

  strokeWeight(1);
  stroke(0);
  pop();
}

function drawPortal()
{
  push();
  if(currentStage === 1)
  {
    if(currentMap === 1)
    {
      drawStage1Map1Portal();
    }
    else if(currentMap === 2)
    {
      drawStage1Map2Portal();
    }
    else if(currentMap === 3)
    {
      drawStage1Map3Portal();
    }
  }
  pop();
  rectMode(CORNER);
}

function nextMap()
{
  currentMap++;
  loadStage();
  itemReset();
  respawnPlayer();

  inPortal = false;
  vent2Open = false;
  worldStartLock = true;
  camX = 0;
}

function itemReset()
{
  selectedItem = 0;
  selectedSlot = 0;
  isReverseGravity = false;
  gravity = 0.5;
  jumpPower = -14;
  dia = defaultDia;
  micLevel = 0;
  micLoudCount = 0;
  micJumpCooldown = 0;
}

function respawnPlayer()
{
  if(currentStage === 1 && currentMap <= 3)
  {
    rectX = spawnX;
    rectY = spawnY;
    speedY = 0;
    gameState = "stage1Playing";
  }
  else if(currentStage === 1 && currentMap === 4)
  {
    stage2IntroFrame = 0;
    gameState = "stage2Intro";
  }
}

function updatePlayer()
{
  isGround = false;
  prevY = rectY;
  speedY += gravity;
  rectY += speedY;

  platformCollision();
  movePlayer();

  if(currentStage === 1 && (currentMap === 2 || currentMap === 3))
  {
    useCam = true;
  }
  else
  {
    useCam = false;
  }
}

function platformCollision()
{
  for(let p of platforms)
  {
    if(gravity > 0)
    {
      if(
        prevY + dia <= p.y &&
        rectY + dia >= p.y &&
        rectX + dia > p.x &&
        rectX < p.x + p.w
      )
      {
        rectY = p.y - dia;
        speedY = 0;
        isGround = true;
      }

      if(
        prevY >= p.y + p.h &&
        rectY <= p.y + p.h &&
        rectX + dia > p.x &&
        rectX < p.x + p.w
      )
      {
        rectY = p.y + p.h;
        speedY = 0;
      }
    }
    else
    {
      if(
        prevY >= p.y + p.h &&
        rectY <= p.y + p.h &&
        rectX + dia > p.x &&
        rectX < p.x + p.w
      )
      {
        rectY = p.y + p.h;
        speedY = 0;
        isGround = true;
      }

      if(
        prevY + dia <= p.y &&
        rectY + dia >= p.y &&
        rectX + dia > p.x &&
        rectX < p.x + p.w
      )
      {
        rectY = p.y - dia;
        speedY = 0;
      }
    }

    if(
      rectY + dia > p.y &&
      rectY < p.y + p.h &&
      rectX + dia > p.x &&
      rectX < p.x
    )
    {
      rectX = p.x - dia;
    }

    if(
      rectY + dia > p.y &&
      rectY < p.y + p.h &&
      rectX < p.x + p.w &&
      rectX + dia > p.x + p.w
    )
    {
      rectX = p.x + p.w;
    }
  }
}

function movePlayer()
{
  if(keyIsDown(RIGHT_ARROW))
  {
    rectX += 3;
  }

  if(keyIsDown(LEFT_ARROW))
  {
    rectX -= 3;
  }

  if(rectX < 0)
  {
    rectX = 0;
  }

  if(rectX + dia > gameWidth)
  {
    rectX = gameWidth - dia;
  }

  if(currentStage === 1 && currentMap === 1)
  {
    if(rectX + dia > width)
    {
      rectX = width - dia;
    }
  }
}

function drawPlayer()
{
  push();
  rectMode(CORNER);
  stroke(0);
  strokeWeight(3);
  fill(255);
  square(rectX - camX, rectY, dia);
  drawFace();
  pop();
}

function drawFace()
{
  strokeWeight(3);

  let eyeSize = dia / 5;
  let mouthW = dia / 5;
  let mouthH = dia / 3;

  if(!isGround)
  {
    circle(rectX - camX + dia/4, rectY + dia/4 + dia/8, eyeSize);
    circle(rectX - camX + dia*3/4, rectY + dia/4 + dia/8, eyeSize);
    ellipse(rectX - camX +dia/2, rectY + dia*3/4, mouthW, mouthH);
  }
  else
  {
    line(
      rectX - camX + dia/4 - dia/15,
      rectY + dia/4 + dia/8,
      rectX - camX + dia/4 + dia/10,
      rectY + dia/4 + dia/8
    );

    line(
      rectX - camX + dia*3/4 - dia/10,
      rectY + dia/4 + dia/8,
      rectX - camX + dia*3/4 + dia/15,
      rectY + dia/4 + dia/8
    );

    line(
      rectX - camX + dia/4 + dia/6,
      rectY + dia*3/4,
      rectX - camX + dia/4 + dia/2.5,
      rectY + dia*3/4
    );
  }
}

function checkItem1()
{
  if(currentStage === 1 && currentMap === 1)
  {
    let distance = dist(rectX + dia/2, rectY + dia/2, item1X, item1Y);
    if(distance < dia/2 + item1Size/2)
    {
      item1Get = true;
    }
  }
}

function checkItem2()
{
  if(currentStage === 1 && currentMap === 2)
  {
    let distance2 = dist(rectX + dia/2, rectY + dia/2, item2X, item2Y);
    if(distance2 < dia/2 + item2Size/2)
    {
      item2Get = true;
    }
  }
}

function checkItem3()
{
  if(currentStage === 1 && currentMap === 3)
  {
    let distance3 = dist(rectX + dia/2, rectY + dia/2, item3X, item3Y);
    if(distance3 < dia/2 + item3Size/2)
    {
      item3Get = true;
      selectedItem = 3;
      selectedSlot = 3;
    }
  }
}

function checkDeath()
{
  if(rectY > height + 200 || rectY < 0)
  {
    gameState = "dead";
  }
}

function drawDeadScreen()
{
  background(0);
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(64);
  text("YOU DIED", width/2, height/2-50);
  textSize(32);
  text("Press R to Respawn", width/2, height/2+30);
}

function keyPressed()
{
  if(keyCode === UP_ARROW && isGround)
  {
    speedY = jumpPower;
  }

  if(key === 'p' || key === 'P')
  {
    if(!fullscreen())
    {
      fullscreen(true);
      resizeCanvas(window.innerWidth, window.innerHeight);

      if(!fullscreenGuideEnd)
      {
        loadStage();
        fullscreenGuideEnd = true;
        if(fullscreenGuideEnd)
        {
          gameState = 'guide';
        }
      }
    }
  }

  if(gameState === "dead")
  {
    if(key === 'r' || key === 'R')
    {
      // 2스테이지에서 죽었을 때
      // 1라운드에서 죽으면 1라운드 처음부터
      // 보스전에서 죽으면 보스전부터 재시작
      if(typeof restartStage2FromDeath === "function" && (currentStage === 2 || currentMap === 4))
      {
        restartStage2FromDeath();
        return false;
      }

      if(currentStage === 1 && currentMap <= 3)
      {
        itemReset();
        respawnPlayer();
        return false;
      }

      if(currentStage === 1 && currentMap === 4)
      {
        respawnPlayer();
        return false;
      }
    }
  }

  if(key === '0')
  {
    itemReset();
  }

  if(currentStage === 1 && currentMap != 3)
  {
    if(item1Get === true && key === '1')
    {
      selectedItem = 1;
      selectedSlot = 1;
      isReverseGravity = !isReverseGravity;

      if(isReverseGravity) gravity = -abs(defaultGravity);
      else gravity = abs(defaultGravity);

      let jumpSize = (dia === defaultDia / 2) ? abs(defaultJumpPower / 2) : abs(defaultJumpPower);

      if(isReverseGravity) jumpPower = jumpSize;
      else jumpPower = -jumpSize;
    }
  }

  if(gameState === "stage2Playing" || gameState === "stage2")
  {
    if(key === '1')
    {
      if(shieldCooldown === 0)
      {
        shieldActive = true;
        shieldTimer = 60;
        shieldCooldown = 1200;
      }
    }
  }

  if(item2Get === true)
  {
    if(key === '2' && currentMap !== 3)
    {
      selectedItem = 2;
      selectedSlot = 2;

      let bottom = rectY + dia;
      let top = rectY;

      dia = (dia === defaultDia) ? defaultDia / 2 : defaultDia;
      jumpPower = (dia === defaultDia / 2) ? abs(defaultJumpPower / 2) : abs(defaultJumpPower);

      if(isReverseGravity) jumpPower = abs(jumpPower);
      else jumpPower = -abs(jumpPower);

      if(isReverseGravity) rectY = top;
      else rectY = bottom - dia;

      platformCollision();
    }
  }

  if(item3Get === true && key === '3')
  {
    selectedItem = 3;
    selectedSlot = 3;
    userStartAudio();

    mic.start(
      function() { micStarted = true; },
      function(error) { micStarted = false; console.log(error); }
    );
  }

  if(key === 'g' || key === 'G') item1Get = true;
  if(key === 'h' || key === 'H') item2Get = true;
  if(key === 'k' || key === 'K') item3Get = true;

  if(currentStage === 1 && currentMap === 2 && inPortal)
  {
    if(key === 'z' || key === 'Z')
    {
      vent2Open = true;
    }
  }

  if(inPortal && (key === 'e' || key === 'E'))
  {
    if(currentStage === 1 && currentMap === 2)
    {
      if(vent2Open) nextMap();
    }
    else
    {
      nextMap();
    }
  }

  if(key === 'm' || key === 'M')
  {
    nextMap();
  }

  if(key === 'b' || key === 'B')
  {
    camY = -(stage2WorldHeight - height);
    startBossTransition();
  }


  // 9번 키: 2스테이지를 스킵하고 바로 엔딩 컷신으로 이동
  if(key === '9')
  {
    currentStage = 2;
    gameState = "stage2Playing";

    if(typeof loadStage2 === "function")
    {
      loadStage2();
    }

    bossDeadSequence = true;
    endingTimer = 0;
    whiteOutAlpha = 0;

    return false;
  }

  return false;
}

function windowResized()
{
  resizeCanvas(window.innerWidth, window.innerHeight);
  gameHeight = height;
  updateGround();
}

function updateCamera()
{
  let leftBound = width * 0.4;

  if(worldStartLock)
  {
    if(rectX > leftBound)
    {
      worldStartLock = false;
      camX = rectX - width / 2;
    }
    else
    {
      camX = 0;
    }
    return;
  }

  camX = rectX - width / 2;
  if(camX < 0) camX = 0;

  let maxCam = gameWidth - width;
  if(camX > maxCam) camX = maxCam;
}

function drawMousePosition()
{
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  let worldMouseX = mouseX + camX;
  let worldMouseY = mouseY;
  text("X: " + floor(worldMouseX) + " Y: " + floor(worldMouseY), width - 150, height - 20);
}

function micJump()
{
  if(micJumpCooldown > 0) micJumpCooldown--;

  if(selectedItem !== 3 || !micStarted)
  {
    micLevel = 0;
    micLoudCount = 0;
    return;
  }

  micLevel = mic.getLevel();
  let micThreshold = 0.006;

  if(micLevel > micThreshold) micLoudCount++;
  else micLoudCount = 0;

  if(isGround && micLoudCount >= 4 && micJumpCooldown === 0)
  {
    let micPower = map(micLevel, micThreshold, 0.18, 8, 22);
    micPower = constrain(micPower, 8, 22);

    if(gravity > 0) speedY = -micPower;
    else speedY = micPower;

    micJumpCooldown = 24;
    micLoudCount = 0;
  }
}

function itemGuide()
{
  let x = 20;
  let startY = 60;
  let guideTexts = [
    ["1번 키를 누르면", "중력이 뒤바뀝니다!"],
    ["2번 키를 누르면", "크기가 변합니다!"],
    ["3번 키를 누르면", "목소리로 점프합니다!"]
  ];
  let itemGets = [item1Get, item2Get, item3Get];

  for(let i = 0; i < inventoryCount; i++)
  {
    if(itemGets[i] === false) continue;

    let y = startY + i * (slotSize + slotGap);

    if(mouseX > x && mouseX < x + slotSize && mouseY > y && mouseY < y + slotSize)
    {
      push();
      fill(255, 200);
      rect(x + slotSize + 20, y, 230, 70, 10);
      fill(0);
      textSize(15);
      textAlign(CENTER, CENTER);
      text(guideTexts[i][0], x + slotSize + 135, y + 22);
      text(guideTexts[i][1], x + slotSize + 135, y + 48);
      pop();
    }
  }
}

function drawMicHint()
{
  if(currentStage === 1 && currentMap === 3)
  {
    noStroke();
    fill(255);
    textSize(18);
    textAlign(LEFT, TOP);

    if(item3Get && !micStarted)
    {
      text("마이크 획득! 3키를 눌러 마이크를 켜자", 20, 35);
    }
    else if(selectedItem === 3 && micStarted)
    {
      text("MIC: " + nf(micLevel, 1, 3), 20, 20);
      rect(100, 45, micLevel * 900, 10);
    }
  }
}