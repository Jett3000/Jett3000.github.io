let coords = [];
let particles = [];
let attractors = [];
let particleCount = 600;


function preload() {
  coords = loadStrings('assets/js/coords.txt');
}

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent("sketch-container");
  noStroke();

  //make attractors from preloaded coords
  for (i = 0; i < coords.length - 1; i += 2) {
    attractors.push(createVector(coords[i] * width, coords[i + 1] * height));
  }

  //make particleCount random particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

//timings for the background dimming
let maxDimAlpha = 30;
let minDimAlpha = 20;
let dimFrames = 150;
let unDimFrames = 40;
let dimStart = 350;
let dimMid = dimStart + dimFrames;
let dimEnd = dimMid + unDimFrames;


function draw() {
  if (frameCount >= dimStart && frameCount < dimEnd) {
    if (frameCount <= dimMid) {
      let bgAlpha = map(frameCount, dimStart, dimMid, minDimAlpha, maxDimAlpha);
      background(14, bgAlpha);
    } else if (frameCount <= dimEnd) {
      let bgAlpha = map(frameCount, dimMid, dimEnd, maxDimAlpha, minDimAlpha);
      background(14, bgAlpha);
    }
  } else if (frameCount == 1) {
    background(14);
  } else {
    background(14, minDimAlpha);
  }

  // attractors.forEach(att => ellipse(att.x, att.y, 5, 5));
  particles.forEach(particle => particle.step());
}

//Particle class
class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D();
    this.attr = this.searchForVec();
    this.acc = p5.Vector.sub(this.attr, this.pos).setMag(0.3);
  }


  searchForVec() {
    attractors.sort((curr, other) => {
      return p5.Vector.sub(curr, this.pos).magSq() -
        p5.Vector.sub(other, this.pos).magSq();
    });

    attractors.sort((curr, other) => {
      return curr.z - other.z;
    });

    attractors[0].z += 1;
    return attractors[0];
  }

  step() {
    ellipse(this.pos.x, this.pos.y, 4, 4);
    this.acc = p5.Vector.sub(this.attr, this.pos);
    if (this.acc.mag() < 8) {
      this.acc.limit(0.1);
    } else {
      this.acc.limit(1.5);
    }

    this.vel = p5.Vector.random2D().mult(2);
    this.vel.lerp(this.acc, 0.5)

    this.pos.add(this.vel);
  }
}
