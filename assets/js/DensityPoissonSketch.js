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

// for handling multple samplers in cymk mode
var cmykMode = false;
var samplerBank = [];
var sampleBank = [];

// banding effect
var stopsInput;
var colorInput;
var addColorButton;
var removeColorButton;
var clearColorButton;
var bandingColors = [];
var bandingStops = [];


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
    console.log("canvas created")

    // size the density map to the canvas
    sizeToCanvas(userImage);

    // load DOM sliders into sketch memory
    initializeSliders();
    console.log("sliders initialized")

    // load palette controls into sketch memory
    initializeBandingControls();


    // load count label to sketch memory
    countLabel = document.getElementById('count-label');

    // setup file handling
    imageInputElement = createFileInput(uploadImageToDOM);
    imageInputElement.parent(document.getElementById('button-panel'))
    imageInputElement.elt.id = 'file-upload';

    // setup file saving
    document.getElementById('user-download-svg').onclick = () => {
        renderToSVG();
    };
    document.getElementById('user-download-png').onclick = () => {
        save();
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

function initializeBandingControls() {
    stopsInput = document.getElementById('stops-input')
    colorInput = document.getElementById('color-input');
    addColorButton = document.getElementById('add-color');
    removeColorButton = document.getElementById('remove-color')
    clearColorButton = document.getElementById('clear-color')

    addColorButton.onclick = () => {
        bandingColors.push(color(colorInput.value))
        handlePaletteChange(true);
    }

    removeColorButton.onclick = () => {
        if (bandingColors.length > 1) {
            bandingColors.pop();
            colorInput.value = bandingColors[bandingColors.length - 1].toString('#rrggbb');
        } else {
            bandingColors = [];
            colorInput.value = '#000000';
        }
        handlePaletteChange(true);
    }

    clearColorButton.onclick = () => {
        bandingColors = [color(0)];
        colorInput.value = '#000000';
        handlePaletteChange(true);
    }

    bandingColors = [color(0)];
    colorInput.value = '#000000';
    handlePaletteChange();
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
    switch (drawModeInput.options[drawModeInput.selectedIndex].value) {
        case 'luminance':
            if (!activeSampler.samplesFull) {
                let newSamples = activeSampler.growSamples();
                if (newSamples) {
                    // draw new samples 
                    for (let s of newSamples) {
                        stroke(channelValtoColor(s.channelVal))
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

// function renderToFile(fileType) {
//     let renderer = fileType === 'SVG' ? SVG : P2D;
//     let graphics = createGraphics(userImage.width, userImage.height, renderer);
//     graphics.noFill()
//     for (let sample of activeSampler.samples) {
//         graphics.circle(sample.pos.x, sample.pos.y, userSliders.radius.value / 2);
//     }
//     graphics.save();
// }


// custom svg construction for lightweight files with thousands of elements
function renderToSVG() {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">\n`;

    for (let sample of activeSampler.samples) {
        let col = ``;
        if (bandingColors.length) {
            col = `stroke="${channelValtoColor(sample.channelVal).toString()}"`
        }
        svgContent += `  <circle ${col} cx="${Math.round(sample.pos.x * 10000) / 10000}" cy="${Math.round(sample.pos.y * 10000) / 10000}" r="${userSliders.radius.value / 2}" />\n`;
    }
    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    let now = new Date();
    link.download = "stipple_render_" + now.toLocaleTimeString().slice(0, -3) + ".svg"; // Filename for the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the object URL
    URL.revokeObjectURL(url);
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

// given an image file, creates a DOM img element containing the image
// invokes domToP5Image() on success
function uploadImageToDOM(file) {
    if (file.type !== 'image') {
        alert('unsupported file type');
        return;
    }

    if (file.name.split('.').pop().toLowerCase() == 'heic') {
        // Convert the HEIC file to a Blob
        const blob = new Blob([file.file], { type: file.file.type });
        // Use heic2any to convert HEIC to PNG
        heic2any({
            blob: blob,
            toType: "image/png",
        }).then((convertedBlob) => {
            // Create an image DOM element to hold the converted image
            bufferImage = createImg(URL.createObjectURL(convertedBlob), '', 'anonymous', domToP5Image);
            bufferImage.hide(); // Hide the image element (we only need its src for the canvas)
        }).catch((err) => {
            console.error("HEIC conversion failed: ", err);
        });
    } else {
        bufferImage = createImg(
            file.data, 'Alt text', 'anonymous', domToP5Image);
        bufferImage.hide();
    }
}

// converts the image stored in the global bufferImage DOM element
// to p5.Image, then saves it in the global userImage variable
function domToP5Image() {
    // draw the image to a temporary p5.Graphics element, copy into p5.Image, then remove
    let g = createGraphics(bufferImage.elt.width, bufferImage.elt.height);
    g.image(bufferImage, 0, 0);
    userImage = g.get(0, 0, g.width, g.height)

    // clean up
    bufferImage.remove();
    g.remove();

    // with the image loaded, initialize sampler
    initializeSampler();
}

// receives a float value and returns a color from the user supplied bands
function channelValtoColor(val) {
    if (!bandingColors.length) return color(0);

    for (let i = 0; i < bandingStops.length - 1; i++) {
        if (val >= bandingStops[i] && val < bandingStops[i + 1]) {
            return bandingColors[i]
        }
    }
    // use last stop
    return bandingColors[bandingColors.length - 1];
}

function handlePaletteChange(retrigger = false) {
    let label = document.getElementById("banding-color-label")
    let string = `Palette:<br>`;
    for (let col of bandingColors) {
        string += `<span style="color: ${col.toString()}; font-size: 1.5em;">█ </span>`
    }
    label.innerHTML = string;

    // also recalculate the stops for display
    bandingStops = [];
    for (let i = 0; i < bandingColors.length; i++) {
        // evenly spaced value from 0 to 1
        let t = i / bandingColors.length;
        // apply exponent
        bandingStops.push(Math.pow(t, parseFloat(userSliders.contrast.value)));
    }

    // optionally redraw the render
    if (retrigger) {
        initializeSampler();
    }
}