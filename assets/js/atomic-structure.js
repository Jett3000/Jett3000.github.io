
const runAtomicStructureWidget =
    ({container, particleInteractivity, atomData, colors = widgetColors}) => {
      const getThemeColors =
          (theme) => {
            // Edit these colors to change the colors
            // of specific elements of the pie chart
            const themes = {
              light: {
                backgroundColor: '#f5f7fa',
                labelTextColor: '#000000',
              },
              dark: {
                backgroundColor: '#1D2126',
                labelTextColor: '#FFFFFF',
              },
            }

            return themes[theme]
          }

      const defaultTheme = 'light';

      // Define global variables that contain colors used by the widget
      atomicStructureThemeColors = getThemeColors(defaultTheme);

      const setThemeColors = (theme) => {
        atomicStructureThemeColors = getThemeColors(theme)
      };

      const themeSetCallback = (event) => {
        setThemeColors(event.detail.newTheme)
      };

      // Change the theme colors when the document theme is changed
      document.addEventListener('themeset', themeSetCallback);

      const node = document.getElementById(container);

      const answerHiddenInput = document.createElement('input');

      // Configure the hidden input
      answerHiddenInput.type = 'hidden';
      answerHiddenInput.name = 'answers[]';
      answerHiddenInput.value = '';

      const updateHiddenInputs = (output) => {
        answerHiddenInput.value = encodeURIComponent(
            JSON.stringify(output.map((segment) => segment.value)))
      };

      // Insert the hidden input into the html
      if (particleInteractivity.protons || particleInteractivity.electrons ||
          particleInteractivity.neutrons || particleInteractivity.shells)
        node.append(answerHiddenInput);

      const heightToWidthRatio = 5 / 8;

      const getHeightOfCanvas = () => {
        const windowHeight = window.innerHeight ||
            document.documentElement.clientHeight || document.body.clientHeight
        const maxHeight = windowHeight * (0.55);

        let height = node.clientWidth * heightToWidthRatio;

        if (height > maxHeight) {
          height = maxHeight
        };

        return height;
      };

      let dims = {
        w: node.clientWidth,
        h: getHeightOfCanvas(),
      };


      // Define the p5 sketch methods
      const sketch = (p) => {
        p.setup = () => {
          // create the canvas
          p.createCanvas(dims.w, dims.h)

          // Create the widget obejct
          p.widgetObject = new AtomicStructureWidget(
              {particleInteractivity, atomData, colors}, p, updateHiddenInputs);


          // TODO: make colors optional
          // if (!(typeof widgetColors === 'undefined') && widgetColors !==
          // null) {
          //   widgetObject = new AtomicStructureWidget(
          //       particleInteractivity, atomData, colors, p,
          //       updateHiddenInputs)
          // }
          // else {
          //   widgetObject = new AtomicStructureWidget(
          //       {segments, interactive}, p, updateHiddenInputs)
          // }
        };

        p.draw = () => {
          p.background(atomicStructureThemeColors.backgroundColor);
          p.widgetObject.draw();
        };

        p.touchStarted = () => {
          return true  // prevents touches firing twice on mobile
        };

        p.mousePressed = () => {
          p.widgetObject.handleClickStart(p.createVector(p.mouseX, p.mouseY));
        };

        p.mouseReleased = () => {
          p.widgetObject.handleClickEnd(p.createVector(p.mouseX, p.mouseY));
        };

        p.windowResized = () => {
          p.resizeCanvas(0, 0);

          dims = {
            w: node.clientWidth,
            h: getHeightOfCanvas(),
          };

          p.resizeCanvas(dims.w, dims.h);
          p.widgetObject.resize();
        };
      };  // end sketch instance methods

      // Create the canvas and run the sketch in the html node.
      const sketchInstance = new p5(sketch, node);

      const removeAtomicStructure = () => {
        // Remove the p5 sketch instance
        sketchInstance.remove()

        // Remove the theme change callback
        document.removeEventListener('themeset', themeSetCallback)

        // Remove any html elements created by this widget
        node.innerHTML = ''
      };

      return removeAtomicStructure;
    }

