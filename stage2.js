let ship;

// =======================
// Stage2 공용 변수
// =======================

let currentStage2Map = 1;

// 카메라
let camY = 0;

// 월드
let stage2WorldHeight = 9000;
let stage2ScrollSpeed = 4;

// 별
let stage2Stars = [];
let stage2StarCount = 160;

// 엔티티
let meteors = [];
let ufos = [];
let aliens = [];
let enemyBullets = [];
let playerBullets = []; 

// 🔥 보스가 스폰할 무적 아이템 변수
let stage2Item = null;

// 스폰
let stage2SpawnTimer = 0;

// 점수
let stage2Score = 0;

let stage2BossStarted = false;

let bossTransition = false;

let fadeAlpha = 0;
let fadeMode = 0;

let boss;

let bossBullets = [];

let bossInvincible = false;

let stage2StartTimer = 0;

// 1 = 1라운드, 2 = 보스전
let stage2RespawnPoint = 1;

// 연사 속도 조절용 타이머 변수
let playerShootCooldown = 0;

// 🎬 보스 사망 연출용 제어 변수 (추가)
let bossDeadSequence = false;   // 보스 사망 연출 시작 여부
let whiteOutAlpha = 0;          // 흰색 페이드 불투명도 (0 ~ 255)
let endingTimer = 0;            // 마무리 연출 시간 타이머

// =======================
// 시작
// =======================

function loadStage2()
{
  currentStage = 2;
  currentStage2Map = 1;
  stage2RespawnPoint = 1;
  loadStage2Map1();

  // stage2 시작 체크포인트 저장
  if(typeof saveCheckpoint === "function") saveCheckpoint();
}

// =======================
// 맵 초기화
// =======================

function loadStage2Map1()
{
  stage2RespawnPoint = 1;
  camY = 0;

  stage2WorldHeight = 9000;

  stage2SpawnTimer = 0;
  stage2Score = 0;

  ship = new Ship(width / 2, height * 0.65);

  meteors = [];
  ufos = [];
  aliens = [];
  enemyBullets = [];
  playerBullets = []; 

  stage2Item = null;

  generateStage2Stars();

  boss = null;

  bossBullets = [];

  stage2BossStarted = false;

  bossTransition = false;

  fadeAlpha = 0;
  fadeMode = 0;

  stage2ScrollSpeed = 4;
  playerShootCooldown = 0;

  // 사망 연출 변수 초기화
  bossDeadSequence = false;
  whiteOutAlpha = 0;
  endingTimer = 0;

}

// =======================
// 메인 루프
// =======================

function stage2GamePlay()
{
  // 보스 사망 연출 중이 아닐 때만 일반 게임 업데이트 진행
  if(gameState !== "dead" && !bossDeadSequence)
  {
    updateStage2();
  }

  drawStage2();
}

// =======================
// UPDATE
// =======================

function updateStage2()
{
  if(currentStage2Map === 1)
  {
    updateStage2Map1();
  }
}

// =======================
// MAP1 UPDATE
// =======================

function updateStage2Map1()
{
  // 1. 키보드 1번 키 입력 감지 (기존 방어막 스킬 그대로 유지)
  if (keyIsDown(49) || keyIsDown(97)) { 
    if (ship) ship.useSkill();
  }

  // 2. 자동 발사
  if (playerShootCooldown > 0) {
    playerShootCooldown--;
  }

  // 마우스를 누르지 않아도 계속 총알이 나감
  if (ship && playerShootCooldown <= 0) {
    playerBullets.push(new Bullet(ship.x, ship.y - 35));
    playerShootCooldown = 8; // 숫자를 낮추면 더 빠르게 발사됨
  }

  // 🔥 떨어지는 무적 아이템 업데이트 및 충돌 체크
  if (stage2Item && stage2Item !== "SPAWNED") {
    stage2Item.update();
    if (stage2Item.hits(ship)) {
      stage2Item.activate();
      stage2Item = null; // 먹으면 제거
    }
  }

  // 카메라 (자동 상승)
  camY -= stage2ScrollSpeed;
  camY = constrain(camY, -(stage2WorldHeight - height), 0);

  // 플레이어
  ship.update();

  // 스폰
  if(!stage2BossStarted)
  {
    spawnMeteors();
    spawnUFOs();
  }

  // 업데이트
  updateMeteors();
  updateUFOs();

  updateBullets();

  updateEnemyBullets();

  updateBossBullets();

  if(stage2BossStarted && boss)
  {
    boss.update();
  }

  checkUFOHits();

  checkBossHits();

  // stage2 시작 후 일정 시간 + 아직 보스 안 시작했을 때만
  if(
    !stage2BossStarted &&
    !bossTransition &&
    stage2SpawnTimer > 300 &&
    camY <= -(stage2WorldHeight - height) &&
    gameState === "stage2Playing"
  )
  {
    // 보스전 진입 전 남아있는 보스 객체 제거
    boss = null;
    startBossTransition();
  }

  updateBossTransition();
}

// =======================
// DRAW
// =======================

function drawStage2()
{
  background(10);

  if(currentStage2Map === 1)
  {
    drawStage2Map1();
  }

  drawStage2HUD();
  if(typeof drawPlayTime === "function") drawPlayTime();

  drawFadeEffect();

  // 🎬 보스 사망 연출 핸들러 호출 (모든 그래픽 위에 흰색 화면을 덮기 위해 최하단 배치)
  handleBossDefeatedSequence();
}

