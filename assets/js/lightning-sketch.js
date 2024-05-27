p5.disableFriendlyErrors = true;

var bolts = [];
var boltCount = 2;
var detailDepth = 8;
var forkChance = 0.6;

function setup() {
  // environment
  createCanvas(windowWidth, windowHeight);
  stroke('#fcfaee');

  // bolt initialization
  for (let i = 0; i < boltCount; i++) {
    bolts.push(new Bolt());
  }

  // clear main div to show canvas
  let mainNode = document.getElementById('main');
  mainNode.style.backgroundColor = '#00000000'
  console.log(mainNode);
}

function draw() {
  background('#bc9eca')

  bolts.forEach(b => {
    b.show();
    if (b.done) b.regenerate();
  })
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Bolt {
  constructor() {
    this.regenerate();
    this.startFrame = 0;
  }

  regenerate() {
    this.root = createVector(random(width), 60);
    this.dest = createVector(
        this.root.x + random(-width * 0.05, width * 0.05), height * 0.8);
    this.rootSeg = new Segment(this.root, this.dest, 16, 0);
    this.segments = this.rootSeg.subdivide();
    this.currentDepth = 0;

    this.detailBolt(detailDepth);
    this.calcTiming();
  }

  calcTiming() {
    this.startFrame = frameCount;
    this.segments.sort((a, b) => a.startPos.y - b.startPos.y);
    this.segments.sort((a, b) => a.branchDepth - b.branchDepth);

    let framesUntilFull = random(100, 300);
    this.segments.forEach((s, i) => {
      s.frameOffset = framesUntilFull * Math.pow(i / this.segments.length, 0.3);
    });
  }

  detailBolt(depth = 1) {
    this.currentDepth += depth;
    // let st = millis();
    for (let i = 0; i < depth; i++) {
      let newSegs = [];

      while (this.segments.length > 0) {
        let curSeg = this.segments.pop();
        // subdivide
        let divisions = curSeg.subdivide();
        newSegs.push(divisions[0]);
        newSegs.push(divisions[1]);
        let mp = divisions[0].endPos.copy();

        // chance to add fork
        // let forkChance = curSeg.width >= 5 ? 1 : 0.6;
        if (curSeg.width >= 5 ||
            (random() < forkChance && curSeg.width > 0.4)) {
          let direction = p5.Vector.sub(curSeg.endPos, curSeg.startPos);
          direction.rotate(random(HALF_PI) - QUARTER_PI).mult(0.9);

          direction.y = abs(direction.y);
          let newEndPos = mp.copy().add(direction);

          let forkSeg = new Segment(
              mp, newEndPos, curSeg.width * 0.3, curSeg.branchDepth + 1);
          newSegs.push(forkSeg);
        }
      }
      this.segments = newSegs;
    }
  }

  show() {
    let framesDisplayed = frameCount - this.startFrame;
    this.done = true;
    for (let i = 0; i < this.segments.length; i++) {
      if (this.segments[i].frameOffset < framesDisplayed) {
        this.segments[i].show();
      } else {
        this.done = false;
      }
    }
  }
}

class Segment {
  constructor(startPos, endPos, width, branchDepth) {
    this.startPos = startPos;
    this.endPos = endPos;
    this.width = width;
    this.branchDepth = branchDepth;
    this.calcDisplayFrame();
  }

  calcDisplayFrame() {
    this.displayOnFrame = frameCount + floor(this.startPos.y / 40);
  }

  midpoint() {
    return p5.Vector.add(this.startPos, this.endPos).mult(0.5);
  }

  show() {
    strokeWeight(1);
    line(this.startPos.x, this.startPos.y, this.endPos.x, this.endPos.y);
  }

  subdivide(offsetFac = 0.2) {
    let midpoint = this.midpoint();
    let offset = p5.Vector.sub(this.endPos, this.startPos).mag() * offsetFac;
    midpoint.x += random(-offset, offset);
    midpoint.y += random(-offset, offset);
    let segA =
        new Segment(this.startPos, midpoint, this.width, this.branchDepth);
    let segB = new Segment(midpoint, this.endPos, this.width, this.branchDepth);

    return [segA, segB];
  }
}
