const runSelectableAreasWidget =
    ({
      container,
      interactive,
      imagePath,
      imageWidth,
      maxImageHeight,
      maxSelections,
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


      // Define the p5 sketch methods
      let dims;
      let backgroundImage;
      let points = [];
      const sketch = (p) => {
        p.preload = () => {
          backgroundImage = p.loadImage(imagePath);
        };

        p.setup = () => {
          // create the canvas
          dims = {
            w: node.clientWidth,
            h: node.clientWidth *
                (backgroundImage.height / backgroundImage.width)
          };

          p.createCanvas(dims.w, dims.h);

          // Create the widget obejct
          p.widgetObject = new SelectableAreasWidget(
              {
                interactive,
                backgroundImage,
                imageWidth,
                maxImageHeight,
                maxSelections,
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
            h: node.clientWidth *
                (backgroundImage.height / backgroundImage.width)
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
        maxSelections,
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
    this.maxSelections = maxSelections;
    this.hotspots = hotspots;

    // link to the sketch instance and document input/outputs
    this.p = p;
    this.updateHiddenInputs = updateHiddenInputs;

    // interactivity
    this.lastInputFrame = 0;
    this.mouseVec = this.p.createVector();
    this.keyboardFocusIndex = -1;
    this.keyboardFocusableAreas = [];
    this.shiftDown = false;

    // complete setup in the resize function
    this.resize();
  }

  // used for canvas-size-dependent elements
  resize() {
    // create selectable area objects
    this.selectableAreas = [];
    this.keyboardFocusableAreas = [];
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
      selectableArea.mouseFocused = selectableArea.mouseWithin(this.mouseVec);
    };
    if (this.selectableAreas.some(s => s.focused)) {
      this.p.cursor(this.p.HAND);
      return
    };

    // if nothing is hovered on, set back to arrow cursor
    this.p.cursor(this.p.ARROW);
  }

  exportModelState() {
    let selectedIndices = [];
    for (const [index, area] of this.selectableAreas.entries()) {
      if (area.selected) {
        selectedIndices.push(index);
      }
    }
    this.updateHiddenInputs(selectedIndices);
  }

  handleClickStart() {
    // register click with widget state
    this.lastInputFrame = this.p.frameCount;
    this.mouseVec.x = this.p.mouseX;
    this.mouseVec.y = this.p.mouseY;

    for (const selectableArea of this.selectableAreas) {
      if (selectableArea.mouseWithin(this.mouseVec)) {
        this.toggleSelection(selectableArea);
        break;
      }
    }
  }

  handleClickEnd() {
    return true;
  }

  handleTab() {
    // increment the focused element index
    if (this.shiftDown) {
      this.keyboardFocusIndex--;
      if (this.keyboardFocusIndex < -1) {
        this.keyboardFocusIndex = this.selectableAreas.length - 1;
      }
    } else {
      this.keyboardFocusIndex++;
      if (this.keyboardFocusIndex >= this.selectableAreas.length) {
        this.keyboardFocusIndex = -1;
      }
    }

    // update the focus
    for (const [index, area] of this.selectableAreas.entries()) {
      area.keyboardFocused = index == this.keyboardFocusIndex;
    }
  }

  handleEnter() {
    // return if the focus index is out of bounds
    if (this.keyboardFocusIndex < 0 ||
        this.keyboardFocusIndex >= this.selectableAreas.length) {
      return;
    }

    this.toggleSelection(this.selectableAreas[this.keyboardFocusIndex]);
  }

  toggleSelection(selectableArea) {
    // toggle selection on clicked selectable areas
    let currSelectedAreaCount =
        this.selectableAreas.filter(s => {return s.selected}).length;

    if (selectableArea.selected) {
      selectableArea.selected = false;
    } else {
      if (currSelectedAreaCount < this.maxSelections) {
        selectableArea.selected = true;
      } else {
        alert('Please deselect an area before selecting more.')
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
    this.mouseFocused = false;
    this.keyboardFocused = false;
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
    if (!this.mouseFocused && !this.keyboardFocused && !this.selected) {
      this.p.drawingContext.setLineDash([5, 5]);
    } else {
      this.p.drawingContext.setLineDash([]);
      if (this.mouseFocused) {
        this.p.strokeWeight(this.widgetController.hoveredAreaStrokeWeight);
      }

      if (this.keyboardFocused) {
        this.p.stroke('#FFA500');
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