// =======================
// MAP1 DRAW
// =======================

function drawStage2Map1()
{
  drawStage2Stars();
  drawStage2WorldBands();

  drawMeteors();
  drawUFOs();

  drawBullets();
  drawEnemyBullets();
  drawBossBullets();

  // 🔥 화면에 아이템 그리기
  if (stage2Item && stage2Item !== "SPAWNED") {
    stage2Item.display();
  }

  if(stage2BossStarted && boss)
  {
    boss.display();
  }

  ship.display();
}

// =======================
// METEOR, UFO SPAWN
// =======================

function spawnMeteors()
{
  stage2SpawnTimer++;

  if(stage2SpawnTimer % 20 === 0)
  {
    let x = random(width);
    let y = camY - 100;

    meteors.push(new Meteor(x, y, random(3, 7)));
  }
}

function spawnUFOs()
{
  if(ufos.length >= 5)
  {
    return;
  }

  if(stage2SpawnTimer % 60 === 0)
  {
    let tries = 0;

    while(tries < 30)
    {
      let x = random(80, width - 80);

      let overlapped = false;

      for(let u of ufos)
      {
        let d = dist(x, 80, u.x, u.y);

        if(d < 120)
        {
          overlapped = true;
          break;
        }
      }

      if(!overlapped)
      {
        ufos.push(new UFO(x, 80));
        break;
      }

      tries++;
    }
  }
}

// =======================
// METEOR,UFO UPDATE
// =======================

function updateMeteors()
{
  for(let i = meteors.length - 1; i >= 0; i--)
  {
    let m = meteors[i];

    m.update();

    // 충돌 검사
    if(m.hits(ship))
    {
      // 일반 무적 타이머나 스킬 방어막 타이머가 둘 다 없을 때만 데미지
      if(!ship.invincible && ship.skillTimer <= 0)
      {
        ship.hp--;
        ship.invincible = true;       
        ship.invincibleTimer = 60;    

        if(ship.hp <= 0)
        {
          gameState = "dead";
        }
      }
      
      meteors.splice(i, 1);
      continue;
    }

    if(m.offScreen())
    {
      meteors.splice(i, 1);
    }
  }
}

function updateUFOs()
{
  for(let i = ufos.length - 1; i >= 0; i--)
  {
    let u = ufos[i];

    u.update();

    if(u.dead && u.deadTimer > 20)
    {
      ufos.splice(i, 1);
      continue;
    }

    if(u.offScreen())
    {
      u.dead = true;
    }
  }
}

// =======================
// METEOR, UFO DRAW
// =======================

function drawMeteors()
{
  for(let m of meteors)
  {
    m.display();
  }
}

function drawUFOs()
{
  for(let u of ufos)
  {
    u.display();
  }
}

function drawEnemyBullets()
{
  for(let b of enemyBullets)
  {
    b.display();
  }
}

// =======================
// STAR SYSTEM
// =======================

function generateStage2Stars()
{
  stage2Stars = [];

  for(let i = 0; i < stage2StarCount; i++)
  {
    stage2Stars.push({
      x: random(width),
      y: random(stage2WorldHeight),
      r: random(1, 3)
    });
  }
}

function drawStage2Stars()
{
  noStroke();
  fill(255);

  for(let s of stage2Stars)
  {
    let sy = s.y - camY;

    if(sy > -10 && sy < height + 10)
    {
      circle(s.x, sy, s.r);
    }
  }
}

// =======================
// WORLD GRID
// =======================

function drawStage2WorldBands()
{
  stroke(255, 30);

  for(let y = 0; y < stage2WorldHeight; y += 700)
  {
    let sy = y - camY;

    if(sy > -20 && sy < height + 20)
    {
      line(0, sy, width, sy);
    }
  }
}

// =======================
// HUD
// =======================

function drawStage2HUD()
{
  fill(255);
  noStroke();

  textAlign(LEFT, BASELINE);
  textSize(16);

  push();

  textSize(25);

  text("HP: " + ship.hp, 20, 20);
  // text("SCORE: " + stage2Score, 20, 40);
  // text("CAMY: " + floor(camY), 20, 60);

  pop();


  // 스킬 쿨타임 표시 UI
  if (ship.skillCooldown > 0) {
    let remainSec = ceil(ship.skillCooldown / 60);
    fill(255, 100, 100);
    text("스킬 쿨타임: " + remainSec + "초", 20, 50);
  } else {
    fill(100, 255, 100);
    text("스킬 사용 가능! (1번 키)", 20, 50);
  }

  // 🔥 무적 아이템 지속 시간 UI 표시
  if (ship.invincible && ship.invincibleTimer > 60) { 
    fill(255, 255, 0);
    text("⭐ 초강력 무적 상태!! (" + ceil(ship.invincibleTimer / 60) + "초)", 20, 120);
  }

  if(stage2BossStarted && boss && !boss.dead)
  {
    drawBossHP();
  }
}

// ======================
// UFO CLASS
// ======================

class UFO
{
  constructor(x, y)
  {
    this.x = x;

    this.y = -100;
    this.targetY = y;

    this.w = 70;
    this.h = 35;

    this.speed = 10;

    this.dead = false;
    this.deadTimer = 0;

    this.shootTimer = random(0, 90);
  }

