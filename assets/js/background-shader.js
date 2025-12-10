let shaderObject;
let seedOffset;
let scrollOffset = 0;


let lastX = 0;
let lastY = 0;

let mouseVec;


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  let c = createCanvas(windowWidth, windowHeight, WEBGL);

  //if the canvas loads, remove body background color
  if (c) {
    document.getElementById('body').style = '';
  }

  // setup shaders
  shaderObject = createShader(vert, frag)
  seedOffset = random(TWO_PI);

  //allocate mouse vector
  mouseVec = createVector(width / -min(width, height), 2 * (height / 2) / min(width, height));
}


function draw() {
  // mouse interactions
  // accrue mouse travel distance
  scrollOffset += abs(lastX - mouseX) + abs(lastY - mouseY);
  lastX = mouseX;
  lastY = mouseY;
  scrollOffset *= 0.999;
  // find mouse pos in shader coord space for distance calculation 
  let mx = 2 * (mouseX - width / 2) / min(width, height);
  let my = 2 * (mouseY - height / 2) / -min(width, height);
  mouseVec.lerp(mx, my, 0, .1);

  shader(shaderObject)
  shaderObject.setUniform('u_mouse', [mouseVec.x, mouseVec.y]);
  shaderObject.setUniform('u_resolution', [width, height])
  shaderObject.setUniform('u_time', millis() / 1000.0)
  shaderObject.setUniform('u_seed', seedOffset)
  shaderObject.setUniform('u_scroll', scrollOffset)


  rect(0, 0, width, height)

  // fixes mobile browser viewport issues when browser UI hides
  if (frameCount < 20 && frameCount % 4 == 0) {
    windowResized();
  }
}


// shader code section
let vert = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;
uniform float time;

void main() {

vTexCoord = aTexCoord;

  vec4 pos4 = vec4(aPosition, 1.0);
  pos4.xy =  pos4.xy * 2.0 -1.0;

  gl_Position = pos4;
}
`;

let frag = `
// heavily inspired by https://www.shadertoy.com/view/lX2GDR

#ifdef GL_ES
precision mediump float;
#endif

// sketch uniforms
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_seed;
uniform float u_scroll;

// grain params
#define SPEED 1.0
#define MEAN 0.6
#define VARIANCE .95

// design stuff
float speed = 0.15;
vec3 jettPink = vec3(0.973,0.784,0.863);
vec3 collectiveBlue = vec3(0.259,0.749,0.867);


// noise helper function
float gaussian(float z, float u, float o) {
  return (1.0 / (o * sqrt(2.0 * 3.1415))) *
         exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
}

void main() {
  // prepare coordinates
  float mr = min(u_resolution.x, u_resolution.y);
  vec2 uv = (gl_FragCoord.xy * 1.0 - u_resolution.xy) / mr;

  float currTime = u_time * speed;

float mouseD = distance(uv, u_mouse) * 4.0;

  float d = -currTime;
  float a = 0.0 + u_seed / 3.1415;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(u_seed + i - d - a * uv.x);
    d += sin(u_scroll *0.001 + u_seed + uv.y * i + a + mouseD);
  }
  d += currTime;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);

  // extract grayscale from noise field
  float mask = (col.x + col.y + col.z) / 4.0;
  mask = pow(mask, 6.0);
  mask = 1.0 + mask;

  // add grain
  float t = u_time * float(SPEED);
  float seed = dot(uv, vec2(102.9898, 78.233));
  float grain = fract(sin(seed) * 43758.5453 + t);
  grain = gaussian(grain, float(MEAN), float(VARIANCE) * float(VARIANCE)) + 0.5;

  gl_FragColor = vec4(jettPink * mask, 1.0);
}
  `;