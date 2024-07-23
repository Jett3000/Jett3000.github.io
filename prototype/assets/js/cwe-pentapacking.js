/*
###############################################
Program: Pentagon Packing Animation
Author: Jett Pavlica
Created: 06/09/2022
###############################################
*/

p5.disableFriendlyErrors = true;
var pentaPoints = [];
var pentagons = [];
var pentagonPool = [];
var prismImage;
var imageWidth;
var imageHeight;

function preload() {
  prismImage = loadImage("assets/img/cwe-prism.png");
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
  imageMode(CENTER);
  let ratio;
  if (width > height) {
    ratio = (height * 0.7) / prismImage.height;
  } else {
    ratio = (width * 0.7) / prismImage.width;
  }
  imageWidth = prismImage.width * ratio;
  imageHeight = prismImage.height * ratio;

  // initialize pentaPoints for drawing pentagons
  for (let i = 0; i < 5; i++) {
    let direction = p5.Vector.fromAngle((i * TWO_PI) / 5 - HALF_PI);
    pentaPoints.push(direction);
  }

  // initialize pentagonPool and pentagons array
  for (var i = 0; i < 60; i++) {
    let p = new Pentagon;
    p.startFrame = 100 - i;
    pentagonPool.push(p);
  }
  pentagons.push(new Pentagon);

  blendMode(BLEND);
}

function draw() {
  // reset background
  background("#000817");
  blendMode(ADD);

  // step through pentagons to show and simulate them,
  // also tracks the oldest, finished pentagon for pruning
  let maxGon = pentagons[0];
  for (let gon of pentagons) {
    gon.show();
    gon.step();
    if (gon.startFrame < maxGon.startFrame && !gon.growing) {
      maxGon = gon;
    }
  }

  // move pentagons from the pool to the active array,
  // or prune existing pentagons if the pool is emtpy
  if (pentagonPool.length > 0) {
    pentagons.push(pentagonPool.pop());
  } else if (!maxGon.growing) {
    maxGon.regen();
  }

  blendMode(BLEND);
  image(prismImage, width / 2, height / 2, imageWidth, imageHeight);
}

class Pentagon {
  constructor() {
    this.regen();
  }

  // give the pentagon a random position on the screen,
  // reset radius and growing state, and record frameCount
  regen() {
    this.pos = createVector(random(width), random(height));
    this.rad = 1;
    this.angle = random(TWO_PI);
    this.growing = true;
    this.startFrame = frameCount;
  }

  // if the pentagon is still growing, increase radius
  // and check for collisions
  step() {
    if (this.growing) {
      this.rad++;
      for (let other of pentagons) {
        if (other != this &&
          (other.rad + this.rad) > this.pos.dist(other.pos) * 2) {
          this.growing = false;
          other.growing = false
          return;
        }
      }
    }
  }

  // translate to the pentagon position, scale by radius
  // draw shape w/ precomputed pentagon points
  show() {
    if (this.rad < 16 && !this.growing) {
      return;
    }

    push();
    translate(this.pos.x, this.pos.y);
    scale(this.rad);
    rotate(this.angle);
    beginShape()
    for (var point of pentaPoints) {
      vertex(point.x, point.y);
    }
    endShape(CLOSE);
    pop();
  }
}
