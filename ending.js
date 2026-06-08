let endingFrame = 0;

function startEnding() {
  background(0);

  let scrollY = height + 120 - endingFrame * 0.5;

  push();
  fill(255);
  textAlign(CENTER, CENTER);

  textSize(42);
  text("ENDING CREDITS", width / 2, scrollY);
  text("소감", width / 2, scrollY + 60);

  textSize(24);
  text("김강민", width / 2, scrollY + 120);
  text("이번 게임을 제작하는 것이 게임 개발자를 꿈꾸는 저로서 좋은 경험이 됐다고 생각합니다.", width / 2, scrollY + 170);
  text("제일 인상 깊었던 것은 팀원과 게임을 기획해 가며 자기만의 게임을 만드는 것이었습니다.", width / 2, scrollY + 210);
  text("비록 기획에서 생각했던 것만큼 그래픽이 완성도 있게 다듬어있지 않아 아쉬움이 남지만,", width / 2, scrollY + 250);
  text("기능들이 실제 게임처럼 작동하는 것을 보며 뿌듯함을 느꼈습니다.", width / 2, scrollY + 290);
  

  // + 130

  text("박경민", width / 2, scrollY + 420);
  text("게임을 정해진 틀에 맞춰 만드는 것이 아니라 처음부터 직접 기획하고 구현했다는 점이 좋았습니다.", width / 2, scrollY + 470);
  text("수업에서 배우지 않은 내용을 활용해야 하는 부분이 많아 어려움도 있었지만,", width / 2, scrollY + 510);
  text("원하는 기능을 구현하기 위해 필요한 내용을 스스로 찾아보고 공부하는 과정에서 큰 재미를 느꼈습니다.", width / 2, scrollY + 550);
  text("또한 팀원들과 의견을 나누며 하나의 게임을 완성해 나가는 과정이 매우 의미 있게 느껴졌습니다.", width / 2, scrollY + 590);

  textSize(18);
  fill(180);
  text("Thank you for playing!", width / 2, scrollY + 780);

  pop();

  endingFrame++;
}


function checkEndingClick() {
  if (endingFrame > 300) {
    endingFrame = 0;
    gameState = "guide";
  }
}