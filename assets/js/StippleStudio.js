// Stipple Studio by Jett Pavlica
// A Luminance Modulated Variable Density Poisson Disc Sampling Engine
// Designed to render bitmap images as stippled vectors.
// Rewritten 2026


const STORAGE_KEY = "stippleStudioSettings";
const SHADOW_EPSILON = 0.001;
const MAX_PAGE_DIMENSION_MM = 1625.6;
const PAGE_PRESETS = {
    "art-9x12": { widthMM: 228.6, heightMM: 304.8 },
    "art-11x14": { widthMM: 279.4, heightMM: 355.6 },
    "arch-a": { widthMM: 228.6, heightMM: 304.8 },
    "art-5x7": { widthMM: 127, heightMM: 177.8 },
    "art-8x10": { widthMM: 203.2, heightMM: 254 },
    "art-12x16": { widthMM: 304.8, heightMM: 406.4 },
    "art-16x20": { widthMM: 406.4, heightMM: 508 },
    "art-18x24": { widthMM: 457.2, heightMM: 609.6 },
    "art-20x24": { widthMM: 508, heightMM: 609.6 },
    "art-24x30": { widthMM: 609.6, heightMM: 762 },
    "art-24x36": { widthMM: 609.6, heightMM: 914.4 },
    "arch-b": { widthMM: 304.8, heightMM: 457.2 },
    "arch-c": { widthMM: 457.2, heightMM: 609.6 },
    "arch-d": { widthMM: 609.6, heightMM: 914.4 },
    "arch-e": { widthMM: 914.4, heightMM: 1219.2 },
    a4: { widthMM: 210, heightMM: 297 },
    a5: { widthMM: 148, heightMM: 210 },
    a3: { widthMM: 297, heightMM: 420 },
    a2: { widthMM: 420, heightMM: 594 },
    a1: { widthMM: 594, heightMM: 841 },
    a0: { widthMM: 841, heightMM: 1189 },
    letter: { widthMM: 215.9, heightMM: 279.4 },
    legal: { widthMM: 215.9, heightMM: 355.6 },
    tabloid: { widthMM: 279.4, heightMM: 431.8 },
};
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
            preset: null,
            dimensions: null,
            orientation: {
                portrait: null,
                landscape: null,
            },
        },
        buttons: {
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
            orientation: "portrait",
            presetKey: "custom",
        },
        palette: null,
        activeSampler: null,
    },
    render: {
        pixelsPerMM: null,
        strokeWidth: null,
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

    app.state.palette = new UserGradient("gradient-editor", app.state.paletteStops);
    app.state.palette.onChange((stops, committed) => {
        app.state.paletteStops = stops;
        if (committed) saveSettings();
        recolor();
    });

    initPage();
    initSamplerParameters();

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
    if (!app.state.activeSampler) return;
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
        palette: app.state.palette ? app.state.palette.getStops() : app.state.paletteStops,
    };
    storeItem(STORAGE_KEY, settings);
}

function loadSettings() {
    const saved = getItem(STORAGE_KEY);
    if (saved) {
        Object.assign(app.state.samplerParameters, saved.samplerParameters);
        Object.assign(app.state.page, saved.page);
        const savedPalette = Array.isArray(saved.palette) ? saved.palette : saved.palette?.stops;
        app.state.paletteStops = Array.isArray(savedPalette) && savedPalette.length >= 1
            ? savedPalette
            : UserGradient.createDefaultStops();
        inferPageSelection(app.state.page, saved.page);
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
            orientation: "portrait",
            presetKey: "art-11x14",
        },
        paletteStops: [
            ...UserGradient.createDefaultStops(),
        ],
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
    app.ui.pageInputs.width.value = `${mmToIn(page.widthMM).toFixed(4)}in`;
    app.ui.pageInputs.height.value = `${mmToIn(page.heightMM).toFixed(4)}in`;
    app.ui.pageInputs.penWidth.value = `${page.penWidthMM.toFixed(2)}mm`;
    syncPresetSelection();
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
    ui.pageInputs.preset = document.getElementById("page-preset");
    ui.pageInputs.dimensions = document.querySelector("#page-setup-section .dimension-grid");
    ui.pageInputs.orientation.portrait = document.getElementById("orientation-portrait");
    ui.pageInputs.orientation.landscape = document.getElementById("orientation-landscape");

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

    ui.pageInputs.preset.addEventListener("change", applyPagePreset);
    ui.pageInputs.orientation.portrait.addEventListener("click", () => setOrientation("portrait"));
    ui.pageInputs.orientation.landscape.addEventListener("click", () => setOrientation("landscape"));
    [ui.pageInputs.width, ui.pageInputs.height, ui.pageInputs.penWidth].forEach((input) => {
        input.addEventListener("input", () => {
            if (input !== ui.pageInputs.penWidth) {
                ui.pageInputs.preset.value = "custom";
                ui.pageInputs.dimensions.hidden = false;
            }
            validatePageInput(input);
            if (input !== ui.pageInputs.penWidth) updateOrientationFromInputs();
        });
        input.addEventListener("blur", commitPageInputs);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                commitPageInputs();
                input.blur();
            }
        });
    });

    bindSamplerParameter("radius");
    bindSamplerParameter("attempts");
    bindSamplerParameter("shadows");
    bindSamplerParameter("highlights");

    function bindSamplerParameter(name) {
        const slider = app.ui.sliders[name];
        const input = app.ui.textInputs[name];
        const params = app.state.samplerParameters;

        function update(value) {
            const parsedValue = parseFloat(value);
            params[name] = name === "shadows"
                ? Math.max(Number.isFinite(parsedValue) ? parsedValue : 0, SHADOW_EPSILON)
                : parsedValue;
            input.value = name === "shadows"
                ? String(params[name])
                : 1 * params[name].toFixed(2);
            slider.value = params[name];
            initializeSampler();
        }

        slider.addEventListener("input", () => {
            update(slider.value);
        });
        input.addEventListener("input", () => {
            update(input.value);
        });
    }
}

