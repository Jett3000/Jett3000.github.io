/*
###############################################
Program: Star Warp / Head Reveal Animation
Author: Jett Pavlica
Created: 06/21/2022
###############################################
*/

p5.disableFriendlyErrors = true;
var prismImage;
var headImage;
var pentaPoints = [];
var pentagons = [];
var mouseOn = false;
var mouseFrames = 0;
var fadeFrames = 30;

function preload() {
  prismImage = loadImage("assets/img/jim-lee-prism.png");
  headImage = loadImage("assets/img/jim-lee-head.png");
}

function setup() {
  // sketch enviroment
  let sketchNode = document.getElementById('sketch-container');
  let canvasWidth = sketchNode.offsetWidth;
  let canvasHeight = window.innerWidth > 601 ? sketchNode.offsetHeight : canvasWidth;
  let c = createCanvas(canvasWidth, canvasHeight);
  c.parent(sketchNode);
  c.mouseOver(() => {
    mouseOn = true;
  });
  c.mouseOut(() => {
    mouseOn = false;
    // mouseFrames = fadeFrames;
  });
  fill("#DA48975A");
  noStroke();
  frameRate(30);
  blendMode(BLEND);

  // image settings
  imageMode(CENTER);
  let ratio;
  if (width > height) {
    ratio = (height * 0.8) / prismImage.height;
  } else {
    ratio = (width * 0.8) / prismImage.width;
  }
  prismImage.resize(prismImage.width * ratio, 0);
  headImage.resize(prismImage.width * ratio * 0.8, 0);

  // populate pentaPoints
  for (let i = 0; i < 5; i++) {
    let direction = p5.Vector.fromAngle((i * TWO_PI) / 5 - HALF_PI);
    pentaPoints.push(direction.copy());
  }

  // populate pentagons
  for (let i = 0; i < 80; i++) {
    let p = p5.Vector.random3D()
      .mult(random(max(width, height)));
    pentagons.push(p);
  }
}

function draw() {
  // reset background
  background("#000817");
  blendMode(ADD);
  translate(width / 2, height / 2);

  for (var pentagon of pentagons) {
    push();
    translate(pentagon.x, pentagon.y);
    scale(40);
    rotate(pentagon.z * TWO_PI)
    beginShape()
    for (var point of pentaPoints) {
      vertex(point.x, point.y);
    }
    endShape();
    pop();

    if (mouseOn) {
      pentagon.x *= 1.09;
      pentagon.y *= 1.09;
    } else {
      pentagon.x *= 0.97;
      pentagon.y *= 0.97;
    }
    let dist = pentagon.x * pentagon.x + pentagon.y * pentagon.y;
    dist = Math.sqrt(dist);
    if (dist < 60 || dist > max(width, height)) {
      pentagon.normalize();
      pentagon.rotate(random(TWO_PI));
      pentagon.z = random()
      if (dist < 60) {
        pentagon.mult(max(width, height));
      } else {
        pentagon.mult(60);
      }
    }
  }

  if (mouseOn && mouseFrames <= fadeFrames) {
    mouseFrames++;
  } else if (mouseFrames >= 0) {
    mouseFrames--;
  }

  let progress = mouseFrames / fadeFrames;
  blendMode(BLEND);
  let tintVal = floor(255 * progress);
  tint(255, 255 - tintVal);
  image(prismImage, 0, 0);
  tint(255, tintVal);
  image(headImage, 0, 0);
}
