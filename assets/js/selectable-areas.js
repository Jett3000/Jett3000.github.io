
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
          p.widgetObject.handleClickStart();
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
    this.areaStrokeWeight = 3;          // line thickness in pixels
    this.hoveredAreaStrokeWeight = 3;   // line thickness in pixels
    this.selectedAreaStrokeWeight = 3;  // line thickness in pixels
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

    // create selectable area objects
    this.selectableAreas = [];
    for (const hotspot of this.hotspots) {
      this.selectableAreas.push(new SelectableArea(
          hotspot.area, hotspot.iconMark, hotspot.color, this));
    };
  }

  // used for canvas-size-dependent elements
  resize() {
    // create selectable area objects
    this.selectableAreas = [];
    for (const hotspot of this.hotspots) {
      this.selectableAreas.push(new SelectableArea(
          hotspot.area, hotspot.iconMark, hotspot.color, this));
    };
  }

  draw() {
    // draw the background image
    this.p.imageMode(this.p.CENTER);
    this.p.image(
        this.backgroundImage, this.p.width / 2, this.p.height / 2, this.p.width,
        this.p.height);

    // respond to the mosue
    this.updateHoverEffects();

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

    // check each area
    for (const selectableArea of this.selectableAreas) {
      selectableArea.focused = selectableArea.mouseWithin(this.mouseVec);
    };
    if (this.selectableAreas.some(s => s.focused)) {
      this.p.cursor(this.p.HAND);
      return
    };

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

    debugger;
    // toggle selection on clicked selectable areas
    let currSelectedAreaCount =
        this.selectableAreas.filter(s => {return s.selected}).length;
    for (const selectableArea of this.selectableAreas) {
      if (selectableArea.mouseWithin(this.mouseVec)) {
        selectableArea.selected = !selectableArea.selected;
        if (selectableArea.selected &&
            currSelectedAreaCount == this.selecbleAreaCount) {
          selectableArea.selected = false;
        }
      }
    }
  }

  handleClickEnd() {
    return true;
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

    // interactivity
    this.focusedFrames = 0;
    this.focused = false;
    this.selected = false;

    // load the shape and features
    this.vertices = vertices.map(v => {
      return {x: v[0] * this.p.width, y: v[1] * this.p.height};
    });
    this.iconMark = iconMark;

    // set the stylings
    let colorCode;
    switch (color) {
      case 'blue':
        colorCode = '#50DFFF';
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
    this.strokeColor = this.p.color(colorCode);
    this.fillColor = this.p.color(colorCode);
    this.fillColor.setAlpha(50);
  }

  draw() {
    this.p.push();

    // styling
    this.p.stroke(this.strokeColor);
    this.p.strokeWeight(this.widgetController.areaStrokeWeight);
    this.p.noFill();
    if (!this.focused && !this.selected) {
      this.p.drawingContext.setLineDash([5, 5]);
    } else {
      this.p.drawingContext.setLineDash([]);
      if (this.focused) {
        this.p.strokeWeight(this.widgetController.hoveredAreaStrokeWeight);
      }
      if (this.selected) {
        this.p.strokeWeight(this.widgetController.hoveredAreaStrokeWeight);
        this.p.fill(this.fillColor)
      }
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
    let mouseP1 = mouseVec.copy();
    mouseP1.y = 0;

    let intersections = 0;
    for (let i = 0; i < this.vertices.length; i++) {
      let p0 = this.vertices[i];
      let p1 = this.vertices[(i + 1) % this.vertices.length];
      if (this.isIntersecting(mouseP0, mouseP1, p0, p1)) {
        intersections++;
      };
    }
    return intersections % 2 == 1;
  };

  isIntersecting(p1, p2, p3, p4) {
    function CCW(p1, p2, p3) {
      return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
    }
    return (CCW(p1, p3, p4) != CCW(p2, p3, p4)) &&
        (CCW(p1, p2, p3) != CCW(p1, p2, p4));
  }
}