class AtomicStructureWidget {
  /**
   * Instantiate an atomic structure widget
   * @param inputs
   * Inputs:
   * - particleInteractivity:
   *    - Protons: boolean / display or hide
   *    - Electrons: boolean / display or hide
   *    - Neutrons: boolean / display or hide
   *    - Shells: boolean / display or hide
   * - atomData:
   *    - protons: integer / number of protons
   *    - neutrons: integer / number of neutrons
   *    - shells: array / number of electrons per shell
   *    - atomCard: boolean / show the atom's period table entry
   * - colors (optional): array // [protonHexCode, neutronHexCode,
   * electronHexCode]
   * @param {p5} p The p5.js sketch object
   */
  constructor(widgetConfig, p, updateHiddenInputs) {
    // read configuration data
    this.particleInteractivity = widgetConfig.particleInteractivity;
    this.atomData = widgetConfig.atomData;
    this.colors = widgetConfig.colors;

    // link to the sketch instance and document input/outputs
    this.p = p;
    this.updateHiddenInputs = updateHiddenInputs;
    this.lastInputFrame = 0;
    this.lastInputWasAdjuster = false;
    this.mouseVec = this.p.createVector();

    // initialize particle arrays
    this.activeProtons = 0;
    this.activeNeutrons = 0;
    this.activeElectrons = 0;
    this.activeShells = 0;
    this.nucleusParticles = [];
    this.shells = [];
    this.shellParticles = [];
    this.shellParticleCounts = [];

    // initialize size dependent variables
    this.atomCenter;
    this.particleSize;
    this.nucleusSpreadFactor;
    this.paletteX;
    this.paletteY;
    this.paletteWidth;
    this.paletteHeight;
    this.paletteLabelOffset;

    // set p5 instance's text alignment
    this.p.textAlign(this.p.RIGHT, this.p.CENTER);
    // complete size dependent setup
    this.resize();

    // add shells and particles according to config
    // protons
    for (let i = 0; i < widgetConfig.atomData.protons; i++) {
      this.addElement('proton');
      this.nucleusParticles[this.nucleusParticles.length - 1].pos =
          this.atomCenter.copy();
    }
    // neutrons
    for (let i = 0; i < widgetConfig.atomData.neutrons; i++) {
      this.addElement('neutron');
      this.nucleusParticles[this.nucleusParticles.length - 1].pos =
          this.atomCenter.copy();
    }
    // shells and electrons
    if (widgetConfig.atomData.shells.length > 0) {
      for (const shellCount of widgetConfig.atomData.shells) {
        this.addElement('shell');
        for (let i = 0; i < shellCount; i++) {
          this.addElement('electron');
          let electron = this.shellParticles[this.shellParticles.length - 1];
          electron.pos = this.atomCenter.copy();
          electron.shell = this.activeShells;
        }
      }
    } else {
      this.activeShells = 1;
    }
  }

  // used for canvas-size-dependent elements
  resize() {
    // set the center of the atom model
    this.atomCenter = this.p.createVector(
        this.p.width * 3 / 5,
        this.p.height / 2,
    );

    // set the particle size and spread factor
    this.particleSize = this.p.width * 0.05;
    this.nucleusSpreadFactor = this.particleSize * 0.5;

    // create adjuster UI elements for the model
    let adjusterDims =
        this.p.createVector(this.p.textWidth('Electrons: 999') * 2, 0);
    adjusterDims.y = adjusterDims.x / 4;
    let adjusterCenter =
        this.p.createVector(adjusterDims.x * 2 / 3, adjusterDims.x * 2 / 3);
    let adjusterSpacing = adjusterDims.y * 1.1;

    this.shellAdjuster = new ElementAdjuster(
        adjusterCenter.copy(), adjusterDims, 'Shells: ', 'shell', this);
    adjusterCenter.y += adjusterSpacing;

    this.protonAdjuster = new ElementAdjuster(
        adjusterCenter.copy(), adjusterDims, 'Protons: ', 'proton', this);
    adjusterCenter.y += adjusterSpacing;

    this.neutronAdjuster = new ElementAdjuster(
        adjusterCenter.copy(), adjusterDims, 'Neutrons: ', 'neutron', this);
    adjusterCenter.y += adjusterSpacing;

    this.electronAdjuster = new ElementAdjuster(
        adjusterCenter.copy(), adjusterDims, 'Electrons: ', 'electron', this);

    this.adjusters = [
      this.shellAdjuster, this.protonAdjuster, this.neutronAdjuster,
      this.electronAdjuster
    ];
  }

