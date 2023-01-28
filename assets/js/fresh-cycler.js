// authored by jett pavlica 1/27/23
// major shoutout to Marian Veteanu for the scenemanager library!

// manager
var mgr;
var sceneLength = 3600 * 2; // frames per scene
var frameCountdown = 0;
var sceneNames = [SpiralSketch, RainingSketch, MorphingSketch, LogoSketch];
// sceneNames = [SpiralSketch];
var sceneBank = [];

// preloaded fonts and images
var fontAzoSansItalic;
var pbgLogo;
var durmpacLogo;

// precalculated points of a pentagon
var pentaPoints = [];

// color bank
var colorBank = ["#bc9eca50", "#752c7c50", "#b5339150"];

// support classes
class MorphingPentagon {
    constructor() {
        this.currPoints = this.randomPentagon();
        this.nextPoints = this.randomPentagon();
        this.currColor = color(random(colorBank));
        this.nextColor = color(random(colorBank));
        this.framesToMorph = 120 + random(40);
        this.framesToPause = 70 - random(60);
        this.frameCounter = 0;
    }

    show() {
        if (this.frameCounter < this.framesToMorph) {
            let progress = this.frameCounter / this.framesToMorph;
            progress *= progress;
            fill(lerpColor(this.currColor, this.nextColor, progress));
            beginShape();
            for (let i = 0; i < 5; i++) {
                let p = p5.Vector.lerp(
                    this.currPoints[i],
                    this.nextPoints[i],
                    progress
                )
                vertex(p.x, p.y);
            }
            endShape();
        } else {
            fill(this.nextColor);
            beginShape()
            for (let p of this.nextPoints) {
                vertex(p.x, p.y);
            }
            endShape();
        }

        // regen after pausing
        if (this.frameCounter - this.framesToMorph > this.framesToPause) {
            this.currPoints = this.nextPoints;
            this.nextPoints = this.randomPentagon();
            this.currColor = this.nextColor;
            this.nextColor = color(random(colorBank));
            this.frameCounter = 0;
            return;
        }

        this.frameCounter++;
    }

    randomPentagon() {
        let xmargin = width / 10;
        let ymargin = height / 10;
        let center = createVector(random(xmargin, width - xmargin), random(ymargin, height - ymargin));
        let radius = random(60, xmargin);
        let rotation = random(TWO_PI);

        let pointArray = [];

        for (let p of pentaPoints) {
            let newPoint = p.copy()
                .rotate(rotation)
                .mult(radius)
                .add(center);

            pointArray.push(newPoint);
        }
        return pointArray;
    }
}

class RainingPentagon {
    constructor(inverted = false) {
        this.inverter = inverted ? -1 : 1;
        this.regen();
        this.pos.y = this.inverter == -1 ? height + random(height) : -random(height); // smooth out initial drop
    }

    regen() {
        let y = this.inverter == 1 ? 0 : height;
        this.pos = createVector(random(width), y);
        this.vel = createVector(0, random(1, 2) * this.inverter);
        this.rotation = random(TWO_PI);
        this.rad = random(15, 35);
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        scale(this.rad);
        rotate(this.rotation);
        beginShape()
        for (let p of pentaPoints) {
            vertex(p.x, p.y);
        }
        endShape()
        pop();

        this.pos.add(this.vel);
        if (this.inverter == 1) {
            if (this.pos.y > height) {
                this.regen();
            }
        } else {
            if (this.pos.y < 0) {
                this.regen();
            }
        }
    }
}

class FlyingLogo {
    constructor(pic) {
        this.image = pic;
        this.pos = createVector(random(width * 0.1, width * 0.9), random(height * 0.1, height * 0.9));
        this.vel = createVector(random(2, 4), random(2, 4));
        this.scale = random(.8, 2);
    }

    show() {
        push()
        translate(this.pos.x, this.pos.y);
        scale(this.scale);
        image(this.image, 0, 0);
        pop();

        // let kick = false;
        if (this.pos.x <= this.image.width / 2 ||
            this.pos.x >= width - this.image.width / 2) {
            this.vel.x *= -1;
        }

        if (this.pos.y <= this.image.height / 2 ||
            this.pos.y >= height - this.image.height / 2) {
            this.vel.y *= -1;
        }

        this.pos.add(this.vel);
    }
}

function populateSceneBank() {
    for (let scene of sceneNames) {
        sceneBank.push(scene);
    }

    shuffle(sceneBank, true);
}

// main sketch setup
function preload() {
    fontAzoSansItalic = loadFont(
        "https://use.typekit.net/af/90ca1f/000000000000000000013f4f/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i7&v=3");

    pbgLogo = loadImage("assets/img/pbg-logo.png")
    durmpacLogo = loadImage("assets/img/durmpac-logo.png")
}

