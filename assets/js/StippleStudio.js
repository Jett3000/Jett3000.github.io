// Stipple Studio by Jett Pavlica
// A Luminance Modulated Variable Density Poisson Disc Sampling Engine
// Designed to render bitmap images as stippled vectors.
// Rewritten 2026


const STORAGE_KEY = "stippleStudioSettings";
const app = {
    ui: {
        sliders: {
            radius: null,
            attempts: null,
            shadows: null,
            highlights: null,
        },
        textInputs: {
            radius: null,
            attempts: null,
            shadows: null,
            highlights: null,
        },
        pageInputs: {
            width: null,
            height: null,
            penWidth: null,
        },
        buttons: {
            uploadImage: null,
            regenerate: null,
            exportPNG: null,
            exportSVG: null,
        },
        sampleCounter: null,
        canvasContainer: null,
    },
    state: {
        samplerParameters: {
            radius: null,
            attempts: null,
            shadows: null,
            highlights: null,
        },
        page: {
            widthMM: null,
            heightMM: null,
            penWidthMM: null,
        },
        palette: null,
        activeSampler: null,
    },
    render: {
        pixelsPerMM: null,
        strokeWidth: null,
        circleRadius: null,
    },
    images: {
        userImage: null,
        samplerImage: null,
        bufferImage: null,
    },

}

function preload() {
    loadImage('/assets/img/default.png', (img) => {
        app.images.userImage = img;
    }, (e) => {
        console.log(e);
    });
}

function setup() {
    initUI();

    loadSettings();
    applySettingsToUI();

    app.state.palette = new UserGradient("gradient-editor");
    app.state.palette.onChange(recolor)

    initPage();
    initSamplerParameters();
    // initPalette();

    initCanvas();

    bindUIEvents();

    initializeSampler();
}

function draw() {
    const sampler = app.state.activeSampler;

    if (!sampler) return;
    if (sampler.samplesFull) {
        noLoop()
        return;
    }


    const newSamples = sampler.growSamples();
    if (newSamples) {
        push()
        translate(app.render.imageOffsetX, app.render.imageOffsetY)
        strokeWeight(app.render.strokeWidth);
        for (const s of newSamples) {
            stroke(channelValToColor(s.channelVal));
            circle(
                s.pos.x,
                s.pos.y,
                app.render.strokeWidth
            );
        }
        pop();
        app.ui.sampleCounter.innerHTML =
            `Samples:<br> ${sampler.samples.length.toLocaleString()}`;
    }
}

function mouseClicked() {
    debugger
    app.state.activeSampler.evaluateSample(mouseX - app.render.imageOffsetX, mouseY - app.render.imageOffsetY)
    app.state.activeSampler.samplesFull = false;
    loop()
}

function recolor() {
    const sampler = app.state.activeSampler;
    if (!sampler) return;

    clear();
    background(255);
    push();
    translate(app.render.imageOffsetX, app.render.imageOffsetY)

    strokeWeight(app.render.strokeWidth);

    for (const s of sampler.samples) {
        stroke(channelValToColor(s.channelVal));
        circle(
            s.pos.x,
            s.pos.y,
            app.render.strokeWidth
        );
    }
    pop()
}

function saveSettings() {
    const settings = {
        samplerParameters: app.state.samplerParameters,
        page: app.state.page,
        palette: app.state.palette
    };
    storeItem(STORAGE_KEY, settings);
}

function loadSettings() {
    const saved = getItem(STORAGE_KEY);
    if (saved) {
        Object.assign(app.state.samplerParameters, saved.samplerParameters);
        Object.assign(app.state.page, saved.page);
        return;
    }

    // load defaults
    app.state = {
        samplerParameters: {
            radius: 1,
            attempts: 30,
            shadows: 1,
            highlights: 4,
        },
        page: {
            widthMM: 279.4, // 11in
            heightMM: 355.6, // 14in
            penWidthMM: .5,
        },
    }
}

function applySettingsToUI() {

    const sliders = app.ui.sliders;
    const inputs = app.ui.textInputs;
    const params = app.state.samplerParameters;
    const page = app.state.page;

    // sampler parameters
    for (const key in sliders) {
        sliders[key].value = params[key];
        inputs[key].value = params[key];
    }

    // page settings
    function mmToIn(mm) {
        return mm / 25.4;
    }
    app.ui.pageInputs.width.value = 1 * mmToIn(page.widthMM).toFixed(2) + "in";
    app.ui.pageInputs.height.value = 1 * mmToIn(page.heightMM).toFixed(2) + "in";
    app.ui.pageInputs.penWidth.value = 1 * page.penWidthMM.toFixed(2) + "mm";
}

