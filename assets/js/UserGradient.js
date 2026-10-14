class UserGradient {
    static createDefaultStops() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 90 + Math.random() * 10;
        const lightness = 70 + Math.random() * 12;
        const chroma = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
        const hueSection = hue / 60;
        const secondary = chroma * (1 - Math.abs(hueSection % 2 - 1));
        const channels = hueSection < 1 ? [chroma, secondary, 0]
            : hueSection < 2 ? [secondary, chroma, 0]
                : hueSection < 3 ? [0, chroma, secondary]
                    : hueSection < 4 ? [0, secondary, chroma]
                        : hueSection < 5 ? [secondary, 0, chroma]
                            : [chroma, 0, secondary];
        const offset = lightness / 100 - chroma / 2;
        const saturatedColor = `#${channels.map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, "0")).join("")}`;
        return [
            { t: 0, color: "#000000" },
            { t: 0.7, color: saturatedColor }
        ];
    }

    constructor(containerId, stops) {
        this.container = document.getElementById(containerId);
        this.stops = this.normalizeStops(stops);
        this.activeStop = this.stops[0];
        this.changeCallback = null;
        this.stopElements = new Map();
        this.suppressStopClick = false;

        this.initDOM();
        this.render();
    }

    getStops() {
        return this.stops.map(({ t, color }) => ({ t, color }));
    }

    setStops(stops) {
        this.stops = this.normalizeStops(stops);
        this.activeStop = this.stops[0];
        this.render();
        this.triggerChange(true);
    }

    onChange(callback) {
        this.changeCallback = callback;
    }

    sample(position) {
        if (!this.stops.length) return "#000000";
        if (this.stops.length === 1) return this.stops[0].color || "#000000";

        const t = this.clamp(Number.isFinite(position) ? position : 0);
        if (t <= this.stops[0].t) return this.stops[0].color;
        if (t >= this.stops[this.stops.length - 1].t) return this.stops[this.stops.length - 1].color;

        const upperIndex = this.stops.findIndex((stop) => stop.t >= t);
        if (upperIndex <= 0) return this.stops[0].color;
        if (upperIndex === -1) return this.stops[this.stops.length - 1].color;
        const left = this.stops[upperIndex - 1];
        const right = this.stops[upperIndex];
        if (!left || !right) return left?.color || right?.color || "#000000";
        const amount = (t - left.t) / (right.t - left.t || 1);
        return this.interpolateColor(left.color, right.color, amount);
    }

    initDOM() {
        this.editor = document.createElement("div");
        this.editor.className = "gradient-editor";

        this.bar = document.createElement("div");
        this.bar.className = "gradient-bar";
        this.bar.setAttribute("role", "group");
        this.bar.setAttribute("aria-label", "Gradient color stops");
        this.bar.addEventListener("click", (event) => this.addStop(event));

        this.palettePresetActions = document.createElement("div");
        this.palettePresetActions.className = "gradient-preset-actions";
        this.palettePresetActions.setAttribute("role", "group");
        this.palettePresetActions.setAttribute("aria-label", "Palette presets");

        this.blackPresetButton = this.createPresetButton("Black", () => {
            this.setStops([{ t: 0, color: "#000000" }]);
        });
        this.duotonePresetButton = this.createPresetButton("Duotone", () => {
            this.setStops(UserGradient.createDefaultStops());
        });
        this.palettePresetActions.append(this.blackPresetButton, this.duotonePresetButton);

        this.stopInspector = document.createElement("div");
        this.stopInspector.className = "gradient-stop-inspector";
        this.stopInspector.setAttribute("aria-label", "Selected color stop");

        this.hexField = this.createField("Color", "text", "stop-color", "#000000");
        this.hexField.input.autocomplete = "off";
        this.hexField.input.spellcheck = false;
        this.hexField.input.maxLength = 7;
        this.hexField.input.setAttribute("aria-describedby", "stop-color-error");
        this.hexField.error.id = "stop-color-error";

        this.positionField = this.createField("Position", "number", "stop-position", "0");
        this.positionField.input.min = "0";
        this.positionField.input.max = "100";
        this.positionField.input.step = "0.1";
        this.positionField.input.inputMode = "decimal";
        this.positionField.input.setAttribute("aria-describedby", "stop-position-error");
        this.positionField.error.id = "stop-position-error";

        this.pickerButton = document.createElement("button");
        this.pickerButton.type = "button";
        this.pickerButton.className = "gradient-picker-button";
        this.pickerButton.textContent = "Choose color";
        this.pickerButton.addEventListener("click", () => this.openColorPicker(this.activeStop));

        this.removeButton = document.createElement("button");
        this.removeButton.type = "button";
        this.removeButton.className = "gradient-remove-button";
        this.removeButton.textContent = "Remove stop";
        this.removeButton.addEventListener("click", () => this.removeStop(this.activeStop));

        this.colorInput = document.createElement("input");
        this.colorInput.type = "color";
        this.colorInput.className = "gradient-native-picker";
        this.colorInput.tabIndex = -1;
        this.colorInput.setAttribute("aria-hidden", "true");

        this.hexField.input.addEventListener("input", () => this.updateColorFromText(false));
        this.hexField.input.addEventListener("change", () => this.updateColorFromText(true));
        this.positionField.input.addEventListener("input", () => this.updatePositionFromText(false));
        this.positionField.input.addEventListener("change", () => this.updatePositionFromText(true));
        this.colorInput.addEventListener("input", () => this.updateColor(this.colorInput.value, false));
        this.colorInput.addEventListener("change", () => this.updateColor(this.colorInput.value, true));

        this.stopInspector.append(
            this.hexField.wrapper,
            this.positionField.wrapper,
            this.pickerButton,
            this.removeButton
        );
        this.editor.append(this.palettePresetActions, this.bar, this.stopInspector, this.colorInput);
        this.container.replaceChildren(this.editor);
    }

    createPresetButton(label, onClick) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "gradient-preset-button";
        button.textContent = label;
        button.addEventListener("click", onClick);
        return button;
    }

    createField(labelText, type, id, value) {
        const wrapper = document.createElement("label");
        wrapper.className = "gradient-inspector-field";
        wrapper.htmlFor = id;

        const label = document.createElement("span");
        label.textContent = labelText;

        const input = document.createElement("input");
        input.type = type;
        input.id = id;
        input.value = value;

        const error = document.createElement("small");
        error.className = "gradient-field-error";
        error.setAttribute("aria-live", "polite");

        wrapper.append(label, input, error);
        return { wrapper, input, error };
    }

    render() {
        this.renderGradient();
        this.renderStops();
        this.renderInspector();
    }

    renderGradient() {
        if (this.stops.length === 1) {
            this.bar.style.background = this.stops[0].color;
            return;
        }
        const gradient = this.stops.map((stop) => `${stop.color} ${stop.t * 100}%`).join(", ");
        this.bar.style.background = `linear-gradient(90deg, ${gradient})`;
    }

    renderStops() {
        this.bar.replaceChildren();
        this.stopElements.clear();

        this.stops.forEach((stop) => {
            const handle = document.createElement("button");
            handle.type = "button";
            handle.className = "gradient-stop";
            handle.style.left = `${stop.t * 100}%`;
            handle.style.setProperty("--stop-color", stop.color);
            handle.setAttribute("aria-label", this.stopLabel(stop));
            handle.setAttribute("aria-pressed", String(stop === this.activeStop));
            handle.title = `${Math.round(stop.t * 1000) / 10}% ${stop.color}`;

            handle.addEventListener("focus", () => this.selectStop(stop));
            handle.addEventListener("click", (event) => {
                event.stopPropagation();
                if (this.suppressStopClick) {
                    this.suppressStopClick = false;
                    return;
                }
                this.openColorPicker(stop);
            });
            handle.addEventListener("pointerdown", (event) => this.startDrag(event, stop, handle));
            handle.addEventListener("keydown", (event) => this.handleStopKeydown(event, stop));

            this.stopElements.set(stop, handle);
            this.bar.appendChild(handle);
        });
    }

    renderInspector() {
        const stop = this.activeStop;
        if (!stop) return;

        this.hexField.input.value = stop.color;
        this.hexField.input.setAttribute("aria-invalid", "false");
        this.hexField.error.textContent = "";
        this.positionField.input.value = (stop.t * 100).toFixed(1).replace(/\.0$/, "");
        this.positionField.input.disabled = false;
        this.positionField.input.setAttribute("aria-invalid", "false");
        this.positionField.error.textContent = "";
        this.removeButton.disabled = this.stops.length <= 1;
        this.removeButton.title = this.removeButton.disabled ? "Keep one stop" : "Remove selected stop";

        this.stopElements.forEach((handle, item) => {
            handle.setAttribute("aria-pressed", String(item === stop));
            handle.setAttribute("aria-label", this.stopLabel(item));
            handle.classList.toggle("is-selected", item === stop);
        });
    }

    selectStop(stop) {
        if (!this.stops.includes(stop)) return;
        this.activeStop = stop;
        this.colorInput.value = stop.color;
        this.renderInspector();
    }

    openColorPicker(stop) {
        if (!stop || !this.stops.includes(stop)) return;
        this.selectStop(stop);

        const handle = this.stopElements.get(stop);
        const rect = handle?.getBoundingClientRect();
        if (!rect) return;
        this.colorInput.value = stop.color;
        this.colorInput.style.left = `${Math.max(0, Math.min(window.innerWidth - 1, rect.left + rect.width / 2))}px`;
        this.colorInput.style.top = `${Math.max(0, Math.min(window.innerHeight - 1, rect.top + rect.height / 2))}px`;

        try {
            if (typeof this.colorInput.showPicker === "function") this.colorInput.showPicker();
            else this.colorInput.click();
        } catch {
            this.colorInput.click();
        }
    }

    addStop(event) {
        const rect = this.bar.getBoundingClientRect();
        if (!rect.width) return;
        const t = this.clamp((event.clientX - rect.left) / rect.width, 0.001, 0.999);
        const stop = { t, color: this.sample(t) };
        this.stops.push(stop);
        this.sortStops();
        this.activeStop = stop;
        this.render();
        this.triggerChange(true);
        this.hexField.input.focus();
    }

    removeStop(stop) {
        if (!stop || this.stops.length <= 1) return;
        const oldIndex = this.stops.indexOf(stop);
        this.stops.splice(oldIndex, 1);
        this.activeStop = this.stops[Math.min(oldIndex, this.stops.length - 1)];
        this.render();
        this.triggerChange(true);
        this.stopElements.get(this.activeStop)?.focus();
    }

    startDrag(event, stop, handle) {
        if (event.button !== 0 && event.pointerType === "mouse") return;
        event.preventDefault();
        event.stopPropagation();
        this.suppressStopClick = false;
        this.selectStop(stop);
        handle.setPointerCapture(event.pointerId);
        const startX = event.clientX;
        const startY = event.clientY;
        let didMove = false;
        let removed = false;
        const cleanup = () => {
            handle.removeEventListener("pointermove", move);
            handle.removeEventListener("pointerup", finish);
            handle.removeEventListener("pointercancel", finish);
        };
        const move = (moveEvent) => {
            if (moveEvent.pointerId !== event.pointerId) return;
            const deltaY = moveEvent.clientY - startY;
            if (deltaY > 44 && this.stops.length > 1) {
                removed = true;
                this.suppressStopClick = true;
                cleanup();
                this.removeStop(stop);
                return;
            }
            if (Math.abs(moveEvent.clientX - startX) > 3 || Math.abs(deltaY) > 3) didMove = true;
            const rect = this.bar.getBoundingClientRect();
            if (!rect.width) return;
            stop.t = this.clamp((moveEvent.clientX - rect.left) / rect.width, 0.001, 0.999);
            this.sortStops();
            this.updateStopLayout();
            this.renderInspector();
            this.triggerChange(false);
        };
        const finish = (finishEvent) => {
            if (finishEvent.pointerId !== event.pointerId) return;
            cleanup();
            this.suppressStopClick = didMove || removed;
            this.syncStopOrder();
            this.renderInspector();
            if (didMove || removed) this.triggerChange(true);
        };

        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", finish);
        handle.addEventListener("pointercancel", finish);
    }

    handleStopKeydown(event, stop) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            this.openColorPicker(stop);
            return;
        }
        if (["Delete", "Backspace", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
            event.stopPropagation();
        }
        if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault();
            this.removeStop(stop);
            return;
        }
        let delta = 0;
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") delta = -0.01;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") delta = 0.01;
        if (event.shiftKey) delta *= 5;
        if (!delta) return;

        event.preventDefault();
        stop.t = this.clamp(stop.t + delta, 0.001, 0.999);
        this.sortStops();
        this.updateStopLayout();
        this.syncStopOrder();
        this.renderInspector();
        this.triggerChange(true);
    }

    updateColorFromText(committed) {
        const normalized = this.normalizeHex(this.hexField.input.value);
        if (!normalized) {
            this.setFieldError(this.hexField, "Use a 3- or 6-digit hex color.");
            return;
        }
        this.setFieldError(this.hexField, "");
        this.updateColor(normalized, committed, false);
        if (committed) this.hexField.input.value = normalized;
    }

    updateColor(value, committed, updateText = true) {
        const color = this.normalizeHex(value);
        if (!color || !this.activeStop) return;
        this.activeStop.color = color;
        if (updateText) this.hexField.input.value = color;
        this.setFieldError(this.hexField, "");
        this.colorInput.value = color;
        const handle = this.stopElements.get(this.activeStop);
        if (handle) {
            handle.style.setProperty("--stop-color", color);
            handle.title = `${Math.round(this.activeStop.t * 1000) / 10}% ${color}`;
            handle.setAttribute("aria-label", this.stopLabel(this.activeStop));
        }
        this.renderGradient();
        this.triggerChange(committed);
    }

    updatePositionFromText(committed) {
        const value = this.positionField.input.value.trim();
        const position = value === "" ? NaN : Number(value);
        if (!Number.isFinite(position) || position < 0 || position > 100) {
            this.setFieldError(this.positionField, "Enter a position from 0 to 100%.");
            return;
        }
        this.setFieldError(this.positionField, "");
        this.activeStop.t = position / 100;
        this.sortStops();
        this.updateStopLayout();
        if (committed) {
            this.syncStopOrder();
            this.positionField.input.value = (this.activeStop.t * 100).toFixed(1).replace(/\.0$/, "");
        }
        this.triggerChange(committed);
    }

    syncStopOrder() {
        const orderedHandles = this.stops.map((stop) => this.stopElements.get(stop)).filter(Boolean);
        const orderMatches = orderedHandles.every((handle, index) => this.bar.children[index] === handle);
        if (orderMatches) return;

        const focusedElement = document.activeElement;
        orderedHandles.forEach((handle) => this.bar.appendChild(handle));
        if (focusedElement && this.bar.contains(focusedElement)) {
            focusedElement.focus({ preventScroll: true });
        }
    }

    updateStopLayout() {
        this.renderGradient();
        this.stopElements.forEach((handle, stop) => {
            handle.style.left = `${stop.t * 100}%`;
            handle.title = `${Math.round(stop.t * 1000) / 10}% ${stop.color}`;
            handle.setAttribute("aria-label", this.stopLabel(stop));
        });
    }

    setFieldError(field, message) {
        field.input.setAttribute("aria-invalid", String(Boolean(message)));
        field.error.textContent = message;
    }

    stopLabel(stop) {
        const selected = stop === this.activeStop ? "selected, " : "";
        return `${selected}color stop at ${(stop.t * 100).toFixed(1)} percent, ${stop.color}`;
    }

    sortStops() {
        this.stops.sort((a, b) => a.t - b.t);
    }

    normalizeStops(stops) {
        const normalized = Array.isArray(stops)
            ? stops.map((stop) => ({
                t: Number(stop.t),
                color: this.normalizeHex(stop.color),
            })).filter((stop) => Number.isFinite(stop.t) && stop.color)
                .map((stop) => ({ t: this.clamp(stop.t), color: stop.color }))
            : [];
        normalized.sort((a, b) => a.t - b.t);
        if (normalized.length < 1) {
            return UserGradient.createDefaultStops();
        }
        return normalized;
    }

    normalizeHex(value) {
        if (typeof value !== "string") return null;
        let hex = value.trim();
        if (!hex.startsWith("#")) hex = `#${hex}`;
        if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) return null;
        if (hex.length === 4) {
            hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
        }
        return hex.toLowerCase();
    }

    interpolateColor(left, right, amount) {
        const a = this.hexToRgb(left);
        const b = this.hexToRgb(right);
        const channels = a.map((channel, index) => Math.round(channel + (b[index] - channel) * amount));
        return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
    }

    hexToRgb(hex) {
        return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
    }

    clamp(value, min = 0, max = 1) {
        return Math.max(min, Math.min(max, value));
    }

    triggerChange(committed) {
        if (this.changeCallback) this.changeCallback(this.getStops(), committed);
    }
}