  draw() {
    // draw the adjuster palette
    this.adjusters.forEach(a => a.draw());

    // draw the protons and neutrons that have been added to the scene
    this.nucleusParticles.forEach(particle => particle.draw());

    // draw electron shells & distribute electrons
    for (let shellIndex = 0; shellIndex < this.activeShells; shellIndex++) {
      // draw orbital path
      let shellRadius = this.minShellRadius() + shellIndex * this.particleSize;
      if (shellRadius + this.particleSize > this.atomCenter.y) {
        this.shrinkAtom();
        return;
      }

      this.p.push();
      this.p.noFill();
      this.p.stroke(0);
      this.p.ellipse(this.atomCenter.x, this.atomCenter.y, shellRadius * 2);
      this.p.pop();

      // envenly distribute electrons on shells
      let currentShellElectrons =
          this.shellParticles.filter(sp => {return sp.shell == shellIndex + 1});
      currentShellElectrons.forEach((electron, i) => {
        let angle = this.p.TAU * i /
            currentShellElectrons.length;  // distrubute on shell
        // update electron target position
        electron.targetPos = p5.Vector.fromAngle(angle).mult(shellRadius);
        electron.targetPos.add(this.atomCenter);
      });
    }

    // draw electrons
    this.shellParticles.forEach(p => p.draw());

    // change the cursor if hovering on an interactive element
    this.mouseVec.x = this.p.mouseX;
    this.mouseVec.y = this.p.mouseY;
    // nucleus particles
    for (const p of this.nucleusParticles) {
      if (p.clickWithin(this.mouseVec)) {
        this.p.cursor(this.p.HAND)
        return;
      }
    }
    // electrons
    for (const p of this.shellParticles) {
      if (p.clickWithin(this.mouseVec)) {
        this.p.cursor(this.p.HAND)
        return;
      }
    }
    // palette adjusters
    for (const adjuster of this.adjusters) {
      if (adjuster.mouseOnAdd(this.mouseVec) ||
          adjuster.mouseOnSubtract(this.mouseVec)) {
        this.p.cursor(this.p.HAND)
        return;
      }
    };

    this.p.cursor(this.p.ARROW);
  }

  addElement(element) {
    let particle;
    switch (element) {
      case 'shell':
        this.activeShells++;
        break;
      case 'proton':
      case 'neutron':
        let color;
        if (element == 'proton') {
          color = this.colors[0];
          this.activeProtons++;
        } else {
          color = this.colors[1];
          this.activeNeutrons++;
        }
        // create new particle
        particle = new AtomicParticle(
            this.p.createVector(this.p.mouseX, this.p.mouseY),
            this.particleSize, color, true, this.p);
        // calculate rest position
        particle.targetPos =
            this.indexToRestPosition(this.nucleusParticles.length);
        // add to the model
        this.nucleusParticles.push(particle);
        break;
      case 'electron':
        // create new particle
        particle = new AtomicParticle(
            this.p.createVector(this.p.mouseX, this.p.mouseY),
            this.particleSize * 0.66, this.colors[2], true, this.p);
        // add to the model
        this.shellParticles.push(particle);
        this.activeElectrons++;

        // if there are no shells yet, create one
        if (this.activeShells < 1) {
          this.activeShells++;
        }
        break;
    }

    this.adjusters.forEach(adjuster => adjuster.updateLabelCount());
  }

