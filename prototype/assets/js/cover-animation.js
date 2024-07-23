p5.disableFriendlyErrors = false;
var prism;
var fontJosefine;
var fontNittiTypewriter;
var presentTextPos;
var zineTextPos;
var titlePos;
var titleSize = 1;
var creditSize = 1;
var titleText = 'PROTOTYPE';
var topCreditText = ' Pop Box Gallery and DurmPAC present ';
var bottomCreditText = ' a digital zine and exhibition archive '
var frameInterval = 30;
var panelCount = 1;
var panelIncrement = true;
var nd = {
  dp: 0.05,
  df: 0.01,
};

function preload() {
  // loads fonts for title and supporting text
  fontJosefine = loadFont("https://use.typekit.net/af/2ed95c/00000000000000007735a0cf/30/a?subset_id=2&fvd=i6&v=3");
  fontNittiTypewriter = loadFont(
    "https://use.typekit.net/af/b1404e/00000000000000007735f7e2/30/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3");
}

function setup() {
  // sketch enviroment
  let sketchNode = document.getElementById('cover-container')
  let c = createCanvas(window.innerWidth, window.innerHeight);
  c.parent(sketchNode);
  fill("#DA48975A");
  stroke(100);
  strokeWeight(2);
  frameRate(30);

  // typography setyp
  textAlign(CENTER, CENTER);
  textFont(fontJosefine);
  // title sizing
  while (textWidth(titleText) < width * 0.8) {
    titleSize++;
    textSize(titleSize);
  }
  // credit sizing
  if (width < height) {
    textSize(creditSize);
    while (textWidth(bottomCreditText) < width * 0.6) {
      creditSize++;
      textSize(creditSize);
    }
  } else {
    creditSize = titleSize / 8;
  }

  // type positioning
  textSize(titleSize);
  let titleWidth = textWidth(titleText);
  titlePos = createVector(width * 0.5, height * 0.4);
  presentTextPos = createVector();
  zineTextPos = createVector();

  if (width > height) {
    presentTextPos.x = titlePos.x - titleWidth * 0.5;
    presentTextPos.y = titlePos.y - creditSize * 2.5;
    zineTextPos.x = titlePos.x + titleWidth * 0.5;
    zineTextPos.y = titlePos.y + creditSize * 6;

    textSize(creditSize);
    presentTextPos.x += textWidth(topCreditText) / 2;
    zineTextPos.x -= textWidth(bottomCreditText) / 2;
  } else {
    presentTextPos.x = width / 2;
    presentTextPos.y = 2 * creditSize;
    zineTextPos.x = width / 2;
    zineTextPos.y = height - 2 * creditSize;
  }
  textSize(titleSize);

  // initialize background PentaPrism
  prism = new PentaPrism();
}

function draw() {
  // reset background
  blendMode(BLEND);
  background("#000817");
  blendMode(ADD);

  // animate PentaPrism
  if (frameCount % frameInterval == 0) {
    panelCount += panelIncrement ? 1 : -1;
    if (panelCount == 1 || panelCount == 6) {
      panelIncrement = !panelIncrement;
    }
  }
  prism.show(constrain(panelCount, 1, 5));

  // draw text
  push();
  // title
  fill(255, 230);
  noStroke();
  text(titleText, titlePos.x, titlePos.y);
  // credits
  fill(255);
  textFont(fontNittiTypewriter);
  textSize(creditSize);
  text(topCreditText, presentTextPos.x, presentTextPos.y);
  text(bottomCreditText, zineTextPos.x, zineTextPos.y);
  pop();
}


// creates a PentaPrism by generating two hexagons and connecting their vertices
// displays a given number of prism panels, modulated by perlin noise
class PentaPrism {
  constructor() {
    this.prismCenter1 = createVector(width * 0.25, height * 0.66);
    this.prismCenter2 = createVector(width * 0.75, height * 0.33);

    this.frontPoints = [];
    this.backPoints = [];

    let initOffset = random(TWO_PI / 10);
    for (let i = 0; i < 5; i++) {
      let offsetVec = p5.Vector.fromAngle(initOffset + (i * TWO_PI) / 5).mult(
        random(width / 5, width / 3)
      );
      this.frontPoints.push(p5.Vector.add(this.prismCenter1, offsetVec));
    }

    initOffset = random(TWO_PI / 10);
    for (let i = 0; i < 5; i++) {
      let offsetVec = p5.Vector.fromAngle(initOffset + (i * TWO_PI) / 5).mult(
        random(width / 5, width / 3)
      );
      this.backPoints.push(p5.Vector.add(this.prismCenter2, offsetVec));
    }
  }

  show(panelCount = 5) {
    let nvals = [];
    for (let i = 1; i <= 4; i++) {
      nvals.push(noise(frameCount * nd.df + nd.dp * i));
    }

    for (let i = 0; i < panelCount; i++) {
      let frontPoint1 = this.frontPoints[i].copy();
      let frontPoint2 = this.frontPoints[(i + 1) % 5].copy();

      let backpoint1 = this.backPoints[i].copy();
      let backpoint2 = this.backPoints[(i + 1) % 5].copy();

      frontPoint1.lerp(this.prismCenter1, nvals[3]);
      frontPoint2.lerp(this.prismCenter1, nvals[2]);
      backpoint1.lerp(this.prismCenter2, nvals[1]);
      backpoint2.lerp(this.prismCenter2, nvals[0]);

      beginShape();
      vertex(backpoint1.x, backpoint1.y);
      vertex(frontPoint1.x, frontPoint1.y);
      vertex(frontPoint2.x, frontPoint2.y);
      vertex(backpoint2.x, backpoint2.y);
      endShape(CLOSE);
    }
  }
}