  update()
  {
    if(!this.dead)
    {
      this.shootTimer++;

      if(this.shootTimer > 60)
      {
        enemyBullets.push(
          new EnemyBullet(this.x, this.y + camY + 20)
        );

        this.shootTimer = 0;
      }

      if(this.y < this.targetY)
      {
        this.y += this.speed;
      }
      else
      {
        this.y = this.targetY;
      }
    }
    else
    {
      this.deadTimer++;
    }
  }

  offScreen()
  {
    return false;
  }

  display()
  {
    push();

    translate(this.x, this.y);

    rectMode(CENTER);
    noStroke();

    if(!this.dead)
    {      
      fill(120);
      ellipse(0, 0, this.w, this.h);
  
      fill(120, 255, 120);
      ellipse(0, -10, 35, 20);
    }
    else
    {
      let r = this.deadTimer * 4;

      fill(255, 150, 0, 180);
      ellipse(0, 0, r);

      fill(255, 220, 100, 150);
      ellipse(0, 0, r * 0.6);

      fill(255);
      ellipse(0, 0, r * 0.25);
    }

    pop();
  }
}

// =======================
// METEOR CLASS
// =======================

class Meteor
{
  constructor(x, y, speed)
  {
    this.x = x;
    this.y = y;
    this.speed = speed;

    this.r = random(18, 40);

    this.rotation = random(TWO_PI);
    this.rotSpeed = random(-0.03, 0.03);

    this.img = meteorImg;
  }

  update()
  {
    this.y += this.speed;
    this.rotation += this.rotSpeed;
  }

  display()
  {
    push();

    translate(this.x, this.y - camY);
    rotate(this.rotation);

    imageMode(CENTER);
    image(this.img, 0, 0, this.r * 2, this.r * 2);

    pop();
  }

  hits(ship)
  {
    let d = dist(this.x, this.y, ship.x, ship.y);
    return d < this.r + ship.hit.r;
  }

  offScreen()
  {
    return (this.y - camY > height + 100);
  }
}

// =======================
// BULLET CLASS
// =======================

class Bullet
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;

    this.speed = 20;
    this.r = 4;
  }

  update()
  {
    this.y -= this.speed;
  }

  display()
  {
    push();
    translate(this.x, this.y - camY);

    noStroke();
    fill(255, 180, 0);
    rectMode(CENTER);
    rect(0, 0, 12, 36, 3);
    fill(0, 255, 255, 180);
    ellipse(0, 4, 8, 16);
    fill(255, 100, 0, 150);
    ellipse(0, 24, 12, 20);

    pop();
  }

  offScreen()
  {
    return this.y < camY - 100;
  }
}

class EnemyBullet
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;

    this.speed = 10;
    this.r = 20;
  }

  update()
  {
    this.y += this.speed;
  }

  display()
  {
    push();

    translate(this.x, this.y - camY);

    noStroke();

    fill(255, 0, 80);
    ellipse(0, 0, this.r, this.r * 5);

    fill(255);
    ellipse(0, 0, this.r * 0.3, this.r * 2.5);

    pop();
  }

  hits(ship)
  {
    let d = dist(this.x, this.y, ship.x, ship.y);

    return d < this.r + ship.hit.r;
  }

  offScreen()
  {
    return this.y - camY > height + 100;
  }
}

// =======================
// SHIP
// =======================

class Ship
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;

    this.w = 40;
    this.h = 60;

    this.smooth = 0.12;

    this.hp = 3;

    this.hit = {
      x: this.x,
      y: this.y,
      r: 18
    };

    this.invincible = false;
    this.invincibleTimer = 0;

    this.skillTimer = 0;        
    this.skillCooldown = 0;     
    this.shieldRadius = 75;     
  }

  useSkill()
  {
    if (this.skillCooldown <= 0 && this.skillTimer <= 0) {
      this.skillTimer = 180;        
      this.skillCooldown = 1200;    
    }
  }

  update()
  {
    this.x = lerp(this.x, mouseX, this.smooth);
    this.y = lerp(this.y, mouseY + camY, this.smooth);

    this.hit.x = this.x;
    this.hit.y = this.y;

    this.x = constrain(this.x, this.w / 2, width - this.w / 2);

    if(this.invincible)
    {
      this.invincibleTimer--;
      if(this.invincibleTimer <= 0)
      {
        this.invincible = false;
      }
    }

    if (this.skillTimer > 0) {
      this.skillTimer--;
      
      if (this.skillTimer === 0) {
        this.clearNearbyBullets();
      }
    }

    if (this.skillCooldown > 0) {
      this.skillCooldown--;
    }
  }

  clearNearbyBullets()
  {
    let wipeRadius = 250; 

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      let b = enemyBullets[i];
      let d = dist(this.x, this.y, b.x, b.y);
      if (d < wipeRadius) {
        enemyBullets.splice(i, 1);
      }
    }

    for (let i = bossBullets.length - 1; i >= 0; i--) {
      let b = bossBullets[i];
      let d = dist(this.x, this.y, b.x, b.y);
      if (d < wipeRadius) {
        bossBullets.splice(i, 1);
      }
    }
  }

  display()
  {
    // 무적 아이템 지속 시간이 길게 남았을 때는 번쩍거리는 효과 제외하고 항상 표시되도록 연출 조건 보정
    if(this.invincible && this.invincibleTimer < 60 && this.skillTimer <= 0 && frameCount % 8 < 4)
    {
      return; 
    }

    push();

    translate(this.x, this.y - camY);

    drawShipBody();
    drawShipCore();
    drawShipWing();
    drawShipAntenna();
    drawShipEngine();

    // 1번 키 스킬 방어막 이펙트
    if (this.skillTimer > 0) {
      push();
      let pulse = sin(frameCount * 0.1) * 4;
      stroke(0, 190, 255, 200);
      strokeWeight(3 + sin(frameCount * 0.2) * 1);
      fill(0, 150, 255, 40 + pulse * 2); 
      ellipse(0, 0, (this.shieldRadius + pulse) * 2);
      pop();
    }

    // 🔥 아이템 먹어서 8초 황금 무적 상태일 때 스페셜 오라 연출
    if (this.invincible && this.invincibleTimer > 60) {
      push();
      stroke(255, 215, 0, 200); // 황금빛 테두리
      strokeWeight(3);
      fill(255, 255, 0, 30 + sin(frameCount * 0.2) * 15);
      circle(0, 0, 65);
      pop();
    }

    pop();
  }
}

