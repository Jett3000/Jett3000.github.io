
const runSelectableAreasWidget =
    ({
      container,
      interactive,
      imagePath,
      imageWidth,
      maxImageHeight,
      selecbleAreaCount,
      hotspots
    }) => {
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
      defaultThemeColors = getThemeColors(defaultTheme);

      const setThemeColors = (theme) => {
        defaultThemeColors = getThemeColors(theme)
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
      if (interactive) node.append(answerHiddenInput);

      const heightToWidthRatio = 5 / 8;

      const getHeightOfCanvas = () => {
        const windowHeight = window.innerHeight ||
            document.documentElement.clientHeight || document.body.clientHeight;
        const maxHeight = windowHeight * (0.55);

        let height = node.clientWidth * heightToWidthRatio;
        if (window.innerHeight > window.innerWidth) {
          height = node.clientWidth / heightToWidthRatio;
        }



        return Math.min(maxHeight, height);
      };

      let dims = {
        w: node.clientWidth,
        h: getHeightOfCanvas(),
      };

      // Define the p5 sketch methods
      let backgroundImage;
      let points = [];
      const sketch = (p) => {
        p.preload = () => {
          backgroundImage = p.loadImage(imagePath);
        };

        p.setup = () => {
          // create the canvas
          p.createCanvas(dims.w, dims.h);

          // Create the widget obejct
          p.widgetObject = new SelectableAreasWidget(
              {
                interactive,
                backgroundImage,
                imageWidth,
                maxImageHeight,
                selecbleAreaCount,
                hotspots
              },
              p, updateHiddenInputs);
        };

        p.draw = () => {
          p.background(defaultThemeColors.backgroundColor);
          p.widgetObject.draw();
        };

        p.touchStarted = () => {
          return true;  // prevents touches firing twice on mobile
        };

        p.touchMoved = (e) => {
          // prevent scrolling when the widget is being interacted with
          if (!e.cancelable) return;
        };

        p.mousePressed = () => {
          points.push([p.mouseX / p.width, p.mouseY / p.height])
          console.log(JSON.stringify(points));
          // p.widgetObject.handleClickStart();
        };

        p.mouseReleased = () => {
          p.widgetObject.handleClickEnd();
        };

        p.keyPressed = () => {
          if (!p.focused) return true;

          if (p.keyCode == p.SHIFT) {
            p.widgetObject.shiftDown = true;
            return false;
          } else if (p.keyCode == p.TAB) {
            p.widgetObject.handleTab();
            return false;
          } else if (p.keyCode == p.ENTER) {
            p.widgetObject.handleEnter();
          }
        };
        p.keyReleased = () => {
          if (!p.focused) return true;

          if (p.keyCode == p.SHIFT) {
            p.widgetObject.shiftDown = false;
            return false;
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

class SelectableAreasWidget {
  /**
   * @param config
   * - interactive: boolean / controls widget response to input
   * - imagePath: string / url to image
   * - imageWidth: float / as a fractin of the container width
   * - maxImageHeight: float / as a fraction of the view height
   * - selectableAreaCount: int / the number of areas a user can select at once
   * - hotspots: object containing the coordinates of hotspot vertices
   *    - area: {[10,20], [52, 58], [98, 125]} / the coordinates of the area,
   unlimited coordinates
   *    - iconMark: [10,20] - which corner to put the tick, cross, dash
   *    - Colour: string / blue or green or red
            Blue is used when the widget is in interactive mode
            Green (correct) and red (wrong) are used for completed questions
   * @param updateHiddenInputs function / exports widget data to hidden HTMl
                                input fields
   */
  constructor(
      {
        interactive,
        backgroundImage,
        imageWidth,
        maxImageHeight,
        selecbleAreaCount,
        hotspots
      },
      p, updateHiddenInputs) {
    /* begin control panel */
    this.areaStrokeWeight = 1;          // line thickness in pixels
    this.hoveredAreaStrokeWeight = 2;   // line thickness in pixels
    this.selectedAreaStrokeWeight = 2;  // line thickness in pixels
    /* end control panel */

    // read configuration data
    this.interactive = interactive;
    this.backgroundImage = backgroundImage;
    this.imageWidth = imageWidth;
    this.maxImageHeight = maxImageHeight;
    this.selecbleAreaCount = selecbleAreaCount;
    this.hotspots = hotspots;

    // link to the sketch instance and document input/outputs
    this.p = p;
    this.updateHiddenInputs = updateHiddenInputs;

    // interactivity
    this.lastInputFrame = 0;
    this.mouseVec = this.p.createVector();
    this.keyboardFocusIndex = -1;
    this.keyboardFocusableActions = [];
    this.shiftDown = false;


    // resize background
    this.backgroundImage.resize(this.p.width, this.p.height);


    // create selectable area objects
    this.selectableAreas = [];
    for (const hotspot of this.hotspots) {
      this.selectableAreas.push(new SelectableArea(
          hotspot.area, hotspot.iconMark, hotspot.color, this));
    };
  }

  // used for canvas-size-dependent elements
  resize() {
    if (this.p.width > this.p.height) {
      /* landscape & desktop view */
      // set the dimension and position of the palette
      this.paletteWidth = this.p.width * 0.3;
      this.paletteX = 20;
      this.paletteElementHeight = this.p.height * 0.1;
      this.paletteElementSpacing = this.paletteElementHeight / 5;
      this.paletteY = this.p.height -
          (this.paletteElementSpacing + this.paletteElementHeight) * 6;

      // set the center of the atom model
      let atomX = this.p.width - (this.p.width - this.paletteWidth) / 2;
      this.atomCenter = this.p.createVector(atomX, this.p.height / 2);

      // set the maximum particle size
      this.maxParticleSize = this.p.width * 0.05;

      // set the atom data card size
      this.atomCardDims =
          this.p.createVector(this.p.width * 0.1, this.p.width * 0.1);
    } else {
      /* portrait & mobile view */
      // set the dimension and position of the palette
      this.paletteWidth = this.p.width * 0.9;
      this.paletteX = (this.p.width - this.paletteWidth) / 2;
      this.paletteElementHeight = this.p.height * 0.07;
      this.paletteElementSpacing = this.paletteElementHeight / 5;
      this.paletteY = this.p.height -
          (this.paletteElementSpacing + this.paletteElementHeight) * 5;

      // set the center of the atom model
      this.atomCenter = this.p.createVector(
          this.p.width / 2,
          this.paletteY / 2,
      );
      // set the maximum particle size
      this.maxParticleSize = this.p.width * 0.1;

      // set the atom data card size
      this.atomCardDims =
          this.p.createVector(this.p.width * 0.16, this.p.width * 0.16);
    }

    // set the initial particle size
    this.particleSize = this.maxParticleSize;
    // create adjuster UI elements for the model
    let paletteTLCorner = this.p.createVector(this.paletteX, this.paletteY);
    let paletteElementDims =
        this.p.createVector(this.paletteWidth, this.paletteElementHeight);

    // shells
    this.shellAdjuster = new ShellAdjuster(
        paletteTLCorner.copy(), paletteElementDims.copy(), this);
    paletteTLCorner.y += this.paletteElementHeight + this.paletteElementSpacing;
    // particles
    this.paletteProton = new PaletteParticle(
        paletteTLCorner.copy(), paletteElementDims.copy(), 'proton',
        this.particleInteractivity.protons, this);
    paletteTLCorner.y += this.paletteElementHeight + this.paletteElementSpacing;
    this.paletteNeutron = new PaletteParticle(
        paletteTLCorner.copy(), paletteElementDims.copy(), 'neutron',
        this.particleInteractivity.protons, this);
    paletteTLCorner.y += this.paletteElementHeight + this.paletteElementSpacing;
    this.paletteElectron = new PaletteParticle(
        paletteTLCorner.copy(), paletteElementDims.copy(), 'electron',
        this.particleInteractivity.protons, this);
    paletteTLCorner.y += this.paletteElementHeight + this.paletteElementSpacing;

    this.particleButtons =
        [this.paletteProton, this.paletteNeutron, this.paletteElectron];

    // undo & reset buttons
    let buttonGapSize = this.paletteWidth * this.lowerButtonGapPercent;
    let buttonDims = this.p.createVector(
        (this.paletteWidth - buttonGapSize) / 2, this.paletteElementHeight);

    // undo
    this.undoButton =
        new WidgetButton(paletteTLCorner.copy(), buttonDims, 'Undo', this);
    // reset
    paletteTLCorner.x += buttonDims.x + buttonGapSize;
    this.resetButton =
        new WidgetButton(paletteTLCorner.copy(), buttonDims, 'Reset', this);

    // atomic data card
    let margin = this.atomCardDims.x * this.atomCardMarginPercent;  // panel add
    let dataCardCenter = this.p.createVector(
        this.p.width - this.atomCardDims.x - margin, margin);
    this.atomicDataCard =
        new AtomicDataCard(dataCardCenter, this.atomCardDims, this.p);

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
      electron.size = this.particleSize * this.electronSizePercent;
      electron.deletionPos = this.paletteElectron.particlePos.copy();
    }
    this.nucleusSpreadFactor = this.particleSize * this.spreadPercent;
    this.remapNucleus();

    // atom tagline
    this.taglineSize = paletteElementDims.y / 3;
  }

  draw() {
    // respond to the mosue
    this.updateHoverEffects();

    // draw the background image
    this.p.imageMode(this.p.CENTER);
    this.p.image(
        this.backgroundImage, this.p.width / 2, this.p.height / 2, this.p.width,
        this.p.height);

    // draw the selectable areas
    // debugger;
    for (const selectableArea of this.selectableAreas) {
      selectableArea.draw();
    }
  }

  updateHoverEffects() {
    // update mouse vector object
    this.mouseVec.x = this.p.mouseX;
    this.mouseVec.y = this.p.mouseY;

    // clear all hover effects


    // check selectable areas for hovering

    // if nothing is hovered on, set back to arrow cursor
    this.p.cursor(this.p.ARROW);
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
          this.userActions.push('subtractElectron');
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
    if (this.shiftDown) {
      this.keyboardFocusIndex--;
      if (this.keyboardFocusIndex < -1) {
        this.keyboardFocusIndex = this.keyboardFocusableActions.length - 1;
      }
    } else {
      this.keyboardFocusIndex++;
      if (this.keyboardFocusIndex >= this.keyboardFocusableActions.length) {
        this.keyboardFocusIndex = -1;
        return;
      }
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

    if (this.shiftDown) {
      // remove particles with shift-enter on particle palette
      switch (this.keyboardFocusableActions[this.keyboardFocusIndex]) {
        case 'addProton':
          this.subtractElement('proton');
          break;
        case 'addNeutron':
          this.subtractElement('neutron');
          break;
        case 'addElectron':
          this.subtractElement('electron');
          break;
      }
    } else {
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
}

class SelectableArea {
  constructor(vertices, iconMark, color, widgetController) {
    // link to the widgetController
    this.widgetController = widgetController;
    this.p = this.widgetController.p;

    // load the shape and features
    this.vertices = vertices.map(v => {
      return {x: v[0] * this.p.width, y: v[1] * this.p.height};
    });
    this.iconMark = iconMark;

    // set the stylings
    let colorCode;
    switch (color) {
      case 'blue':
        colorCode = '#3277BD';
        break;
      case 'red':
        colorCode = '#FF1616';
        break;
      case 'green':
        colorCode = '#63C616';
        break;
      case 'orange':
        colorCode = '#FF5C00';
        break;
    }

    this.color = this.p.color(colorCode);
    this.color.setAlpha(50);
  }

  draw() {
    this.p.push();

    // styling
    this.p.strokeWeight(this.widgetController.areaStrokeWeight);
    this.p.stroke(this.p.color);
    if (this.hoveredOn) {
      this.p.fill(this.color);
    } else {
      this.p.noFill();
    }

    // draw shape
    this.p.beginShape();
    for (const areaVertex of this.vertices) {
      this.p.vertex(areaVertex.x, areaVertex.y);
    }
    this.p.endShape(this.p.CLOSE);


    this.p.pop();
  }

  mouseWithin(mouseVec) {
    // test via casting a ray to the edge of the sketch and counting the
    // intersections with area boundary lines
    let mouseP0 = mouseVec;
    let mouseP1 = this.p.createVector(0, mouseVec.y);

    let intersections = 0;
    for (let i = 0; i < this.vertices.length; i++) {
      let p0 = this.vertices[i];
      let p1 = this.vertices[(i + 1) % this.vertices.length];

      if (this.intersects(
              mouseP0.x, mouseP0.y, mouseP1.x, mouseP1.y, p0.x, p0.y, p1.x,
              p1.y)) {
        intersections++;
      };

      return intersections % 2 == 1;
    }
  }

  // returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
  intersects(a, b, c, d, p, q, r, s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
  };
}