function initUI() {
    const ui = app.ui;

    ui.canvasContainer = document.getElementById("canvas-container");
    ui.sampleCounter = document.getElementById("count-label");

    // sliders
    ui.sliders.radius = document.getElementById("radius-slider");
    ui.sliders.attempts = document.getElementById("attempts-slider");
    ui.sliders.shadows = document.getElementById("shadows-slider");
    ui.sliders.highlights = document.getElementById("highlights-slider");

    // sampler parameter inputs
    ui.textInputs.radius = document.getElementById("radius-input");
    ui.textInputs.attempts = document.getElementById("attempts-input");
    ui.textInputs.shadows = document.getElementById("shadows-input");
    ui.textInputs.highlights = document.getElementById("highlights-input");

    // page inputs
    ui.pageInputs.width = document.getElementById("page-width");
    ui.pageInputs.height = document.getElementById("page-height");
    ui.pageInputs.penWidth = document.getElementById("pen-width");

    // buttons
    ui.buttons.regenerate = document.getElementById("user-regenerate");
    ui.buttons.exportPNG = document.getElementById("user-download-png");
    ui.buttons.exportSVG = document.getElementById("user-download-svg");
    // speical case file upload to use p5.js's version
    let imageInputElement = createFileInput(uploadImageToDOM);
    imageInputElement.parent(document.getElementById('upload-section'))
    imageInputElement.elt.id = 'file-upload';
}
function bindUIEvents() {
    const ui = app.ui;

    ui.buttons.regenerate.onclick = initializeSampler;

    ui.buttons.exportPNG.onclick = () => {
        save();
    };

    ui.buttons.exportSVG.onclick = () => {
        renderToSVG();
    };

    // page inputs
    ui.pageInputs.width.oninput = () => {
        initPage();
        initCanvas();
        initializeSampler();
    };

    ui.pageInputs.height.oninput = () => {
        initPage();
        initCanvas();
        initializeSampler();
    };

    ui.pageInputs.penWidth.oninput = () => {
        initPage();
        initCanvas();
        initializeSampler();
    };

    bindSamplerParameter("radius");
    bindSamplerParameter("attempts");
    bindSamplerParameter("shadows");
    bindSamplerParameter("highlights");

    function bindSamplerParameter(name) {
        const slider = app.ui.sliders[name];
        const input = app.ui.textInputs[name];
        const params = app.state.samplerParameters;

        function update(value) {
            params[name] = parseFloat(value);
            input.value = 1 * params[name].toFixed(2);
            slider.value = value;
            initializeSampler();
        }

        slider.addEventListener("input", () => {
            update(slider.value);
        });
        input.addEventListener("input", () => {
            update(input.value);
        });

        update(params[name]);
    }
}

function initPage(reset = false) {
    const ui = app.ui.pageInputs;
    const page = app.state.page;

    page.widthMM = min(parseToMM(ui.width.value, ui.width.id), 1625.6);
    page.heightMM = min(parseToMM(ui.height.value, ui.height.id), 1625.6);
    page.penWidthMM = parseToMM(ui.penWidth.value, ui.penWidth.id);
}

function initSamplerParameters() {
    const sliders = app.ui.sliders;
    const params = app.state.samplerParameters;

    params.radius = parseFloat(sliders.radius.value);
    params.attempts = parseInt(sliders.attempts.value);
    params.shadows = parseFloat(sliders.shadows.value);
    params.highlights = parseFloat(sliders.highlights.value);
}

function initCanvas() {

    const container = app.ui.canvasContainer;
    const page = app.state.page;
    const src = app.images.userImage;

    if (!src) return;

    const containerW = container.clientWidth * 0.98;
    const containerH = container.clientHeight * 0.98 || window.innerHeight * 0.8;

    // compute how many pixels represent 1mm so the page fits the viewport
    const pxPerMM_X = containerW / page.widthMM;
    const pxPerMM_Y = containerH / page.heightMM;

    app.render.pixelsPerMM = Math.min(pxPerMM_X, pxPerMM_Y);

    // compute canvas size from physical page
    const canvasW = Math.floor(page.widthMM * app.render.pixelsPerMM);
    const canvasH = Math.floor(page.heightMM * app.render.pixelsPerMM);

    // remove old canvas
    if (app.render.canvas) {
        app.render.canvas.remove();
    }

    // create new canvas
    const c = createCanvas(canvasW, canvasH);
    c.parent(container);
    app.render.canvas = c;

    // ---- scale image into page ----

    const img = src.get();

    const scale = Math.min(
        canvasW / img.width,
        canvasH / img.height
    );

    const drawW = Math.floor(img.width * scale);
    const drawH = Math.floor(img.height * scale);

    img.resize(drawW, drawH);

    app.images.samplerImage = img;

    // center image in page
    app.render.imageOffsetX = (canvasW - drawW) / 2;
    app.render.imageOffsetY = (canvasH - drawH) / 2;

    // ---- compute render metrics ----
    app.render.strokeWidth =
        page.penWidthMM * app.render.pixelsPerMM;

    app.render.circleRadius =
        app.render.strokeWidth / 2;

    strokeWeight(app.render.strokeWidth);
    noFill();
}

