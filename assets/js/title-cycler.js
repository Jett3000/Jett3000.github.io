// authored by jett pavlica 1/22/23
// major shoutout to Marian Veteanu for the scenemanager library!

// manager
var mgr;
var sceneLength = 3600 * 2; // frames per scene
var frameCountdown = 0;
var sceneNames = [CoverSketch, JellygonSketch, RecursiveSketch, SpinnerSketch];
// sceneNames = [CoverSketch]
var sceneBank = [];

// preloaded font
var fontAzoSansItalic;

// precalculated points of a pentagon
var pentaPoints = [];

// support classes
class HollowPentagon {
    constructor(sideWidthFactor = 0.08) {
        let rad = min(width, height) * 0.45;
        let sideWidth = rad * sideWidthFactor;

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

class TranslucentPentagon {
    constructor() {
        this.regen();
    }

    regen() {
        this.fillColor = random(["#bc9eca88", "#752c7c88", "#b5339188"])
        this.theta = random(TWO_PI);
        this.spinning = random() < 0.8;
        let oneDegree = TWO_PI / 360;
        this.angularVel = random(oneDegree / 2, oneDegree * 2);
        if (random() < 0.5) this.angularVel *= -1;

        this.pos = createVector(random(width), random(height));
        this.rad = random(60, 100);
    }

    show() {
        push()
        fill(this.fillColor);
        translate(this.pos.x, this.pos.y);
        rotate(this.theta);
        scale(this.rad);
        beginShape();
        for (let p of pentaPoints) {
            vertex(p.x, p.y);
        }
        endShape();
        this.theta = this.spinning ? this.theta + this.angularVel : this.theta;
        pop();
    }
}

class PentaPrism {
    constructor() {
        this.prismCenter1 = createVector(width * 0.25, height * 0.66);
        this.prismCenter2 = createVector(width * 0.75, height * 0.33);

        this.frontPoints = [];
        this.backPoints = [];

        let initOffset = random(TWO_PI / 10);
        for (let i = 0; i < 5; i++) {
            let offsetVec = p5.Vector.fromAngle(initOffset + (i * TWO_PI) / 5).mult(
                random(width / 5, width / 3)
            );
            this.frontPoints.push(p5.Vector.add(this.prismCenter1, offsetVec));
        }

        initOffset = random(TWO_PI / 10);
        for (let i = 0; i < 5; i++) {
            let offsetVec = p5.Vector.fromAngle(initOffset + (i * TWO_PI) / 5).mult(
                random(width / 5, width / 3)
            );
            this.backPoints.push(p5.Vector.add(this.prismCenter2, offsetVec));
        }

        this.nd = {
            dp: 0.3,
            df: random(0.002, 0.006)
        }
    }

    show(panelCount = 5) {
        let nvals = [];
        for (let i = 1; i <= 4; i++) {
            nvals.push(noise(frameCount * this.nd.df + this.nd.dp * i));
        }

        for (let i = 0; i < panelCount; i++) {
            let frontPoint1 = this.frontPoints[i].copy();
            let frontPoint2 = this.frontPoints[(i + 1) % 5].copy();

            let backpoint1 = this.backPoints[i].copy();
            let backpoint2 = this.backPoints[(i + 1) % 5].copy();

            frontPoint1.lerp(this.prismCenter1, nvals[3]);
            frontPoint2.lerp(this.prismCenter1, nvals[2]);
            backpoint1.lerp(this.prismCenter2, nvals[1]);
            backpoint2.lerp(this.prismCenter2, nvals[0]);

            beginShape();
            vertex(backpoint1.x, backpoint1.y);
            vertex(frontPoint1.x, frontPoint1.y);
            vertex(frontPoint2.x, frontPoint2.y);
            vertex(backpoint2.x, backpoint2.y);
            endShape(CLOSE);
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
    fontAzoSansItalic = loadFont("https://use.typekit.net/af/90ca1f/000000000000000000013f4f/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i7&v=3");
}

function setup() {
    // enviroment
    let c = createCanvas(window.innerWidth, window.innerHeight);
    c.parent(document.getElementById('sketch-container'));

    fill("#DA48975A");
    frameRate(60);
    textAlign(CENTER, CENTER);
    textSize(height / 4.5)
    textFont(fontAzoSansItalic);

    // populate pentaPoints
    for (let i = 0; i < 5; i++) {
        let direction = p5.Vector.fromAngle((i * TWO_PI) / 5 - HALF_PI);
        pentaPoints.push(direction.copy());
    }


    // setup manager and scenes
    mgr = new SceneManager();
    populateSceneBank();
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

function JellygonSketch() {
    var pentagon = new HollowPentagon();

    // noise delta's for controlling motion
    var nd = {
        df: 0.001,
        dp: 0.33,
        ds: 0.001
    };

    this.enter = function () {
        fill("#DA48977A");
        stroke(100);
        strokeWeight(2);
    }

    this.draw = function () {
        // reset background
        blendMode(BLEND);
        background("#000000");
        push();
        fill("#fcfaee");
        noStroke();
        text('PROTOTYPE', width / 2, height / 2)
        pop();
        blendMode(ADD);

        translate(0, height / 2);
        translate(width / 4, 0);
        for (let i = 0; i < 1.0; i += 0.05) {
            push();
            scale(i * i) // + noise(i + frameCount * 0.01));
            rotate(4 * TWO_PI * noise(i * nd.dp + frameCount * nd.df));
            pentagon.show();
            pop();
        }

        // translate(width / 3, 0);
        let synchronosity = noise(frameCount * nd.ds) * 300;
        translate(width / 2, 0);
        for (let i = 0; i < 1.0; i += 0.05) {
            push();
            scale(i * i) // + noise(i + frameCount * 0.01));
            rotate(-4 * TWO_PI * noise(i * nd.dp + (frameCount + synchronosity) * nd.df));
            pentagon.show();
            pop();
        }
    }
}

function CoverSketch() {
    var prism = new PentaPrism();;
    var panelCount = 1;
    var panelIncrement = true;
    var frameInterval = 120;


    this.enter = function () {
        // initialize background PentaPrism
        prism = new PentaPrism();
    }

    this.enter = function () {
        fill("#DA48977A");
        stroke(100);
        strokeWeight(2);
    }

    this.draw = function () {
        // reset background
        blendMode(BLEND);
        background("#000000");
        push();
        fill("#fcfaee");
        noStroke();
        text('PROTOTYPE', width / 2, height / 2)
        pop();
        blendMode(ADD);

        // animate PentaPrism
        if (frameCount % frameInterval == 0) {
            panelCount += panelIncrement ? 1 : -1;
            if (panelCount == 1 || panelCount == 6) {
                panelIncrement = !panelIncrement;
            }
        }
        prism.show(constrain(panelCount, 1, 5));
    }
}

function SpinnerSketch() {
    let numPentagons = 120;
    let pentagons = [];

    this.setup = function () {
        for (let i = 0; i < numPentagons; i++) {
            pentagons.push(new TranslucentPentagon());
        }
    }

    this.enter = function () {
        noStroke();
        for (let gon of pentagons) {
            gon.regen();
        }
    }

    this.draw = function () {
        blendMode(BLEND);
        background("#000000");
        push();
        fill("#fcfaee");
        noStroke();
        text('PROTOTYPE', width / 2, height / 2)
        pop();
        blendMode(ADD);

        for (let gon of pentagons) {
            gon.show();
        }
    }

}

function RecursiveSketch() {
    var contourPoints = [];
    var depth = 0;
    var maxDepth = 4;
    var depthIncrementInterval = 600;
    var depthIncrementTracker = 0;

    this.enter = function () {
        depthIncrementTracker = 0;
        depth = 0;
        noStroke();
        fill("#da4897a0");
    }

    this.setup = function () {
        for (let p of pentaPoints) {
            contourPoints.push(p.copy().mult(0.85));
        }
        contourPoints.reverse();
    }

    this.draw = function () {
        // reset background
        blendMode(BLEND);
        background("#000000");

        // draw text
        push();
        fill("#fcfaee");
        noStroke();
        text('PROTOTYPE', width / 2, height / 2)
        pop();

        // draw recursive pentagon
        blendMode(ADD);
        translate(width / 2, height / 2);
        this.drawPentagon(height / 4, depth + 1);

        // increment depth as needed
        if (depthIncrementTracker == depthIncrementInterval) {
            depth = (depth + 1) % maxDepth;
            depthIncrementTracker = 0;
        } else {
            depthIncrementTracker++;
        }


    }

    this.drawPentagon = function (rad, depth) {
        rotate(millis() / 2000)

        if (depth > 0) {
            for (var point of pentaPoints) {
                push();
                translate(point.x * rad, point.y * rad);
                this.drawPentagon(rad * 0.5, depth - 1);
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
}
