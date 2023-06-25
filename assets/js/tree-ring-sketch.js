var sampler;
var userSettings = {
    radius: 12,
    attempts: 30,
    searchWidth: 45,
    searchHeading: 60,
    wiggleWidth: 0,
    wiggleSpeed: 0,
    noiseStrength: 0,
    rainbowMode: 1,
    renderMode: null
}
var record = false;

function setup() {
    // setup control sliders
    if (getItem('userSettings')) {
        userSettings = getItem('userSettings');
    } else {
        userSettings.renderMode = P2D // default definition workaround
    }

    function initSlider(domSlider,
        min, max, step, defaultValue,
        settingID, labelID,
        degreeSymbol = false, precisionRound = false) {
        domSlider.min = min;
        domSlider.max = max;
        domSlider.step = step;
        domSlider.value = defaultValue;
        if (!degreeSymbol && !precisionRound) {
            document.getElementById(labelID).innerHTML = Math.round(domSlider.value);
            domSlider.oninput = () => {
                userSettings[settingID] = parseFloat(domSlider.value);
                storeItem('userSettings', userSettings);
                document.getElementById(labelID).innerHTML = Math.round(domSlider.value);
            }
        } else if (degreeSymbol) {
            document.getElementById(labelID).innerHTML = Math.round(domSlider.value) + '°';
            domSlider.oninput = () => {
                userSettings[settingID] = parseFloat(domSlider.value);
                storeItem('userSettings', userSettings);
                document.getElementById(labelID).innerHTML = Math.round(domSlider.value) + '°';
            }
        } else {
            document.getElementById(labelID).innerHTML = Math.round(domSlider.value * 100) / 100;
            domSlider.oninput = () => {
                userSettings[settingID] = parseFloat(domSlider.value);
                storeItem('userSettings', userSettings);
                document.getElementById(labelID).innerHTML = Math.round(domSlider.value * 100) / 100;
            }
        }
    }

    // radius
    initSlider(document.getElementById('radius-slider'), 2, 40, 1, userSettings.radius,
        'radius', 'radius-slider-label');
    // attempts
    initSlider(document.getElementById('attempts-slider'), 2, 40, 1, userSettings.attempts,
        'attempts', 'attempts-slider-label');
    // search width
    initSlider(document.getElementById('sal-slider'), 0, 360, 0.01, userSettings.searchWidth,
        'searchWidth', 'sal-slider-label', true);
    // search heading
    initSlider(document.getElementById('phase-slider'), -90, 90, 0.01, userSettings.searchHeading,
        'searchHeading', 'phase-slider-label', true);

    // wiggle width
    initSlider(document.getElementById('sin-strength-slider'), 0, 120, 0.01, userSettings.wiggleWidth,
        'wiggleWidth', 'sin-strength-slider-label', true);

    // wiggle speed
    initSlider(document.getElementById('sin-speed-slider'), -0.5, 0.5, 0.01, userSettings.wiggleSpeed,
        'wiggleSpeed', 'sin-speed-slider-label', false, true);

    // noise strength
    initSlider(document.getElementById('noise-slider'), 0, 1, 0.001, userSettings.noiseStrength,
        'noiseStrength', 'noise-slider-label', false, true);

    // rainbow mode
    initSlider(document.getElementById('rainbow-slider'), 0, 1, 1, userSettings.rainbowMode,
        'rainbowMode', 'rainbow-slider-label');


    // update the render mode label
    let renderModeDisplay = document.getElementById('render-mode-display');
    if (userSettings.renderMode == SVG) {
        renderModeDisplay.innerHTML = "Render Mode: SVG"
    } else {
        renderModeDisplay.innerHTML = "Render Mode: PNG"
    }

    // set render toggle onclick function
    document.getElementById('render-mode-toggle').onclick = () => {
        debugger;
        if (userSettings.renderMode == P2D) {
            userSettings.renderMode = SVG;
        } else {
            userSettings.renderMode = P2D;
        }
        storeItem('userSettings', userSettings);
        location.reload()
    }

    // create the canvas for the sketch
    let dim = min(window.innerWidth, window.innerHeight);
    let sketchNode = document.getElementById('sketch-container');
    let c = createCanvas(dim, dim, userSettings.renderMode);
    c.parent(sketchNode);
    noFill();
    strokeWeight(1);
    if (userSettings.renderMode == P2D && userSettings.rainbowMode > 0) {
        colorMode(HSB);
    }

    // begin generations :)
    initSampler();
}


