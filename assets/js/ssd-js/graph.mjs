
import { Board } from "./board.mjs";
import { Octree } from "./octree.mjs";


// text displays
var boardDisplay = document.getElementById('board-display')
var optionsContainer = document.getElementById('options-container')
var nodeInfoLabel = document.getElementById('node-label')
var titleElt = document.getElementById('title')

// ui controls
var dfsButton = document.getElementById('dfs-button')
var bfsButton = document.getElementById('bfs-button')
var cameraButton = document.getElementById('toggle-camera')
var automateButton = document.getElementById('automate-button');
var fastPhysicsButton = document.getElementById('fast-physics');
var speedSlider = document.getElementById('speed-slider')
var backtackingButton = document.getElementById('backtracking')
var newGameButton = document.getElementById('new-game')

// optimized memory
var globalTempVec;

const sketch = (p) => {
    p.disableFriendlyErrors = true;
    // initialize graph
    var graphNodes = [];
    var initBoard = new Board();
    var rootNode = new Node(p, initBoard);
    graphNodes.push(rootNode);
    var visitedSet = {};
    visitedSet[rootNode.board.hashString()] = rootNode;
    var octree;
    // initialize sketch variables
    var autoAllowance = 0;
    var allowOddMoves = true;
    var treeMode = false;
    var trackingCamera = false;
    var lastNode;
    var trackingVector;
    var fastMode = false;
    var fastPhysics = false;
    var centerAttraction = true;
    var searchDFS = true;
    var backtracking = true;
    var scaleTarget;
    var drawPoints = false;
    var buildTreeFlag = false;


    newGameButton.onclick = (e) => {
        visitedSet = {};
        graphNodes = [];
        initBoard = new Board();
        rootNode = new Node(p, initBoard);
        graphNodes.push(rootNode);
        visitedSet[rootNode.board.hashString()] = rootNode;

        buildTreeFlag = true;
        trackingVector = rootNode.position.copy();
        p.playFromNode(rootNode);
        e.stopPropagation();
    }

    backtackingButton.onclick = () => {
        backtracking = !backtracking;
        if (backtracking) {
            backtackingButton.classList.add('toggled')
        } else {
            backtackingButton.classList.remove('toggled')
        }
        e.stopPropagation();

    }

    dfsButton.onclick = () => {
        searchDFS = true;
        dfsButton.classList.add('toggled')
        bfsButton.classList.remove('toggled')
    }
    bfsButton.onclick = () => {
        searchDFS = false;
        bfsButton.classList.add('toggled')
        dfsButton.classList.remove('toggled')
    }

    automateButton.onclick = () => {
        if (autoAllowance < 1) {
            autoAllowance += 500;
            automateButton.classList.add('toggled')
            titleElt.style.color = "#00000000"
        } else {
            autoAllowance = 0;
        }
    }

    fastPhysicsButton.onclick = () => {
        fastPhysics = !fastPhysics;
        if (fastPhysics) {
            fastPhysicsButton.classList.add('toggled')
            speedSlider.style.display = 'block'

        } else {
            fastPhysicsButton.classList.remove('toggled')
            speedSlider.style.display = 'none'
        }
    }

    cameraButton.onclick = () => {
        trackingCamera = !trackingCamera;
        if (trackingCamera) {
            trackingVector = lastNode.position.copy().mult(-1);
            cameraButton.classList.add('toggled')
        } else {
            cameraButton.classList.remove('toggled')
        }
    }

    p.setup = () => {
        const c = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);

        p.colorMode(p.HSB);
        p.noFill();
        p.background(0);

        const canvasContainer = document.getElementById('canvas-container');
        c.parent('canvas-container');
        c.onclick = (e) => {
            titleElt.style.color = "#00000000";
            if (graphNodes.length < 2) autoAllowance += 500;
        };

        if (p.windowWidth < 768) {
            drawPoints = true;

            titleElt.innerHTML = `Soli State Drive<br>-<br>
            tap to explore the state space`;
            titleElt.style.fontSize = "1.4rem";
            titleElt.style.minWidth = "16ch";

            canvasContainer.addEventListener('touchstart', () => {
                if (autoAllowance < 1000) {
                    autoAllowance += 500;
                    titleElt.style.color = "#00000000";
                }
            });
            const creditLine = document.getElementById('credit-line');
            creditLine.innerHTML = creditLine.innerHTML.replaceAll('|', "<br>-<br>");

            if (!p.getItem('mobileAlert')) {
                alert('come back on a desktop for more features :)');
                p.storeItem('mobileAlert', true);
            }
        }

        // fade in ui
        for (let elt of Array.from(document.getElementsByClassName('clear-text'))) {
            elt.classList.remove('clear-text')
        }

        scaleTarget = Math.min(p.width, p.height) * 1.2;

        globalTempVec = p.createVector();
        trackingVector = rootNode.position.copy();
        p.playFromNode(rootNode);
    };


    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight)
        scaleTarget = Math.min(p.width, p.height) * 1.1;
    }

    p.draw = () => {
        p.background(0);
        p.orbitControl(1, 1, .2);

        // --- repulsion ---
        // barnes–hut repulsion
        const THETA = 0.9;   // lower = more accurate, slower
        const BH_K = 30;   // repulsion strength

        // compute bounds
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        for (const n of graphNodes) {
            if (n.position.x < minX) minX = n.position.x; if (n.position.x > maxX) maxX = n.position.x;
            if (n.position.y < minY) minY = n.position.y; if (n.position.y > maxY) maxY = n.position.y;
            if (n.position.z < minZ) minZ = n.position.z; if (n.position.z > maxZ) maxZ = n.position.z;
        }

        const center = p.createVector(
            (minX + maxX) / 2,
            (minY + maxY) / 2,
            (minZ + maxZ) / 2
        );

        const halfSize = Math.max(
            maxX - minX,
            maxY - minY,
            maxZ - minZ
        ) / 2 + 1;


        // build octree
        if (buildTreeFlag || (p.frameCount - 1) % 10 == 0) {
            octree = new Octree(center, halfSize, p);
            for (const n of graphNodes) {
                octree.insert(n);
            }
            buildTreeFlag = false;
        }

        octree.computeMass();

        // apply repulsion to all nodes
        let factor = -0.001 / Math.sqrt(graphNodes.length);
        for (const n of graphNodes) {
            octree.applyForce(n, THETA, BH_K);
            if (centerAttraction) n.applyForce(globalTempVec.set(n.position).mult(factor));
        }

        // update position of all nodes
        for (const node of graphNodes) {
            node.update(fastPhysics ? speedSlider.value : 1);
        }

        // scale to keep nodes on screen
        p.scale(Math.min(1, scaleTarget / Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2) + Math.pow(maxZ - minZ, 2))));

        // position camera
        if (trackingCamera) {
            trackingVector.lerp(-lastNode.position.x, -lastNode.position.y, -lastNode.position.z, .02)
            p.translate(...trackingVector.array());
        } else {
            let x = 0, y = 0, z = 0;
            for (const n of graphNodes) {
                x += n.position.x
                y += n.position.y
                z += n.position.z
            }
            // let c = p._renderer._curCamera
            p.rotate(p.millis() / 30000, [0, 1, 0])

            p.translate(-x / graphNodes.length, -y / graphNodes.length, -z / graphNodes.length);
        }
        rootNode.position.mult(.99) // always bring root node to world center


        // visit each node, draw it, for each of its children, calculate a spring link force for next frame and draw the link
        let springForce = .01;

        p.beginShape(p.LINES)
        p.stroke(80)
        for (let node of graphNodes) {
            p.push()
            p.translate(...node.position.array())
            if (drawPoints) {
                p.stroke(288 * node.score / 51, 50, 100)
                p.point(0, 0, 0)
            } else {
                p.noStroke();
                p.fill(288 * node.score / 51, 50, 100)
                p.sphere(7, 4, 4)
            }
            p.pop()

            const nx = node.position.x;
            const ny = node.position.y;
            const nz = node.position.z;
            for (let child of node.children) {
                const cx = child.position.x;
                const cy = child.position.y;
                const cz = child.position.z;

                let dx = cx - nx;
                let dy = cy - ny;
                let dz = cz - nz;

                let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                let desired = node.children.length > 2 ? 10 : 1;
                let f = (dist - desired) * 0.9 * springForce / dist;

                dx *= f; dy *= f; dz *= f;

                node.acceleration.x += dx;
                node.acceleration.y += dy;
                node.acceleration.z += dz;

                child.acceleration.x -= dx;
                child.acceleration.y -= dy;
                child.acceleration.z -= dz;

                p.vertex(nx, ny, nz);
                p.vertex(cx, cy, cz);
            }
        }
        p.endShape()

        // updadte info label
        if (p.frameCount % 10 == 0) {
            let nodeCount = fastMode ? Object.keys(visitedSet).length : graphNodes.length;

            nodeInfoLabel.innerHTML =
                `${fastPhysics ? speedSlider.value : 1}x sim speed<br>————————<br>
                 ${nodeCount} node${nodeCount <= 1 ? '' : 's'}<br>
              fps: ${Math.round(p.frameRate())}<br>————————<br>
             explore budget: ${autoAllowance}<br>
           `;
        }

        // automatically explore the tree
        if (autoAllowance > 0) {
            autoAllowance--

            if (treeMode) {
                debugger;
                let termNodes = [];
                for (let node of graphNodes) {
                    if (node.potentialMoves.length || node.oddMoves.length) {
                        termNodes.push(node);
                    }
                }
                for (let node of termNodes) {
                    if (node.potentialMoves.length) {
                        p.progressNode(node, node.potentialMoves.shift())
                    } else if (node.oddMoves.length) {
                        p.progressNode(node, node.oddMoves.shift())
                    }
                }
                treeMode = false;
                return;
            }


            while (fastMode && autoAllowance && lastNode.potentialMoves.length) {
                autoAllowance--
                p.progressNode(lastNode, lastNode.potentialMoves.shift());
            }

            if (lastNode.potentialMoves.length) {
                p.progressNode(lastNode, lastNode.potentialMoves.shift());
                return;
            } else if (lastNode.oddMoves.length) {
                p.progressNode(lastNode, lastNode.oddMoves.shift());
                return;
            }
            if (backtracking && lastNode.parent) {
                lastNode = lastNode.parent;
                autoAllowance++;
                return;
            }
            p.playFromNode(p.getNextNode())
        } else {
            automateButton.classList.remove('toggled')
        }
    }

    p.renderSVG = () => {
        const viewMat = p._renderer.uMVMatrix.mat4;        // ModelView
        const projMat = p._renderer.uPMatrix.mat4;         // Projection
        var linkXML = [];
        var nodeXML = [];



        for (let node of graphNodes) {
            let coords = mulMat4Vec4(projMat, mulMat4Vec4(viewMat, [node.position.x, node.position.y, node.position.z, 1]));
            coords[0] = (coords[0] / coords[3] * 0.5 + 0.5) * p.width;
            coords[1] = (1 - (coords[1] / coords[3] * 0.5 + 0.5)) * p.height;
            nodeXML.push(`  <circle cx="${Math.round(coords[0] * 10000) / 10000}" cy="${Math.round(coords[1] * 10000) / 10000}" r="${1}" />\n`);


            //links
            for (let child of node.children) {
                let childCoords = mulMat4Vec4(projMat, mulMat4Vec4(viewMat, [child.position.x, child.position.y, child.position.z, 1]));
                childCoords[0] = (childCoords[0] / childCoords[3] * 0.5 + 0.5) * p.width;
                childCoords[1] = (1 - (childCoords[1] / childCoords[3] * 0.5 + 0.5)) * p.height;

                linkXML.push(`  <line x1="${coords[0]}" y1="${coords[1]}" x2="${childCoords[0]}" y2="${childCoords[1]}" />\n`)
            }
        }


        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${p.width}" height="${p.height}">
                             <style> circle, line {stroke: black; fill: white; }</style>\n`;
        for (let line of linkXML) {
            svgContent += line
        }
        for (let line of nodeXML) {
            svgContent += line;
        }
        svgContent += `</svg>`;

        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        let now = new Date();
        link.download = "ssd_render_" + now.toLocaleTimeString().slice(0, -3) + ".svg"; // Filename for the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Release the object URL
        URL.revokeObjectURL(url);


        function mulMat4Vec4(m, v) {
            return [
                m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
                m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
                m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14],
                m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15],
            ];
        }
    }


    p.getNextNode = () => {
        let keys = searchDFS ? Object.keys(visitedSet).reverse() : Object.keys(visitedSet);
        for (const key of keys) {
            if (visitedSet[key].potentialMoves.length || visitedSet[key].oddMoves.length) {
                return visitedSet[key]
            }
        }

        // if we get here, the statespace is fully explored, kill automation for safety
        autoAllowance = 0;
        return false;
    }

    // depreceated
    p.getBestUnfinishedNode = () => {
        let maxScore = -99;
        let maxNode = rootNode;
        for (const g of graphNodes) {
            if (g.score > maxScore) {
                maxScore = g.score;
                if (g.potentialMoves.length || g.oddMoves.length) {
                    maxNode = g;
                }
            }
        }
        if (maxNode.potentialMoves.length || maxNode.oddMoves.length) {
            return maxNode;
        } else {
            for (const key in visitedSet) {
                if (visitedSet[key].potentialMoves.length || (allowOddMoves && visitedSet[key].oddMoves.length)) {
                    return visitedSet[key];
                }
            }
        }
        // if we get here, the statespace is fully explored, kill automation for safety
        autoAllowance = 0;
        return false;
    }

    p.removeLowScoreNodes = () => {
        // find lowest score
        let minScore = 99999;
        for (const node of graphNodes) {
            if (node.score < minScore) {
                minScore = node.score;
            }
        }
        // remove low scoring nodes from graph
        let index = 0;
        let c = 99
        while (index < graphNodes.length && c--) {
            let curr = graphNodes[index];
            if (curr == rootNode) continue;
            if (curr.score > minScore) {
                index++;
                continue;
            }

            // remove node
            curr.children.forEach(element => {
                element.parent = curr.parent;
            });
            curr.parent.children.splice(curr.parent.children.indexOf(curr), 1)
            curr.parent.children.push(...curr.children);
            graphNodes.splice(index, 1)
        }
    }

    p.keyPressed = () => {
        switch (p.key) {
            case 'p':
                p.save();
                break;

            // node selectors
            case 'r':
                p.playFromNode(rootNode);
                break;
            case 'z':
                if (lastNode.parent) p.playFromNode(lastNode.parent)
                break
            case 'v':
                p.removeLowScoreNodes();
                break;

            // automation
            case 'a':
                autoAllowance += 500;
                automateButton.classList.add('toggled')
                titleElt.style.color = "#00000000"
                break;
            case 's':
                autoAllowance += 1;
                titleElt.style.color = "#00000000"
                break;
            case 'q':
                autoAllowance = 0;
                break;
            case 'j':
                fastMode = !fastMode;
                break;
            case 'k':
                graphNodes = [];
                for (const key in visitedSet) {
                    graphNodes.push(visitedSet[key])
                }
                break;
            case 't':
                treeMode = true;
                autoAllowance = 1;
                break

            // node graph simulation
            case 'f':
                fastPhysicsButton.onclick();
                break;
            case 'x':
                centerAttraction = !centerAttraction
                break;
            case 'w':
                let scale = graphNodes[graphNodes.length - 1].position.mag() / 2;
                for (const node of graphNodes) {
                    node.position = p5.Vector.random3D().mult(scale);
                }
                break;

            // camera / scene
            case 'c':
                trackingCamera = !trackingCamera;
                if (trackingCamera) {
                    trackingVector = lastNode.position.copy().mult(-1);
                    cameraButton.classList.add('toggled')
                } else {
                    cameraButton.classList.remove('toggled')
                }
                break;
            case 'n':
                newGameButton.onclick();
                autoAllowance = 0;
                break;
            case 'e':
                p.renderSVG();
                break;
        }
    };

    p.playFromNode = (node) => {
        if (!node) return;
        node.optionsToHTML(optionsContainer, p.progressNode)
        node.board.toHTML(boardDisplay)
        lastNode = node;
    }

    p.progressNode = (node, move) => {
        let newBoard = node.board.clone();
        newBoard.performMove(move);

        if (visitedSet[newBoard.hashString()]) {
            let collidingNode = visitedSet[newBoard.hashString()]
            node.children.push(collidingNode)
            p.playFromNode(collidingNode)
        } else {
            let newNode = new Node(p, newBoard, node)
            node.children.push(newNode);
            if (!fastMode) graphNodes.push(newNode)
            visitedSet[newBoard.hashString()] = newNode;
            p.playFromNode(newNode)
            if (newBoard.inWinState()) {
                autoAllowance = 0;
            }
        }
    }

    p.filterTopScores = () => {
        let topScore = -9999;
        for (const [key, val] of Object.entries(visitedSet)) {
            topScore = Math.max(topScore, val.score);
        }
        graphNodes = graphNodes.filter((n) => { return n.score >= topScore });
        lastNode = p.random(graphNodes);
        p.playFromNode(lastNode)
    }
};


class Node {
    constructor(p, board, parent = null) {
        this.p = p;
        this.board = board;
        this.parent = parent;
        this.children = [];

        this.score = board.score();
        // moves
        this.allMoves = board.findAllLegalMoves();
        this.analyzeMoves(this.allMoves);


        // --- 3D graph physics fields ---
        this.position = parent
            ? parent.position.copy().add(new p5.Vector.random3D().setMag(10))
            : p.createVector(0, 0, 0);

        if (parent && parent.parent && parent.children.length < 1) {
            globalTempVec.set(parent.position).sub(parent.parent.position).setMag(20);
            this.position = p.createVector().add(parent.position).add(globalTempVec);
        }

        this.velocity = p.createVector(0, 0, 0);
        this.acceleration = p.createVector(0, 0, 0);
    }

    // --- 3D physics & rendering ---
    applyForce(force) {
        this.acceleration.add(force);
    }

    update(crankFactor = 1) {
        this.velocity.add(this.acceleration);
        if (this.velocity.magSq() > 400) this.velocity.setMag(20); // speed limit
        globalTempVec.set(this.velocity.mult(0.9))
        globalTempVec.x *= crankFactor;
        globalTempVec.y *= crankFactor;
        globalTempVec.z *= crankFactor;
        this.position.add(globalTempVec);
        this.acceleration.mult(0);
    }

    optionsToHTML(element, handlerFn) {
        element.innerHTML = '';
        for (const move of this.allMoves) {
            const option = document.createElement('p');
            option.classList.add('option');
            if (this.potentialMoves.includes(move) == false && this.oddMoves.includes(move) == false) option.classList.add('explored');

            // --- red card color parsing preserved ---
            let str = move.string, span;
            while (str.includes('\x1b[31m')) {
                let idx = str.indexOf('\x1b[31m');
                span = document.createElement('span');
                span.innerText = str.slice(0, idx);
                option.appendChild(span);

                span = document.createElement('span');
                span.innerText = str.slice(idx + 5, idx + 8);
                span.style.color = 'red';
                option.appendChild(span);

                str = str.slice(idx + 12);
            }
            if (str) {
                span = document.createElement('span');
                span.innerText = str;
                option.appendChild(span);
            }

            option.onclick = () => {
                handlerFn(this, move)
                if (this.potentialMoves.includes(move)) {
                    this.potentialMoves.splice(this.potentialMoves.indexOf(move), 1)
                } else {
                    this.oddMoves.splice(this.oddMoves.indexOf(move), 1)
                }
                return false;
            }
            element.appendChild(option);
        };
    }

    analyzeMoves(moveSet) {
        this.potentialMoves = [];
        this.oddMoves = [];

        this.potentialMoves = this.potentialMoves.concat(moveSet.filter((m) => { return m.string.includes('build pile') }))
        if (this.potentialMoves.length) return; // special case: always deposit

        this.potentialMoves = this.potentialMoves.concat(moveSet.filter((m) => { return m.string.includes('move') && !m.string.includes('FS') }))
        this.potentialMoves = this.potentialMoves.concat(moveSet.filter((m) => { return m.string.includes('draw') && !m.string.includes('FS') }))

        this.potentialMoves = this.potentialMoves.concat(moveSet.filter((m) => { return m.string.includes('reveal') }))

        this.oddMoves = moveSet.filter((m) => { return !this.potentialMoves.includes(m) })
    }
}


// run sketch
new p5(sketch)