// =======================
// SHIP PARTS
// =======================

function drawShipBody()
{
  noStroke();
  rectMode(CENTER);

  // 대가리/기수 추가
  fill(210);
  triangle(-20, -20, 20, -20, 0, -48);

  // 몸체
  fill(180);
  rect(0, 5, 40, 62, 8);
}

function drawShipCore()
{
  fill(100, 200, 255);
  ellipse(0, 5, 15, 15);
}

function drawShipWing()
{
  fill(120);
  triangle(-20, 10, -40, 30, -20, 30);
  triangle(20, 10, 40, 30, 20, 30);
}

function drawShipAntenna()
{
  stroke(200);
  strokeWeight(2);

  line(0, -30, 0, -48);

  noStroke();
  fill(255, 80, 80);
  ellipse(0, -52, 6, 6);
}

// 수정: 엔진 이펙트도 사망 연출 시 숨김 처리 추가

function drawShipEngine()
{
  if (bossDeadSequence && endingTimer > 150) return;
  noStroke();
  fill(255, 150, 0, 180);
  ellipse(0, 40 + random(-2, 2), 12, 20);
}

function drawBullets()
{
  for(let b of playerBullets)
  {
    b.display();
  }
}

function updateBullets()
{
  for(let i = playerBullets.length - 1; i >= 0; i--)
  {
    let b = playerBullets[i];

    b.update();

    if(b.offScreen())
    {
      playerBullets.splice(i, 1);
    }
  }
}

function checkUFOHits()
{
  for(let i = ufos.length - 1; i >= 0; i--)
  {
    let u = ufos[i];

    if(u.dead)
    {
      continue;
    }

    for(let j = playerBullets.length - 1; j >= 0; j--)
    {
      let b = playerBullets[j];

      let d = dist(b.x, b.y - camY, u.x, u.y);

      if(d < 30)
      {
        u.dead = true;

        playerBullets.splice(j, 1);

        stage2Score += 100;
        return;
      }
    }
  }
}

function updateEnemyBullets()
{
  for(let i = enemyBullets.length - 1; i >= 0; i--)
  {
    let b = enemyBullets[i];

    b.update();

    if(b.hits(ship))
    {
      if(!ship.invincible && ship.skillTimer <= 0)
      {
        ship.hp--;
        ship.invincible = true;
        ship.invincibleTimer = 60; 

        if(ship.hp <= 0)
        {
          gameState = "dead";
        }
      }

      enemyBullets.splice(i, 1);
      continue;
    }

    if(b.offScreen())
    {
      enemyBullets.splice(i, 1);
    }
  }
}


// ====================
// 보스전 컨트롤
// ====================

function startBossTransition()
{
  if(stage2BossStarted || bossTransition)
  {
    return;
  }

  bossTransition = true;

  stage2ScrollSpeed = 1;

  fadeMode = 1;
}

function startStage2Boss()
{
  if(stage2BossStarted)
  {
    return;
  }

  stage2BossStarted = true;
  stage2RespawnPoint = 2;

  stage2ScrollSpeed = 0;

  meteors = [];
  ufos = [];
  enemyBullets = [];

  spawningStopped = true;

  boss = new Boss(width / 2, camY + 200);

}

function updateBossTransition()
{
  if(fadeMode === 1)
  {
    fadeAlpha += 6;

    stage2ScrollSpeed *= 0.97;

    if(fadeAlpha >= 255)
    {
      fadeAlpha = 255;

      startStage2Boss();

      fadeMode = 2;
    }
  }
  else if(fadeMode === 2)
  {
    fadeAlpha -= 6;

    if(fadeAlpha <= 0)
    {
      fadeAlpha = 0;

      fadeMode = 0;

      bossTransition = false;
    }
  }
}

function drawFadeEffect()
{
  if(fadeAlpha <= 0)
  {
    return;
  }

  noStroke();

  fill(0, fadeAlpha);

  rect(0, 0, width, height);
}

