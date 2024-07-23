p5.disableFriendlyErrors = false;
var pentaPoints = [];
var contourPoints = [];
var depth = 1;

function mouseMoved() {
  // calculate the depth of recursion based
  // on mouse position
  let mouseVal;
  let screenSize;
  if (width < height) {
    mouseVal = mouseY;
    screenSize = height;
  } else {
    mouseVal = mouseX;
    screenSize = width;
  }

  if (mouseVal < screenSize * 0.33) {
    depth = 1;
  } else if (mouseVal > screenSize * 0.66) {
    depth = 3;
  } else {
    depth = 2;
  }

}

function setup() {
  // sketch enviroment
  let sketchNode = document.getElementById('sketch-container')
  let c = createCanvas(sketchNode.offsetWidth, sketchNode.offsetHeight);
  c.parent(sketchNode);
  fill("#DA48975A");
  noStroke();
  frameRate(30);

  for (let i = 0; i < 5; i++) {
    let direction = p5.Vector.fromAngle((i * TWO_PI) / 5 - HALF_PI);
    pentaPoints.push(direction.copy());
    contourPoints.push(p5.Vector.mult(direction, 0.85));
  }
  contourPoints.reverse();
}

function draw() {
  // reset background
  blendMode(BLEND);
  background("#000817");
  blendMode(ADD);

  translate(width / 2, height / 2);
  drawPentagon(height / 4, depth + 1);
}

function drawPentagon(rad, depth) {
  rotate(millis() / 1000)

  if (depth > 0) {
    for (var point of pentaPoints) {
      push();
      translate(point.x * rad, point.y * rad);
      drawPentagon(rad * 0.5, depth - 1);
      pop();
    }
  }

  push();
  scale(rad);
  beginShape()
  for (var point of pentaPoints) {
    vertex(point.x, point.y);
  }
  beginContour()
  for (var point of contourPoints) {
    vertex(point.x, point.y);
  }
  endContour()
  endShape();
  pop();
}
