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
let clothImg;

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

let playTime = 0;
let lastFrameTime = 0;
let clearTime = -1;
let recentClearTime = -1;
let bestClearTime = -1;

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
  clothImg = loadImage('assets/cloth.png');
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
let previousGameState = "fullscreenOn";
let menuSnapshot = null;
let menuButtons = [];
let isLoadingSave = false;

// ===============================
// LocalStorage 저장 / 이어하기
// ===============================

const SAVE_KEY = "lab_escape_save_v1";
const CUSTOM_SAVE_KEY = "lab_escape_custom_v1";



function loadClothImageSafe()
{
  if(clothImg)
  {
    return;
  }

  try
  {
    loadImage(
      'assets/cloth.png',
      function(img)
      {
        clothImg = img;
      },
      function()
      {
        clothImg = null;
      }
    );
  }
  catch(e)
  {
    clothImg = null;
  }
}

function drawClothIcon(x, y, w, h)
{
  if(clothImg)
  {
    image(clothImg, x, y, w, h);
  }
  else
  {
    push();
    rectMode(CORNER);
    stroke(20);
    strokeWeight(3);
    fill(170, 100, 35);

    let cx = x + w / 2;
    let topY = y + h * 0.25;
    let leftX = x + w * 0.12;
    let rightX = x + w * 0.88;
    let bottomY = y + h * 0.82;

    // 간단한 옷걸이 대체 그림
    line(cx, y + h * 0.08, cx, topY);
    noFill();
    arc(cx, y + h * 0.08, w * 0.28, h * 0.28, PI * 0.2, PI * 1.3);

    fill(170, 100, 35);
    line(cx, topY, leftX, bottomY);
    line(cx, topY, rightX, bottomY);
    line(leftX, bottomY, rightX, bottomY);
    pop();
  }
}

function saveCustomization()
{
  let customData = {
    clothGet: clothGet,
    customizationUnlocked: customizationUnlocked,
    playerColorName: playerColorName,
    playerAccessory: playerAccessory
  };

  localStorage.setItem(CUSTOM_SAVE_KEY, JSON.stringify(customData));
}

function loadCustomization()
{
  let raw = localStorage.getItem(CUSTOM_SAVE_KEY);

  if(!raw)
  {
    return;
  }

  try
  {
    let customData = JSON.parse(raw);
    clothGet = customData.clothGet ?? clothGet;
    customizationUnlocked = customData.customizationUnlocked ?? customizationUnlocked;
    playerColorName = customData.playerColorName ?? playerColorName;
    playerAccessory = customData.playerAccessory ?? playerAccessory;
  }
  catch(e)
  {
    localStorage.removeItem(CUSTOM_SAVE_KEY);
  }
}

function clearCustomization()
{
  localStorage.removeItem(CUSTOM_SAVE_KEY);
}

function hasSavedGame()
{
  return localStorage.getItem(SAVE_KEY) !== null;
}

