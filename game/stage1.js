function loadStage1Map1()
{
  console.log(width, height);
  console.log(platforms);

  platforms = [];

  rectMode(CORNER);
  
  gameWidth = width;

  spawnX = 10;
  spawnY = height * 3 / 5;

  platforms.push(
    {x:width/4, y:height*3/4, w:200, h:20},
    {x:width/2, y:height*5/8, w:200, h:20},
    {x:0, y:height*7/8, w:200, h:20},
    {x:width-250, y:20, w:250, h:20}
  );

  item1X = width * 5/8;

  item1Y = height * 2/5;

  item1Size = 150;
}

function loadStage1Map2()
{
  platforms = [];

  gameWidth = 4000;

  spawnX = 10;
  spawnY = 50;

  platforms.push(
    {x:0, y:300, w:200, h:20},
    {x:450, y:800, w:200, h:20},
    {x:970, y:70, w:200, h:20},
    {x:1400, y:800, w:300, h:20},
    {x:1500, y:0, w:20, h:760},
    {x:1890, y:40, w:465, h:20},
    {x:1930, y:100, w:360, h:20},
    {x:2335, y:60, w:20, h:600},
    {x:2270, y:120, w:20, h:580},
    {x:2270, y:700, w:530, h:20},
    {x:2335, y:640, w:465, h:20},
    {x:2780, y:0, w:20, h:660},
    {x:2780, y:700, w:20, h:300},
    {x:2960, y:60, w:150, h:20},
    {x:3260, y:640, w:150, h:20},
    {x:3523, y:230, w:750, h:20},
    {x:3400, y:170, w:750, h:20}
  );

  item2X = 1000;
  item2Y = 100;
  item2Size = 150;
}

function loadStage1Map3()
{
  platforms = [];

  gameWidth = 4000;

  spawnX = 20;
  spawnY = height - 180;

  platforms.push(
    // 천장 벽: 마이크 점프가 너무 높게 튀는 것 방지
    {x:0, y:0, w:4000, h:10},

    // 왼쪽 시작 구간
    {x:0, y:height-100, w:360, h:20},
    {x:420, y:height-180, w:180, h:20},
    {x:740, y:height-280, w:170, h:20},

    // 마이크 점프 구간
    {x:1080, y:height-420, w:160, h:20},
    {x:1420, y:height-560, w:160, h:20},
    {x:1770, y:height-420, w:160, h:20},
    {x:2120, y:height-280, w:170, h:20},
    {x:2480, y:height-470, w:160, h:20},
    {x:2840, y:height-620, w:160, h:20},
    {x:3180, y:height-450, w:170, h:20},

    // 도착 구간
    {x:3550, y:height-260, w:430, h:20}
  );

  item3X = 190;
  item3Y = height - 230;
  item3Size = 110;
}

function drawStage1Map1Portal()
{
  let portal1X = width - 50;
  let portal1Y = 140;

  let screenPortal1X = portal1X - camX;

  stroke(0);
  fill(255);

  rectMode(CENTER);

  rect(screenPortal1X, portal1Y, 100, 200);

  noStroke();

  imageMode(CENTER);

  image(wallCrack, screenPortal1X, portal1Y, 100, 200);

  imageMode(CORNER);

  stroke(0);
  strokeWeight(1);

  if(currentStage === 1 && currentMap === 1)
  {
    if(
      rectX + dia > portal1X - 50 &&
      rectX < portal1X + 50 &&
      rectY + dia > portal1Y - 100 &&
      rectY < portal1Y + 100
    )
    {
      fill(0);
      textSize(10);
      textAlign(CENTER);
      text("벽이 무너져 내렸다...", screenPortal1X, portal1Y);
      text("넘어가려면 E를 누르자!", screenPortal1X, portal1Y + 20);

      inPortal = true;
    }
    else
    {
      inPortal = false;
    }
  }

  rectMode(CORNER);
  imageMode(CORNER);
  textAlign(LEFT, BASELINE);
}

function drawStage1Map2Portal()
{
  let portal2X = 3980;
  let portal2Y = 210;

  let ventW = 60;
  let ventH = 60;

  let screenPortal2X = portal2X - camX;

  imageMode(CENTER);

  if(vent2Open)
  {
    image(ventOnImg, screenPortal2X, portal2Y, ventW, ventH);
  }
  else
  {
    image(ventOffImg, screenPortal2X, portal2Y, ventW, ventH);
  }

  imageMode(CORNER);

  if(currentStage === 1 && currentMap === 2)
  {
    if(
      rectX + dia > portal2X - ventW / 2 &&
      rectX < portal2X + ventW / 2 &&
      rectY + dia > portal2Y - ventH / 2 &&
      rectY < portal2Y + ventH / 2
    )
    {
      fill(0);
      textSize(16);
      textAlign(CENTER);

      if(vent2Open)
      {
        text("환풍구가 열렸다!", screenPortal2X * 22 / 23, portal2Y + 80);
        text("들어가려면 E를 누르자!", screenPortal2X * 22 / 23, portal2Y + 105);
      }
      else
      {
        text("닫힌 환풍구다.", screenPortal2X * 22 / 23, portal2Y + 80);
        text("Z를 눌러 열자!", screenPortal2X * 22 / 23, portal2Y + 105);
      }

      inPortal = true;
    }
    else
    {
      inPortal = false;
    }
  }

  rectMode(CORNER);
  imageMode(CORNER);
  textAlign(LEFT, BASELINE);
}

function drawStage1Map3Portal()
{
  let portal3X = 3880;
  let portal3Y = height - 340;

  let portalW = 120;
  let portalH = 160;

  let screenPortal3X = portal3X - camX;

  rectMode(CENTER);
  noStroke();
  imageMode(CENTER);

  image(wallCrack, screenPortal3X, portal3Y, portalW, portalH);

  imageMode(CORNER);
  rectMode(CORNER);

  if(currentStage === 1 && currentMap === 3)
  {
    if(
      rectX + dia > portal3X - portalW / 2 &&
      rectX < portal3X - portalW / 2 + portalW &&
      rectY + dia > portal3Y - portalH / 2 &&
      rectY < portal3Y - portalH / 2 + portalH
    )
    {
      fill(0);
      textSize(16);
      textAlign(CENTER);
      text("마이크 점프맵 통과!", screenPortal3X, portal3Y + 95);
      text("넘어가려면 E를 누르자!", screenPortal3X, portal3Y + 120);

      inPortal = true;
    }
    else
    {
      inPortal = false;
    }
  }

  rectMode(CORNER);
  imageMode(CORNER);
  textAlign(LEFT, BASELINE);
}