// ==========================================
// 🔥 각성 리뉴얼된 BOSS 클래스
// ==========================================
class Boss
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;

    this.w = 350;
    this.h = 350;

    this.hp = 1000;

    this.dead = false;

    this.entered = false;

    this.attackTimer = 0;

    this.pattern = 0;
    this.patternTimer = 0;

    this.moveAngle = 0;

    this.phase = 1;
    this.invincible = false;       
    this.invincibleTimer = 0;  

    this.spiralAngle = 0;
    this.rageMode = false;
  }

  update()
  {
    if(this.invincible)
    {
      this.invincibleTimer--;

      // 2페이즈 돌입 시 무적 아이템 스폰 (딱 한 번)
      if (this.invincibleTimer === 240 && !stage2Item) {
        stage2Item = new UpgradeGem(width / 2, camY + 120);
      }
      
      this.x = lerp(this.x, width / 2, 0.05);
      this.y = lerp(this.y, camY + 200, 0.05);

      if(this.invincibleTimer <= 0)
      {
        this.invincible = false;
        this.rageMode = true; 
        this.pattern = 0;
        this.patternTimer = 0;
        this.attackTimer = 0;
      }
      return;
    }
    
    if(!this.entered)
    {
      this.y += 2;

      if(this.y >= camY + 220)
      {
        this.entered = true;
      }
    }
    if(this.entered && !this.dead)
    {
      this.attackTimer++;
      this.patternTimer++;

      let nextPatternTime = this.rageMode ? 240 : 300;

      if(this.patternTimer > nextPatternTime)
      {
        this.pattern++;

        if(this.pattern > 3)
        {
          this.pattern = 0;
        }

        this.patternTimer = 0;
        this.attackTimer = 0;
      }

      if(!this.rageMode)
      {
        if(this.pattern === 0 && this.attackTimer > 20) {
          this.shootFanPattern();
          this.attackTimer = 0;
        }
        else if(this.pattern === 1 && this.attackTimer > 8) {
          this.shootSpiralPattern();
          this.attackTimer = 0;
        }
        else if(this.pattern === 2 && this.attackTimer > 70) {
          this.shootWallPattern();
          this.attackTimer = 0;
        }
        else if(this.pattern === 3 && this.attackTimer > 40) {
          this.shootAimPattern();
          this.attackTimer = 0;
        }

        this.moveAngle += 0.02;
        this.x = width / 2 + sin(this.moveAngle) * 220;
      }
      else
      {
        if(this.pattern === 0) {
          if(this.attackTimer > 6) {
            this.shootRageAimPattern();
            this.attackTimer = 0;
          }
        }
        else if(this.pattern === 1) {
          if(this.attackTimer > 4) {
            this.shootRageSpiralPattern();
            this.attackTimer = 0;
          }
        }
        else if(this.pattern === 2) {
          if(this.attackTimer > 45) {
            this.shootRageCrossWallPattern();
            this.attackTimer = 0;
          }
        }
        else if(this.pattern === 3) {
          if(this.attackTimer > 15) {
            this.spawnRageMeteors();
            this.attackTimer = 0;
          }
        }

        this.moveAngle += 0.04;
        this.x = width / 2 + sin(this.moveAngle) * 250;
        this.y = (camY + 220) + cos(this.moveAngle * 2) * 60;
      }
    }
  }

  display()
  {
    if(this.dead)
    {
      return;
    }
    
    push();

    translate(this.x, this.y - camY);

    imageMode(CENTER);

    if(this.rageMode) {
      if(frameCount % 4 < 2) {
        tint(255, 100, 100);
      }
      translate(random(-3, 3), random(-3, 3));
    }

    image(bossImg, 0, 0, this.w * 1.5, this.h);

    pop();

    if(this.invincible) {
      push();
      stroke(255, 0, 0, 200);
      strokeWeight(5);
      fill(255, 0, 0, 30 + sin(frameCount * 0.2) * 20);
      circle(this.x, this.y - camY, 400 + random(-10, 10));
      pop();
    }
  }

  shootFanPattern()
  {
    for(let angle = 65; angle <= 115; angle += 5)
    {
      bossBullets.push(new BossBullet(this.x, this.y + 80, angle, 9));
    }
  }

  shootSpiralPattern()
  {
    bossBullets.push(new BossBullet(this.x, this.y + 50, this.spiralAngle, 7));
    this.spiralAngle += 18;
  }

  shootWallPattern()
  {
    for(let angle = 60; angle <= 120; angle += 15)
    {
      bossBullets.push(new BossBullet(this.x - 120, this.y + 40, angle, 8));
      bossBullets.push(new BossBullet(this.x + 120, this.y + 40, angle, 8));
    }
  }
  
  shootAimPattern()
  {
    let dx = ship.x - this.x;
    let dy = ship.y - this.y;
    let angle = degrees(atan2(dy, dx));

    for(let i = -2; i <= 2; i++)
    {
      bossBullets.push(new BossBullet(this.x, this.y + 40, angle + i * 10, 11));
    }
  }

  shootRageAimPattern() {
    let dx = ship.x - this.x;
    let dy = ship.y - this.y;
    let angle = degrees(atan2(dy, dx));
    for(let i = -1; i <= 1; i++) {
      bossBullets.push(new BossBullet(this.x, this.y + 60, angle + i * 5, 14));
    }
  }

  shootRageSpiralPattern() {
    for(let i = 0; i < 4; i++) {
      bossBullets.push(new BossBullet(this.x, this.y + 50, this.spiralAngle + (i * 90), 8));
    }
    this.spiralAngle += 13;
  }

  shootRageCrossWallPattern() {
    for(let angle = 45; angle <= 105; angle += 12) {
      bossBullets.push(new BossBullet(this.x - 150, this.y + 40, angle, 7));
    }
    for(let angle = 75; angle <= 135; angle += 12) {
      bossBullets.push(new BossBullet(this.x + 150, this.y + 40, angle, 7));
    }
  }

  spawnRageMeteors() {
    for(let i = 0; i < 2; i++) {
      let randX = random(30, width - 30);
      let spawnY = camY - 50;
      meteors.push(new Meteor(randX, spawnY, random(6, 11)));
    }
  }
}

