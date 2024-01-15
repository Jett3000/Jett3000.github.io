
const runAtomicStructureWidget =
    ({container, particleInteractivity, atomData, atomColors}) => {
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

      // create and configure the hidden input
      const answerHiddenInput = document.createElement('input');
      answerHiddenInput.type = 'hidden';
      answerHiddenInput.name = 'answers[]';
      answerHiddenInput.value = '';

      const updateHiddenInputs = (output) => {
        answerHiddenInput.value = encodeURIComponent(JSON.stringify(output));
      };

      // Insert the hidden input into the html
      if (particleInteractivity.protons || particleInteractivity.electrons ||
          particleInteractivity.neutrons || particleInteractivity.shells)
        node.append(answerHiddenInput);

      const heightToWidthRatio = 5 / 8;

      const getHeightOfCanvas = () => {
        const windowHeight = window.innerHeight ||
            document.documentElement.clientHeight || document.body.clientHeight;
        const maxHeight = windowHeight * (0.55);

        let height = node.clientWidth * heightToWidthRatio;
        if (window.innerHeight > window.innerWidth) {
          height = node.clientWidth / heightToWidthRatio;
        }

        return height;
      };

      let dims = {
        w: node.clientWidth,
        h: getHeightOfCanvas(),
      };

      // Define the p5 sketch methods
      const sketch = (p) => {
        p.preload = () => {
          p.periodicTableData =
              p.loadJSON('assets/js/periodic-table-lookup.json');
        };

        p.setup = () => {
          // create the canvas
          p.createCanvas(dims.w, dims.h)

          // Create the widget obejct
          p.widgetObject = new AtomicStructureWidget(
              {particleInteractivity, atomData, atomColors}, p,
              updateHiddenInputs);
        };

        p.draw = () => {
          p.background(atomicStructureThemeColors.backgroundColor);
          p.widgetObject.draw();
        };

        p.touchStarted = () => {
          return true;  // prevents touches firing twice on mobile
        };

        p.touchMoved = (e) => {
          // prevent scrolling when the widget is being interacted with
          if (!e.cancelable) return;

          let anyParticleInGrasp = false;
          for (const particle of p.widgetObject.nucleusParticles) {
            if (particle.inUserGrasp) {
              anyParticleInGrasp = true;
              break;
            }
          }
          for (const particle of p.widgetObject.shellParticles) {
            if (particle.inUserGrasp) {
              anyParticleInGrasp = true;
              break;
            }
          }
          if (anyParticleInGrasp) return false;
        };

        p.mousePressed = () => {
          p.widgetObject.handleClickStart();
        };

        p.mouseReleased = () => {
          p.widgetObject.handleClickEnd();
        };

        p.keyPressed = () => {
          if (!p.focused) return true;

          if (p.keyCode == p.TAB) {
            p.widgetObject.handleTab();
            return false;
          } else if (p.keyCode == p.ENTER) {
            p.widgetObject.handleEnter();
          }
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
   * - atomColors:
   *    - protonColor: string (hex code) / color of protons
   *    - neutronColor: string (hex code) / color of neutrons
   *    - electronColor: string (hex code) / color of electrons
   *    - buttonFocusColor: string (hex code) / color of focused buttons
   * @param {p5} p The p5.js sketch object
   */
  constructor(widgetConfig, p, updateHiddenInputs) {
    // read configuration data
    this.particleInteractivity = widgetConfig.particleInteractivity;
    this.atomData = widgetConfig.atomData;
    this.atomColors = widgetConfig.atomColors;

    // link to the sketch instance and document input/outputs
    this.p = p;
    this.updateHiddenInputs = updateHiddenInputs;

    // interactivity
    this.lastInputFrame = 0;
    this.lastInputWasAdjuster = false;
    this.mouseVec = this.p.createVector();
    this.keyboardFocusIndex = -1;
    this.keyboardFocusableActions = [];
    /* full set:
    ['subtractShell', 'addShell', 'addProton', 'addNeutron', 'addElectron',
    'undo', 'reset'] */

    if (this.particleInteractivity.shells) {
      this.keyboardFocusableActions.push('subtractShell');
      this.keyboardFocusableActions.push('addShell');
    }
    if (this.particleInteractivity.protons)
      this.keyboardFocusableActions.push('addProton');
    if (this.particleInteractivity.neutrons)
      this.keyboardFocusableActions.push('addNeutron');
    if (this.particleInteractivity.electrons)
      this.keyboardFocusableActions.push('addElectron');
    this.keyboardFocusableActions.push('undo');
    this.keyboardFocusableActions.push('reset');


    // initialize particle arrays & model history
    this.activeProtons = 0;
    this.activeNeutrons = 0;
    this.activeElectrons = 0;
    this.activeShells = 0;
    this.nucleusParticles = [];
    this.shellParticles = [];
    this.userActions = [];
    this.particlesInDeletion = [];

    // initialize size dependent variables
    this.atomCenter;
    this.particleSize;
    this.nucleusSpreadFactor;
    this.paletteX;
    this.paletteY;
    this.paletteWidth;
    this.paletteHeight;
    this.paletteLabelOffset;

    // complete size dependent setup
    this.resize();

    // populate model according to config
    this.resetAtom();
  }

  // used for canvas-size-dependent elements
  resize() {
    let paletteCenter;
    let paletteElementDims;

    if (this.p.width > this.p.height) {
      // landscape / desktop view
      // set the dimension and position of the palette
      paletteElementDims =
          this.p.createVector(this.p.width * 0.3, this.p.height * .12);
      paletteCenter = this.p.createVector(
          paletteElementDims.x / 2 + 10,
          this.p.height * 0.5 - paletteElementDims.y * 2);
      // set the center of the atom model
      this.atomCenter = this.p.createVector(
          this.p.width - paletteElementDims.x, this.p.height / 2);
    } else {
      // portrait / mobile view
      // set the dimension and position of the palette
      paletteElementDims =
          this.p.createVector(this.p.width * 0.4, this.p.height * 0.07);
      paletteCenter = this.p.createVector(
          this.p.width / 2, this.p.height - paletteElementDims.y * 6);
      // set the center of the atom model
      this.atomCenter = this.p.createVector(
          this.p.width / 2,
          this.p.height / 4,
      )
    }

    // set the particle size
    this.particleSize = this.p.width * 0.05;

    // create adjuster UI elements for the model
    let paletteElementSpacing = paletteElementDims.y * 1.1;
    // shells
    this.shellAdjuster =
        new ShellAdjuster(paletteCenter.copy(), paletteElementDims, this);
    paletteCenter.y += paletteElementSpacing;
    // particles
    this.paletteProton = new PaletteParticle(
        paletteCenter.copy(), paletteElementDims, 'Protons: ', 'proton',
        this.particleInteractivity.protons, this);
    paletteCenter.y += paletteElementSpacing;
    this.paletteNeutron = new PaletteParticle(
        paletteCenter.copy(), paletteElementDims, 'Neutrons: ', 'neutron',
        this.particleInteractivity.neutrons, this);
    paletteCenter.y += paletteElementSpacing;
    this.paletteElectron = new PaletteParticle(
        paletteCenter.copy(), paletteElementDims, 'Electrons: ', 'electron',
        this.particleInteractivity.electrons, this);
    paletteCenter.y += paletteElementSpacing - paletteElementDims.y * 0.2;
    this.particleButtons =
        [this.paletteProton, this.paletteNeutron, this.paletteElectron];

    // undo & reset buttons
    let buttonDims = paletteElementDims.copy()
    buttonDims.x *= 0.5;
    buttonDims.y *= 0.6
    // undo
    let undoCenter = paletteCenter.copy();
    undoCenter.x -= paletteElementDims.x / 4;
    this.undoButton = new WidgetButton(undoCenter, buttonDims, 'Undo', this);
    // reset
    let resetCenter = paletteCenter.copy();
    resetCenter.x += paletteElementDims.x / 4;
    this.resetButton = new WidgetButton(resetCenter, buttonDims, 'Reset', this);

    // atomic data card
    let dataCardCenter =
        this.p.createVector(paletteCenter.x, undoCenter.y + buttonDims.y * 1.6);
    paletteCenter.y += buttonDims.y * 2;
    this.atomicDataCard = new AtomicDataCard(
        dataCardCenter, buttonDims.copy().add(0, buttonDims.y), this.p);

    // particle spread positioning, and deletion positions
    for (const particle of this.nucleusParticles) {
      particle.size = this.particleSize;
      if (particle.color == this.atomColors.protonColor) {
        particle.deletionPos = this.paletteProton.particlePos.copy();
      } else {
        particle.deletionPos = this.paletteNeutron.particlePos.copy();
      }
    }
    for (const electron of this.shellParticles) {
      electron.size = this.particleSize * 0.66;
      electron.deletionPos = this.paletteElectron.particlePos.copy();
    }
    this.nucleusSpreadFactor = this.particleSize * 0.5;
    this.remapNucleus();
  }

  draw() {
     // visually respond to the mouse
     this.updateHoverEffects();

    // draw particles leaving the scene
    this.particlesInDeletion.forEach(particle => particle.draw());
    // remove particles that have left the scene
    this.particlesInDeletion = this.particlesInDeletion.filter(particle => {
      return particle.pos.dist(particle.targetPos) > 1;
    });

    // draw the protons and neutrons in the nucleus
    this.nucleusParticles.forEach(particle => particle.draw());

    // draw the ui elements
    this.particleButtons.forEach(pb => pb.draw());
    this.shellAdjuster.draw();
    this.undoButton.draw();
    this.resetButton.draw();
    if (this.atomData.atomCard) this.atomicDataCard.draw(this.activeProtons);


    // draw electrons and orbital rings
    // set the highlighted shell when user is holding electron
    let highlightedShell = -1;
    for (const electron of this.shellParticles) {
      if (electron.inUserGrasp) {
        highlightedShell += electron.calculateShell(
            this.atomCenter, this.minShellRadius(), this.particleSize,
            this.activeShells);
        break;
      }
    }
    // draw orbital rings
    let maxShellRadius =
        this.minShellRadius() + this.activeShells * this.particleSize;
    if (maxShellRadius > this.atomCenter.y) {
      this.resizeAtom(0.9);
      return;
    } else if (
        maxShellRadius < this.atomCenter.y * 0.9 &&
        this.particleSize < this.p.width * 0.05) {
      this.resizeAtom(1.1);
      return;
    }

    for (let shellIndex = 0; shellIndex < this.activeShells; shellIndex++) {
      let shellRadius = this.minShellRadius() + shellIndex * this.particleSize;

      this.p.push();
      this.p.noFill();
      this.p.stroke(0);
      this.p.strokeWeight(1);
      if (highlightedShell == shellIndex) this.p.strokeWeight(2);
      this.p.ellipse(this.atomCenter.x, this.atomCenter.y, shellRadius * 2);
      this.p.pop();

      // envenly distribute electrons on shells
      let currentShellElectrons =
          this.shellParticles.filter(sp => {return sp.shell == shellIndex + 1});
      currentShellElectrons.forEach((electron, i) => {
        let angle = this.p.TAU * i / currentShellElectrons.length;
        // update electron target position
        electron.targetPos = p5.Vector.fromAngle(angle).mult(shellRadius);
        electron.targetPos.add(this.atomCenter);
      });
    }

    // draw electrons
    this.shellParticles.forEach(particle => particle.draw());

    // draw grapsed particle(s)
    let grapsedParticles = this.nucleusParticles.filter(particle => particle.inUserGrasp);
    grapsedParticles = grapsedParticles.concat(this.shellParticles.filter(particle => particle.inUserGrasp));
    grapsedParticles.forEach(particle => particle.draw());
   
  }

  updateHoverEffects() {
    // update mouse vector object
    this.mouseVec.x = this.p.mouseX;
    this.mouseVec.y = this.p.mouseY;

    // clear all hover effects
    this.shellAdjuster.subtractMouseFocused = false;
    this.shellAdjuster.addMouseFocused = false;
    this.paletteProton.mouseFocused = false;
    this.paletteNeutron.mouseFocused = false;
    this.paletteElectron.mouseFocused = false;
    this.undoButton.mouseFocused = false;
    this.resetButton.mouseFocused = false;
    for (const particle of this.nucleusParticles) {
      particle.mouseFocused = false;
    }
    for (const particle of this.shellParticles) {
      particle.mouseFocused = false;
    }
    
    // check draggable particles for hovering
    if (!this.nucleusParticles.some(particle => particle.inUserGrasp)) {
      // nucleus particles
      for (const particle of this.nucleusParticles) {
        if (particle.clickWithin(this.mouseVec)) {
          particle.mouseFocused = true;
          this.p.cursor(this.p.HAND)
          return;
        }
      }
      // electrons
      for (const particle of this.shellParticles) {
        if (particle.clickWithin(this.mouseVec)) {
          particle.mouseFocused = true;
          this.p.cursor(this.p.HAND)
          return;
        }
      }
    }
    // check ui elements for hover effects + hand cursor
    // palette particles
    for (const button of this.particleButtons) {
      button.mouseFocused = button.mouseOnButton(this.mouseVec);
      if (button.mouseFocused) {
        this.p.cursor(this.p.HAND)
        return;
      }
    };
    // shell adjuster, undo and reset buttons
    this.shellAdjuster.addMouseFocused =
        this.shellAdjuster.mouseOnAdd(this.mouseVec);
    this.shellAdjuster.subtractMouseFocused =
        this.shellAdjuster.mouseOnSubtract(this.mouseVec);
    this.undoButton.mouseFocused = this.undoButton.mouseOnButton(this.mouseVec);
    this.resetButton.mouseFocused =
        this.resetButton.mouseOnButton(this.mouseVec);
    if (this.shellAdjuster.addMouseFocused ||
        this.shellAdjuster.subtractMouseFocused ||
        this.undoButton.mouseFocused || this.resetButton.mouseFocused) {
      this.p.cursor(this.p.HAND)
      return;
    }

    // if nothing is hovered on, set back to arrow cursor
    this.p.cursor(this.p.ARROW);
  }

  addElement(element, tracking = true) {
    let particle;
    switch (element) {
      case 'shell':
        this.activeShells++;
        if (tracking) this.userActions.push('addShell');
        break;
      case 'proton':
      case 'neutron':
        let color;
        let endPos;
        let interactivity;
        if (element == 'proton') {
          color = this.atomColors.protonColor;
          interactivity = this.particleInteractivity.protons;
          endPos = this.paletteProton.particlePos.copy();
          this.activeProtons++;
          if (tracking) this.userActions.push('addProton');
        } else {
          color = this.atomColors.neutronColor;
          interactivity = this.particleInteractivity.neutrons;
          endPos = this.paletteNeutron.particlePos.copy();
          this.activeNeutrons++;
          if (tracking) this.userActions.push('addNeutron');
        }
        // create new particle
        particle = new AtomicParticle(
            this.p.createVector(this.p.mouseX, this.p.mouseY), endPos,
            this.particleSize, color, interactivity, this.p);
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
            this.paletteElectron.particlePos.copy(), this.particleSize * 0.66,
            this.atomColors.electronColor, this.particleInteractivity.electrons,
            this.p);
        particle.calculateShell(
            this.atomCenter, this.minShellRadius(), this.particleSize,
            this.activeShells);
        // add to the model
        this.shellParticles.push(particle);
        this.activeElectrons++;
        if (tracking) this.userActions.push('addElectron');

        // if there are no shells yet, create one
        if (this.activeShells < 1) {
          this.activeShells++;
        }
        break;
    }

    // update the document output
    this.exportModelState();
  }

  subtractElement(element, tracking = true) {
    switch (element) {
      case 'shell':
        if (this.activeShells <= 0) return;

        // remove shell particles on the outermost shell
        this.shellParticles = this.shellParticles.filter(
            e => {return e.shell != this.activeShells});

        this.activeShells--;
        if (tracking) this.userActions.push('subtractShell');
        break;
      case 'proton':
      case 'neutron':
        let targetColor;
        if (element == 'proton') {
          if (this.activeProtons <= 0) return;
          targetColor = this.atomColors.protonColor;
          this.activeProtons--;
          if (tracking) this.userActions.push('subtractProton');
        } else {
          if (this.activeNeutrons <= 0) return;
          targetColor = this.atomColors.neutronColor;
          this.activeNeutrons--;
          if (tracking) this.userActions.push('subtractNeutron');
        }
        for (let i = this.nucleusParticles.length - 1; i >= 0; i--) {
          if (this.nucleusParticles[i].color == targetColor) {
            // set particle for deletion
            this.nucleusParticles[i].delete();
            // remove from the model
            this.particlesInDeletion = this.particlesInDeletion.concat(
                this.nucleusParticles.splice(i, 1));
            // remap rest positions
            this.remapNucleus();
            break;
          }
        }
        break;
      case 'electron':
        if (this.activeElectrons <= 0) return;
        let lastElectron = this.shellParticles.pop();
        lastElectron.delete();
        this.particlesInDeletion.push(lastElectron);
        this.activeElectrons--;
        if (tracking) this.userActions.push('subtractElectron');
        break;
    }
    // update the document model output
    this.exportModelState();
  }

  exportModelState() {
    let electronsPerShell = [];
    for (let shell = 0; shell < this.activeShells; shell++) {
      let currentShellElectrons = this.shellParticles.filter(
          electron => {return electron.shell == shell + 1});
      electronsPerShell.push(currentShellElectrons.length);
    }

    const modelState = {
      protons: this.activeProtons,
      neutrons: this.activeNeutrons,
      shells: electronsPerShell
    };

    this.updateHiddenInputs(modelState);
  }

  resizeAtom(resizeFactor = 1) {
    // update size and spread factor
    this.particleSize *= resizeFactor;
    this.nucleusSpreadFactor = this.particleSize * 0.5;

    this.nucleusParticles.forEach((particle, i) => {
      particle.size = this.particleSize;
    });
    this.shellParticles.forEach((particle, i) => {
      particle.size = this.particleSize * 0.66;
    });
  }

  resetAtom() {
    // initialize particle arrays
    this.activeProtons = 0;
    this.activeNeutrons = 0;
    this.activeElectrons = 0;
    this.activeShells = 0;
    this.nucleusParticles = [];
    this.shells = [];
    this.shellParticles = [];
    this.shellParticleCounts = [];
    this.particlesInDeletion = [];
    // reset user actions
    this.userActions = [];

    // set the particle size and spread factor
    this.particleSize = this.p.width * 0.05;
    this.nucleusSpreadFactor = this.particleSize * 0.5;

    // add shells and particles according to config
    // protons
    for (let i = 0; i < this.atomData.protons; i++) {
      this.addElement('proton', false);
      this.nucleusParticles[this.nucleusParticles.length - 1].pos =
          this.atomCenter.copy();
    }
    // neutrons
    for (let i = 0; i < this.atomData.neutrons; i++) {
      this.addElement('neutron', false);
      this.nucleusParticles[this.nucleusParticles.length - 1].pos =
          this.atomCenter.copy();
    }
    // shells and electrons
    if (this.atomData.shells.length > 0) {
      for (const shellCount of this.atomData.shells) {
        this.addElement('shell', false);
        for (let i = 0; i < shellCount; i++) {
          this.addElement('electron', false);
          let electron = this.shellParticles[this.shellParticles.length - 1];
          electron.pos = this.atomCenter.copy();
          electron.shell = this.activeShells;
        }
      }
    } else {
      this.activeShells = 1;
    }

    this.nucleusParticles = this.p.shuffle(this.nucleusParticles);
    this.remapNucleus();
  }

  undoLastAction() {
    let action = this.userActions.pop();
    switch (action) {
      case 'addShell':
        this.subtractElement('shell', false);
        break;
      case 'addProton':
        this.subtractElement('proton', false);
        break;
      case 'addNeutron':
        this.subtractElement('neutron', false);
        break;
      case 'addElectron':
        this.subtractElement('electron', false);
        break;
      case 'subtractShell':
        this.addElement('shell', false);
        break;
      case 'subtractProton':
        this.addElement('proton', false);
        break;
      case 'subtractNeutron':
        this.addElement('neutron', false);
        break;
      case 'subtractElectron':
        this.addElement('electron', false);
        break;
    }
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

  remapNucleus() {
    this.nucleusParticles.forEach((p, i) => {
      p.targetPos = this.indexToRestPosition(i);
    });
  }

  handleClickStart() {
    // register click with widget state
    this.lastInputFrame = this.p.frameCount;
    this.mouseVec.x = this.p.mouseX;
    this.mouseVec.y = this.p.mouseY;

    // reset button
    if (this.resetButton.mouseOnButton(this.mouseVec)) {
      this.resetAtom();
      this.lastInputWasAdjuster = true;
    }

    // undo button
    if (this.undoButton.mouseOnButton(this.mouseVec)) {
      this.undoLastAction();
      this.lastInputWasAdjuster = true;
    }

    // check if user clicked on adjuster
    this.lastInputWasAdjuster = false;
    for (const adjuster of this.particleButtons) {
      if (adjuster.mouseOnButton(this.mouseVec)) {
        adjuster.addElement();
        this.lastInputWasAdjuster = true;
      }
    };
    if (this.shellAdjuster.mouseOnAdd(this.mouseVec)) {
      this.shellAdjuster.addElement();
    } else if (this.shellAdjuster.mouseOnSubtract(this.mouseVec)) {
      this.shellAdjuster.subtractElement();
    }

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
        return;
      }
    }
  }

  handleClickEnd() {
    // delete quickly clicked particles
    if (this.p.frameCount - this.lastInputFrame < 10 &&
        !this.lastInputWasAdjuster &&
        !this.undoButton.mouseOnButton(this.mouseVec)) {
      // update nucleus particle count
      for (const particle of this.nucleusParticles) {
        if (particle.inUserGrasp) {
          particle.delete();
          if (particle.color == this.atomColors.protonColor) {
            this.activeProtons--;
            this.userActions.push('subtractProton');
          } else {
            this.activeNeutrons--;
            this.userActions.push('subtractNeutron');
          }
          break;
        }
      }
      // delete nucleus particles under the mouse
      this.particlesInDeletion = this.particlesInDeletion.concat(
          this.nucleusParticles.filter(p => {return p.inDeletion}));
      this.nucleusParticles =
          this.nucleusParticles.filter(p => {return !p.inDeletion});
      this.remapNucleus();


      // delete shell particles under the mouse
      for (const electron of this.shellParticles) {
        if (electron.inUserGrasp) {
          electron.delete();
          break;
        }
      }

      this.particlesInDeletion = this.particlesInDeletion.concat(
          this.shellParticles.filter(p => {return p.inDeletion}));
      this.shellParticles =
          this.shellParticles.filter(p => {return !p.inDeletion});
    }

    // release any dragged particles
    for (const particle of this.nucleusParticles) {
      particle.inUserGrasp = false;
    }
    for (const particle of this.shellParticles) {
      if (particle.inUserGrasp) {
        particle.calculateShell(
            this.atomCenter, this.minShellRadius(), this.particleSize,
            this.activeShells);
      }
      particle.inUserGrasp = false;
    }
  }

  handleTab(unfocusAll = false) {
    // clear all focuses
    this.shellAdjuster.subtractKeyboardFocused = false;
    this.shellAdjuster.addKeyboardFocused = false;
    this.paletteProton.keyboardFocused = false;
    this.paletteNeutron.keyboardFocused = false;
    this.paletteElectron.keyboardFocused = false;
    this.undoButton.keyboardFocused = false;
    this.resetButton.keyboardFocused = false;
    if (unfocusAll) return;

    // increment the focused element index
    this.keyboardFocusIndex++;
    if (this.keyboardFocusIndex >= this.keyboardFocusableActions.length) {
      this.keyboardFocusIndex = -1;
      return;
    }

    switch (this.keyboardFocusableActions[this.keyboardFocusIndex]) {
      case 'subtractShell':
        this.shellAdjuster.subtractKeyboardFocused = true;
        break;
      case 'addShell':
        this.shellAdjuster.addKeyboardFocused = true;
        break;
      case 'addProton':
        this.paletteProton.keyboardFocused = true;
        break;
      case 'addNeutron':
        this.paletteNeutron.keyboardFocused = true;
        break;
      case 'addElectron':
        this.paletteElectron.keyboardFocused = true;
        break;
      case 'undo':
        this.undoButton.keyboardFocused = true;
        break;
      case 'reset':
        this.resetButton.keyboardFocused = true;
        break;
    }
  }

  handleEnter() {
    if (this.keyboardFocusIndex < 0 ||
        this.keyboardFocusIndex >= this.keyboardFocusableActions.length) {
      return;
    }

    switch (this.keyboardFocusableActions[this.keyboardFocusIndex]) {
      case 'subtractShell':
        this.subtractElement('shell');
        break;
      case 'addShell':
        this.addElement('shell');
        break;
      case 'addProton':
        this.addElement('proton');
        break;
      case 'addNeutron':
        this.addElement('neutron');
        break;
      case 'addElectron':
        this.addElement('electron');
        // this.handleClickEnd();
        break;
      case 'undo':
        this.undoLastAction();
        break;
      case 'reset':
        this.resetAtom();
        break;
    }
  }
}

