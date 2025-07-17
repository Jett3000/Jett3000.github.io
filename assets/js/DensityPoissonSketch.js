// Density Modulated Poisson Disc Sample Image Rendering Sketch
// Jett Pavlica 2025
var userImage;
var bufferImage;
var userSliders = {
    radius: null,
    attempts: null,
    contrast: null,
    lightness: null,
}
var activeSampler;
var countLabel;
var imageInputElement;
var drawModeInput;
var canvasContainer;

// for cymk stuff
var cmykMode = false;
var samplerBank = [];
var sampleBank = [];

function preload() {
    loadImage('/assets/img/default.png', (img) => {
        userImage = img;
    }, (e) => {
        console.log(e);
    });
}

function setup() {
    // create a 2D canvas
    canvasContainer = document.getElementById('canvas-container');
    let canvas = createCanvas(canvasContainer.clientWidth, canvasContainer.clientHeight);
    canvas.parent(canvasContainer)
    noFill();
    strokeWeight(1.7);
    // blendMode(ADD)
    console.log("canvas created")

    // size the density map to the canvas
    sizeToCanvas(userImage);

    // load DOM sliders into sketch memory
    initializeSliders();
    console.log("sliders initialized")

    // load count label to sketch memory
    countLabel = document.getElementById('count-label');

    // setup file handling
    imageInputElement = createFileInput(handleImage);
    imageInputElement.parent(document.getElementById('button-panel'))
    imageInputElement.elt.id = 'file-upload';

    // setup file saving
    document.getElementById('user-download').onclick = () => {
        renderToSVG();
    };

    // load drawMode selection & handle swapping
    drawModeInput = document.getElementById('draw-mode-dropdown');
    drawModeInput.onchange = () => {
        initializeSampler();
    };

    // set callback for regenerate button
    document.getElementById('user-regenerate').onclick = () => {
        initializeSampler();
    };
    // begin generations :)
    console.log("initializing sampler...");
    initializeSampler();
}

function initializeSliders() {
    // cache dom objects to sketch variables
    userSliders.radius = document.getElementById('radius-slider')
    userSliders.attempts = document.getElementById('attempts-slider')
    userSliders.contrast = document.getElementById('contrast-slider')
    userSliders.lightness = document.getElementById('lightness-slider')

    // try to restore user's last settings, or set to default values
    let userData = getItem('userData');
    if (userData) {
        userSliders.radius.value = userData.radius;
        userSliders.attempts.value = userData.attempts;
        userSliders.contrast.value = userData.contrast;
        userSliders.lightness.value = userData.lightness;
    } else {
        userSliders.radius.value = 2;
        userSliders.attempts.value = 12;
        userSliders.contrast.value = 1;
        userSliders.lightness.value = 6;
    }

    // set event handling
    userSliders.radius.addEventListener('mouseup', () => {
        initializeSampler()
    })
    userSliders.attempts.addEventListener('mouseup', () => {
        initializeSampler()
    })
    userSliders.contrast.addEventListener('mouseup', () => {
        initializeSampler()
    })
    userSliders.lightness.addEventListener('mouseup', () => {
        initializeSampler()
    })
}

function initializeSampler() {
    if (userImage.height > height ||
        userImage.width > width ||
        (userImage.height < height && userImage.width < width)
    ) sizeToCanvas(userImage);

    let x = userImage.width / 2;
    let y = userImage.height / 2;

    clear();
    let drawMode = drawModeInput.options[drawModeInput.selectedIndex].value;
    switch (drawModeInput.options[drawModeInput.selectedIndex].value) {
        case 'luminance':
            activeSampler = new DensityPoissonSampler(
                userImage,
                parseFloat(userSliders.radius.value),
                parseFloat(userSliders.attempts.value),
                parseFloat(userSliders.contrast.value),
                parseFloat(userSliders.lightness.value),
                'l',
                x,
                y
            );
            loop();
            break
        case 'cmyk':
            let channels = ['c', 'm', 'y', 'l'];
            samplerBank = [];

            for (let channel of channels) {
                let channelSampler = new DensityPoissonSampler(
                    userImage,
                    parseFloat(userSliders.radius.value),
                    parseFloat(userSliders.attempts.value),
                    parseFloat(userSliders.contrast.value),
                    parseFloat(userSliders.lightness.value),
                    channel,
                    x,
                    y
                );
                samplerBank.push(channelSampler);
            }
            loop();
            break
    }
}

