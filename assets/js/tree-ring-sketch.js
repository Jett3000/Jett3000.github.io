var sampler;
var renderMode;

var radiusSlider;
var attemptSlider;
var noiseStrengthSlider;
var sinSpeedSlider;
var focalPhaseSlider;
var searchArcLengthSlider;
var sinStengthSlider;


function setup() {
    // setup control sliders
    let defaultValue;
    if (getItem('userRadius')) {
        defaultValue = getItem('userRadius');
    } else {
        defaultValue = 20;
    }
    radiusSlider = document.getElementById('radius-slider');
    radiusSlider.min = 2;
    radiusSlider.max = 40;
    radiusSlider.step = 1;
    radiusSlider.value = defaultValue;
    document.getElementById('radius-slider-label').innerHTML = radiusSlider.value;
    radiusSlider.oninput = () => {
        storeItem("userRadius", radiusSlider.value);
        document.getElementById('radius-slider-label').innerHTML = radiusSlider.value;
    }

    if (getItem('userAttempts')) {
        defaultValue = getItem('userAttempts');
    } else {
        defaultValue = 30;
    }
    attemptSlider = document.getElementById('attempts-slider');
    attemptSlider.min = 2;
    attemptSlider.max = 40;
    attemptSlider.step = 1;
    attemptSlider.value = defaultValue;
    document.getElementById('attempts-slider-label').innerHTML = attemptSlider.value;
    attemptSlider.oninput = () => {
        storeItem("userAttempts", attemptSlider.value);
        document.getElementById('attempts-slider-label').innerHTML = attemptSlider.value;
    }

    if (getItem('userSAL')) {
        defaultValue = getItem('userSAL');
    } else {
        defaultValue = PI;
    }
    searchArcLengthSlider = document.getElementById('sal-slider');
    searchArcLengthSlider.min = 0;
    searchArcLengthSlider.max = 360;
    searchArcLengthSlider.step = 0.001;
    searchArcLengthSlider.value = defaultValue;
    document.getElementById('sal-slider-label').innerHTML = Math.round(searchArcLengthSlider.value) + '°';
    searchArcLengthSlider.oninput = () => {
        storeItem("userSAL", searchArcLengthSlider.value);
        document.getElementById('sal-slider-label').innerHTML = Math.round(searchArcLengthSlider.value) + '°';
    }

    if (getItem('userFocalPhase')) {
        defaultValue = getItem('userFocalPhase');
    } else {
        defaultValue = 0;
    }
    focalPhaseSlider = document.getElementById('phase-slider');
    focalPhaseSlider.min = -90;
    focalPhaseSlider.max = 90;
    focalPhaseSlider.step = 0.001;
    focalPhaseSlider.value = defaultValue;
    document.getElementById('phase-slider-label').innerHTML = Math.round(focalPhaseSlider.value) + '°';
    focalPhaseSlider.oninput = () => {
        storeItem("userFocalPhase", focalPhaseSlider.value);
        document.getElementById('phase-slider-label').innerHTML = Math.round(focalPhaseSlider.value) + '°';
    }

    if (getItem('userSinStrength')) {
        defaultValue = getItem('userSinStrength');
    } else {
        defaultValue = 0;
    }
    sinStengthSlider = document.getElementById('sin-strength-slider');
    sinStengthSlider.min = 0;
    sinStengthSlider.max = 120;
    sinStengthSlider.step = 0.01;
    sinStengthSlider.value = defaultValue;
    document.getElementById('sin-strength-slider-label').innerHTML = Math.round(sinStengthSlider.value) + '°';
    sinStengthSlider.oninput = () => {
        storeItem("userSinStrength", sinStengthSlider.value);
        document.getElementById('sin-strength-slider-label').innerHTML = Math.round(sinStengthSlider.value) + '°';
    }

    if (getItem('userSinSpeed')) {
        defaultValue = getItem('userSinSpeed');
    } else {
        defaultValue = 0;
    }
    sinSpeedSlider = document.getElementById('sin-speed-slider');
    sinSpeedSlider.min = -0.5;
    sinSpeedSlider.max = 0.5;
    sinSpeedSlider.step = 0.001;
    sinSpeedSlider.value = defaultValue;
    document.getElementById('sin-speed-slider-label').innerHTML = sinSpeedSlider.value;
    sinSpeedSlider.oninput = () => {
        storeItem("userSinSpeed", sinSpeedSlider.value);
        document.getElementById('sin-speed-slider-label').innerHTML = Math.round(100 * sinSpeedSlider.value) / 100;
    }





    if (getItem('userNoiseStrength')) {
        defaultValue = getItem('userNoiseStrength');
    } else {
        defaultValue = 0;
    }
    noiseStrengthSlider = document.getElementById('noise-slider');
    noiseStrengthSlider.min = 0;
    noiseStrengthSlider.max = 1;
    noiseStrengthSlider.step = 0.001;
    noiseStrengthSlider.value = defaultValue;
    document.getElementById('noise-slider-label').innerHTML = noiseStrengthSlider.value;
    noiseStrengthSlider.oninput = () => {
        storeItem("userNoiseStrength", noiseStrengthSlider.value);
        document.getElementById('noise-slider-label').innerHTML = Math.round(100 * noiseStrengthSlider.value) / 100;
    }

    // read last render mode, or supply default
    debugger;
    if (getItem('userRenderMode') == undefined) {
        storeItem('userRenderMode', P2D)
    }
    let renderMode = getItem('userRenderMode');

    // update the display paragraph
    let renderModeDisplay = document.getElementById('render-mode-display');
    if (renderMode == SVG) {
        renderModeDisplay.innerHTML = "Render Mode: SVG"
    } else {
        renderModeDisplay.innerHTML = "Render Mode: PNG"
    }

    document.getElementById('render-mode-toggle').onclick = () => {
        debugger;
        if (renderMode == P2D) {
            storeItem('userRenderMode', SVG)
        } else {
            storeItem('userRenderMode', P2D)
        }
        location.reload()
    }

    // create the canvas for the sketch
    let dim = min(window.innerWidth, window.innerHeight);
    let sketchNode = document.getElementById('sketch-container');
    let c = createCanvas(dim, dim, renderMode);
    c.parent(sketchNode);
    noFill();
    strokeWeight(1);

    // begin generations :)
    initSampler();
}

