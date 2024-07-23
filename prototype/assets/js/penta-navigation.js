/*
###############################################
Program: Pentagon Mouse Tracking and Navigation
Author: Jett Pavlica
Created: 06/13/2022
###############################################
*/

p5.disableFriendlyErrors = true;
var pentaPoints = [];
var contourPoints = [];
var artistPrisms = [];
var pentagonGrid;
var nd = {
  dp: 0.01,
  df: 0.01,
  di: 0.2,
  dfi: 0.005
}

// thx ashleedawg on stackexchange
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function mouseMoved() {
  cursor("auto");
  for (var prism of artistPrisms) {
    if (prism.inBoundingBox(mouseX, mouseY)) {
      cursor("zoom-in");
      if (prism.link == "art-artists-authors.html") {
        cursor("pointer");
      }
      break;
    }
  }
}

function mouseClicked() {
  for (var prism of artistPrisms) {
    if (prism.inBoundingBox(mouseX, mouseY)) {
      prism.clicked();
      break;
    }
  }
}

function preload() {
  let currImage;

  currImage = loadImage('assets/img/derrick-beasley-prism.png');
  artistPrisms.push(new ArtistPrism("derrick-beasley.html", currImage));

  currImage = loadImage('assets/img/cwe-prism.png');
  artistPrisms.push(new ArtistPrism("carlyn-wright-eakes.html", currImage));

  currImage = loadImage('assets/img/jermaine-powell-prism.png');
  artistPrisms.push(new ArtistPrism("jermain-powell.html", currImage));

  currImage = loadImage('assets/img/ban-artwork-prism.png');
  artistPrisms.push(new ArtistPrism("ban-artwork.html", currImage));

  currImage = loadImage('assets/img/mailande-moran-prism.png');
  artistPrisms.push(new ArtistPrism("mailande-moran.html", currImage));

  currImage = loadImage('assets/img/samir-knego-prism.png');
  artistPrisms.push(new ArtistPrism("samir-knego.html", currImage));

  currImage = loadImage('assets/img/jim-lee-prism.png');
  artistPrisms.push(new ArtistPrism("jim-lee.html", currImage));

  currImage = loadImage('assets/img/exit-prism.png');
  artistPrisms.push(new ArtistPrism("art-artists-authors.html", currImage));
}

function setup() {
  // sketch enviroment
  let sketchNode = document.getElementById('sketch-container')
  let c = createCanvas(sketchNode.offsetWidth, sketchNode.offsetHeight);
  c.parent(sketchNode);
  fill("#DA48975A");
  noStroke();
  frameRate(30);
  imageMode(CENTER);

  // calculate pentagon points
  for (let i = 0; i < 5; i++) {
    let direction = p5.Vector.fromAngle((i * TWO_PI) / 5);
    pentaPoints.push(direction.copy());
    this.contourPoints.push(p5.Vector.mult(direction, 0.85));
  }
  this.contourPoints.reverse();

  // initialize mouse tracking grid
  pentagonGrid = new PentagonGrid();

  // pre-process images
  let maxRows;
  let maxCols;
  let screenBound;
  let imageSize;
  if (width > height) {
    maxRows = 2;
    maxCols = 4;
    screenBound = height;
    imageSize = screenBound / 3;
  } else {
    maxRows = 4;
    maxCols = 2;
    screenBound = width;
    imageSize = screenBound / 4;
  }
  // shuffleArray(artistPrisms);
  let index = 0;
  for (let row = 1; row <= maxRows; row++) {
    for (let col = 1; col <= maxCols; col++) {
      if (index < artistPrisms.length) {
        let x = map(col, 0, maxCols + 1, 0, width);
        let y = map(row, 0, maxRows + 1, 0, height);
        let prism = artistPrisms[index];
        prism.pos.x = x;
        prism.pos.y = y;
        let prismPic = prism.image;
        let ratio = imageSize / prismPic.height;
        if (prismPic.width > prismPic.height) {
          ratio = imageSize / prismPic.width;
        }
        prismPic.resize(prismPic.width * ratio, 0);
        index++;
      }
    }
  }
}

function draw() {
  // reset background
  // blendMode(BLEND);
  background("#000817");

  // draw tracking grid
  blendMode(ADD);
  fill("#DA48975A");
  pentagonGrid.show();

  // draw artistPrisms
  blendMode(BLEND);
  // fill("#000817");
  let index = 0;
  for (var prism of artistPrisms) {
    push();
    translate(prism.pos.x, prism.pos.y);
    scale(0.6 + noise(index * nd.di, frameCount * nd.dfi) * 0.75)
    image(prism.image, 0, 0)
    pop();
    index++;
  }
}

class PentagonGrid {
  constructor() {
    this.mouseVec = createVector();
    this.rad = 30;
    this.rows = ceil((height * 0.8) / this.rad / 1.7);
    this.cols = ceil((width * 0.8) / this.rad / 1.7);
    // this.rows = 10
    // this.cols = 50
  }

  show() {
    this.mouseVec.x = mouseX;
    this.mouseVec.y = mouseY;
    for (let row = 1; row <= this.rows; row++) {
      for (let col = 1; col <= this.cols; col++) {
        push()
        let x = map(col, 1, this.cols, width * 0.1, width * 0.9)
        let y = map(row, 1, this.rows, height * 0.1, height * 0.9)
        let pos = createVector(x, y);
        let heading = this.mouseVec.copy()
          .sub(pos)
          .heading();
        translate(pos.x, pos.y);
        scale(this.rad + 30 * noise(pos.x * nd.dp, pos.y * nd.dp, frameCount * nd.df));
        rotate(heading);
        beginShape()
        for (var point of pentaPoints) {
          vertex(point.x, point.y);
        }
        // beginContour()
        // for (var point of contourPoints) {
        //   vertex(point.x, point.y);
        // }
        // endContour()
        endShape();
        pop();
      }
    }
  }
}

class ArtistPrism {
  constructor(link, image) {
    this.link = link;
    this.image = image;
    this.pos = createVector();
  }

  inBoundingBox(x, y) {
    return x > this.pos.x - this.image.width / 2 &&
      x < this.pos.x + this.image.width / 2 &&
      y > this.pos.y - this.image.height / 2 &&
      y < this.pos.y + this.image.height / 2;
  }

  show() {
    image(this.image, this.pos.x, this.pos.y);
  }

  clicked() {
    window.location.href = this.link;
  }
}