function initPage() {
    const ui = app.ui.pageInputs;
    const page = app.state.page;
    const values = {
        widthMM: parseToMM(ui.width.value, ui.width.id),
        heightMM: parseToMM(ui.height.value, ui.height.id),
        penWidthMM: parseToMM(ui.penWidth.value, ui.penWidth.id),
    };
    const errors = {
        width: validateDimension(values.widthMM, true),
        height: validateDimension(values.heightMM, true),
        penWidth: validateDimension(values.penWidthMM, false),
    };

    setPageInputError(ui.width, errors.width);
    setPageInputError(ui.height, errors.height);
    setPageInputError(ui.penWidth, errors.penWidth);
    if (Object.values(errors).some(Boolean)) return false;

    Object.assign(page, values);
    return true;
}

function validateDimension(valueMM, isPageDimension) {
    if (!Number.isFinite(valueMM) || valueMM <= 0) {
        return "Enter a positive size with a supported unit.";
    }
    if (isPageDimension && valueMM > MAX_PAGE_DIMENSION_MM) {
        return `Maximum page dimension is ${MAX_PAGE_DIMENSION_MM} mm.`;
    }
    return "";
}

function validatePageInput(input) {
    const isPageDimension = input !== app.ui.pageInputs.penWidth;
    const valueMM = parseToMM(input.value, input.id);
    setPageInputError(input, validateDimension(valueMM, isPageDimension));
}

function setPageInputError(input, message) {
    const error = document.getElementById(`${input.id}-error`);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    error.textContent = message;
}

function commitPageInputs() {
    const previous = { ...app.state.page };
    if (!initPage()) return;

    const page = app.state.page;
    if (app.ui.pageInputs.preset.value === "custom") {
        page.presetKey = "custom";
        if (page.widthMM > page.heightMM) page.orientation = "landscape";
        else if (page.heightMM > page.widthMM) page.orientation = "portrait";
    }
    const changed = page.widthMM !== previous.widthMM ||
        page.heightMM !== previous.heightMM ||
        page.penWidthMM !== previous.penWidthMM ||
        page.orientation !== previous.orientation ||
        page.presetKey !== previous.presetKey;
    if (changed) {
        initCanvas();
        initializeSampler();
    } else {
        saveSettings();
    }
    syncPresetSelection();
}

function applyPagePreset() {
    const ui = app.ui.pageInputs;
    const presetKey = ui.preset.value;
    if (presetKey === "custom") {
        ui.dimensions.hidden = false;
        app.state.page.presetKey = "custom";
        ui.width.value = `${(app.state.page.widthMM / 25.4).toFixed(4)}in`;
        ui.height.value = `${(app.state.page.heightMM / 25.4).toFixed(4)}in`;
        saveSettings();
        return;
    }

    const preset = PAGE_PRESETS[presetKey];
    if (!preset) return;
    const isLandscape = app.state.page.orientation === "landscape";
    app.state.page.presetKey = presetKey;
    app.state.page.widthMM = isLandscape ? preset.heightMM : preset.widthMM;
    app.state.page.heightMM = isLandscape ? preset.widthMM : preset.heightMM;
    ui.dimensions.hidden = true;
    ui.width.value = `${(app.state.page.widthMM / 25.4).toFixed(4)}in`;
    ui.height.value = `${(app.state.page.heightMM / 25.4).toFixed(4)}in`;
    setPageInputError(app.ui.pageInputs.width, "");
    setPageInputError(app.ui.pageInputs.height, "");
    syncOrientationButtons();
    initCanvas();
    initializeSampler();
}