function initializeSampler() {
    saveSettings();

    const img = app.images.samplerImage;
    const params = app.state.samplerParameters;
    const page = app.state.page;
    const render = app.render;

    if (!img) return;

    const x = img.width / 2;
    const y = img.height / 2;

    clear();
    background(255);
    // image(img, render.imageOffsetX, render.imageOffsetY)

    const radiusPixels =
        params.radius *
        page.penWidthMM *
        render.pixelsPerMM;

    app.state.activeSampler = new DensityPoissonSampler(
        img,
        radiusPixels,
        params.attempts,
        params.shadows,
        params.highlights,
        'l',
        x,
        y
    );

    loop();
}

// xml based svg construction for lightweight files with thousands of elements
function renderToSVG() {
    const sampler = app.state.activeSampler;
    const page = app.state.page;
    const render = app.render;

    if (!sampler) return;

    const pxToMM = 1 / render.pixelsPerMM;

    // group samples by color 
    const layers = new Map();

    for (const sample of sampler.samples) {
        const col = channelValToColor(sample.channelVal).toString('#rrggbb');

        if (!layers.has(col)) {
            layers.set(col, []);
        }

        layers.get(col).push(sample);
    }

    // sort each layer top → bottom 
    for (const samples of layers.values()) {
        samples.sort((a, b) => a.pos.y - b.pos.y);
    }

    // build SVG 
    const r = page.penWidthMM / 2;
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg"
    width="${page.widthMM}mm"
    height="${page.heightMM}mm"
    viewBox="0 0 ${page.widthMM} ${page.heightMM}">
\n`;

    // write layers 
    let layerCounter = 1;
    for (const [colorHex, samples] of layers.entries()) {

        svgContent += `  <g id="${layerCounter} - ${colorHex.replace('#', '')}" stroke-width="${page.penWidthMM}" stroke="${colorHex}" fill="none">\n`;

        for (const sample of samples) {
            const cx = ((sample.pos.x + app.render.imageOffsetX) * pxToMM).toFixed(4);
            const cy = ((sample.pos.y + app.render.imageOffsetY) * pxToMM).toFixed(4);
            svgContent += `    <circle cx="${cx}" cy="${cy}" r="${r}" />\n`;
        }

        svgContent += `  </g>\n`;
        layerCounter++;
    }

    svgContent += `</svg>`;

    // download 
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const now = new Date();
    link.download =
        "stipple_render_" +
        now.toLocaleTimeString().replace(/:/g, "-").slice(0, -3) +
        ".svg";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


// helper functions
function parseToMM(value, fieldName) {
    try {
        if (!/[a-zA-Z]/.test(value)) {
            value = value + " mm";
        }
        const unit = math.unit(value);
        return unit.to("mm").toNumber("mm");

    } catch (err) {
        console.warn(`Invalid unit in ${fieldName}:`, value);
        return null;
    }
}

// given an image file, creates a DOM img element containing the image
// invokes domToP5Image() on success
function uploadImageToDOM(file) {
    if (file.type !== 'image') {
        alert('unsupported file type');
        return;
    }
    if (file.name.split('.').pop().toLowerCase() === 'heic') {
        const blob = new Blob([file.file], { type: file.file.type });
        heic2any({
            blob: blob,
            toType: "image/png",
        }).then((convertedBlob) => {
            app.images.bufferImage = createImg(
                URL.createObjectURL(convertedBlob),
                '',
                'anonymous',
                domToP5Image
            );
            app.images.bufferImage.hide();
        }).catch((err) => {
            console.error("HEIC conversion failed:", err);
        });
    } else {
        app.images.bufferImage = createImg(
            file.data,
            '',
            'anonymous',
            domToP5Image
        );
        app.images.bufferImage.hide();
    }
}

// converts the image stored in the global bufferImage DOM element
// to p5.Image, then saves it in the global userImage variable
function domToP5Image() {
    const buffer = app.images.bufferImage;
    const g = createGraphics(buffer.elt.width, buffer.elt.height);

    g.image(buffer, 0, 0);

    app.images.userImage = g.get(0, 0, g.width, g.height);

    buffer.remove();
    g.remove();

    initCanvas();
    initializeSampler();
}

function channelValToColor(val) {
    const stops = app.state.palette.stops;

    if (!stops || stops.length === 0) {
        return color(0);
    }

    // undo the shadow exponentiation
    const adjustedVal = Math.pow(val, 1 / app.state.samplerParameters.shadows);

    if (stops.length === 1) {
        return color(stops[0].color);
    }

    for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];

        if (adjustedVal >= a.t && adjustedVal <= b.t) {
            return a.color
        }
    }

    return color(stops[stops.length - 1].color);
}