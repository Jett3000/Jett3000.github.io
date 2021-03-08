let particles = [];
let attractors = [];

function preload() {
  loadStrings('assets/js/draft1.txt', makeAttractors);
}

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent("sketch-container");
  stroke(150);
  for (let i = 0; i < 600; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  if(frameCount == 350){
      background(14);
      print("clear");
    }
    background(14, 20);
  particles.forEach(particle => particle.step());
}

function makeAttractors(strings) {
  for (i = 0; i < strings.length - 1; i += 2) {
    // print(strings[i], strings[i + 1]);
    attractors.push(createVector(strings[i] * (600 / 750), strings[i + 1] * (600 / 750)));
  }
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
      return this.pos.dist(curr) - this.pos.dist(other);
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
    if(this.acc.mag() < 8){
      this.acc.limit(0.1);
    } else {
      this.acc.limit(1.5);
    }

    this.vel = p5.Vector.random2D().mult(2);
    this.vel.lerp(this.acc, 0.5)

    this.pos.add(this.vel);
  }
}