class AtomicParticle {
  constructor(pos, deletionPos, size, color, interactive, p) {
    this.pos = pos;
    this.targetPos = pos.copy();
    this.deletionPos = deletionPos;
    this.shell = 0;
    this.size = size;
    this.color = color;
    this.interactive = interactive;
    this.p = p;
    this.inUserGrasp = false;
    this.mouseFocused = false;
    this.inDeletion = false;
    this.framesHovered = 0;
  }

  draw() {
    let drawSize = this.size;
    // set size while hovering
    if (this.mouseFocused) {
      this.framesHovered++;
      drawSize = this.p.lerp(this.size, this.size * 1.1, this.p.min(1, this.framesHovered / 10));
    } else {
      this.framesHovered = 0;
    }

    // set size and position user grasp
    if (this.inUserGrasp) {
      this.pos.x = this.p.mouseX;
      this.pos.y = this.p.mouseY;
      drawSize = this.size * 1.5;
    } else {
      this.pos.lerp(this.targetPos, 0.08);
    }

    this.p.push();
    this.p.fill(this.color);
    this.p.stroke(0);
    this.p.ellipse(this.pos.x, this.pos.y, drawSize);
    this.p.pop();
  }

  delete() {
    this.inDeletion = true;
    this.inUserGrasp = false;
    this.targetPos = this.deletionPos;
  }

