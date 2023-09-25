var heartImage;
var heartHeightProp;
var titleFont;
var title;
var drops = [];
var caughtDrops = 0;
var mouseVec;
var subtitle;

function preload() {
  heartImage = loadImage('assets/img/heart.png');
  titleFont = loadFont('assets/font/JosefinSans-SemiBold.ttf')
}

function windowResized() {
  if (windowWidth == width) return;

  resizeCanvas(windowWidth, windowHeight);
  calibrateFontSize();
  subtitle.calibrateSizeAndPos();
  background(0);

  if (width > height) {
    drops = [];
    heartHeightProp = 0.5;
  } else {
    heartHeightProp = 0.66;
  }
}

function calibrateFontSize() {
  textSize(1);
  if (windowWidth > height) {
    // landscape orientation
    title = ' RADICAL       HEALING'
    while (textWidth(title) < windowWidth * 0.8) {
      textSize(textSize() + 1);
    }
  } else {
    // portrait orientation
    while (textWidth('RADICAL') < windowWidth * 0.5) {
      textSize(textSize() + 1);
    }
  }
}


function setup() {
  // cnavas & environment
  createCanvas(window.innerWidth, window.innerHeight);
  imageMode(CENTER);
  textAlign(CENTER, CENTER)
  try {
    textFont(titleFont);
  } catch {
    textFont('Arial')
  }
  noStroke();
  background(0);

  // size/proporitons
  calibrateFontSize();
  subtitle = new Subtitle();
  heartHeightProp = width > height ? 0.5 : 0.66;

  // interactivity
  mouseVec = createVector(0, 0);
}

function draw() {
  background(0, 10);
  // prepare heart image
  let heartImageCopy = heartImage.get();
  let heartSize =
      2 + easeInOutBack(constrain(-cos(frameCount * 0.008) * 2 + 1, 0, 1));
  heartImageCopy.resize(0, textSize() * heartSize);


  // spawn, cull, and display rainbow drops
  if (drops.length < 200 && frameCount % 2 == 0) {
    let xProportion = random(0.1, 0.9)
    let dropPos = createVector(
        xProportion * heartImageCopy.width, heartImageCopy.height * 0.4);
    let fillColor = heartImageCopy.get(dropPos.x, dropPos.y);
    let heartImageLeftX = (width - heartImageCopy.width) / 2;
    let heartImageTopY = height * heartHeightProp - heartImageCopy.height / 2
    dropPos.x += heartImageLeftX;
    dropPos.y += heartImageTopY;
    drops.push(new Drop(dropPos, fillColor, xProportion));
  }

  drops = drops.filter(d => {
    return d.pos.y < height + 60 && d.pos.x > -20 && d.pos.x < width + 20
  });

  mouseVec.x = mouseX;
  mouseVec.y = mouseY;
  caughtDrops = 0;
  drops.forEach(d => d.show(mouseVec))

  // draw rainbow heart
  image(heartImageCopy, width / 2, height * heartHeightProp);

  // draw black heart to reduce blur
  // let blackHeart = heartImageCopy.get();
  // blackHeart.resize(0, heartImageCopy.height * 1.05);
  // blackHeart.filter(THRESHOLD, 1)
  // image(blackHeart, width / 2, height / 2);

  // draw title
  drawTitle();
}

function drawTitle() {
  let bank = ['LOVE', 'CHANGE', 'GROWTH', 'HOPE'];
  fill(255);
  if (width > height) {
    textAlign(CENTER)
    text(title, width / 2, height / 2);
    subtitle.show();

  } else {
    text('RADICAL', width / 2, height * 0.33 - textSize());
    text('HEALING', width / 2, height * 0.33 + textSize());
  }
}

function easeInOutBack(x) {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;

  return x < 0.5 ?
      (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2 :
      (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

class Drop {
  constructor(pos, fillColor, xProportion) {
    this.pos = pos;
    this.vel = p5.Vector.fromAngle(xProportion * PI);
    this.vel.x *= -1;
    this.vel.y *= 2;

    this.fillColor = fillColor;
    this.size = random(10, 20);
    this.decayFactor = random(1.002, 1.006);
    this.interactionRadius = textSize() * textSize();
  }

  show() {
    fill(this.fillColor)
    circle(this.pos.x, this.pos.y, this.size);

    let attractionForce = p5.Vector.sub(this.pos, mouseVec);

    if (attractionForce.magSq() < this.interactionRadius && caughtDrops < 50) {
      attractionForce.normalize().rotate(HALF_PI * 1.1).lerp(this.vel, 0.2);
      this.pos.add(attractionForce);
      caughtDrops++
    } else {
      this.pos.add(this.vel);
      this.vel.x *= this.decayFactor;
    }
  }
}

class Subtitle {
  constructor() {
    // timing
    this.typeingFrames = 240;
    this.currFrames = 0;

    // word bank randomization
    this.bank =
        ['LOVE', 'CARE', 'CHANGE', 'GROWTH', 'HOPE', 'DREAMING', 'SECURITY'];
    this.shuffledBank = shuffle(this.bank);
    this.currWord = this.shuffledBank.pop();

    // sizing
    this.calibrateSizeAndPos();
  }

  calibrateSizeAndPos() {
    let titleLeftX = (width - textWidth(title)) / 2;
    this.textHeight = 2 * textSize() / 3;

    this.leftX = titleLeftX + textWidth(' RADICAL       ');
    this.centerY = height / 2 + this.textHeight * 1.5;
  }

  show() {
    let progress = 1 - abs((this.currFrames / this.typeingFrames) - 0.5) * 2;
    let wordSlice =
        this.currWord.slice(0, progress * (this.currWord.length * 2));

    push()
    textSize(this.textHeight);
    textAlign(LEFT);
    fill(254, 172, 210)
    text('& ' + wordSlice, this.leftX, this.centerY);
    pop();

    this.currFrames++;
    if (this.currFrames == this.typeingFrames) {
      this.currFrames = 0;
      if (this.shuffledBank.length == 0) this.shuffledBank = shuffle(this.bank);
      this.currWord = this.shuffledBank.pop();
    }
  }
}