function syncPresetSelection() {
    const page = app.state.page;
    app.ui.pageInputs.preset.value = PAGE_PRESETS[page.presetKey] ? page.presetKey : "custom";
    app.ui.pageInputs.dimensions.hidden = app.ui.pageInputs.preset.value !== "custom";
    syncOrientationButtons();
}

function syncOrientationButtons() {
    const isPortrait = app.state.page.orientation !== "landscape";
    app.ui.pageInputs.orientation.portrait.setAttribute("aria-pressed", String(isPortrait));
    app.ui.pageInputs.orientation.landscape.setAttribute("aria-pressed", String(!isPortrait));
}

function inferPageSelection(page, savedPage) {
    if (PAGE_PRESETS[savedPage.presetKey] && ["portrait", "landscape"].includes(savedPage.orientation)) {
        return;
    }

    const match = Object.entries(PAGE_PRESETS).find(([, preset]) =>
        (Math.abs(preset.widthMM - page.widthMM) < 0.01 && Math.abs(preset.heightMM - page.heightMM) < 0.01) ||
        (Math.abs(preset.heightMM - page.widthMM) < 0.01 && Math.abs(preset.widthMM - page.heightMM) < 0.01)
    );
    if (match) {
        const [, preset] = match;
        page.presetKey = match[0];
        page.orientation = page.widthMM > page.heightMM ? "landscape" : "portrait";
        if (preset.widthMM === preset.heightMM) page.orientation = "portrait";
        return;
    }

    page.presetKey = "custom";
    page.orientation = page.widthMM > page.heightMM ? "landscape" : "portrait";
}

function updateOrientationFromInputs() {
    const ui = app.ui.pageInputs;
    const widthMM = parseToMM(ui.width.value, ui.width.id);
    const heightMM = parseToMM(ui.height.value, ui.height.id);
    if (validateDimension(widthMM, true) || validateDimension(heightMM, true)) return;
    if (widthMM > heightMM) app.state.page.orientation = "landscape";
    else if (heightMM > widthMM) app.state.page.orientation = "portrait";
    syncOrientationButtons();
}

function setOrientation(orientation) {
    const page = app.state.page;
    const ui = app.ui.pageInputs;
    if (orientation === page.orientation) return;

    if (ui.preset.value === "custom") {
        if (!initPage()) return;
        if ((orientation === "landscape" && page.widthMM < page.heightMM) ||
            (orientation === "portrait" && page.heightMM < page.widthMM)) {
            [page.widthMM, page.heightMM] = [page.heightMM, page.widthMM];
        }
        page.presetKey = "custom";
        page.orientation = orientation;
        ui.width.value = `${(page.widthMM / 25.4).toFixed(4)}in`;
        ui.height.value = `${(page.heightMM / 25.4).toFixed(4)}in`;
    } else {
        const preset = PAGE_PRESETS[page.presetKey];
        if (!preset) return;
        page.orientation = orientation;
        page.widthMM = orientation === "landscape" ? preset.heightMM : preset.widthMM;
        page.heightMM = orientation === "landscape" ? preset.widthMM : preset.heightMM;
    }

    syncOrientationButtons();
    initCanvas();
    initializeSampler();
}

function initSamplerParameters() {
    const sliders = app.ui.sliders;
    const inputs = app.ui.textInputs;
    const params = app.state.samplerParameters;

    params.radius = parseFloat(sliders.radius.value);
    params.attempts = parseInt(sliders.attempts.value);
    params.shadows = Math.max(parseFloat(sliders.shadows.value) || 0, SHADOW_EPSILON);
    params.highlights = parseFloat(sliders.highlights.value);

    for (const key of Object.keys(sliders)) {
        sliders[key].value = params[key];
        inputs[key].value = key === "shadows" ? String(params[key]) : params[key];
    }
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
        value = value.trim();
        if (!value) return null;
        if (!/[a-zA-Z]/.test(value)) {
            value = value + " mm";
        }
        const unit = math.unit(value);
        const valueMM = unit.to("mm").toNumber("mm");
        return Number.isFinite(valueMM) ? valueMM : null;

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
    if (!app.state.palette || typeof app.state.palette.sample !== "function") {
        return color(0);
    }

    const channelValue = Number.isFinite(val) ? Math.max(0, Math.min(1, val)) : 0;
    const shadowExponent = Number.isFinite(app.state.samplerParameters.shadows)
        ? Math.max(app.state.samplerParameters.shadows, SHADOW_EPSILON)
        : SHADOW_EPSILON;
    const adjustedVal = Math.pow(channelValue, 1 / shadowExponent);

    try {
        const sampledColor = app.state.palette.sample(adjustedVal);
        return typeof sampledColor === "string" && sampledColor.length > 0
            ? color(sampledColor)
            : color(0);
    } catch (error) {
        console.warn("Palette color sampling failed:", error);
        return color(0);
    }
}