function initSampler() {
    clear();
    sampler = new PoissonHash(createVector(width, height),
        parseFloat(userSettings.radius),
        parseInt(userSettings.attempts));
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
            record = true;
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
        sampler.growSamples()
    }
    else {
        if (sampler.samples.length < 100) {
            initSampler();
        } else {
            noLoop();
        }
    }


    clear();
    if (userSettings.rainbowMode > 0 && userSettings.renderMode == P2D) {
        colorMode(HSB)
        let maxParents = 0;
        for (let s of sampler.samples) {//.filter(x => !x.hasChildren)) {
            maxParents = max(maxParents, s.numParents);
        }
        for (let s of sampler.samples) {
            stroke(360 * Math.pow(s.numParents / maxParents, 0.9) % 360, 70, 90);
            if (s.parent != undefined) {
                line(s.pos.x, s.pos.y, s.parent.pos.x, s.parent.pos.y);
            }
        }
    } else {
        if (record) {
            stroke(0)
        } else {
            stroke(255);
        }
        for (let s of sampler.samples) {
            if (s.parent != undefined) {
                line(s.pos.x, s.pos.y, s.parent.pos.x, s.parent.pos.y);
            }
        }
    }


    if (record) {
        save();
        record = false;
        loop();
    }

}

class Node {
    constructor(pos, parent) {
        this.pos = pos;
        this.parent = parent;
        this.children = [];
        this.hasChildren = false;
        this.active = true;
        this.drawn = false;
        this.numParents = 0;
        if (parent != undefined) {
            this.numParents = parent.numParents + 1;
        }
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

        // initial samples
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
        // reject samples outside of the domain
        if (sampleX < 0 || sampleY < 0 ||
            sampleX > this.domainVec.x || sampleY > this.domainVec.y) return false;
        // or a circular subset of the domain
        let centDist = Math.sqrt(
            Math.pow(abs(sampleX - (this.domainVec.x / 2)), 2) +
            Math.pow(abs(sampleY - (this.domainVec.y / 2)), 2));
        if (centDist > this.domainVec.x * 0.5) return false;

        // test neighboring squares in the spatial hash
        let sampleCol = floor(sampleX / this.cellSize);
        let sampleRow = floor(sampleY / this.cellSize);
        let noiseDelta = 0.05;
        let noiseVal = this.sampleRadius * 0.5 *
            noise(sampleCol * noiseDelta, sampleRow * noiseDelta) * userSettings.noiseStrength;
        for (let xOff = -1; xOff <= 1; xOff++) {
            for (let yOff = -1; yOff <= 1; yOff++) {
                let searchCol = sampleCol + xOff;
                let searchRow = sampleRow + yOff;
                if (searchCol < 0 || searchRow < 0 ||
                    searchCol > this.hashCols || searchRow > this.hashRows) continue;

                let collidingSampleIndex = this.hashArray[this.coords2index(searchRow, searchCol)];
                if (collidingSampleIndex > -1) {
                    let distance = Math.sqrt(
                        Math.pow(sampleX - this.samples[collidingSampleIndex].pos.x, 2) +
                        Math.pow(sampleY - this.samples[collidingSampleIndex].pos.y, 2) + 1);
                    if (distance + noiseVal < this.sampleRadius) return false;
                }
            }
        }

        // on success, add to the sample list and hashmap
        this.hashArray[this.coords2index(sampleRow, sampleCol)] = this.samples.length;
        let newSample = new Node(createVector(sampleX, sampleY), parent);
        this.samples.push(newSample);
        if (parent != undefined) {
            parent.hasChildren = true;
            parent.children.push(newSample);
        }
        return true;
    }

    growSamples() {
        if (this.samplesFull) return;

        // pull the active samples from the main list
        let currentSamples = this.samples.filter(s => s.active);
        if (currentSamples.length == 0) {
            this.samplesFull = true;
            return;
        }

        for (let sample of currentSamples) {
            // boolean to track success
            let sampleAdded = false;
            // the angle between this sample and the center of the screen
            let screenTheta = createVector(sample.pos.x - (width / 2), sample.pos.y - (height / 2)).heading();
            let searchArcLength = radians(userSettings.searchWidth);
            let focalTheta = screenTheta +
                radians(userSettings.searchHeading) +
                (radians(userSettings.wiggleWidth) * sin(frameCount * userSettings.wiggleSpeed));

            // attempt to add new sample from the current one
            for (let i = 0; i < this.attemptCount; i++) {
                let theta = focalTheta + random(-0.5, 0.5) * searchArcLength;
                let r = random(this.sampleRadius, 2 * this.sampleRadius)

                // test the new sample for validity
                let potentialX = sample.pos.x + cos(theta) * r;
                let potentialY = sample.pos.y + sin(theta) * r;
                if (this.addSample(potentialX, potentialY, sample)) {
                    // if it's accepted, record and break
                    sampleAdded = true;
                    break;
                }
            }
            // flag the sample as inactive if no samples are placed after max attempts
            if (!sampleAdded) {
                sample.active = false;
            }
        }
    }
}
