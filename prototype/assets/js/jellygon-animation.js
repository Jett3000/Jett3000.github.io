/*
###############################################
Program: Jelly Pentagon Animation
Author: Jett Pavlica
Created: 06/09/2022
###############################################
*/

p5.disableFriendlyErrors = true;
var pentagon;

// noise delta's for controlling motion
var nd = {
  df: 0.005,
  dp: 0.33,
};

function setup() {
  // sketch enviroment
  let sketchNode = document.getElementById('sketch-container')
  let c = createCanvas(sketchNode.offsetWidth, sketchNode.offsetWidth);
  c.parent(sketchNode);
  fill("#DA48975A");
  stroke(100);
  strokeWeight(2);
  frameRate(30);

  pentagon = new Pentagon();
}

function draw() {
  // reset background
  blendMode(BLEND);
  background("#000817");
  blendMode(ADD);

  translate(width / 2, height / 2);
  for (let i = 0; i < 1.0; i += 0.05) {
    push();
    scale(i*i) // + noise(i + frameCount * 0.01));
    rotate(2 * TWO_PI * noise(i * nd.dp + frameCount * nd.df));
    pentagon.show();
    pop();
  }

// pentagon = new Pentagon(noise(frameCount * nd.df * 4))

}

class Pentagon {
  constructor(nval = -1) {
    let rad = min(width, height) * 0.5;
    let sideWidth = rad * 0.08;
    if(nval > 0){
      sideWidth = rad * map(nval, 0, 1, 0.04, 0.3);
    }

    this.shapePoints = [];
    this.contourPoints = [];
    let prismCenter = createVector(0, 0);
    for (let i = 0; i < 5; i++) {
      let direction = p5.Vector.fromAngle((i * TWO_PI) / 5 - HALF_PI);
      this.shapePoints.push(p5.Vector.add(prismCenter, p5.Vector.mult(direction, rad)));
      this.contourPoints.push(p5.Vector.add(prismCenter, p5.Vector.mult(direction, rad - sideWidth)));
    }
    this.contourPoints.reverse();
  }


  show() {
    beginShape()
    for (var point of this.shapePoints) {
      vertex(point.x, point.y);
    }
    beginContour()
    for (var point of this.contourPoints) {
      vertex(point.x, point.y);
    }
    endContour()
    endShape();
  }
}