  calculateShell(atomCenter, minShellRadius, particleSize, activeShells) {
    let atomicRadius = atomCenter.dist(this.pos) - minShellRadius;
    let shellCalculation = 1 + this.p.floor(0.5 + atomicRadius / particleSize);
    this.shell = this.p.constrain(shellCalculation, 1, activeShells);
    return this.shell;
  }

  clickWithin(mouseVec) {
    return this.interactive && mouseVec.dist(this.pos) < this.size / 2;
  }
}

class ShellAdjuster {
  constructor(centerPos, dims, widgetController) {
    // link to controller
    this.widgetController = widgetController;
    this.p = widgetController.p;

    // positioning
    this.centerPos = centerPos;
    this.dims = dims;
    this.capDims = dims.copy();
    this.capDims.x = this.dims.x / 3;
    this.capDims.x = this.p.min(this.capDims.x, dims.y);
    this.leftCapCenter = this.p.createVector(
        this.centerPos.x - (this.dims.x - this.capDims.x) / 2,
        this.centerPos.y);
    this.rightCapCenter = this.p.createVector(
        this.centerPos.x + (this.dims.x - this.capDims.x) / 2,
        this.centerPos.y);
    this.labelPos = this.centerPos.copy().sub(0, this.dims.y / 3);
    this.countPos = this.centerPos.copy().add(0, dims.y / 4);

    // hover and keyboard focused display
    this.subtractMouseFocused = false;
    this.subtractKeyboardFocused = false;
    this.addMouseFocused = false;
    this.addKeyboardFocused = false;
  }