// =======================
// 충돌 판정 및 데미지
// =======================
function checkBossHits()
{
  if(!boss || boss.dead || bossDeadSequence)
  {
    return;
  }

  if(boss.invincible || bossInvincible)
  {
    return;
  }

  for(let i = playerBullets.length - 1; i >= 0; i--)
  {
    let b = playerBullets[i];

    let bx = b.x;
    let by = b.y - camY;

    let left = boss.x - 110;
    let right = boss.x + 110;

    let top = boss.y - camY - 120;
    let bottom = boss.y - camY + 120;

    if(
      bx > left &&
      bx < right &&
      by > top &&
      by < bottom
    )
    {
      boss.hp -= 10;

      playerBullets.splice(i, 1);

      if(boss.hp <= 500 && boss.phase === 1)
      {
        boss.phase = 2;
        boss.invincible = true;         
        boss.invincibleTimer = 300; 
      }

      // 💥 보스 사망 시 시퀀스 발동 처리 추가
      if(boss.hp <= 0)
      {
        boss.dead = true;
        bossDeadSequence = true; 
        endingTimer = 0;
        whiteOutAlpha = 0;
        if(typeof saveClearTimeRecord === "function") saveClearTimeRecord();
        
        // 화면 안의 위험 요소 일괄 제거
        bossBullets = [];
        enemyBullets = [];
        meteors = [];
        ufos = [];
      }
    }
  }
}

function drawBossHP()
{
  let barW = 400;
  let barH = 20;

  let x = width / 2 - barW / 2;
  let y = 40;

  noStroke();

  fill(80);
  rect(x, y, barW, barH);

  if(boss.rageMode && frameCount % 10 < 5) {
    fill(255, 255, 0);
  } else {
    fill(255, 60, 60);
  }

  let hpW = map(boss.hp, 0, 1000, 0, barW);

  rect(x, y, hpW, barH);

  fill(255);
  textAlign(CENTER, CENTER);
  
  let bossTitle = boss.rageMode ? "BOSS : PHASE 2 (각성)" : "BOSS";
  text(bossTitle, width / 2, y + barH / 2);
}

// =======================
// BOSS BULLET CLASS
// =======================
class BossBullet
{
  constructor(x, y, angle, speed)
  {
    this.x = x;
    this.y = y;

    this.speed = speed;

    this.angle = radians(angle);

    this.vx = cos(this.angle) * this.speed;
    this.vy = sin(this.angle) * this.speed;

    this.r = 12;
  }

  update()
  {
    this.x += this.vx;
    this.y += this.vy;
  }

  display()
  {
    push();

    translate(this.x, this.y - camY);

    noStroke();

    fill(255, 0, 120);
    ellipse(0, 0, this.r * 2);

    fill(255);

    ellipse(0, 0, this.r);

    pop();
  }

  hits(ship)
  {
    let d = dist(this.x, this.y, ship.x, ship.y);

    return d < this.r + ship.hit.r;
  }

  offScreen()
  {
    return(
      this.x < -100 ||
      this.x > width + 100 ||
      this.y - camY > height + 100 ||
      this.y - camY < -100
    );
  }
}

function updateBossBullets()
{
  for(let i = bossBullets.length - 1; i >= 0; i--)
  {
    let b = bossBullets[i];

    b.update();

    if(b.hits(ship))
    {
      if(!ship.invincible && ship.skillTimer <= 0)
      {
        ship.hp--;
        ship.invincible = true;
        ship.invincibleTimer = 60; 

        if(ship.hp <= 0)
        {
          gameState = "dead";
        }
      }

      bossBullets.splice(i, 1);
      continue;
    }

    if(b.offScreen())
    {
      bossBullets.splice(i, 1);
    }
  }
}

function drawBossBullets()
{
  for(let b of bossBullets)
  {
    b.display();
  }
}

// ==========================================
// ⭐ 신규 클래스: 2페이즈 역전용 무적 보석
// ==========================================
class UpgradeGem {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 25;
    this.vy = 2; 
  }

  update() {
    this.y += this.vy;
  }

  display() {
    push();
    translate(this.x, this.y - camY);
    
    rectMode(CENTER);
    rotate(frameCount * 0.05);
    
    stroke(255, 255, 0);
    strokeWeight(2);
    fill(255, 215, 0, 200 + sin(frameCount * 0.2) * 55); 
    
    quad(0, -this.r, this.r, 0, 0, this.r, -this.r, 0);
    
    fill(255);
    ellipse(0, 0, 10, 10);
    pop();
  }

  hits(ship) {
    let d = dist(this.x, this.y, ship.x, ship.y);
    return d < this.r + ship.hit.r;
  }

  activate() {
    ship.invincible = true;
    ship.invincibleTimer = 480; 
    
    enemyBullets = [];
    bossBullets = [];
    
    console.log("⭐ 황금 무적 보석 획득!! 8초간 완벽 무적 상태 돌입!");
  }
}

