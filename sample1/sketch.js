/*********************************************
  1. mouse:
    - 마우스를 오른손 주변으로 가면 실제 지판 잡듯이 이동 가능하다
  2. keyboard:
    - ↑ 를 누르면 스트로크하듯이 팔을 들고 8분 음표가 나온다
    - ↓ 를 누르면 팔을 내리고 8분 음표 두 개가 나온다
*********************************************/
let noteX = 156;
let noteY = 311;
let noteA = 0;
let noteOn = false;
let noteType = 1;
function keyPressed() {
  if (key === 's') {
    saveGif('mySketch', 10);
  }
}
function setup() {
  createCanvas(400, 600);
}
function draw() {
  background(220);
  stroke(0);
  strokeWeight(4);
  fill("#E2C9BD");
  rect(155, 215, 50, 30);
  ellipse(100, 157, 33, 40);
  ellipse(260, 157, 33, 40);
  ellipse(180, 150, 150, 140);
  fill("#B8A298");
  noStroke();
  ellipse(97, 157, 10, 20);
  ellipse(263, 157, 10, 20);
  stroke(0);
  fill("#000000");
  ellipse(215, 122, 80, 40);
  triangle(120, 122, 180, 150, 190, 120);
  triangle(105, 124, 130, 140, 128, 124);
  rect(98, 124, 10, 10);
  rect(250, 124, 10, 10);
  circle(150, 160, 19);
  circle(210, 160, 19);
  strokeWeight(3);
  noFill();
  arc(175, 180, 10, 10, radians(95), radians(360));
  arc(180, 200, 30, 10, radians(0), radians(180));
  fill("#425236");
  ellipse(180, 60, 20, 20);
  arc(180, 125, 165, 130, radians(180), radians(360));
  ellipse(180, 120, 150, 20);
  strokeWeight(1);
  line(180, 60, 180, 110);
  line(150, 65, 130, 86);
  line(130, 86, 120, 115);
  line(210, 65, 230, 86);
  line(230, 86, 240, 115);
  strokeWeight(4);
  quad(100, 240, 100, 420, 260, 420, 260, 240);
  quad(260, 240, 260, 360, 300, 350, 300, 260);
  fill("#000000");
  quad(100, 420, 100, 600, 260, 600, 260, 420);
  fill("#E2C9BD");
  ellipse(280, 375, 40, 40);
  stroke("#FFFFFF");
  strokeWeight(2);
  line(180, 500, 180, 600);
  fill("#D9A33B");
  noStroke();
  circle(180, 85, 40);
  rect(192, 83, 8, 20);
  ellipse(150, 350, 80, 60);
  ellipse(160, 430, 100, 50);
  ellipse(100, 400, 160, 140);
  fill("#000000");
  ellipse(150, 353, 50, 30);
  ellipse(140, 385, 70, 90);
  ellipse(150, 410, 70, 50);
  ellipse(155, 208, 3, 3);
  fill("#815E20");
  quad(155, 370, 160, 400, 320, 365, 315, 335);
  fill("#D9A33B");
  quad(275, 330, 300, 370, 365, 355, 353, 335);
  fill("#979797");
  quad(60, 380, 70, 430, 106, 420, 97, 370);
  ellipse(100, 450, 70, 15);
  ellipse(300, 338, 10, 10);
  ellipse(313, 339, 10, 10);
  ellipse(325, 340, 10, 10);
  ellipse(338, 342, 10, 10);
  ellipse(350, 344, 10, 10);
  ellipse(288, 338, 10, 10);
  ellipse(115, 385, 10, 40);
  fill("#8B8989");
  ellipse(85, 450, 10, 10);
  ellipse(105, 450, 10, 10);
  fill("#000000");
  ellipse(87, 400, 10, 40);
  ellipse(120, 450, 3, 3);
  stroke("#425236");
  noFill();
  strokeWeight(4);
  arc(190, 78, 15, 7, 0, 180);
  stroke(0);
  fill("#425236");
  if (keyIsDown(UP_ARROW)) {
    quad(70, 260, 100, 320, 150, 315, 101, 240);
    noStroke();
    rect(98, 243, 50, 50);
    fill("#E2C9BD");
    stroke(0);
    quad(104, 320, 120, 356, 155, 350, 140, 315);
    ellipse(136, 348, 40, 40);
    fill("#3494C7");
    noStroke();
    triangle(150, 350, 135, 360, 150, 372);
  } 
  else if (keyIsDown(DOWN_ARROW)) {
    stroke(0);
    fill("#425236");
    quad(70, 260, 90, 330, 140, 325, 101, 240);
    noStroke();
    rect(98, 243, 50, 50);
    fill("#E2C9BD");
    stroke(0);
    quad(94, 330, 110, 366, 145, 360, 135, 325);
    ellipse(125, 365, 40, 40);
    fill("#3494C7");
    noStroke();
    triangle(140, 375, 120, 380, 135, 395);
  } 
  else {
    stroke(0);
    fill("#425236");
    quad(60, 260, 50, 320, 100, 330, 100, 240);
    noStroke();
    rect(98, 243, 10, 50);
    fill("#E2C9BD");
    stroke(0);
    strokeWeight(4);
    quad(58, 321, 53, 380, 90, 374, 95, 328);
    ellipse(70, 378, 40, 40);
  }
  noStroke();
  fill("#425236");
  rect(258, 243, 4, 70);
  fill("#E2C9BD");
  stroke(0);
  strokeWeight(4);
  if (mouseX > 230 && mouseX < 290 && mouseY > 328 && mouseY < 380) {
    ellipse(mouseX, mouseY, 40, 40);
  } else {
    ellipse(270, 370, 40, 40);
  }
  if (!noteOn) {
    if (keyIsDown(UP_ARROW)) {
      noteX = 156;
      noteY = 311;
      noteA = 255;
      noteOn = true;
      noteType = 1;
    } 
    else if (keyIsDown(DOWN_ARROW)) {
      noteX = 156;
      noteY = 311;
      noteA = 255;
      noteOn = true;
      noteType = 2;
    }
  }
  if (noteOn) {
    noteY = noteY - 2;
    noteA = noteA - 4;

    stroke(0, noteA);
    fill(0, noteA);
    strokeWeight(2);
    if (noteType == 1) {
      ellipse(noteX, noteY, 14, 10);
      line(noteX + 6, noteY, noteX + 6, noteY - 30);
      noFill();
      arc(noteX + 6, noteY - 23, 18, 18, radians(270), radians(60));
    }
    if (noteType == 2) {
      fill(0, noteA);
      stroke(0, noteA);
      ellipse(noteX - 6, noteY + 2, 12, 9);
      ellipse(noteX + 9, noteY, 12, 9);
      line(noteX + 12, noteY, noteX + 12, noteY - 30);
      line(noteX - 1, noteY, noteX - 1, noteY - 24);
      strokeWeight(6);
      line(noteX + 10, noteY - 30, noteX + 1, noteY - 24);
    }
    if (noteA <= 0) {
      noteOn = false;
    }
  }
}