function initSampler() {
    clear();
    background(14);
    sampler = new PoissonHash(createVector(width, height), radiusSlider.value, attemptSlider.value);
    loop()
}

function mouseClicked() {
    initSampler();
}

function keyPressed() {
    switch (key) {
        case 'r':
            initSampler();
            break;
        case 's':
            clear();
            stroke(0);
            let node = sampler.samples[0]
            beginShape();
            drawFromNode(node);
            node = sampler.samples[1]
            beginShape();
            drawFromNode(node);
            save();
            loop();
            break;
    }

}

function maxNodeDepth(node) {
    if (!node.hasChildren) {
        return 0;
    } else {
        let maxChildDepth = 0;
        for (let c of node.children) {
            let childDepth = maxNodeDepth(c);
            if (childDepth > maxChildDepth) {
                maxChildDepth = childDepth;
            }
        }
        return 1 + maxChildDepth;
    }
}

function drawFromNode(node) {
    curveVertex(node.pos.x, node.pos.y)
    if (node.hasChildren) {
        drawFromNode(node.children[0]);
        for (let i = 1; i < node.children.length; i++) {
            if (maxNodeDepth(node.children[i]) < 3) continue;

            if (node.parent != undefined) {
                if (node.parent.parent != undefined) {
                    beginShape()
                    curveVertex(node.parent.parent.pos.x, node.parent.parent.pos.y)
                    curveVertex(node.parent.pos.x, node.parent.pos.y)
                    curveVertex(node.pos.x, node.pos.y);
                    drawFromNode(node.children[i]);
                } else {
                    beginShape()
                    curveVertex(node.parent.pos.x, node.parent.pos.y)
                    curveVertex(node.pos.x, node.pos.y);
                    drawFromNode(node.children[i]);
                }
            } else {
                beginShape();
                curveVertex(node.pos.x, node.pos.y);
                drawFromNode(node.children[i]);
            }
        }
    } else {
        endShape();
    }
}