function saveGame()
{
  if(isLoadingSave)
  {
    return;
  }

  saveCustomization();

  // 메뉴/죽음/엔딩/전체화면 안내/가이드/초반 인트로/커스텀 화면에서는
  // 게임 진행 위치를 저장하지 않음
  if(
    gameState === "menu" ||
    gameState === "dead" ||
    gameState === "fullscreenOn" ||
    gameState === "guide" ||
    gameState === "intro" ||
    gameState === "customize"
  )
  {
    return;
  }

  // 1스테이지에서 낙사 중인 좌표는 저장하지 않음
  if(currentStage === 1 && currentMap <= 3)
  {
    if(rectY > height + 50 || rectY < -120)
    {
      return;
    }
  }

  let saveData = {
    gameState: gameState,
    previousGameState: previousGameState,

    currentStage: currentStage,
    currentMap: currentMap,

    rectX: rectX,
    rectY: rectY,
    speedY: speedY,
    dia: dia,
    gravity: gravity,
    jumpPower: jumpPower,
    isReverseGravity: isReverseGravity,

    camX: camX,
    useCam: useCam,
    worldStartLock: worldStartLock,

    item1Get: item1Get,
    item2Get: item2Get,
    item3Get: item3Get,
    clothGet: clothGet,
    customizationUnlocked: customizationUnlocked,
    playerColorName: playerColorName,
    playerAccessory: playerAccessory,
    selectedItem: selectedItem,
    selectedSlot: selectedSlot,

    vent2Open: vent2Open,
    inPortal: inPortal,

    introFrame: typeof introFrame !== "undefined" ? introFrame : 0,
    stage2IntroFrame: typeof stage2IntroFrame !== "undefined" ? stage2IntroFrame : 0,

    currentStage2Map: typeof currentStage2Map !== "undefined" ? currentStage2Map : 1,
    camY: typeof camY !== "undefined" ? camY : 0,
    stage2Score: typeof stage2Score !== "undefined" ? stage2Score : 0,
    stage2SpawnTimer: typeof stage2SpawnTimer !== "undefined" ? stage2SpawnTimer : 0,
    stage2ScrollSpeed: typeof stage2ScrollSpeed !== "undefined" ? stage2ScrollSpeed : 4,
    stage2BossStarted: typeof stage2BossStarted !== "undefined" ? stage2BossStarted : false,
    stage2RespawnPoint: typeof stage2RespawnPoint !== "undefined" ? stage2RespawnPoint : 1,
    playerShootCooldown: typeof playerShootCooldown !== "undefined" ? playerShootCooldown : 0,

    shipX: typeof ship !== "undefined" && ship ? ship.x : null,
    shipY: typeof ship !== "undefined" && ship ? ship.y : null,
    shipHp: typeof ship !== "undefined" && ship ? ship.hp : 3,

    bossHp: typeof boss !== "undefined" && boss ? boss.hp : null,
    bossRageMode: typeof boss !== "undefined" && boss ? boss.rageMode : false,
    bossPhase: typeof boss !== "undefined" && boss ? boss.phase : 1,

    playTime: playTime,
    clearTime: clearTime,
    savedAt: Date.now()
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function loadSavedGame()
{
  isLoadingSave = true;

  let raw = localStorage.getItem(SAVE_KEY);

  if(!raw)
  {
    isLoadingSave = false;
    return false;
  }

  let saveData;

  try
  {
    saveData = JSON.parse(raw);
  }
  catch(e)
  {
    localStorage.removeItem(SAVE_KEY);
    isLoadingSave = false;
    return false;
  }

  currentStage = saveData.currentStage ?? 1;
  currentMap = saveData.currentMap ?? 1;

  item1Get = saveData.item1Get ?? false;
  item2Get = saveData.item2Get ?? false;
  item3Get = saveData.item3Get ?? false;
  clothGet = saveData.clothGet ?? false;
  customizationUnlocked = saveData.customizationUnlocked ?? false;
  playerColorName = saveData.playerColorName ?? 'white';
  playerAccessory = saveData.playerAccessory ?? 'none';
  selectedItem = saveData.selectedItem ?? 0;
  selectedSlot = saveData.selectedSlot ?? 0;

  dia = saveData.dia ?? defaultDia;
  gravity = saveData.gravity ?? defaultGravity;
  jumpPower = saveData.jumpPower ?? defaultJumpPower;
  isReverseGravity = saveData.isReverseGravity ?? false;

  camX = saveData.camX ?? 0;
  useCam = saveData.useCam ?? false;
  worldStartLock = saveData.worldStartLock ?? true;

  vent2Open = saveData.vent2Open ?? false;
  inPortal = saveData.inPortal ?? false;

  if(typeof introFrame !== "undefined") introFrame = saveData.introFrame ?? 0;
  if(typeof stage2IntroFrame !== "undefined") stage2IntroFrame = saveData.stage2IntroFrame ?? 0;
  playTime = saveData.playTime ?? playTime;
  clearTime = saveData.clearTime ?? clearTime;
  lastFrameTime = millis();

  if(currentStage === 1)
  {
    loadStage();

    rectX = saveData.rectX ?? spawnX;
    rectY = saveData.rectY ?? spawnY;

    // 이어하기 때 저장 직전의 낙하 속도 때문에 바로 떨어지는 문제 방지
    speedY = 0;
    prevY = rectY;
    isGround = false;

    // 카메라맵이면 저장된 카메라를 먼저 복구
    camX = saveData.camX ?? 0;

    if(currentMap === 2 || currentMap === 3)
    {
      useCam = true;
      worldStartLock = false;
      updateCamera();
    }
    else
    {
      useCam = false;
      camX = 0;
    }

    if(currentMap <= 3)
    {
      gameState = "stage1Playing";
    }
    else if(currentMap === 4)
    {
      gameState = "stage2Intro";
    }
  }
  else if(currentStage === 2)
  {
    if(typeof loadStage2 === "function")
    {
      loadStage2();
    }

    if(typeof currentStage2Map !== "undefined") currentStage2Map = saveData.currentStage2Map ?? 1;
    if(typeof camY !== "undefined") camY = saveData.camY ?? 0;
    if(typeof stage2Score !== "undefined") stage2Score = saveData.stage2Score ?? 0;
    if(typeof stage2SpawnTimer !== "undefined") stage2SpawnTimer = saveData.stage2SpawnTimer ?? 0;
    if(typeof stage2ScrollSpeed !== "undefined") stage2ScrollSpeed = saveData.stage2ScrollSpeed ?? 4;
    if(typeof stage2BossStarted !== "undefined") stage2BossStarted = saveData.stage2BossStarted ?? false;
    if(typeof stage2RespawnPoint !== "undefined") stage2RespawnPoint = saveData.stage2RespawnPoint ?? 1;
    if(typeof playerShootCooldown !== "undefined") playerShootCooldown = saveData.playerShootCooldown ?? 0;

    if(saveData.stage2BossStarted && typeof restartStage2BossFight === "function")
    {
      restartStage2BossFight();

      if(typeof boss !== "undefined" && boss && saveData.bossHp !== null)
      {
        boss.hp = saveData.bossHp;
        boss.rageMode = saveData.bossRageMode ?? false;
        boss.phase = saveData.bossPhase ?? 1;
      }
    }

    if(typeof ship !== "undefined" && ship)
    {
      if(saveData.shipX !== null) ship.x = saveData.shipX;
      if(saveData.shipY !== null) ship.y = saveData.shipY;
      ship.hp = saveData.shipHp ?? 3;
    }

    gameState = "stage2Playing";
  }

  loadCustomization();
  loadTimeRecords();
  lastFrameTime = millis();
  loadTimeRecords();
  lastFrameTime = millis();
  loadClothImageSafe();

  previousGameState = gameState;
  menuSnapshot = null;
  isLoadingSave = false;

  return true;
}

function clearSavedGame()
{
  localStorage.removeItem(SAVE_KEY);
}

function saveCheckpoint()
{
  saveGame();
}

function autoSaveGame()
{
  if(frameCount % 60 !== 0)
  {
    return;
  }

  if(
    gameState === "stage1Playing" ||
    gameState === "stage2Playing" ||
    gameState === "stage2Intro"
  )
  {
    saveGame();
  }
}



function clearTimeRecords()
{
  localStorage.removeItem("lab_escape_recent_time");
  localStorage.removeItem("lab_escape_best_time");

  recentClearTime = -1;
  bestClearTime = -1;
  clearTime = -1;
  playTime = 0;
  lastFrameTime = millis();
}

function loadTimeRecords()
{
  let recent = localStorage.getItem("lab_escape_recent_time");
  let best = localStorage.getItem("lab_escape_best_time");

  recentClearTime = recent === null ? -1 : Number(recent);
  bestClearTime = best === null ? -1 : Number(best);

  if(isNaN(recentClearTime)) recentClearTime = -1;
  if(isNaN(bestClearTime)) bestClearTime = -1;
}

function saveClearTimeRecord()
{
  clearTime = floor(playTime);
  recentClearTime = clearTime;

  // 최고 기록을 "가장 큰 시간" 기준으로 갱신
  if(bestClearTime < 0 || clearTime > bestClearTime)
  {
    bestClearTime = clearTime;
  }

  localStorage.setItem("lab_escape_recent_time", String(recentClearTime));
  localStorage.setItem("lab_escape_best_time", String(bestClearTime));
}

function formatPlayTime(t)
{
  if(t < 0)
  {
    return "--:--";
  }

  let minutes = floor(t / 60);
  let seconds = floor(t % 60);

  return nf(minutes, 2) + ":" + nf(seconds, 2);
}

function drawPlayTime()
{
  push();
  fill(255);
  stroke(0);
  strokeWeight(3);
  textAlign(RIGHT, TOP);
  textSize(28);
  text(formatPlayTime(floor(playTime)), width - 20, 20);
  pop();
}

function updatePlayTime()
{
  let now = millis();

  if(gameState === "stage1Playing" || gameState === "stage2Playing")
  {
    playTime += (now - lastFrameTime) / 1000;
  }

  lastFrameTime = now;
}

function drawTimeRecordsOnGuide()
{
  loadTimeRecords();

  push();
  textAlign(RIGHT, TOP);
  textSize(22);
  stroke(0);
  strokeWeight(4);
  fill(255);

  text("최근 기록 : " + formatPlayTime(recentClearTime), width - 30, height - 95);
  text("최고 기록 : " + formatPlayTime(bestClearTime), width - 30, height - 60);

  pop();
}

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

// 커스텀마이징
let clothX = 1900;
let clothY = 0;
let clothSize = 90;
let clothGet = false;
let customizationUnlocked = false;
let customizationMessageTimer = 0;
let customizationButtons = [];
let playerColorName = "white";
let playerAccessory = "none";
let playerColors = {
  white: [255, 255, 255],
  red: [255, 90, 90],
  blue: [90, 170, 255],
  green: [90, 230, 120],
  purple: [190, 120, 255]
};


function setup()
{
  createCanvas(window.innerWidth, window.innerHeight);

  gameHeight = height;

  loadStage();

  updateGround();

  rectX = spawnX;
  rectY = spawnY;

  mic = new p5.AudioIn();

  loadCustomization();
  loadTimeRecords();
  lastFrameTime = millis();
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
      if(typeof stage2IntroReadyToStart !== "undefined") stage2IntroReadyToStart = false; 
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
  updatePlayTime();

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

  else if(gameState === 'menu')
  {
    drawMenu();
  }

  else if(gameState === 'customize')
  {
    drawCustomizeScreen();
  }

  else if(gameState === 'ending')
  {
    startEnding();
  }


  autoSaveGame();
}

function stage1GamePlay()
{
  image(img, 0, 0, width, height);

  createPlatform();

  drawItem1();
  drawItem2();
  drawItem3();
  drawClothItem();

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
  checkClothItem();
  checkDeath();

  drawCustomizationUnlockMessage();

  // drawMousePosition();
  drawPlayTime();
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


  saveGame();
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

  let c = playerColors[playerColorName] || playerColors.white;
  fill(c[0], c[1], c[2]);

  square(rectX - camX, rectY, dia);
  drawPlayerAccessory();
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



function drawPreviewPlayer(x, y, size)
{
  push();
  rectMode(CORNER);
  stroke(0);
  strokeWeight(3);

  let c = playerColors[playerColorName] || playerColors.white;
  fill(c[0], c[1], c[2]);
  square(x, y, size);

  drawAccessoryAt(x, y, size);

  strokeWeight(3);
  let eyeSize = size / 5;
  circle(x + size / 4, y + size / 4 + size / 8, eyeSize);
  circle(x + size * 3 / 4, y + size / 4 + size / 8, eyeSize);
  ellipse(x + size / 2, y + size * 3 / 4, size / 5, size / 3);

  pop();
}

function drawAccessoryAt(x, y, size)
{
  push();

  if(playerAccessory === "santa")
  {
    noStroke();
    fill(210, 0, 0);
    triangle(x + size * 0.15, y + size * 0.05, x + size * 0.85, y + size * 0.05, x + size * 0.55, y - size * 0.35);
    fill(255);
    rect(x + size * 0.12, y + size * 0.02, size * 0.76, size * 0.12, 5);
    circle(x + size * 0.58, y - size * 0.35, size * 0.18);
  }
  else if(playerAccessory === "soldier")
  {
    noStroke();
    fill(62, 92, 55);
    arc(x + size / 2, y + size * 0.08, size * 0.8, size * 0.45, PI, TWO_PI);
    rect(x + size * 0.12, y + size * 0.04, size * 0.76, size * 0.13, 4);
    fill(40, 65, 35);
    rect(x + size * 0.28, y - size * 0.05, size * 0.18, size * 0.08);
    rect(x + size * 0.55, y - size * 0.02, size * 0.18, size * 0.07);
  }
  else if(playerAccessory === "bunny")
  {
    stroke(0);
    strokeWeight(3);
    fill(255);
    ellipse(x + size * 0.33, y - size * 0.17, size * 0.22, size * 0.55);
    ellipse(x + size * 0.67, y - size * 0.17, size * 0.22, size * 0.55);
    noStroke();
    fill(255, 170, 200);
    ellipse(x + size * 0.33, y - size * 0.17, size * 0.09, size * 0.35);
    ellipse(x + size * 0.67, y - size * 0.17, size * 0.09, size * 0.35);
  }

  pop();
}

function drawPlayerAccessory()
{
  drawAccessoryAt(rectX - camX, rectY, dia);
}

function drawClothItem()
{
  if(currentStage === 1 && currentMap === 3 && !clothGet)
  {
    imageMode(CORNER);
    drawClothIcon(clothX - camX, clothY, clothSize, clothSize);
  }
}

function checkClothItem()
{
  if(currentStage === 1 && currentMap === 3 && !clothGet)
  {
    let d = dist(rectX + dia / 2, rectY + dia / 2, clothX + clothSize / 2, clothY + clothSize / 2);

    if(d < dia / 2 + clothSize / 2)
    {
      clothGet = true;
      customizationUnlocked = true;
      customizationMessageTimer = 180;
      saveCustomization();
    }
  }
}

function drawCustomizationUnlockMessage()
{
  if(customizationMessageTimer > 0)
  {
    customizationMessageTimer--;

    push();
    textAlign(CENTER, CENTER);
    textSize(34);
    stroke(0);
    strokeWeight(5);
    fill(255, 240, 120);
    text("커스텀마이징이 해금되었습니다!", width / 2, height * 0.18);
    pop();
  }
}

function drawHangerSlot()
{
  if(!customizationUnlocked)
  {
    return;
  }

  let slotX = width - 110;
  let slotY = 25;
  let slotSize2 = 80;

  push();
  rectMode(CORNER);
  stroke(255);
  strokeWeight(3);
  fill(20, 24, 34, 220);
  rect(slotX, slotY, slotSize2, slotSize2, 14);

  imageMode(CORNER);
  drawClothIcon(slotX + 8, slotY + 8, slotSize2 - 16, slotSize2 - 16);

  noStroke();
  fill(255);
  textAlign(CENTER, TOP);
  textSize(13);
  text("CUSTOM", slotX + slotSize2 / 2, slotY + slotSize2 + 4);
  pop();
}

function clickedHangerSlot()
{
  if(!customizationUnlocked)
  {
    return false;
  }

  let slotX = width - 110;
  let slotY = 25;
  let slotSize2 = 80;

  return mouseX > slotX && mouseX < slotX + slotSize2 && mouseY > slotY && mouseY < slotY + slotSize2;
}

function drawCustomizeScreen()
{
  image(backgroundImg, 0, 0, width, height);

  push();
  fill(0, 170);
  rect(0, 0, width, height);

  let panelW = min(760, width * 0.88);
  let panelH = min(540, height * 0.82);
  let panelX = width / 2 - panelW / 2;
  let panelY = height / 2 - panelH / 2;

  fill(20, 24, 34, 245);
  stroke(255);
  strokeWeight(3);
  rect(panelX, panelY, panelW, panelH, 20);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("CUSTOMIZE", width / 2, panelY + 50);

  customizationButtons = [];

  // 미리보기 캐릭터
  drawPreviewPlayer(width / 2 - 45, panelY + 95, 90);

  textSize(22);
  fill(255);
  text("색깔", panelX + 110, panelY + 245);

  let colorNames = ["white", "red", "blue", "green", "purple"];
  let colorLabels = ["흰색", "빨강", "파랑", "초록", "보라"];

  for(let i = 0; i < colorNames.length; i++)
  {
    let bx = panelX + 190 + i * 95;
    let by = panelY + 220;
    let c = playerColors[colorNames[i]];

    stroke(playerColorName === colorNames[i] ? [255, 240, 80] : 255);
    strokeWeight(playerColorName === colorNames[i] ? 5 : 2);
    fill(c[0], c[1], c[2]);
    rect(bx, by, 58, 58, 10);

    noStroke();
    fill(255);
    textSize(13);
    text(colorLabels[i], bx + 29, by + 78);

    customizationButtons.push({x: bx, y: by, w: 58, h: 58, type: "color", value: colorNames[i]});
  }

  fill(255);
  textSize(22);
  text("모자", panelX + 110, panelY + 365);

  let hats = [
    {label:"없음", value:"none"},
    {label:"산타모자", value:"santa"},
    {label:"군인모자", value:"soldier"},
    {label:"토끼 귀", value:"bunny"}
  ];

  for(let i = 0; i < hats.length; i++)
  {
    let bx = panelX + 190 + i * 120;
    let by = panelY + 335;

    stroke(playerAccessory === hats[i].value ? [255, 240, 80] : 255);
    strokeWeight(playerAccessory === hats[i].value ? 5 : 2);
    fill(245);
    rect(bx, by, 96, 52, 10);

    noStroke();
    fill(0);
    textSize(16);
    text(hats[i].label, bx + 48, by + 26);

    customizationButtons.push({x: bx, y: by, w: 96, h: 52, type: "hat", value: hats[i].value});
  }

  let closeX = panelX + panelW - 105;
  let closeY = panelY + panelH - 70;

  fill(255);
  stroke(255);
  strokeWeight(2);
  rect(closeX, closeY, 80, 45, 10);
  noStroke();
  fill(0);
  textSize(18);
  text("닫기", closeX + 40, closeY + 22);

  customizationButtons.push({x: closeX, y: closeY, w: 80, h: 45, type: "close", value: "close"});

  pop();
}

function handleCustomizeClick()
{
  for(let b of customizationButtons)
  {
    if(mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h)
    {
      if(b.type === "color")
      {
        playerColorName = b.value;
        saveCustomization();
      }
      else if(b.type === "hat")
      {
        playerAccessory = b.value;
        saveCustomization();
      }
      else if(b.type === "close")
      {
        guideReady = false;
        gameState = "guide";
      }

      return true;
    }
  }

  return false;
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
if(key === 'm' || key === 'M')
{
  if(gameState === "menu")
  {
    gameState = previousGameState;
  }
  else if(gameState === "guide" || gameState === "intro" || gameState === "stage1Playing" || gameState === "stage2Intro" || gameState === "stage2Playing" || gameState === "customize")
    {
      previousGameState = gameState;
      saveGame();
      menuSnapshot = get();
      gameState = "menu";
    }
    
    return false;
}

if(gameState === "menu")
{
  return false;
}

if(keyCode === ESCAPE && gameState === "customize")
{
  gameState = "guide";
  return false;
}

  if(keyCode === UP_ARROW && isGround && item3Get === false)
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

  if(currentStage === 1 )
  {
    if(item1Get === true && key === '1' && currentMap != 3)
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

    saveGame();
  }

  // if(key === 'g' || key === 'G') item1Get = true;
  // if(key === 'h' || key === 'H') item2Get = true;
  // if(key === 'k' || key === 'K') item3Get = true;

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

  if(key === 'n' || key === 'N')
  {
    nextMap();
  }

  // if(key === 'b' || key === 'B')
  // {
  //   camY = -(stage2WorldHeight - height);
  //   startBossTransition();
  // }


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

function drawMenu()
{
  if(menuSnapshot)
  {
    image(menuSnapshot, 0, 0, width, height);
    filter(BLUR, 3);
  }
  else
  {
    background(0);
  }

  push();

  noStroke();
  fill(0, 150);
  rect(0, 0, width, height);

  let menuW = min(420, width * 0.82);
  let menuH = 420;
  let menuX = width / 2 - menuW / 2;
  let menuY = height / 2 - menuH / 2;

  fill(20, 24, 34, 240);
  stroke(255);
  strokeWeight(2);
  rect(menuX, menuY, menuW, menuH, 18);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(34);
  text("MENU", width / 2, menuY + 55);

  menuButtons = [];

  let labels = ["새 게임", "메인화면", "리스폰", "이어하기"];
  let actions = ["newGame", "main", "respawn", "loadSave"];

  let buttonW = menuW - 90;
  let buttonH = 56;
  let startY = menuY + 115;

  for(let i = 0; i < labels.length; i++)
  {
    let x = width / 2 - buttonW / 2;
    let y = startY + i * 72;

    let hover =
      mouseX > x &&
      mouseX < x + buttonW &&
      mouseY > y &&
      mouseY < y + buttonH;

    fill(hover ? 255 : 235);
    stroke(hover ? 0 : 255);
    strokeWeight(2);
    rect(x, y, buttonW, buttonH, 12);

    noStroke();
    fill(0);
    textSize(24);
    text(labels[i], width / 2, y + buttonH / 2);

    menuButtons.push({
      x: x,
      y: y,
      w: buttonW,
      h: buttonH,
      action: actions[i]
    });
  }

  pop();
}

function mouseClicked()
{
  checkEndingClick();
  
  if(gameState === "stage2Intro" && typeof stage2IntroReadyToStart !== "undefined" && stage2IntroReadyToStart)
  {
    stage2IntroReadyToStart = false;
    stage2IntroFrame = 0;
    gameState = "stage2Playing";

    if(typeof loadStage2 === "function")
    {
      loadStage2();
    }

    return false;
  }
  if(gameState === "customize")
  {
    handleCustomizeClick();
    return false;
  }

  if(gameState === "guide")
  {
    if(clickedHangerSlot())
    {
      gameState = "customize";
      return false;
    }
  }

  if(gameState !== "menu")
  {
    return false;
  }

  for(let b of menuButtons)
  {
    if(
      mouseX > b.x &&
      mouseX < b.x + b.w &&
      mouseY > b.y &&
      mouseY < b.y + b.h
    )
    {
      handleMenuAction(b.action);
      return false;
    }
  }

  return false;
}

function handleMenuAction(action)
{
  if(action === "continue")
  {
    gameState = previousGameState;
  }

  else if(action === "respawn")
  {
    if(typeof restartStage2FromDeath === "function" && (currentStage === 2 || currentMap === 4))
    {
      restartStage2FromDeath();
    }
    else
    {
      itemReset();
      respawnPlayer();
    }

    saveGame();
  }

  else if(action === "loadSave")
  {
    if(hasSavedGame())
    {
      loadSavedGame();
    }
  }

  else if(action === "newGame")
  {
    clearTimeRecords();

    clearSavedGame();

    currentStage = 1;
    currentMap = 1;

    item1Get = false;
    item2Get = false;
    item3Get = false;
    clothGet = false;
    customizationUnlocked = false;
    playerColorName = 'white';
    playerAccessory = 'none';

    itemReset();
    loadStage();
    respawnPlayer();
  }

  else if(action === "main")
  {
    currentStage = 1;
    currentMap = 1;

    item1Get = false;
    item2Get = false;
    item3Get = false;

    itemReset();
    loadStage();

    guideReady = false;
    gameState = "guide";
  }


}