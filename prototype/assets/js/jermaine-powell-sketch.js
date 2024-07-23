/*
###############################################
Program: Linked List Snaking Pentagon Animation
Author: Jett Pavlica
Created: 06/28/2022
###############################################
*/

p5.disableFriendlyErrors = true;
var prismImage;
var pentaPoints = [];
var snakes = [];

function preload() {
  prismImage = loadImage("assets/img/jermaine-powell-prism.png");
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
  for (var i = 0; i < 5; i++) {
    let p1 = pentaPoints[i];
    let p2 = pentaPoints[(i + 1) % 5];

    for (let j = 0; j < 1; j += 0.05) {
      // first lerp along the line between the points
      let ePoint = p5.Vector.lerp(p1, p2, j);
      // modulate by sin
      ePoint.mult(1 + sin(frameCount * 0.04 + map(j, 0, 1, 0, TWO_PI)) / 6);

      let distScale = prismImage.width / 1.5;
      //draw an ellipse
      ellipse(ePoint.x * distScale, ePoint.y * distScale, 15, 15);
      ellipse(ePoint.x * distScale * 1.1, ePoint.y * distScale * 1.1, 17, 17);
      ellipse(ePoint.x * distScale * 1.2, ePoint.y * distScale * 1.2, 20, 20);

    }
  }

  blendMode(BLEND);
  image(prismImage, 0, 0);
  // noLoop();
}