  draw() {
    this.p.push();

    // draw buttons
    this.p.rectMode(this.p.CENTER);
    this.p.noStroke();
    // draw minus button
    if (this.subtractMouseFocused || this.subtractKeyboardFocused) {
      this.p.fill(this.widgetController.atomColors.buttonFocusedColor)
    } else {
      this.p.fill(this.widgetController.atomColors.buttonUnfocusedColor)
    };
    this.p.rect(
        this.leftCapCenter.x, this.leftCapCenter.y, this.capDims.x,
        this.capDims.y, 6);
    // draw plus button
    if (this.addMouseFocused || this.addKeyboardFocused) {
      this.p.fill(this.widgetController.atomColors.buttonFocusedColor)
    } else {
      this.p.fill(this.widgetController.atomColors.buttonUnfocusedColor)
    };
    this.p.rect(
        this.rightCapCenter.x, this.rightCapCenter.y, this.capDims.x,
        this.capDims.y, 6);

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
    this.p.textSize(this.dims.y / 3);
    this.p.textAlign(this.p.CENTER, this.p.TOP);
    this.p.text('Shells', this.labelPos.x, this.labelPos.y);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);

    this.p.text(
        this.widgetController.activeShells, this.countPos.x, this.countPos.y);
    this.p.pop();
  }

  addElement() {
    this.widgetController.addElement('shell');
  }

  subtractElement() {
    this.widgetController.subtractElement('shell');
  }

  mouseOnSubtract(mouseVec) {
    return this.widgetController.particleInteractivity.shells &&
        this.p.abs(mouseVec.x - this.leftCapCenter.x) < this.capDims.x / 2 &&
        this.p.abs(mouseVec.y - this.leftCapCenter.y) < this.capDims.y / 2;
  }

  mouseOnAdd(mouseVec) {
    return this.widgetController.particleInteractivity.shells &&
        this.p.abs(mouseVec.x - this.rightCapCenter.x) < this.capDims.x / 2 &&
        this.p.abs(mouseVec.y - this.rightCapCenter.y) < this.capDims.y / 2;
  }
}