// ==========================================
// 🎬 추가된 핵심 처리: 보스 사망 화이트아웃 및 엔딩 텍스트 애니메이션
// ==========================================
// function handleBossDefeatedSequence() {
//   if (!bossDeadSequence) return;

//   endingTimer++;

//   // 1단계: 흰색 사각형의 투명도를 높이며 화면을 흐릿하고 하얗게 채움 (약 2.5초간 진행)
//   if (endingTimer < 150) {
//     whiteOutAlpha = map(endingTimer, 0, 150, 0, 255);
//   } else {
//     whiteOutAlpha = 255;
//   }

//   push();
//   fill(255, 255, 255, whiteOutAlpha);
//   rectMode(CORNER);
//   rect(0, 0, width, height);
//   pop();

//   // 2단계: 화면이 완전히 하얗게 변한 뒤 마무리 서사 애니메이션 작동
//   if (endingTimer >= 150) {
//     push();
//     textAlign(CENTER, CENTER);
//     noStroke();

//     // 텍스트가 서서히 나타나는 페이드인 연출
//     let textAlpha = map(endingTimer, 150, 230, 0, 255);
//     textAlpha = constrain(textAlpha, 0, 255);

//     // 연출 메인 타이틀 묘사 (SF 감성의 차분하고 세련된 다크네이비 색상)
//     fill(22, 32, 54, textAlpha);
//     textSize(34);
//     text("MISSION ACCOMPLISHED", width / 2, height / 2 - 60);

//     // 자막 애니메이션 (위아래로 우아하게 요동치는 펄스 효과 부여)
//     let textYOffset = sin(frameCount * 0.04) * 4;
//     fill(68, 80, 105, textAlpha);
//     textSize(18);
//     text("외계 연구소의 메인 코어가 완전히 폭발하며 차원의 균열이 닫혔습니다.", width / 2, height / 2 + 15 + textYOffset);
//     text("융합된 결합 유물의 광휘가 기체를 감싸 안으며 안전한 우주로 워프합니다.", width / 2, height / 2 + 50 + textYOffset);

//     // 3단계: 충분히 읽은 뒤(약 5초 경과) 마우스 클릭 트리거 안내 활성화
//     if (endingTimer > 300) {
//       let blinkValue = floor(frameCount / 25) % 2 === 0 ? 255 : 60;
//       fill(110, 120, 145, blinkValue);
//       textSize(15);
//       text("- 화면을 클릭하면 타이틀 화면으로 돌아갑니다 -", width / 2, height * 0.8);
//     }
//     pop();
//   }
// }

// =======================
// 시스템 리셋
// =======================
function resetStage2()
{
  stage2BossStarted = false;

  bossTransition = false;

  fadeAlpha = 0;
  fadeMode = 0;

  boss = null;

  bossBullets = [];

  meteors = [];
  ufos = [];
  enemyBullets = [];
  playerBullets = [];
  
  stage2Item = null;

  // 사망 연출 변수 리셋
  bossDeadSequence = false;
  whiteOutAlpha = 0;
  endingTimer = 0;

  loadStage2Map1();

  gameState = "stage2";
}

function resetBossFight()
{
  bossInvincible = true;
  
  meteors = [];
  ufos = [];
  enemyBullets = [];

  bossBullets = [];

  stage2BossStarted = false;
  bossTransition = false;

  fadeAlpha = 0;
  fadeMode = 0;

  stage2ScrollSpeed = 0;
  stage2Item = null;

  // 사망 연출 변수 리셋
  bossDeadSequence = false;
  whiteOutAlpha = 0;
  endingTimer = 0;

  boss = new Boss(width / 2, camY + 200);
}

// [파일의 맨 끝부분에 추가]
function handleBossDefeatedSequence()
{
  if(!bossDeadSequence)
  {
    return;
  }

  endingTimer++;

  // 엔딩 컷신 배경
  background(5, 8, 25);
  drawEndingStars();
  drawEndingEarth();
  drawEndingShip();
  drawEndingText();

  // 컷신이 끝나면 다시 로비로 이동
  if(endingTimer > 560)
  {
    whiteOutAlpha = map(endingTimer, 560, 650, 0, 255);
    whiteOutAlpha = constrain(whiteOutAlpha, 0, 255);

    push();
    noStroke();
    fill(255, whiteOutAlpha);
    rect(0, 0, width, height);
    pop();
  }

  if(endingTimer > 650)
  {
    showEndingBackground();
  }
}

function drawEndingStars()
{
  push();
  noStroke();

  for(let i = 0; i < 120; i++)
  {
    let x = (i * 97 - endingTimer * 1.2) % width;
    if(x < 0) x += width;

    let y = (i * 53) % height;

    fill(255, 200);
    circle(x, y, 2);
  }

  pop();
}

function drawEndingEarth()
{
  push();
  noStroke();

  let earthX = width * 0.82;
  let earthY = height * 0.72;
  let earthSize = 260;

  // 엔딩 후반에는 지구가 점점 가까워짐
  if(endingTimer > 260)
  {
    earthSize = map(endingTimer, 260, 520, 260, 520);
    earthSize = constrain(earthSize, 260, 520);
  }

  fill(35, 120, 235);
  circle(earthX, earthY, earthSize);

  fill(75, 200, 95);
  ellipse(earthX - earthSize * 0.12, earthY - earthSize * 0.05, earthSize * 0.35, earthSize * 0.18);
  ellipse(earthX + earthSize * 0.14, earthY + earthSize * 0.12, earthSize * 0.42, earthSize * 0.2);

  fill(255, 255, 255, 180);
  ellipse(earthX - earthSize * 0.18, earthY - earthSize * 0.2, earthSize * 0.32, earthSize * 0.07);
  ellipse(earthX + earthSize * 0.16, earthY - earthSize * 0.08, earthSize * 0.25, earthSize * 0.06);

  pop();
}

