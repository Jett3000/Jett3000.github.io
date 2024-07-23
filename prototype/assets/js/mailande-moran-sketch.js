/*
###############################################
Program: Pentagon Sine Wave
Author: Jett Pavlica
Created: 06/21/2022
###############################################
*/

p5.disableFriendlyErrors = true;
var prismImage;
var pentaPoints = [];
var rows = 8;
var cols = 8;

function preload() {
  prismImage = loadImage("assets/img/mailande-moran-prism.png");
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

  for (let col = 1; col <= cols; col++) {
    for (let row = 1; row <= rows; row++) {
      let x = map(col, 1, cols, width * 0.1, width * 0.9);
      let y = map(row, 1, rows, height * 0.1, height * 0.9);
      let theta = map(row, 1, rows, 0, TWO_PI);
      theta += col * TWO_PI / cols;
      push();
      translate(x + sin(theta + frameCount / 20) * 40, y);
      scale(40);
      beginShape();
      for (var point of pentaPoints) {
        vertex(point.x, point.y);
      }
      endShape();
      pop();
    }
  }

  blendMode(BLEND);
  image(prismImage, width / 2, height / 2);
}