class PaletteParticle {
  constructor(
      centerPos, dims, labelText, particleType, interactive, widgetController) {
    // link to controller
    this.widgetController = widgetController;
    this.p = widgetController.p;

    // positioning
    this.dims = dims;
    this.particleSize = dims.y * 2 / 3;
    this.centerPos = centerPos;
    this.particlePos =
        this.centerPos.copy().add(this.particleSize / 1.2 - dims.x / 2, 0);
    this.labelPos = this.particlePos.copy().add(this.particleSize / 1.2, 0);
    this.countPos = this.centerPos.copy().add(
        dims.x / 2 - widgetController.particleSize / 2, 0);

    // particle
    this.particleColor;
    switch (particleType) {
      case 'proton':
        this.particleColor = widgetController.atomColors.protonColor;
        break;
      case 'neutron':
        this.particleColor = widgetController.atomColors.neutronColor;
        break;
      case 'electron':
        this.particleColor = widgetController.atomColors.electronColor;
        break;
    }

    // mouse and keyboard focus
    this.clearColor = this.p.color(0, 0, 0, 0);
    this.hoverColor = this.p.color(this.particleColor);
    this.hoverColor.setAlpha(30);
    this.keyboardFocused = false;
    this.mouseFocused = false;
    this.interactive = interactive;
    this.framesHovered = 0;

    // label
    this.particleType = particleType;
    this.labelText = labelText;
    this.labelCount = 0;
    this.updateLabelCount();
  }

