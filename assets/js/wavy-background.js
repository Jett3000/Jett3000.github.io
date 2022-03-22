var numCurves = 8;
var numSegs = 3;
var offsetMag = 30;
var startCol = null;
var endCol = null;
var colCounter = 0;
var rainbowMode = false;
var h = 0; // hue
var hOff = 0; // hue offset;
var nd = {
  // noise deltas
  x: 0.3,
  y: 0.3,
  fr: 0.002,
};
var curves = [];

var colorPairs = [
  [
    [199, 92, 88],
    [170, 184, 201]
  ],
  [
    [86, 216, 214],
    [255, 125, 173]
  ],
  [
    [206, 17, 136],
    [57, 208, 132]
  ],
  [
    [31, 145, 211],
    [140, 206, 97]
  ],
  [
    [214, 78, 204],
    [57, 22, 143]
  ],

  [
    [44, 44, 71],
    [245, 179, 170]
  ],

  [
    [191, 51, 57],
    [108, 186, 191]
  ],
  [
    [107, 170, 197],
    [29, 24, 50]
  ],
  [
    [68, 3, 0],
    [230, 20, 169]
  ],
  [
    [109, 137, 214],
    [89, 248, 144]
  ],
  [
    [31, 95, 135],
    [45, 25, 80]
  ],
  [
    [51, 101, 85],
    [158, 165, 185]
  ],
  [
    [228, 79, 63],
    [233, 237, 166]
  ],
  [
    [166, 128, 73],
    [3, 73, 113]
  ],
  [
    [10, 21, 78],
    [234, 84, 3]
  ],
  [
    [53, 103, 110],
    [67, 242, 161]
  ],
  [
    [11, 187, 129],
    [11, 107, 190]
  ],
  [
    [153, 62, 155],
    [225, 237, 187]
  ],
  [
    [202, 108, 211],
    [85, 7, 225]
  ],
  [
    [91, 99, 110],
    [229, 73, 100]
  ],
  [
    [16, 8, 63],
    [29, 115, 242]
  ],
  [
    [44, 64, 175],
    [20, 139, 153]
  ],
  [
    [51, 81, 133],
    [157, 225, 198]
  ],
  [
    [121, 109, 152],
    [239, 212, 218]
  ]
];

var sketchNode = document.getElementById('wavy-background-container');
var msgNode = document.getElementById('code-p')

function setup() {
  let c = createCanvas(window.innerWidth, window.innerHeight);
  c.parent(sketchNode);
  offsetMag = min(
    window.innerHeight / numCurves,
    (0.4 * window.innerWidth) / numSegs
  );
  if (rainbowMode) {
    colorMode(HSB, 360, 255, 255);
  } else {
    let colPair = random(colorPairs);
    startCol = color(colPair[0][0], colPair[0][1], colPair[0][2]);
    endCol = color(colPair[1][0], colPair[1][1], colPair[1][2]);
  }
  noStroke();
  frameRate(60);
}

function draw() {
  // genCurves();

  if (rainbowMode) {
    background(h, 140, 180);
    h += 1;
    h = h > 360 ? 0 : h;
    hOff = 0;
  } else {
    background(startCol);
    colCounter = 0;
  }

  curves = [];
  for (i = -1; i < numCurves; i++) {
    var y = height - ((i + 0.5) * height) / numCurves;
    beginShape();
    curveVertex(width, 0);
    curveVertex(width, 0);
    for (j = -1; j <= numSegs; j++) {
      var x = width - ((j + 0.5) * width) / numSegs;
      let curvePoint = createVector(x, y);
      let noiseVal =
        noise(frameCount * nd.fr + j * nd.x, frameCount * nd.fr + i * nd.y) *
        TWO_PI;
      let offset = p5.Vector.fromAngle(noiseVal).mult(offsetMag);
      curvePoint.add(offset);
      curveVertex(curvePoint.x, curvePoint.y);
    }
    curveVertex(0, 0);
    curveVertex(0, 0);
    if (rainbowMode) {
      fill((h + hOff) % 360, 140, 180);
    } else {
      fill(lerpColor(startCol, endCol, colCounter / numCurves));
      colCounter++;
    }
    endShape();
    hOff += 360 / numCurves;
  }
  // showPoints();
}

function showPoints() {
  fill(0);
  for (let curve of curves) {
    for (let k = 0; k < curve.length; k++) {
      ellipse(curve[k].x, curve[k].y, 20);
    }
  }
}

function genCurves() {
  curves = [];
  for (i = -1; i < numCurves; i++) {
    var curveArray = [];
    var y = height - ((i + 0.5) * height) / numCurves;
    var offsetMag = min(height / numCurves, (0.4 * width) / numSegs);
    var yPad = height / numCurves;
    var xPad = width / numSegs;
    for (j = -1; j <= numSegs; j++) {
      var x = width - ((j + 0.5) * width) / numSegs;
      let basePoint = createVector(x, y);
      let noiseVal =
        noise(frameCount * nd.fr + j * nd.x, frameCount * nd.fr + i * nd.y) *
        TWO_PI;
      let offset = p5.Vector.fromAngle(noiseVal).mult(offsetMag);
      curveArray.push(p5.Vector.add(basePoint, offset));
    }
    curves.push(curveArray);
  }
}
