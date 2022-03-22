var nodeNum = 100;
var nodes = [];
var nodePool = [];
var currentNode = null;
var startTime = 0;
const primSketchNode = document.getElementById("prim-holder");

function setup() {
  let c = createCanvas(primSketchNode.clientWidth, primSketchNode.clientHeight);
  c.parent(primSketchNode);
  stroke(255);
  fill(255);

  for (let i = 0; i < nodeNum; i++) {
    let newNode = new Node(i);
    nodes.push(newNode);
    nodePool.push(newNode);
    newNode.show();
  }

  currentNode = random(nodePool);
  startTime = millis();
}

// the function that draws to the screen each frame.
function draw() {
  if (nodePool.length > 0) {
    primStep();
  } else {
    for (let node of nodes) {
      node.inTree = false;
      node.primParent = null;
      node.primWeight = Infinity;
      nodePool.push(node);
    }

    let endTime = millis() - startTime;

    print(
      "Making and resetting tree took " + Math.round(endTime) / 1000 + "s."
    );

    currentNode = random(nodePool);
    background(14, 90);
    startTime = millis();
  }
}

// this function contains the logic from the main loop
// of Prim's MST algorithm: pop the next node, add it to the tree,
// update the rest of the nodes as needed. during the updating step,
// the minimum weight is tracked to find the next node
function primStep() {
  // draw a line from the current node to its parent
  // by drawing the line to the screen, the node is added to the tree
  // with the line serving as its edge
  if (currentNode.primParent != null) {
    line(
      currentNode.pos.x,
      currentNode.pos.y,
      currentNode.primParent.pos.x,
      currentNode.primParent.pos.y
    );
  }

  // splice the node from the nodePool
  nodePool.splice(nodePool.indexOf(currentNode), 1);

  // update the Nodes in the nodePool with new weights
  // and find the next node to be added
  let minCost = Infinity;
  let minIndex = 0;
  let nextFrameNode = null;

  for (let node of nodePool) {
    let cost = manhattanDist(currentNode, node);
    if (cost < node.primWeight) {
      node.primParent = currentNode;
      node.primWeight = cost;
    }

    if (node.primWeight <= minCost) {
      minCost = node.primWeight;
      nextFrameNode = node;
    }
  }
  currentNode = nextFrameNode;
}

function resetTree() {
  for (let node of nodes) {
    node.primParent = null;
    node.primWeight = Infinity;
    nodePool.push(node);
  }
  currentNode = random(nodePool);
}

// returns the node from a nodePool with the lowest cost edge to its parent
function nextNodeToAdd(nodePool) {
  let minWeight = Infinity;
  let minIndex = 0;
  for (let i = 0; i < nodePool.length; i++) {
    if (nodePool[i].primWeight < minWeight) {
      minWeight = nodePool[i].primWeight;
      minIndex = i;
    }
  }
  return nodePool[minIndex];
}

// returns the manhattan distance between two nodes, faster to calculate
// and just as good for comparing distances
function manhattanDist(n1, n2) {
  dx = abs(n1.pos.x - n2.pos.x);
  dy = abs(n1.pos.y - n2.pos.y);
  return (dy + dx) * random(0.7, 1.3);
}

// the Node object class
class Node {
  constructor(nodeCode) {
    //node code used for quick array access
    this.code = nodeCode;

    // initialized random position with some padding around the margins
    this.pos = createVector(
      random(width * 0.05, width * 0.95),
      random(height * 0.05, height * 0.95)
    );

    // variables to hold the current parent and weight for Prim's MST
    this.primParent = null;
    this.primWeight = Infinity;

    // variables to assist in drawing the node/tree
    this.inTree = false;
    this.beingAdded = false;
  }

  show() {
    ellipse(this.pos.x, this.pos.y, 4, 4);
  }
}
