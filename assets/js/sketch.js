let particles = [];
let attractors = [];

function preload() {
  loadStrings('assets/draft1.txt', makeAttractors);
}

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent("sketch-container");
  stroke(150);
  for (let i = 0; i < 300; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  background(0, 30);
  // attractors.forEach(att => ellipse(att.x, att.y, 5, 5));
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
    this.vel = p5.Vector.random2D().setMag(0.2);
    this.attr = this.findClosestVec();
    this.acc = p5.Vector.sub(this.attr, this.pos).setMag(0.3);
  }

  findClosestVec() {
    let ldist = 10000;
    let lvec;
    for (i = 0; i < attractors.length; i++) {
      print(attractors[i]);
      let cdist = p5.Vector.dist(attractors[i], this.pos);
      if (cdist < ldist) {
        ldist = cdist;
        lvec = attractors[i];
      }
    }
    return lvec;
  }

  step() {
    // line(this.pos.x, this.pos.y, this.attr.x, this.attr.y);
    ellipse(this.pos.x, this.pos.y, 3, 3);
    this.pos.add(this.vel);
    this.vel.add(this.acc).limit(1);
    this.acc = p5.Vector.sub(this.attr, this.pos).limit(0.5);
  }
}