function setup() {
    // enviroment
    let c = createCanvas(window.innerWidth, window.innerHeight);
    c.parent(document.getElementById('sketch-container'));

    fill("#DA48975A");
    noStroke();
    frameRate(60);
    imageMode(CENTER);
    textAlign(CENTER, CENTER);
    textSize(height / 4.5)
    textFont(fontAzoSansItalic);

    // populate pentaPoints
    for (let i = 0; i < 5; i++) {
        let direction = p5.Vector.fromAngle((i * TWO_PI) / 5 - HALF_PI);
        pentaPoints.push(direction.copy());
    }

    // resize images
    ratio = (height * 0.2) / pbgLogo.height;
    pbgLogo.resize(pbgLogo.height * ratio, 0);
    ratio = (height * 0.2) / durmpacLogo.height;
    durmpacLogo.resize(durmpacLogo.height * ratio, 0);


    // setup manager and scenes
    mgr = new SceneManager();
    populateSceneBank();

    // mgr.showScene(MorphingSketch);
}

function draw() {
    if (frameCountdown == 0) {
        // reset countdown
        frameCountdown = sceneLength;

        // regenerate scene bank if emptied
        if (sceneBank.length == 0) {
            populateSceneBank();
        }

        // show the next scene in the bank
        mgr.showScene(sceneBank.pop());

    } else {
        frameCountdown--;
    }
    mgr.draw();
}

// =============================================================
// =                         BEGIN SCENES                      = 
// =============================================================

function MorphingSketch() {
    var pentagons = [];
    var pentagonCount = 140;

    this.enter = function () {
        let pentagonCount = random(80, 160);
        pentagons = [];
        for (let i = 0; i < pentagonCount; i++) {
            pentagons.push(new MorphingPentagon());
        }
    }

    this.draw = function () {
        // reset background
        blendMode(BLEND);
        background("#000000");

        // draw pentagons
        blendMode(ADD)
        for (let gon of pentagons) {
            gon.show();
        }
    }
}

function RainingSketch() {
    var pentagons = [];
    var pentagonCount = 1000;

    this.enter = function () {
        fill("#DA48979A");
        pentagons = [];

        let mode = random();
        if (mode < 0.33) {
            for (let i = 0; i < pentagonCount; i++) {
                pentagons.push(new RainingPentagon(false));
            }
        } else if (mode < 0.66) {
            for (let i = 0; i < pentagonCount; i++) {
                pentagons.push(new RainingPentagon(true));
            }
        } else {
            for (let i = 0; i < pentagonCount; i++) {
                pentagons.push(new RainingPentagon(random() < 0.5));
            }
        }
    }

    this.draw = function () {
        // reset background
        blendMode(BLEND);
        background("#000000");

        // draw pentagons
        blendMode(ADD)
        for (let gon of pentagons) {
            gon.show();
        }
    }
}

function SpiralSketch() {
    var a = 8;
    var c = 1.15;

    this.enter = function () {
        fill("#DA48977A");
    }

    this.draw = function () {
        // reset background
        blendMode(BLEND);
        background("#000000");

        // draw pentagons
        blendMode(ADD)
        translate(width / 2, height / 2);
        rotate(millis() / 10000)
        let offset = (frameCount / (100 * TWO_PI)) % TWO_PI;
        for (let theta = 0; theta < TWO_PI * 6; theta += TWO_PI / 36) {
            let r = a * pow(c, theta);

            let x = r * cos(theta);
            let y = r * sin(theta);

            push();
            translate(x, y);
            let noiseVal = max(noise(r / 100 + frameCount / 300), 0.5);
            scale((r / 2) * noise(r / 100, frameCount / 300));
            // rotate(theta);
            beginShape();
            for (let p of pentaPoints) {
                vertex(p.x, p.y);

            }
            endShape();
            pop();
        }
    }
}

function LogoSketch() {
    var logos = [];
    var logoCount = 24;

    this.setup = function () {
        for (let i = 0; i < logoCount; i++) {
            let pic = i % 2 == 0 ? durmpacLogo : pbgLogo;
            logos.push(new FlyingLogo(pic));
        }
    }

    this.enter = function () {
        fill("#fcfaee");
    }

    this.draw = function () {
        // reset background
        blendMode(BLEND);
        background("#000000");

        // draw text
        let message = "thanks for"
        text(message, width / 2, height / 2 - textSize() / 2);
        message = "coming!"
        text(message, width / 2, height / 2 + textSize() / 2);

        // draw logos
        for (let l of logos) {
            l.show();
        }


    }
}
