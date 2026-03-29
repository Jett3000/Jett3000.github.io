class UserGradient {
    constructor(containerId) {

        this.container = document.getElementById(containerId);

        this.stops = [
            { t: 0, color: "#000000" },
        ];

        this.activeIndex = null;
        this.changeCallback = null;

        this.initDOM();
        this.render();
    }

    // ---------- Public API ----------

    getStops() {
        return this.stops;
    }

    setStops(stops) {
        this.stops = stops;
        this.sortStops();
        this.render();
    }

    onChange(callback) {
        this.changeCallback = callback;
    }

    // ---------- Setup ----------

    initDOM() {
        this.bar = document.createElement("div");
        this.bar.className = "gradient-bar";

        this.colorInput = document.createElement("input");
        this.colorInput.type = "color";
        this.colorInput.style.position = "absolute";
        this.colorInput.style.opacity = "0";
        this.colorInput.style.pointerEvents = "none";

        this.container.appendChild(this.bar);
        this.container.appendChild(this.colorInput);

        this.bar.addEventListener("click", (e) => this.addStop(e));

        this.colorInput.addEventListener("input", () => {
            if (this.activeIndex !== null) {
                this.stops[this.activeIndex].color = this.colorInput.value;
                this.triggerChange();
                this.render();
            }
        });
    }

    // ---------- Rendering ----------

    render() {
        this.renderGradient();
        this.renderStops();
    }

    renderGradient() {
        if (this.stops.length === 1) {
            this.bar.style.background = this.stops[0].color;
            return;
        }

        const gradient = this.stops
            .map(s => `${s.color} ${s.t * 100}%`)
            .join(", ");

        this.bar.style.background = `linear-gradient(to right, ${gradient})`;
    }

    renderStops() {
        this.bar.querySelectorAll(".gradient-stop").forEach(el => el.remove());

        this.stops.forEach((stop, index) => {
            const handle = document.createElement("div");

            handle.className = "gradient-stop";
            handle.style.left = `${stop.t * 100}%`;
            handle.style.background = stop.color;

            handle.onmousedown = (e) => this.startDrag(e, index);

            handle.onclick = (e) => {
                e.stopPropagation();
                this.selectStop(index);
            };

            handle.ondblclick = () => this.removeStop(index);

            this.bar.appendChild(handle);
        });
    }

    // ---------- Interaction ----------

    selectStop(index) {
        this.activeIndex = index;

        const stop = this.stops[index];

        // update picker color
        this.colorInput.value = stop.color;

        // position picker near stop
        const barRect = this.bar.getBoundingClientRect();
        const x = barRect.left + stop.t * barRect.width;
        const y = barRect.top;

        this.colorInput.style.left = `${x}px`;
        this.colorInput.style.top = `${y - 30}px`; // above the bar

        // allow interaction momentarily
        this.colorInput.style.pointerEvents = "auto";

        // trigger picker
        this.colorInput.click();

        // disable again after open (prevents weird focus issues)
        setTimeout(() => {
            this.colorInput.style.pointerEvents = "none";
        }, 0);
    }

    addStop(e) {
        const rect = this.bar.getBoundingClientRect();
        const t = (e.clientX - rect.left) / rect.width;

        this.stops.push({
            t: this.clamp(t),
            color: "#000000"
        });

        this.sortStops();
        this.triggerChange();
        this.render();
    }

    removeStop(index) {
        if (this.stops.length <= 1) return; // keep at least one

        this.stops.splice(index, 1);
        this.triggerChange();
        this.render();
    }

    startDrag(e, index) {
        e.stopPropagation();

        const startY = e.clientY;
        const DELETE_THRESHOLD = 30; // px
        let el = e;

        let removed = false;

        const onMove = (e) => {

            const dy = e.clientY - startY;

            // ----- DELETE LOGIC -----
            if (Math.abs(dy) > DELETE_THRESHOLD) {

                if (!removed && this.stops.length > 1) {
                    this.removeStop(index);
                    removed = true;
                }

                return; // stop further updates after removal
            }

            // ----- NORMAL DRAG -----
            const rect = this.bar.getBoundingClientRect();
            let t = (e.clientX - rect.left) / rect.width;

            this.stops[index].t = this.clamp(t);

            this.sortStops();
            this.triggerChange();
            this.render();
        };

        const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }

    // ---------- Helpers ----------

    sortStops() {
        this.stops.sort((a, b) => a.t - b.t);
    }

    clamp(v) {
        return Math.max(0, Math.min(1, v));
    }

    triggerChange() {
        if (this.changeCallback) {
            this.changeCallback(this.stops);
        }
    }
}