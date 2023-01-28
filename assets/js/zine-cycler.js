// authored by jett pavlica 1/22/23
// major shoutout to Marian Veteanu for the scenemanager library!

p5.disableFriendlyErrors = true; // live dangerously and performantly

// manager
var mgr;
var sceneLength = 3660; // frames per scene
var frameCountdown = 0;
var sceneNames = [BeasleySketch, EakesSketch, PowellSketch, BANSketch, MoranSketch, KnegoSketch, LeeSketch];
var sceneBank = [];

// prism pictures
var beasleyPic;
var eakesPic;
var powellPic;
var banPic;
var moranPic;
var knegoPic;
var leePic;
var headPic; // bonus :)
var collabLogo // extra bonus 🤯

// precalculated points of a pentagon
var pentaPoints = [];

// support classes
class PackedPentagon {
    constructor() {
        this.regen();
    }

    // give the pentagon a random position on the screen,
    // reset radius and growing state, and record frameCount
    regen() {
        this.pos = createVector(random(width), random(height));
        this.rad = 1;
        this.angle = random(TWO_PI);
        this.growing = true;
        this.startFrame = frameCount;
    }

    // if the pentagon is still growing, increase radius
    // and check for collisions
    step(pentagons) {
        if (this.growing) {
            this.rad += 0.5;
            for (let other of pentagons) {
                if (other != this &&
                    (other.rad + this.rad) > this.pos.dist(other.pos) * 2) {
                    this.growing = false;
                    other.growing = false
                    return;
                }
            }
        }
    }

    // translate to the pentagon position, scale by radius
    // draw shape w/ precomputed pentagon points
    show() {
        if (this.rad < 16 && !this.growing) {
            return;
        }

        push();
        translate(this.pos.x, this.pos.y);
        scale(this.rad);
        rotate(this.angle);
        beginShape()
        for (var point of pentaPoints) {
            vertex(point.x, point.y);
        }
        endShape(CLOSE);
        pop();
    }
}

class GlassPentagon {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = p5.Vector.random2D()
            .mult(random(1, 3));
        this.col = random(["#0000977C", "#0048007C", "#DA00007C", "#BC9ECA7C", "#DA489770", "#DA4897A0"]);
        this.noiseOffset = random(999);
    }

    step() {
        // add velocity to position to simmulate movement
        this.pos.add(this.vel);

        // bounce off walls if out of bounds
        if (this.pos.x < 0 || this.pos.x > width) {
            this.vel.x *= -1;
        }
        if (this.pos.y < 0 || this.pos.y > height) {
            this.vel.y *= -1;
        }
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        scale(120);
        rotate(2 * TWO_PI * noise(this.noiseOffset + (frameCount / 300)));
        fill(this.col);
        beginShape();
        for (var point of pentaPoints) {
            vertex(point.x, point.y);
        }
        endShape();
        pop();
    }
}

class PentagonGrid {
    constructor() {
        this.rad = 40;
        this.rows = ceil((height * 0.8) / this.rad / 1.6);
        this.cols = ceil((width * 0.8) / this.rad / 1.6);

        this.nd = {
            dp: 0.01,
            df: 0.005,
            di: 0.2,
            dfi: 0.005
        }
    }