function draw() {
    // let drawMode = drawModeInput.options[drawModeInput.selectedIndex].value;

    switch (drawModeInput.options[drawModeInput.selectedIndex].value) {
        case 'luminance':
            if (!activeSampler.samplesFull) {
                let newSamples = activeSampler.growSamples();
                if (newSamples) {
                    // draw new samples 
                    stroke(0);
                    for (let s of newSamples) {
                        circle(s.pos.x, s.pos.y, userSliders.radius.value)
                    }
                    // update circle count lable
                    countLabel.innerHTML = `Circles:<br> ${activeSampler.samples.length.toLocaleString()}`;
                }
            } else {
                noLoop();
            }
            break;
        case 'cmyk':
            let stillSampling = false;
            let totalSamples = 0;
            for (const [i, activeSampler] of samplerBank.entries()) {
                totalSamples += activeSampler.samples.length;
                if (activeSampler.samplesFull) { continue; } else {
                    stillSampling = true;
                }

                let newSamples = activeSampler.growSamples();
                if (newSamples) {
                    // set cmyk stroke color
                    switch (i) {
                        case 0:
                            stroke(0, 255, 255, 80);
                            break
                        case 1:
                            stroke(255, 0, 255, 80);
                            break
                        case 2:
                            stroke(255, 255, 0, 80);
                            break
                        case 3:
                            stroke(0, 0, 0, 255);
                            break
                    }
                    // draw samples
                    for (let s of newSamples) {
                        circle(s.pos.x, s.pos.y, userSliders.radius.value)
                    }
                }
                // update circle count label
                countLabel.innerHTML = `Circles:<br> ${totalSamples.toLocaleString()}`;
                // if (totalSamples > 100000) noLoop();
            }
            if (!stillSampling) noLoop();

            // redraw samples in cmyk order
            clear()
            push();
            blendMode(HARD_LIGHT)
            stroke(0, 255, 255, 80);
            samplerBank[0].samples.forEach((s) => {
                circle(s.pos.x, s.pos.y, userSliders.radius.value)
            });
            stroke(255, 0, 255, 80);
            samplerBank[1].samples.forEach((s) => {
                circle(s.pos.x, s.pos.y, userSliders.radius.value)
            });
            stroke(255, 255, 0, 80);
            samplerBank[2].samples.forEach((s) => {
                circle(s.pos.x, s.pos.y, userSliders.radius.value)
            });
            stroke(0, 0, 0, 80);
            samplerBank[3].samples.forEach((s) => {
                circle(s.pos.x, s.pos.y, userSliders.radius.value)
            });
            break
    }
}

// user interaction
function mouseClicked() {
    saveUserData();

    if (mouseX > 0 && mouseY > 0 && mouseX < width && mouseY < height) {
        if (drawModeInput.options[drawModeInput.selectedIndex].value === 'luminance') {
            activeSampler.evaluateSample(mouseX, mouseY);
            activeSampler.samplesFull = false;
        } else {
            for (let sampler of samplerBank) {
                sampler.evaluateSample(mouseX, mouseY);
                sampler.samplesFull = false;
            }
        }
        loop();
    }
}

function saveUserData() {
    let userData = {
        radius: userSliders.radius.value,
        attempts: userSliders.attempts.value,
        contrast: userSliders.contrast.value,
        lightness: userSliders.lightness.value,
    };
    storeItem('userData', userData);
}

function renderToSVG() {
    let graphics = createGraphics(userImage.width, userImage.height, SVG);
    for (let sample of activeSampler.samples) {
        graphics.circle(sample.pos.x, sample.pos.y, userSliders.radius.value / 2);
    }
    graphics.save();
}


// image helpers
function sizeToCanvas(image) {
    let factor = canvasContainer.clientWidth / image.width;
    if (image.height * factor > windowHeight) {
        image.resize(0, windowHeight);
    } else {
        image.resize(canvasContainer.clientWidth, 0);
    }
    console.log(`image resized to ${userImage.width} x ${userImage.height}`)

    resizeCanvas(image.width, image.height)
}

function handleImage(file) {
    imgLoaded = false;
    if (file.type === 'image') {
        bufferImage = createImg(
            file.data, 'Alt text', 'anonymous', imgCreated);
        bufferImage.hide();
    } else {
        bufferImage = null;
    }
}

// Once the img element is created, use it to 
// convert the image element into a p5Image object. 
function imgCreated() {
    bufferImage.hide();
    // Create a temporary p5.Graphics object to draw the image.
    let g = createGraphics(bufferImage.elt.width, bufferImage.elt.height);
    g.image(bufferImage, 0, 0);
    // Remove the original element from the DOM.
    bufferImage.remove();
    // g.get will return image data as a p5.Image object
    bufferImage = g.get(0, 0, g.width, g.height)

    // Record that we have finished creating the image object.
    imgLoaded = true;
    userImage = bufferImage;
    initializeSampler();
}