function drawFullCurves() {
    let terminalNodes = sampler.samples.filter(s => !s.hasChildren);
    for (let n of terminalNodes) {
        beginShape();
        let currNode = n;
        while (currNode != undefined) {
            curveVertex(currNode.pos.x, currNode.pos.y);
            currNode = currNode.parent;
        }
        endShape();
    }

}

function drawSegmentedCurves() {
    for (let n of sampler.samples) {
        if (n.parent != undefined &&
            n.parent.parent != undefined &&
            n.parent.parent.parent != undefined) {
            curve(n.pos.x, n.pos.y,
                n.parent.pos.x, n.parent.pos.y,
                n.parent.parent.pos.x, n.parent.parent.pos.y,
                n.parent.parent.parent.pos.x, n.parent.parent.parent.pos.y)
        }
    }
}

function draw() {
    if (!sampler.samplesFull) {
        sampler.growSamples();
    }
    else {
        noLoop();
    }

    clear();
    stroke(255)
    beginShape();
    drawFromNode(sampler.samples[0]);
    beginShape();
    drawFromNode(sampler.samples[1]);

}

class Node {
    constructor(pos, parent) {
        this.pos = pos;
        this.parent = parent;
        this.children = [];
        this.hasChildren = false;
        this.maxDepth = -1;
    }

    show() {
        if (this.parent != undefined) {
            line(this.parent.pos.x, this.parent.pos.y,
                this.pos.x, this.pos.y);
        }
    }
}

class PoissonHash {
    constructor(domainVec, sampleRadius, attemptCount) {
        this.domainVec = domainVec;
        this.sampleRadius = sampleRadius;
        this.attemptCount = attemptCount;
        this.cellSize = sampleRadius / Math.sqrt(2);
        this.hashCols = floor(domainVec.x / this.cellSize);
        this.hashRows = floor(domainVec.y / this.cellSize);
        this.hashArray = Array(this.hashCols * this.hashRows).fill(-1);
        this.samples = [];
        this.samplesFull = false;
        this.addSample(2 * sampleRadius + domainVec.x / 2, domainVec.y / 2);
        this.addSample(-2 * sampleRadius + domainVec.x / 2, domainVec.y / 2);

        console.log("constructed sampler");
    }

    index2coords(index) {
        let x = index % this.hashCols;
        let y = floor(index / this.hashCols);
        return createVector(x, y);
    }

    coords2index(row, col) {
        let index = row * this.hashCols + col;
        return index;
    }