  subtractElement(element) {
    switch (element) {
      case 'shell':
        // remove shell particles on the outermost shell
        this.shellParticles = this.shellParticles.filter(
            e => {return e.shell != this.activeShells});
        // set the new number of shells
        this.activeShells = this.activeShells > 0 ? this.activeShells - 1 : 0;
        break;
      case 'proton':
      case 'neutron':
        let targetColor;
        if (element == 'proton') {
          targetColor = this.colors[0];
          this.activeProtons =
              this.activeProtons > 0 ? this.activeProtons - 1 : 0;
        } else {
          targetColor = this.colors[1];
          this.activeNeutrons =
              this.activeNeutrons > 0 ? this.activeNeutrons - 1 : 0;
        }
        for (let i = this.nucleusParticles.length - 1; i >= 0; i--) {
          if (this.nucleusParticles[i].color == targetColor) {
            // remove from the model
            this.nucleusParticles.splice(i, 1);
            // remap rest positions
            this.nucleusParticles.forEach((p, i) => {
              p.targetPos = this.indexToRestPosition(i);
            });
            return;
          }
        }
        break;
      case 'electron':
        this.shellParticles.pop();
        this.activeElectrons--;
        break;
    }
    this.adjusters.forEach(adjuster => adjuster.updateLabelCount());
  }

  shrinkAtom() {
    this.particleSize *= 0.9;
    this.nucleusSpreadFactor = this.particleSize * 0.5;

    this.nucleusParticles.forEach((particle, i) => {
      particle.size = this.particleSize;
      particle.targetPos = this.indexToRestPosition(i);
    });
    this.shellParticles.forEach((particle, i) => {
      particle.size = this.particleSize * 0.66;
    });
  }

  indexToRestPosition(i) {
    // based on sunflower seed dispersal pattern
    let theta = (i + 1) * this.p.TAU / (1.618 * 1.618);
    let r = this.nucleusSpreadFactor * this.p.sqrt(i);

    let position =
        this.p.createVector(r * this.p.cos(theta), r * this.p.sin(theta));
    position.add(this.atomCenter)

    return position;
  }

  minShellRadius() {
    return this.nucleusSpreadFactor *
        this.p.sqrt(this.p.max(2, this.nucleusParticles.length)) +
        this.particleSize;
  }

  handleClickStart() {
    // register click with widget state
    this.lastInputFrame = this.p.frameCount;
    this.mouseVec.x = this.p.mouseX;
    this.mouseVec.y = this.p.mouseY;

    // check if user clicked on adjuster cap
    this.lastInputWasAdjuster = false;
    for (const adjuster of this.adjusters) {
      if (adjuster.mouseOnAdd(this.mouseVec)) {
        adjuster.addElement();
        this.lastInputWasAdjuster = true;
      }
      if (adjuster.mouseOnSubtract(this.mouseVec)) {
        adjuster.subtractElement();
        this.lastInputWasAdjuster = true;
      }
    };

    // if the user clicked an electron or nuclear particle, add it to their
    // grasp
    for (const particle of this.nucleusParticles) {
      if (particle.clickWithin(this.mouseVec)) {
        particle.inUserGrasp = true;
        return;
      }
    }
    for (const particle of this.shellParticles) {
      if (particle.clickWithin(this.mouseVec)) {
        particle.inUserGrasp = true;
        particle.shell = 0;
        // return;
      }
    }
  }

  handleClickEnd(mouseVec) {
    // delete quickly clicked particles
    if (this.p.frameCount - this.lastInputFrame < 10 &&
        !this.lastInputWasAdjuster) {
      // delete nucleus particles under the mouse
      this.nucleusParticles =
          this.nucleusParticles.filter(p => {return !p.inUserGrasp});
      // delete shell particles under the mouse
      this.shellParticles =
          this.shellParticles.filter(p => {return !p.inUserGrasp});
    }

    // release any dragged particles
    for (const particle of this.nucleusParticles) {
      particle.inUserGrasp = false;
    }
    for (const particle of this.shellParticles) {
      if (particle.inUserGrasp) {
        // need to calculate which shell it lands on
        let atomicRadius = this.atomCenter.dist(particle.pos);
        atomicRadius -= this.minShellRadius();
        let shell = 1 + this.p.floor(0.5 + atomicRadius / this.particleSize);
        particle.shell = this.p.constrain(shell, 1, this.activeShells);
      }
      particle.inUserGrasp = false;
    }
  }
}

class AtomicParticle {
  constructor(pos, size, color, interactive, p) {
    this.pos = pos;
    this.targetPos = pos.copy();
    this.size = size;
    this.color = color;
    this.interactive = interactive;
    this.p = p;
    this.inUserGrasp = false;
  }

