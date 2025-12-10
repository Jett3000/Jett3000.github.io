// barnes–hut 3d octree for repulsion
// standalone utility, p5 optional but supported

export class Octree {
    constructor(center, halfSize, p = null) {
        this.center = center;                     // p5.Vector
        this.halfSize = halfSize;                 // scalar
        this.children = new Array(8).fill(null); // octants
        this.point = null;                       // leaf: single payload
        this.mass = 0;                           // aggregated mass
        this.com = p.createVector()    // center of mass
        this.p = p;                              // optional p5 instance
        this.isLeaf = true;


        // holder vectors to avoid pointless initializations
        this.dirVector = p.createVector();
    }

    // bounds test
    contains(pos) {
        return Math.abs(pos.x - this.center.x) <= this.halfSize &&
            Math.abs(pos.y - this.center.y) <= this.halfSize &&
            Math.abs(pos.z - this.center.z) <= this.halfSize;
    }

    // octant index
    getOctant(pos) {
        let idx = 0;
        if (pos.x >= this.center.x) idx |= 1;
        if (pos.y >= this.center.y) idx |= 2;
        if (pos.z >= this.center.z) idx |= 4;
        return idx;
    }

    // insert payload with .position
    insert(payload) {
        if (!this.point && this.isLeaf) {
            this.point = payload;
            return;
        }

        if (this.point) {
            const old = this.point;
            this.point = null;
            this.subdivide();
            this._insertToChild(old);
        }

        this._insertToChild(payload);
    }

    _insertToChild(payload) {
        const pos = payload.position;
        const idx = this.getOctant(pos);



        if (!this.children[idx]) {
            const hs = this.halfSize / 2;
            if (this.halfSize < 1e-4) {
                // stop subdividing, store multiple points in this leaf
                if (!this.points) this.points = [];
                this.points.push(payload);
                return;
            }

            const offset = this.p.createVector(
                (idx & 1 ? 0.5 : -0.5) * this.halfSize,
                (idx & 2 ? 0.5 : -0.5) * this.halfSize,
                (idx & 4 ? 0.5 : -0.5) * this.halfSize
            );

            const childCenter = this.center.copy().add(offset);
            this.children[idx] = new Octree(childCenter, hs, this.p);
        }

        this.children[idx].insert(payload);
    }

    subdivide() {
        this.isLeaf = false;
        for (let i = 0; i < 8; i++) this.children[i] = null;
    }

    // mass + center of mass accumulation
    computeMass() {
        if (this.point) {
            this.mass = 1;
            this.com.set(this.point.position);

            return this.mass;
        }

        let m = 0;
        this.com.set();

        for (const c of this.children) {
            if (!c) continue;
            m += c.computeMass();
            this.com.add(c.com.x * c.mass, c.com.y * c.mass, c.com.z * c.mass);
        }

        if (m > 0) this.com.div(m)
        this.mass = m;
        return m;
    }

    // barnes–hut force on a target (repulsive)
    applyForce(target, theta, k) {
        if (this.mass === 0) return;
        if (this.point === target && this.isLeaf) return;

        const dir = this.dirVector.set(this.com).sub(target.position);
        const dist = Math.max(1e-2, dir.mag());
        const s = this.halfSize * 2;

        if ((s / dist) < theta || this.children.every(c => c === null)) {
            const strength = (k * this.mass) / (dist * dist);
            const f = dir.setMag(strength).mult(-1)
            target.applyForce(f);
        } else {
            for (const c of this.children) {
                if (c) c.applyForce(target, theta, k);
            }
        }
    }
}