    show() {
        for (let row = 1; row <= this.rows; row++) {
            for (let col = 1; col <= this.cols; col++) {
                push()
                let x = map(col, 1, this.cols, width * 0.1, width * 0.9)
                let y = map(row, 1, this.rows, height * 0.1, height * 0.9)
                let pos = createVector(x, y);
                translate(pos.x, pos.y);
                scale(this.rad + 30 * noise(pos.x * this.nd.dp, pos.y * this.nd.dp, frameCount * this.nd.df));
                rotate(noise(pos.x * this.nd.dp + 500, pos.y * this.nd.dp + 500, frameCount * this.nd.df + 500));
                beginShape()
                for (var point of pentaPoints) {
                    vertex(point.x, point.y);
                }
                endShape();
                pop();
            }
        }
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
    let currImage;

    beasleyPic = loadImage('assets/img/derrick-beasley-prism.png');

    eakesPic = loadImage('assets/img/cwe-prism.png');

    powellPic = loadImage('assets/img/jermaine-powell-prism.png');

    banPic = loadImage('assets/img/ban-artwork-prism.png');

    moranPic = loadImage('assets/img/mailande-moran-prism.png');

    knegoPic = loadImage('assets/img/samir-knego-prism.png');

    leePic = loadImage('assets/img/jim-lee-prism.png');

    headPic = loadImage('assets/img/jim-lee-head.png');

    collabLogo = loadImage('assets/img/collab-logo.png');
}

function setup() {
    // enviroment
    let c = createCanvas(window.innerWidth, window.innerHeight);
    c.parent(document.getElementById('sketch-container'));

    fill("#DA48975A");
    noStroke();
    frameRate(60);
    blendMode(BLEND);
    imageMode(CENTER);

    // populate pentaPoints
    for (let i = 0; i < 5; i++) {
        let direction = p5.Vector.fromAngle((i * TWO_PI) / 5 - HALF_PI);
        pentaPoints.push(direction.copy());
    }

    // resize images



    // setup manager and scenes
    mgr = new SceneManager();
    populateSceneBank();
}

function draw() {
    if (frameCountdown == 0) {
        // reset countdown
        frameCountdown = sceneLength;

        // plays when the scene bank is empty, play Allsketch then 
        // start a new cycle
        if (sceneBank.length == 0) {
            if (mgr.isCurrent(AllSketch)) {
                populateSceneBank();
            } else {
                mgr.showScene(AllSketch)
                return;
            }
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

function BeasleySketch() {
    var currPoint = 2;
    var cycleFrames = sceneLength / 3;

    this.enter = function () {
        fill("#DA48975A");
        ratio = (height * 0.7) / beasleyPic.height;
        beasleyPic.resize(beasleyPic.height * ratio, 0);
    }

    this.draw = function () {
        // reset background
        background("#000000");
        blendMode(ADD);

        translate(width / 2, height / 2);
        for (let i = 0; i < 5; i++) {
            push();
            scale(height / 2.1);
            let rotation = map(i, 0, 4, 0, 4 * TWO_PI / 5);
            let progress = map(frameCount % cycleFrames, 0, cycleFrames, 0, 2);
            rotation = progress > 1 ? -rotation : rotation;
            progress = progress > 1 ? 2 - progress : progress;
            rotate(rotation * progress);
            beginShape();
            // vertex(0, 0);
            vertex(0, 0);
            curveVertex(pentaPoints[currPoint].x, pentaPoints[currPoint].y);
            curveVertex(pentaPoints[(currPoint + 1) % 5].x, pentaPoints[(currPoint + 1) % 5].y);
            vertex(0, 0);
            vertex(0, 0);
            endShape();
            pop();
        }

        if (frameCount % cycleFrames == floor(cycleFrames / 2)) {
            currPoint = (currPoint + 1) % 5;
        }

        blendMode(BLEND);
        image(beasleyPic, 0, 0);
    }
}

function EakesSketch() {
    var pentagons = [];
    var pentagonPool = [];

    this.enter = function () {
        fill("#da48967e");
        ratio = (height * 0.7) / eakesPic.height;
        eakesPic.resize(eakesPic.height * ratio, 0);
    }

    this.setup = function () {
        // initialize pentagonPool and pentagons array
        for (var i = 0; i < 60; i++) {
            let p = new PackedPentagon;
            p.startFrame = 100 - i;
            pentagonPool.push(p);
        }
        pentagons.push(new PackedPentagon);
    }

    this.draw = function () {
        // reset background
        background("#000000");
        blendMode(ADD);

        // step through pentagons to show and simulate them,
        // also tracks the oldest, finished pentagon for pruning
        let maxGon = pentagons[0];
        for (let gon of pentagons) {
            gon.show();
            gon.step(pentagons);
            if (gon.startFrame < maxGon.startFrame && !gon.growing) {
                maxGon = gon;
            }
        }

        // move pentagons from the pool to the active array,
        // or prune existing pentagons if the pool is emtpy
        if (pentagonPool.length > 0) {
            pentagons.push(pentagonPool.pop());
        } else if (!maxGon.growing) {
            maxGon.regen();
        }

        blendMode(BLEND);
        image(eakesPic, width / 2, height / 2);
    }
}

function PowellSketch() {
    var dotSize = 40;
    var increase = 1.2;
    var dotSize2 = dotSize * increase;
    var dotSize3 = dotSize2 * increase;

    this.enter = function () {
        fill("#da48964b");
        ratio = (height * 0.7) / powellPic.height;
        powellPic.resize(powellPic.height * ratio, 0);


    }

    this.draw = function () {
        // reset background
        background("#000000");
        blendMode(ADD);

        translate(width / 2, height / 2);
        for (var i = 0; i < 5; i++) {
            let p1 = pentaPoints[i];
            let p2 = pentaPoints[(i + 1) % 5];

            for (let j = 0; j < 1; j += 0.02) {
                // first lerp along the line between the points
                let ePoint = p5.Vector.lerp(p1, p2, j);
                // modulate by sin
                ePoint.mult(1 + sin(frameCount * 0.02 + map(j, 0, 1, 0, TWO_PI)) / 6);

                let distScale = powellPic.height / 1.5;
                //draw an ellipse
                ellipse(ePoint.x * distScale, ePoint.y * distScale, dotSize, dotSize);
                ellipse(ePoint.x * distScale * increase, ePoint.y * distScale * increase, dotSize2, dotSize2);
                ellipse(ePoint.x * distScale * increase * increase, ePoint.y * distScale * increase * increase, dotSize3, dotSize3);

            }
        }

        blendMode(BLEND);
        image(powellPic, 0, 0);
    }
}

function BANSketch() {
    var pentagons = [];
    this.enter = function () {
        ratio = (height * 0.7) / banPic.height;
        banPic.resize(banPic.height * ratio, 0);
    }

    this.setup = function () {
        // populate flying pentagons
        for (var i = 0; i < 80; i++) {
            pentagons.push(new GlassPentagon());
        }
    }

    this.draw = function () {
        // reset background
        background("#000000");
        blendMode(ADD);

        for (var pentagon of pentagons) {
            pentagon.step();
            pentagon.show();
        }

        blendMode(BLEND);
        image(banPic, width / 2, height / 2);
    }
}

function MoranSketch() {
    var rows = 8;
    var cols = 12;

    this.enter = function () {
        fill("#da489680");
        ratio = (height * 0.7) / moranPic.height;
        moranPic.resize(moranPic.height * ratio, 0);


    }

    this.draw = function () {
        // reset background
        background("#000000");
        blendMode(ADD);

        for (let col = 1; col <= cols; col++) {
            for (let row = 1; row <= rows; row++) {
                let x = map(col, 1, cols, width * 0.1, width * 0.9);
                let y = map(row, 1, rows, height * 0.1, height * 0.9);
                let theta = map(row, 1, rows, 0, TWO_PI);
                theta += col * TWO_PI / cols;
                push();
                translate(x + sin(theta + frameCount / 40) * 65, y);
                scale(65);
                rotate(noise(row * 0.005, col * 0.005, frameCount / 800) * TWO_PI * 3);
                beginShape();
                for (var point of pentaPoints) {
                    vertex(point.x, point.y);
                }
                endShape();
                pop();
            }
        }

        blendMode(BLEND);
        image(moranPic, width / 2, height / 2);
    }
}

function KnegoSketch() {

    this.enter = function () {
        fill("#da489620");
        ratio = (height * 0.7) / knegoPic.height;
        knegoPic.resize(knegoPic.height * ratio, 0);
    }

    this.draw = function () {
        // reset background
        background("#000000");
        blendMode(ADD);

        translate(width / 2, height / 2);
        let layers = 8;
        for (let i = 0; i < layers; i++) {
            let rad = map(i, 0, layers, knegoPic.height, height)
            push();
            scale(rad / 1.5);
            rotate((i * 0.15) * millis() / 1000)
            beginShape()
            for (var point of pentaPoints) {
                vertex(point.x, point.y);
            }
            endShape();
            pop();
        }

        blendMode(BLEND);
        image(knegoPic, 0, 0);

    }
}

function LeeSketch() {
    var pentagons = [];
    var countdownFrames;
    var transitionFrames = 30;

    this.enter = function () {
        countdownFrames = sceneLength * 0.6;
        fill("#da489676");
        ratio = (height * 0.7) / leePic.height;
        leePic.resize(leePic.height * ratio, 0);
    }

    this.setup = function () {
        // populate pentagons
        for (let i = 0; i < 180; i++) {
            let p = p5.Vector.random3D()
                .mult(random(max(width, height)));
            pentagons.push(p);
        }
    }

    this.draw = function () {
        // reset background
        background("#000000");
        translate(width / 2, height / 2);

        for (var pentagon of pentagons) {
            push();
            translate(pentagon.x, pentagon.y);
            scale(70);
            rotate(pentagon.z)
            beginShape()
            for (var point of pentaPoints) {
                vertex(point.x, point.y);
            }
            endShape();
            pop();

            if (countdownFrames < 20) {
                pentagon.x *= 1.04;
                pentagon.y *= 1.04;
            } else {
                pentagon.x *= 0.995;
                pentagon.y *= 0.995;
            }
            let dist = pentagon.x * pentagon.x + pentagon.y * pentagon.y;
            dist = Math.sqrt(dist);
            if (dist < 60 || dist > max(width, height)) {
                pentagon.normalize();
                pentagon.rotate(random(TWO_PI));
                pentagon.z = random()
                if (dist < 60) {
                    pentagon.mult(max(width, height));
                } else {
                    pentagon.mult(random(55, 65));
                }
            }
        }

        push();
        countdownFrames--;
        if (countdownFrames < transitionFrames) {
            if (countdownFrames > 0) {
                let progress = countdownFrames / transitionFrames;
                progress *= progress;
                let tintVal = floor(255 * progress);
                tint(255, 255 - tintVal);
                image(headPic, 0, 0);
                tint(255, tintVal);
                image(leePic, 0, 0);
            } else {
                image(headPic, 0, 0);
            }

        } else {
            image(leePic, 0, 0);
        }
        pop();
    }
}

function AllSketch() {
    var pentagonGrid = new PentagonGrid();
    var prismArray = [beasleyPic, eakesPic, powellPic, banPic, moranPic, knegoPic, leePic, collabLogo];
    var nd = {
        dp: 0.01,
        df: 0.01,
        di: 0.15,
        dfi: 0.002
    }

    this.enter = function () {

        for (let prism of prismArray) {
            let ratio = width / prism.width / 4;
            prism.resize(prism.width * ratio, 0);
        }
    }

    this.draw = function () {
        // reset background
        // blendMode(BLEND);
        background("#000000");

        // draw tracking grid
        blendMode(ADD);
        fill("#DA48975A");
        pentagonGrid.show();

        // draw artistPrisms
        blendMode(BLEND);
        let rows = 2;
        let cols = 4;
        let counter = 0;
        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                let x = map(col + 0.5, 0, cols, 0, width);
                let y = map(row + 0.5, 0, rows, 0, height);
                push();
                translate(x, y);
                scale(0.6 + noise(counter * nd.di, frameCount * nd.dfi) * 0.75)
                image(prismArray[counter], 0, 0)
                pop();
                counter++;
            }
        }
    }
}
