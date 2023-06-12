var sampler;

var radiusSlider;
var attemptSlider;
var noiseStrengthSlider;
var sinSpeedSlider;
var focalPhaseSlider;
var searchArcLengthSlider;
var sinStengthSlider;


function setup() {
    let dim = min(window.innerWidth, window.innerHeight);
    let sketchNode = document.getElementById('sketch-container');
    let c = createCanvas(dim, dim);
    c.parent(sketchNode);
    noFill();
    strokeWeight(1);

    // setup control sliders
    let defaultValue;
    if (getItem('userRadius')) {
        defaultValue = getItem('userRadius');
    } else {
        defaultValue = 12;
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
        defaultValue = 4;
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
        defaultValue = HALF_PI;
    }
    searchArcLengthSlider = document.getElementById('sal-slider');
    searchArcLengthSlider.min = 0;
    searchArcLengthSlider.max = PI;
    searchArcLengthSlider.step = 0.001;
    searchArcLengthSlider.value = defaultValue;
    document.getElementById('sal-slider-label').innerHTML = searchArcLengthSlider.value;
    searchArcLengthSlider.oninput = () => {
        storeItem("userSAL", searchArcLengthSlider.value);
        document.getElementById('sal-slider-label').innerHTML = Math.round(100 * searchArcLengthSlider.value) / 100;
    }

     if (getItem('userSinStrength')) {
        defaultValue = getItem('userSinStrength');
    } else {
        defaultValue = 1;
    }
    sinStengthSlider = document.getElementById('sin-strength-slider');
    sinStengthSlider.min = 0;
    sinStengthSlider.max = 120;
    sinStengthSlider.step = 0.01;
    sinStengthSlider.value = defaultValue;
    document.getElementById('sin-strength-slider-label').innerHTML = Math.round(sinStengthSlider.value);
    sinStengthSlider.oninput = () => {
        storeItem("userSinStrength", sinStengthSlider.value);
        document.getElementById('sin-strength-slider-label').innerHTML = Math.round(sinStengthSlider.value);
    }

    if (getItem('userSinSpeed')) {
        defaultValue = getItem('userSinSpeed');
    } else {
        defaultValue = 1;
    }
    sinSpeedSlider = document.getElementById('sin-speed-slider');
    sinSpeedSlider.min = 0;
    sinSpeedSlider.max = 1.5;
    sinSpeedSlider.step = 0.001;
    sinSpeedSlider.value = defaultValue;
    document.getElementById('sin-speed-slider-label').innerHTML = sinSpeedSlider.value;
    sinSpeedSlider.oninput = () => {
        storeItem("userSinSpeed", sinSpeedSlider.value);
        document.getElementById('sin-speed-slider-label').innerHTML = Math.round(100 * sinSpeedSlider.value) / 100;
    }


    if (getItem('userFocalPhase')) {
        defaultValue = getItem('userFocalPhase');
    } else {
        defaultValue = 0;
    }
    focalPhaseSlider = document.getElementById('phase-slider');
    focalPhaseSlider.min = -HALF_PI;
    focalPhaseSlider.max = HALF_PI;
    focalPhaseSlider.step = 0.001;
    focalPhaseSlider.value = defaultValue;
    document.getElementById('phase-slider-label').innerHTML = Math.round(focalPhaseSlider.value);
    focalPhaseSlider.oninput = () => {
        storeItem("userFocalPhase", focalPhaseSlider.value);
        document.getElementById('phase-slider-label').innerHTML = Math.round(100 * focalPhaseSlider.value) / 100;
    }


    if (getItem('userNoiseStrength')) {
        defaultValue = getItem('userNoiseStrength');
    } else {
        defaultValue = 1;
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
            drawSegmentedCurves();
            save();
            loop();
            break;
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
        beginShape();
        let counter = 0;
        let currNode = n;
        while (currNode != undefined && counter < 4) {
            curveVertex(currNode.pos.x, currNode.pos.y);
            currNode = currNode.parent;
            counter++;
        }
        endShape();
    }

}

function draw() {
    clear();
    if (!sampler.samplesFull) {
        sampler.growSamples();

        for (let s of sampler.samples) {
            if (s.pos.z < 0) {
                stroke('#fcfaee');
            } else {
                stroke('#bc9eca');
            }
            s.show();
            // ellipse(s.pos.x, s.pos.y, 2, 2)
        }
    } else {
        drawSegmentedCurves();
        noLoop();
    }
}

class Node {
    constructor(pos, parent) {
        this.pos = pos;
        this.parent = parent;
        this.hasChildren = false;
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
        this.addSample(2*sampleRadius + domainVec.x / 2, domainVec.y / 2);
        this.addSample(-2*sampleRadius + domainVec.x / 2, domainVec.y / 2);

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
                    let noiseVal = .99 + noise(sampleCol * noiseDelta, sampleRow * noiseDelta) * parseFloat(noiseStrengthSlider.value);
                    let dist = this.samples[hashResult].pos.dist(potentialSample.pos);
                    if (dist * noiseVal < this.sampleRadius) return false;
                }
            }
        }

        // on success, add to the sample list and hashmap
        let hashIndex = this.coords2index(sampleRow, sampleCol);
        this.hashArray[hashIndex] = this.samples.length;
        this.samples.push(potentialSample);
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
            let searchArcLength = parseFloat(searchArcLengthSlider.value);
            let focalTheta = screenTheta +
                parseFloat(focalPhaseSlider.value) +
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
                    sample.hasChildren = true;
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
