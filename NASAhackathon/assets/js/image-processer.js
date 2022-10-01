// Created 8/1/2022 by Jett Pavlica
// A program using shaders and user input
// to create and save customized images of Jupiter

var redImage, greenImage, blueImage;

function preload() {
  redImage = loadImage("/assets/img/jupiter-redmap.png");
  greenImage = loadImage("/assets/img/jupiter-greenmap.png");
  blueImage = loadImage("/assets/img/jupiter-bluemap.png");

}

function setup() {
 // sketch enviroment
  let sketchNode = document.getElementById('sketch-container');
  let canvasWidth = sketchNode.offsetWidth;
  let canvasHeight = sketchNode.offsetHeight ;
  let c = createCanvas(canvasWidth, canvasHeight);
  c.parent(sketchNode);
  noStroke();
  frameRate(30);
}

function draw() {
  image(redImage, 0, 0, width, height);
  noLoop();
}
