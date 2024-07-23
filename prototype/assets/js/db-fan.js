/*
###############################################
Program: Pentagon Fanning Animation
Author: Jett Pavlica
Created: 06/14/2022
###############################################
*/

p5.disableFriendlyErrors = true;
var prismImage;
var pentaPoints = [];
var currPoint = 2;
var cycleFrames = 300;

function preload() {
  prismImage = loadImage("assets/img/derrick-beasley-prism.png");
}

function setup() {
  // sketch enviroment
  let sketchNode = document.getElementById('sketch-container');
  let canvasWidth = sketchNode.offsetWidth;
  let canvasHeight = window.innerWidth > 601 ? sketchNode.offsetHeight : canvasWidth;
  let c = createCanvas(canvasWidth, canvasHeight);
  c.parent(sketchNode);
  fill("#DA48975A");
  noStroke();
  frameRate(30);
  blendMode(BLEND);

  // image settings
  imageMode(CENTER);
  let ratio;
  if (width > height) {
    ratio = (height * 0.7) / prismImage.height;
  } else {
    ratio = (width * 0.7) / prismImage.width;
  }
  prismImage.resize(prismImage.width * ratio, 0);

  // populate pentaPoints
  for (let i = 0; i < 5; i++) {
    let direction = p5.Vector.fromAngle((i * TWO_PI) / 5 - HALF_PI);
    pentaPoints.push(direction.copy());
  }
}

function draw() {
  // reset background
  background("#000817");
  blendMode(ADD);

  translate(width / 2, height / 2);
  for (let i = 0; i < 5; i++) {
    push();
    scale(width / 2.3);
    let rotation = map(i, 0, 4, 0, 4 * TWO_PI / 5);
    let progress = map(frameCount % cycleFrames, 0, cycleFrames, 0, 2);
    rotation = progress > 1 ? -rotation : rotation;
    progress = progress > 1 ? 2 - progress : progress;
    rotate(rotation * progress);
    beginShape();
    // vertex(0, 0);
    vertex(0, 0);
    curveVertex(pentaPoints[currPoint].x, pentaPoints[currPoint].y);
    curveVertex(pentaPoints[(currPoint + 1) % 5].x, pentaPoints[(currPoint + 1) % 5].y);
    vertex(0, 0);
    vertex(0, 0);
    endShape();
    pop();
  }

  if (frameCount % cycleFrames == floor(cycleFrames / 2)) {
    currPoint = (currPoint + 1) % 5;
  }

  blendMode(BLEND);
  image(prismImage, 0, 0);
}
