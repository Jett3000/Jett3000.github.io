let coords = [];
let particles = [];
let attractors = [];
let particleCount = 600;
let textThickness = 8;
let particleSize = 4;
let bgBrightneess = 100 * 14 / 255;
let mouseVec;


function preload() {
  coords = loadStrings('assets/js/coords.txt');
}

function setup() {
  //create canvas to fit container div
  const canvasDiv = document.getElementById('sketch-container');
  const canvasWidth = canvasDiv.offsetWidth;
  const canvas = createCanvas(canvasWidth, canvasWidth);
  canvas.parent("sketch-container");

  //sketch settings
  noStroke();
  colorMode(HSB);
  background(bgBrightneess);

  //downsize sketch for mobile
  if (canvasWidth < 300) {
    console.log("downsizing for mobile");
    particleCount /= 3;
    textThickness /= 3;
    particleSize /= 2;
  }

  //make attractors from preloaded coords
  for (i = 0; i < coords.length - 1; i += 2) {
    attractors.push(createVector(coords[i] * width, coords[i + 1] * height));
  }

  //make particleCount random particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  mouseVec = createVector(0, 0);
}



function draw() {
  background(0, 0, bgBrightneess, 0.2 * sin(frameCount * 4));
  mouseVec.x = mouseX;
  mouseVec.y = mouseY;

  // attractors.forEach(att => ellipse(att.x, att.y, 5, 5));
  particles.forEach(particle => particle.step());
}

//Particle class
class Particle {
  constructor() {
    this.hoff = random(30);
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D();
    this.attr = this.searchForVec();
    this.acc = p5.Vector.sub(this.attr, this.pos).setMag(0.3);
  }

  step() {
    fill((frameCount + this.hoff) % 360, 50, 200)
    ellipse(this.pos.x, this.pos.y, particleSize, particleSize);
    this.acc = p5.Vector.sub(this.attr, this.pos);
    if (this.acc.magSq() < (textThickness * textThickness)) {
      this.acc.limit(0.1);
    } else {
      this.acc.limit(2);
    }

    if (this.distSq(this.pos, mouseVec) <= 3600) {
      this.acc = p5.Vector.sub(this.pos, mouseVec).rotate(radians(45)).setMag(3);
    }

    //jitter towards attractor behavior
    this.vel = p5.Vector.random2D().mult(2.5);
    this.vel.lerp(this.acc, 0.5)
    this.pos.add(this.vel);
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

  distSq(vec1, vec2) {
    let xdiff = pow(vec1.x - vec2.x, 2);
    let ydiff = pow(vec1.y - vec2.y, 2);
    return ydiff + xdiff;

  }

}
