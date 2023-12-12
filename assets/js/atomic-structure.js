
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
          particleInteractivity.nuetrons || particleInteractivity.shells)
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
   *    - Nuetrons: boolean / display or hide
   *    - Shells: boolean / display or hide
   * - atomData:
   *    - protons: integer / number of protons
   *    - nuetrons: integer / number of nuetrons
   *    - shells: array / number of electrons per shell
   *    - atomCard: boolean / show the atom's period table entry
   * - colors (optional): array // [protonHexCode, nuetronHexCode,
   * electronHexCode]
   * @param {p5} p The p5.js sketch object
   */
  constructor(widgetConfig, p, updateHiddenInputs) {
    // read configuration data
    this.particleInteractivity = widgetConfig.particleInteractivity;
    this.atomData = widgetConfig.atomData;
    this.colors = widgetConfig.colors;

    // link to the sketch instance and document outputs
    this.p = p;
    this.updateHiddenInputs = updateHiddenInputs;

    // initialize particle arrays & counters
    this.activeProtons = 0;
    this.activeNuetrons = 0;
    this.activeElectrons = 0;
    this.nucleusParticles = [];
    this.shellParticles = [];
    this.paletteParticles = [];

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
    this.p.textAlign(this.p.LEFT, this.p.CENTER);
    // complete size dependent setup
    this.resize();
  }

  // used for canvas-size-dependent elements
  resize(shrinkingAtom = false) {
    this.atomCenter = this.p.createVector(
        this.p.width * 3 / 5,
        this.p.height / 2,
    );

    this.particleSize =
        shrinkingAtom ? this.particleSize * 0.8 : this.p.width * 0.05;
    this.nucleusSpreadFactor = this.particleSize * 0.5;

    if (shrinkingAtom) {
      // resize & reposition existing particles in the scene
      this.particleSize *= 0.9;
      this.nucleusParticles.forEach((particle, i) => {
        particle.size = this.particleSize;
        particle.targetPos = this.indexToRestPosition(i);
      });
      this.shellParticles.forEach((particle, i) => {
        particle.size = this.particleSize * 0.66;
      });

      return;  // prevent changing the palette size & location
    }

    // position particle palette
    this.paletteParticles = [];
    this.paletteX = this.p.width * 0.05;
    this.paletteY = this.p.height * 0.33;
    this.paletteWidth =
        this.particleSize * 2 + this.p.textWidth('nuetrons: 99');
    this.paletteHeight = this.particleSize * 5;
    this.paletteLabelOffset = this.particleSize * 0.66;
    let particleSpacing = this.particleSize * 1.5;
    if (this.particleInteractivity.protons) {
      this.paletteParticles.push(new AtomicParticle(
          this.p.createVector(
              this.paletteX + this.particleSize,
              this.paletteY + this.particleSize),
          this.particleSize, this.colors[0], true, this.p));
    }
    if (this.particleInteractivity.nuetrons) {
      this.paletteParticles.push(new AtomicParticle(
          this.p.createVector(
              this.paletteX + this.particleSize,
              this.paletteY + this.particleSize + particleSpacing),
          this.particleSize, this.colors[1], true, this.p));
    }
    if (this.particleInteractivity.electrons) {
      this.paletteParticles.push(new AtomicParticle(
          this.p.createVector(
              this.paletteX + this.particleSize,
              this.paletteY + this.particleSize + particleSpacing * 2),
          this.particleSize * 2 / 3, this.colors[2], true, this.p));
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

  handleClickStart(mouseVec) {
    // check if user clicked on palette particle
    for (const particle of this.paletteParticles) {
      if (particle.clickWithin(mouseVec)) {
        // create a copy of the palette particle to add to the scene
        let particleCopy = new AtomicParticle(
            particle.pos.copy(), this.particleSize, particle.color,
            particle.interactive, particle.p);
        particleCopy.inUserGrasp = true;
        particleCopy.targetPos =
            this.indexToRestPosition(this.nucleusParticles.length);

        // add the copied particle to the scene and track particle counts
        switch (particle.color) {
          case this.colors[0]:  // proton
            this.nucleusParticles.push(particleCopy);
            this.activeProtons++;
            break;
          case this.colors[1]:  // nuetron
            this.nucleusParticles.push(particleCopy);
            this.activeNuetrons++;
            break;
          case this.colors[2]:  // electron
            particleCopy.size *= 0.66;
            this.shellParticles.push(particleCopy);
            this.activeElectrons++;
            break;
        }
        return;
      }
    }

    // if the user clicked an electron or nuclear particle, add it to their
    // grasp
    for (const particle of this.nucleusParticles) {
      if (particle.clickWithin(mouseVec)) {
        particle.inUserGrasp = true;
        return;
      }
    }
    for (const particle of this.shellParticles) {
      if (particle.clickWithin(mouseVec)) {
        particle.inUserGrasp = true;
        return;
      }
    }
  }

  handleClickEnd(mouseVec) {
    // release any dragged particles
    for (const particle of this.nucleusParticles) {
      particle.inUserGrasp = false;
    }
    for (const particle of this.shellParticles) {
      particle.inUserGrasp = false;
    }
  }

  draw() {
    // draw the palette
    // bounding box and particles
    this.p.push();
    this.p.noFill();
    this.p.stroke(0);
    this.p.rect(
        this.paletteX, this.paletteY, this.paletteWidth, this.paletteHeight,
        12);
    this.paletteParticles.forEach(particle => particle.draw());
    // particle count labels
    this.p.fill(0);
    this.p.noStroke();
    this.p.text(
        'protons: ' + this.activeProtons,
        this.paletteParticles[0].pos.x + this.paletteLabelOffset,
        this.paletteParticles[0].pos.y);
    this.p.text(
        'nuetrons: ' + this.activeNuetrons,
        this.paletteParticles[1].pos.x + this.paletteLabelOffset,
        this.paletteParticles[1].pos.y);
    this.p.text(
        'electrons: ' + this.activeElectrons,
        this.paletteParticles[2].pos.x + this.paletteLabelOffset,
        this.paletteParticles[2].pos.y);
    this.p.pop();

    // draw the protons and nuetrons that have been added to the scene
    this.nucleusParticles.forEach(particle => particle.draw());

    // draw electrons & electron shells
    let minShellRadius =
        this.nucleusSpreadFactor * this.p.sqrt(this.nucleusParticles.length);
    let electronPool = this.shellParticles.slice();
    let shellCounter = 1;
    for (const spliceSize of this.atomData.shells) {
      if (electronPool.length == 0) return;
      let shellRadius = minShellRadius + shellCounter * this.particleSize;
      if (shellRadius > this.atomCenter.y - this.particleSize) {
        this.resize(true);
        return;
      }

      // draw orbital path
      this.p.push();
      this.p.noFill();
      this.p.stroke(0);
      this.p.ellipse(this.atomCenter.x, this.atomCenter.y, shellRadius * 2);
      this.p.pop();

      // distribute current shell's electrons
      let currentShellElectrons = electronPool.splice(0, spliceSize);
      currentShellElectrons.forEach((electron, i) => {
        let angle = this.p.TAU * i /
            currentShellElectrons.length;  // distrubute on shell
        angle += this.p.TAU *
            (this.p.frameCount / shellCounter / 600);          // animate shell
        angle += this.p.TAU * shellCounter / (1.618 * 1.618);  // offset shells
        // create electron target position
        electron.targetPos = p5.Vector.fromAngle(angle).mult(shellRadius);
        electron.targetPos.add(this.atomCenter);
        // draw the electron
        electron.draw();
      });
      shellCounter++;
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
    this.inPalette = false;
    this.inUserGrasp = false;

    this.shell;
    this.theta;
  }

  draw() {
    if (this.inUserGrasp) {
      this.pos.x = this.p.mouseX;
      this.pos.y = this.p.mouseY;
    } else {
      this.pos.lerp(this.targetPos, 0.05);
    }


    this.p.push();
    this.p.noStroke();
    this.p.fill(this.color);
    this.p.ellipse(this.pos.x, this.pos.y, this.size);
    this.p.pop();
  }

  clickWithin(mouseVec) {
    return mouseVec.dist(this.pos) < this.size / 2;
  }
}
