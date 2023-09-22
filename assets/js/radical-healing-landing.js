var heartImage;
var titleFont;
var title;
var drops = [];
var caughtDrops = 0;

function preload() {
  heartImage = loadImage('assets/img/heart.png');
  titleFont = loadFont('assets/font/JosefinSans-Bold.ttf')
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // typography
  textSize(1);

  if (windowWidth > height) {
    title = ' RADICAL       HEALING'
    while (textWidth(title) < windowWidth * 0.8) {
      textSize(textSize() + 1);
    }
  } else {
    while (textWidth('RADICAL') < windowWidth * 0.5) {
      textSize(textSize() + 1);
    }
  }

  drops = [];
  background(0);
}


function setup() {
  // cnavas & environment
  let c = createCanvas(window.innerWidth, window.innerHeight);
  let sketchNode = document.getElementById('sketch-container');
  imageMode(CENTER);
  textAlign(CENTER, CENTER)
  // textFont(titleFont);
  noStroke();
  background(0);

  // typography
  if (width > height) {
    title = ' RADICAL       HEALING'
    while (textWidth(title) < width * 0.8) {
      textSize(textSize() + 1);
    }
  } else {
    while (textWidth('RADICAL') < width * 0.5) {
      textSize(textSize() + 1);
    }
  }



  // heartImage.resize(0, textSize() * 1.5);
}

function draw() {
  background(0, 10);
  let heartHeightProp = width > height ? 0.5 : 0.66;
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
    return d.pos.y < (height + 60) && d.pos.x > -20 && d.pos.x < width + 20
  });

  let mouseVec = createVector(mouseX, mouseY);
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
  let bank = ['LOVE', 'CHANGE', 'GROWTH']
  fill(255);
  if (width > height) {
    textAlign(CENTER)
    text(title, width / 2, height / 2);
    let titleLeftX = (width / 2) - textWidth(title) / 2;
    let wordbankLeftX = titleLeftX + textWidth(' RADICAL       ');
    // push()
    // textSize(2 * textSize() / 3);
    // textAlign(LEFT);
    // fill(140)
    // text(
    //     '& ' + bank[floor(frameCount / 300) % 3], wordbankLeftX,
    //     height / 2 + textSize() * 1.5);
    // pop();

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

  show(mouseVec) {
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
