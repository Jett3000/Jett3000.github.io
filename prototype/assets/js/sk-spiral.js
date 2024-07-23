/*
###############################################
Program: Pentagon Spiral Animation
Author: Jett Pavlica
Created: 06/14/2022
###############################################
*/

p5.disableFriendlyErrors = true;
var prismImage;
var pentaPoints = [];

function preload() {
  prismImage = loadImage("assets/img/samir-knego-prism.png");
}

function setup() {
  // sketch enviroment
  let sketchNode = document.getElementById('sketch-container');
  let canvasWidth = sketchNode.offsetWidth;
  let canvasHeight = window.innerWidth > 601 ? sketchNode.offsetHeight : canvasWidth;
  let c = createCanvas(canvasWidth, canvasHeight);
  c.parent(sketchNode);
  fill("#DA48971A");
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
  let layers = 8;
  for (let i = 0; i < layers; i++) {
    let rad = map(i, 0, layers, prismImage.width, width)
    push();
    scale(rad / 1.5);
    let reverse = i % 2 == 0 ? -1 : 1;
    rotate((i * 0.1) * millis() / 1000)
    beginShape()
    for (var point of pentaPoints) {
      vertex(point.x, point.y);
    }
    endShape();
    pop();
  }

  blendMode(BLEND);
  image(prismImage, 0, 0);
}