function drawEndingShip()
{
  let startX = width * 0.18;
  let startY = height * 0.35;
  let endX = width * 0.72;
  let endY = height * 0.55;

  let t = constrain(endingTimer / 430, 0, 1);
  let shipX = lerp(startX, endX, t);
  let shipY = lerp(startY, endY, t);

  push();
  translate(shipX, shipY);
  rotate(PI / 2.8);
  scale(1.2);

  noStroke();

  // 엔진 불꽃
  fill(255, 120, 0, 210);
  triangle(-16, 35, 16, 35, 0, 80 + random(-6, 6));
  fill(255, 230, 0, 220);
  triangle(-8, 35, 8, 35, 0, 60 + random(-4, 4));

  // 날개
  fill(110);
  triangle(-28, 8, -65, 35, -25, 38);
  triangle(28, 8, 65, 35, 25, 38);

  // 몸체
  fill(175);
  rectMode(CENTER);
  rect(0, 3, 52, 76, 10);

  // 기수
  fill(220);
  triangle(-26, -25, 26, -25, 0, -70);

  // 창문
  fill(70, 190, 255);
  ellipse(0, -14, 24, 20);

  pop();
}

function drawEndingText()
{
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  if(endingTimer < 180)
  {
    fill(255);
    textSize(32);
    text("보스를 처치했다!", width / 2, height * 0.14);
  }
  else if(endingTimer < 360)
  {
    fill(255);
    textSize(32);
    text("우주선을 타고 지구로 귀환 중...", width / 2, height * 0.14);
  }
  else
  {
    fill(255);
    textSize(32);
    text("무사히 돌아왔다", width / 2, height * 0.14);
  }

  pop();
}

function showEndingBackground()
{
  if(typeof clearSavedGame === "function") clearSavedGame();

  resetStage2Only();

  currentStage = 1;
  currentMap = 1;

  item1Get = false;
  item2Get = false;
  item3Get = false;

  itemReset();
  loadStage();

  if(typeof loadTimeRecords === "function") loadTimeRecords();
  playTime = 0;
  lastFrameTime = millis();
  if(typeof endingFrame !== "undefined") endingFrame = 0;

  guideReady = false;
  gameState = "ending";
}
function returnToLobby()
{
  if(typeof clearSavedGame === "function") clearSavedGame();

  resetStage2Only();

  currentStage = 1;
  currentMap = 1;

  item1Get = false;
  item2Get = false;
  item3Get = false;

  itemReset();
  loadStage();

  if(typeof loadTimeRecords === "function") loadTimeRecords();
  playTime = 0;
  lastFrameTime = millis();

  guideReady = false;
  gameState = "guide";
}

function resetStage2Only()
{
  stage2BossStarted = false;
  bossTransition = false;
  fadeAlpha = 0;
  fadeMode = 0;
  boss = null;
  bossBullets = [];
  meteors = [];
  ufos = [];
  enemyBullets = [];
  playerBullets = [];
  stage2Item = null;
  bossDeadSequence = false;
  whiteOutAlpha = 0;
  endingTimer = 0;
  stage2SpawnTimer = 0;
  stage2Score = 0;
  camY = 0;
}


function cleanAllStage2Data()
{
  boss = null;
  stage2BossStarted = false;
  bossTransition = false;
  bossDeadSequence = false;
  fadeAlpha = 0;
  fadeMode = 0;

  bossBullets = [];
  enemyBullets = [];
  playerBullets = [];
  meteors = [];
  ufos = [];
  aliens = [];

  stage2Item = null;
  whiteOutAlpha = 0;
  endingTimer = 0;
  stage2SpawnTimer = 0;
  stage2Score = 0;
  playerShootCooldown = 0;
}


function restartStage2FromDeath()
{
  gameState = "stage2Playing";

  if(stage2RespawnPoint === 2 || stage2BossStarted || boss)
  {
    restartStage2BossFight();
  }
  else
  {
    loadStage2Map1();
  }

  // 리스폰 후 현재 위치 저장
  if(typeof saveGame === "function") saveGame();
}

function restartStage2BossFight()
{
  currentStage = 2;
  currentStage2Map = 1;
  stage2RespawnPoint = 2;

  // 보스전 위치로 바로 이동
  camY = -(stage2WorldHeight - height);

  stage2BossStarted = true;
  bossTransition = false;
  fadeAlpha = 0;
  fadeMode = 0;
  stage2ScrollSpeed = 0;

  meteors = [];
  ufos = [];
  aliens = [];
  enemyBullets = [];
  playerBullets = [];
  bossBullets = [];

  stage2Item = null;
  bossDeadSequence = false;
  whiteOutAlpha = 0;
  endingTimer = 0;
  playerShootCooldown = 0;

  ship = new Ship(width / 2, camY + height * 0.72);
  boss = new Boss(width / 2, camY + 200);

  if(typeof saveGame === "function") saveGame();
}

function mousePressed()
{
  // 엔딩 중 클릭해도 바로 넘어가지 않게 둠
}
