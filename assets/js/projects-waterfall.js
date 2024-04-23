
var noiseParams = {dx: 0.002, dt: 0.001, mag: 2};
var curves = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  stroke('#bc9eca')
  strokeWeight(1);

  let curveCount = min(windowWidth / 4, 300);
  for (let curve = 0; curve < curveCount; curve++) {
    let pos = createVector(lerp(0, width, (0.5 + curve) / curveCount), 0);
    let c = new BCurve(pos);
    curves.push(c);
  }
    
    background(14);
    document.getElementById('main').style.background = '#00000000';
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)

  curves = [];
  let curveCount = windowWidth / 4;
  for (let curve = 0; curve < curveCount; curve++) {
    let pos = createVector(lerp(0, width, (0.5 + curve) / curveCount), 0);
    let c = new BCurve(pos);
    curves.push(c);
  }
}

function draw() {
  background(14)
  curves.forEach(c => c.show());
}

class BCurve {
  constructor(pos) {
    this.pos = pos;
    this.size = height / 12;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y)
    let nval = noise(this.pos.x * noiseParams.dx, frameCount * noiseParams.dt);
    rotate(nval * TAU * noiseParams.mag);

    bezier(
        -this.size, this.size / 4, 0, this.size, 0, -this.size, this.size,
        -this.size / 4);
    pop();
  }
}