  draw() {
    this.p.push();
    this.p.rectMode(this.p.CENTER);
    if ((this.mouseFocused || this.keyboardFocused) && this.interactive) {
      this.framesHovered++;
      this.p.fill(this.p.lerpColor(this.clearColor, this.hoverColor, this.p.min(1, this.framesHovered/20)))
    } else {
      this.framesHovered = 0;
      this.p.noFill();
    }
    // draw outer container
    this.p.rect(
        this.centerPos.x, this.centerPos.y, this.dims.x, this.dims.y, 6);

    // draw the particle
    this.p.fill(this.particleColor);
    this.p.ellipse(this.particlePos.x, this.particlePos.y, this.dims.y * 2 / 3);

    // draw the label
    this.p.textSize(this.dims.y / 4);
    this.p.textAlign(this.p.LEFT, this.p.CENTER);
    this.p.fill(0);
    this.p.text(this.labelText, this.labelPos.x, this.labelPos.y);

    // draw the count
    this.updateLabelCount();
    this.p.textAlign(this.p.RIGHT);
    this.p.text(this.labelCount, this.countPos.x, this.countPos.y);

    this.p.pop();
  }

  updateLabelCount() {
    switch (this.particleType) {
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
    this.widgetController.addElement(this.particleType);
    this.updateLabelCount();
  }

  mouseOnButton(mouseVec) {
    return this.interactive &&
        this.p.abs(mouseVec.x - this.centerPos.x) < this.dims.x / 2 &&
        this.p.abs(mouseVec.y - this.centerPos.y) < this.dims.y / 2;
  }
}

class WidgetButton {
  constructor(centerPos, dims, labelText, widgetController) {
    // link to controller
    this.widgetController = widgetController;
    this.p = widgetController.p;

    // positioning
    this.centerPos = centerPos;
    this.dims = dims;

    // label
    this.labelText = labelText;

    // hover and keyboard focusing
    this.mouseFocused = false;
    this.keyboardFocused = false;
  }

