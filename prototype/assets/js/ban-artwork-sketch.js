/*
###############################################
Program: Additive Light Pentagon Animation
Author: Jett Pavlica
Created: 06/24/2022
###############################################
*/

p5.disableFriendlyErrors = true;
var prismImage;
var pentaPoints = [];
var pentagons = [];

function preload() {
  prismImage = loadImage("assets/img/ban-artwork-prism.png");
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

  // populate flying pentagons
  for (var i = 0; i < 60; i++) {
    pentagons.push(new Pentagon());
  }
}

// idea: noise field where the fill is detirmined by color?

function draw() {
  // reset background
  background("#000817");
  blendMode(ADD);

  for (var pentagon of pentagons) {
    pentagon.step();
    pentagon.show();
  }

  blendMode(BLEND);
  image(prismImage, width / 2, height / 2);
  // noLoop();
}

// represents a whimsical pentagon flying and spining across the screen
class Pentagon {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D()
      .mult(random(1, 3));
    this.col = random(["#0000977C", "#0048007C", "#DA00007C"]);
    this.noiseOffset = random(999);
  }

  step() {
    // add velocity to position to simmulate movement
    this.pos.add(this.vel);

    // bounce off walls if out of bounds
    if (this.pos.x < 0 || this.pos.x > width) {
      this.vel.x *= -1;
    }
    if (this.pos.y < 0 || this.pos.y > height) {
      this.vel.y *= -1;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    scale(120);
    rotate(2 * TWO_PI * noise(this.noiseOffset + (frameCount / 300)));
    fill(this.col);
    beginShape();
    for (var point of pentaPoints) {
      vertex(point.x, point.y);
    }
    endShape();
    pop();
  }

}