  draw() {
    if (this.inUserGrasp) {
      this.pos.x = this.p.mouseX;
      this.pos.y = this.p.mouseY;
    } else {
      this.pos.lerp(this.targetPos, 0.05);
    }

    this.p.push();
    this.p.fill(this.color);
    this.p.stroke(0);
    this.p.ellipse(this.pos.x, this.pos.y, this.size);
    this.p.pop();
  }

  clickWithin(mouseVec) {
    return mouseVec.dist(this.pos) < this.size / 2;
  }
}

class ElementAdjuster {
  constructor(centerPos, dims, label, element, widgetController) {
    // link to controller
    this.widgetController = widgetController;
    this.p = widgetController.p;

    // positioning
    this.centerPos = centerPos;
    this.dims = dims;
    this.capDims = dims.copy();
    this.capDims.x = this.dims.x / 4;
    this.leftCapCenter = this.p.createVector(
        this.centerPos.x - (this.dims.x - this.capDims.x) / 2,
        this.centerPos.y);
    this.rightCapCenter = this.p.createVector(
        this.centerPos.x + (this.dims.x - this.capDims.x) / 2,
        this.centerPos.y);

    // label
    this.element = element;
    this.label = label;
    this.labelCount = 0;
    this.updateLabelCount();
  }

  draw() {
    this.p.push();
    this.p.rectMode(this.p.CENTER);
    this.p.fill(0, 100);
    this.p.noFill();
    // draw outer container
    this.p.rect(
        this.centerPos.x, this.centerPos.y, this.dims.x, this.dims.y, 10);
    // draw -/+ caps
    this.p.rect(
        this.leftCapCenter.x, this.leftCapCenter.y, this.capDims.x,
        this.capDims.y, 10, 0, 0, 10);
    this.p.rect(
        this.rightCapCenter.x, this.rightCapCenter.y, this.capDims.x,
        this.capDims.y, 0, 10, 10, 0);
    // draw the -/+ signs
    this.p.stroke(0);
    this.p.strokeWeight(1);
    // minus sign
    this.p.line(
        this.leftCapCenter.x - this.capDims.x / 3, this.leftCapCenter.y,
        this.leftCapCenter.x + this.capDims.x / 3, this.leftCapCenter.y);
    // plus sign
    this.p.line(
        this.rightCapCenter.x - this.capDims.x / 3, this.rightCapCenter.y,
        this.rightCapCenter.x + this.capDims.x / 3, this.rightCapCenter.y);
    this.p.line(
        this.rightCapCenter.x, this.rightCapCenter.y - this.capDims.x / 3.5,
        this.rightCapCenter.x, this.rightCapCenter.y + this.capDims.x / 3.5);

    // draw the label
    this.p.fill(0);
    this.p.noStroke();
    this.p.text(
        this.label + this.labelCount,
        this.rightCapCenter.x - this.capDims.x * 2 / 3, this.centerPos.y);

    this.p.pop();
  }

  updateLabelCount() {
    switch (this.element) {
      case 'shell':
        this.labelCount = this.widgetController.activeShells;
        break;
      case 'proton':
        this.labelCount = this.widgetController.activeProtons;
        break;
      case 'neutron':
        this.labelCount = this.widgetController.activeNeutrons;
        break;
      case 'electron':
        this.labelCount = this.widgetController.shellParticles.length;
        break;
    }
  }

  addElement() {
    this.widgetController.addElement(this.element);
    this.updateLabelCount();
  }

  subtractElement() {
    this.widgetController.subtractElement(this.element);
    this.updateLabelCount();
  }

  mouseOnSubtract(mouseVec) {
    return this.p.abs(mouseVec.x - this.leftCapCenter.x) < this.capDims.x / 2 &&
        this.p.abs(mouseVec.y - this.leftCapCenter.y) < this.capDims.y / 2;
  }

  mouseOnAdd(mouseVec) {
    return this.p.abs(mouseVec.x - this.rightCapCenter.x) <
        this.capDims.x / 2 &&
        this.p.abs(mouseVec.y - this.rightCapCenter.y) < this.capDims.y / 2;
  }
}