  draw() {
    this.p.push();

    // draw outer container
    this.p.rectMode(this.p.CENTER);
    this.p.noStroke();
    if (this.mouseFocused || this.keyboardFocused) {
      this.p.fill(this.widgetController.atomColors.buttonFocusedColor);
    } else {
      this.p.fill(this.widgetController.atomColors.buttonUnfocusedColor)
    };

    this.p.rect(
        this.centerPos.x, this.centerPos.y, this.dims.x, this.dims.y, 6);

    // draw the label
    this.p.textSize(this.dims.y / 2);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.fill(0);
    this.p.text(this.labelText, this.centerPos.x, this.centerPos.y);

    this.p.pop();
  }

  mouseOnButton(mouseVec) {
    return this.p.abs(mouseVec.x - this.centerPos.x) < this.dims.x / 2 &&
        this.p.abs(mouseVec.y - this.centerPos.y) < this.dims.y / 2;
  }
}

class AtomicDataCard {
  constructor(centerPos, dims, p) {
    // link to controller and p5 instance
    this.p = p;

    // size and positioning
    this.centerPos = centerPos;
    this.dims = dims;
  }

  draw(protonCount) {
    // if no protons are in the model, or element doesen't exist
    // skip displaying
    if (protonCount <= 0 || protonCount >= 120) return;

    // extract the periodic table data
    let elementID = this.p.periodicTableData.order[protonCount - 1];
    let elementData = this.p.periodicTableData[elementID];


    this.p.push();
    // outer container
    this.p.rectMode(this.p.CENTER);
    this.p.noFill();
    this.p.rect(
        this.centerPos.x, this.centerPos.y, this.dims.x, this.dims.y, 6);

    // text
    this.p.fill(0);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(this.dims.y / 5);
    this.p.text(
        '' + elementData.number, this.centerPos.x,
        this.centerPos.y - this.dims.y / 2 + this.p.textSize());
    this.p.textSize(this.dims.y / 3);
    this.p.text('' + elementData.symbol, this.centerPos.x, this.centerPos.y);
    this.p.textSize(this.dims.y / 5);
    this.p.text(
        '' + elementData.name, this.centerPos.x,
        this.centerPos.y + this.dims.y / 2 - this.p.textSize());

    this.p.pop();
  }
}