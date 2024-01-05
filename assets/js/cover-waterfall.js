var attractors = [];
var agents = [];
const palette = ["#f94144", "#f3722c", "#f8961e", "#f9c74f", "#90be6d", "#43aa8b", "#577590"];
const sketchNode = document.getElementById("waterfall-sketch-container");

function setup() {
  let c = createCanvas(sketchNode.clientWidth, sketchNode.clientHeight);
  c.parent(sketchNode);
  noFill();

  // set attractor flow direction
  let lr = (i) => {
    return random(width / attrCount) + (i * width) / attrCount;
  };
  let rl = (i) => {
    return random(width / attrCount) + ((3 - i) * width) / attrCount;
  };
  let tb = (i) => {
    return random(height / attrCount) + (i * height) / attrCount;
  };
  let bt = (i) => {
    return random(height / attrCount) + ((3 - i) * height) / attrCount;
  };

  let xRand = random() < 0.5 ? lr : rl;
  let yRand = random() < 0.5 ? tb : bt;

  // generate attractors
  let attrCount = int(random(3, 6));
  for (let i = 0; i < attrCount; i++) {
    let attrX = constrain(xRand(i), width * 0.1, width * 0.9);
    let attrY = constrain(yRand(i), height * 0.1, height * 0.9);
    attractors.push(createVector(attrX, attrY));
  }

  // center attractors
  let avgX = (attractors[0].x + attractors[attractors.length - 1].x) / 2;
  let avgY = (attractors[0].y + attractors[attractors.length - 1].y) / 2;
  let xDiff = (width / 2) - avgX;
  let yDiff = (height / 2) - avgY;
  attractors.forEach((attr) => {
    attr.x += xDiff;
    attr.y += yDiff
  });

  // generate agents
  let agentCount = floor(random(24, 33));
  for (let j = 0; j < agentCount; j++) {
    agents.push(new Agent(attractors[0].x, attractors[0].y));
  }

  // sort the agents by noiseOffset
  agents.sort((a, b) => {
    return a.noiseOffset - b.noiseOffset;
  });

  // set sketch background
  background("#0e0e0e");
}

function draw() {
  background(14, 10);
  //step and draw agents
  strokeWeight(4);
  agents.forEach((agent) => {
    if (!agent.done) {
      agent.step();
      agent.show();
      allDone = false;
    }
  });

  drawAttractors();
}

function drawAttractors() {
  strokeWeight(2);
  stroke(255);
  fill(0);
  attractors.forEach((att, i) => {
    if (i < attractors.length - 1) {
      line(att.x, att.y, attractors[i + 1].x, attractors[i + 1].y);
    }
    ellipse(att.x, att.y, 16);
  });
}

class Agent {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.searchingFor = 1;
    this.noiseOffset = agents.length * random(10);
    this.speed = 1 + random();
    this.col = random(palette);
  }

  attrDist(attrIndex) {
    return (
      abs(this.pos.x - attractors[attrIndex].x) +
      abs(this.pos.y - attractors[attrIndex].y)
    );
  }

  step() {
    // forces simulation
    this.vel = p5.Vector
      .sub(attractors[this.searchingFor], this.pos)
      .setMag(this.speed);
    this.vel.rotate(
      (noise((frameCount + this.noiseOffset) / 120) - 0.5) * (TWO_PI * 0.65)
    );

    this.pos.add(this.vel);

    // checking if close enough to current attractor
    if (this.attrDist(this.searchingFor) < 6) {
      if (this.searchingFor < attractors.length - 1) {
        this.searchingFor += 1;
      } else {
        this.pos.x = attractors[0].x;
        this.pos.y = attractors[0].y;
        this.searchingFor = 1;
      }
    }
  }

  show() {
    stroke(this.col);
    point(this.pos.x, this.pos.y);
  }
}