    addSample(sampleX, sampleY, parent) {
        if (sampleX < 0 || sampleY < 0 ||
            sampleX > this.domainVec.x || sampleY > this.domainVec.y) return false;
        let centDist = Math.pow(
            Math.pow(abs(sampleX - (this.domainVec.x / 2)), 2) +
            Math.pow(abs(sampleY - (this.domainVec.y / 2)), 2), 0.5);
        if (centDist > this.domainVec.x/2) return false;

        let potentialSample =
            new Node(createVector(sampleX, sampleY, 1.8), parent);
        let sampleCol = floor(potentialSample.pos.x / this.cellSize);
        let sampleRow = floor(potentialSample.pos.y / this.cellSize);

        // test neighboring squares in the spatial hash
        for (let xOff = -1; xOff <= 1; xOff++) {
            for (let yOff = -1; yOff <= 1; yOff++) {
                let searchCol = sampleCol + xOff;
                let searchRow = sampleRow + yOff;
                if (searchCol < 0 || searchRow < 0 || searchCol > this.hashCols || searchRow > this.hashRows) continue;

                let hashResult = this.hashArray[this.coords2index(searchRow, searchCol)];
                if (hashResult > -1) {
                    let noiseDelta = 0.05;
                    let noiseVal = this.sampleRadius * 0.5 * noise(sampleCol * noiseDelta, sampleRow * noiseDelta) * parseFloat(noiseStrengthSlider.value);
                    let dist = this.samples[hashResult].pos.dist(potentialSample.pos);
                    if (dist + noiseVal < this.sampleRadius) return false;
                }
            }
        }

        // on success, add to the sample list and hashmap
        let hashIndex = this.coords2index(sampleRow, sampleCol);
        this.hashArray[hashIndex] = this.samples.length;
        this.samples.push(potentialSample);
        if (parent != undefined) {
            parent.hasChildren = true;
            parent.children.push(potentialSample);
        }
        return true;
    }

    sampleNeighbors(sample) {
        let sampleCol = floor(potentialSample.x / this.cellSize);
        let sampleRow = floor(potentialSample.y / this.cellSize);
        let neighbors = [];

        // pull samples from neighboring squares in the spatial hash
        for (let xOff = -1; xOff <= 1; xOff++) {
            for (let yOff = -1; yOff <= 1; yOff++) {
                let searchCol = sampleCol + xOff;
                let searchRow = sampleRow + yOff;
                if (searchCol < 0 ||
                    searchRow < 0 ||
                    searchCol > this.hashCols ||
                    searchRow > this.hashRows) continue;

                let hashResult = this.hashArray[this.coords2index(searchRow, searchCol)];
                if (hashResult > -1) {
                    neighbors.push(this.samples[hashResult]);
                }
            }
        }
    }

    growSamples() {
        if (this.samplesFull) return;

        // pull the active samples from the main list
        let currentSamples = this.samples.filter(s => s.pos.z >= 0);
        if (currentSamples.length == 0) {
            this.samplesFull = true;
            return;
        }

        for (let sample of currentSamples) {
            // boolean to track success
            let sampleAdded = false;
            // the angle between this sample and the center of the screen
            let screenTheta = createVector(sample.pos.x - (width / 2), sample.pos.y - (height / 2)).heading();
            let searchArcLength = radians(parseFloat(searchArcLengthSlider.value));
            let focalTheta = screenTheta +
                radians(parseFloat(focalPhaseSlider.value)) +
                (radians(parseFloat(sinStengthSlider.value)) * sin(frameCount * parseFloat(sinSpeedSlider.value)));

            // attempt to add new sample new the current one
            for (let i = 0; i < this.attemptCount; i++) {
                let theta = focalTheta + random(-0.5, 0.5) * searchArcLength;

                // and the radius
                let r = random(this.sampleRadius, 2 * this.sampleRadius)

                // test the new sample for validity
                let potentialX = sample.pos.x + cos(theta) * r;
                let potentialY = sample.pos.y + sin(theta) * r;
                if (this.addSample(potentialX, potentialY, sample)) {
                    // if it's accepted, record and break
                    sampleAdded = true;
                    break;
                } else {
                    // otherwise, increase chaos a bit
                    sample.pos.z *= 1.1;
                }
            }
            // flag the sample as inactive if no samples are placed after max attempts
            if (!sampleAdded) {
                sample.pos.z = -1;
            }
        }
    }
}

class Star {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.angle = random(TWO_PI);
        this.sharpness = random(0.2, 0.8);
        this.size = random(10, 20);
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        // rotate(this.angle);
        for (let i = 0; i < 4; i++) {
            beginShape()
            vertex(0, this.size);
            bezierVertex(0, this.size * this.sharpness,
                this.size * this.sharpness, 0,
                this.size, 0);
            endShape();
            rotate(PI / 2);
        }
        pop();
    }
}
