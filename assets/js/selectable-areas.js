const runSelectableAreasWidget =
    ({
      container,
      interactive,
      imagePath,
      imageWidthFactor,
      imageMaxHeightFactor,
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

      const getSketchDims =
          (backgroundImage) => {
            let imageAspectRatio =
                backgroundImage.height / backgroundImage.width;

            let sketchWidth = node.clientWidth * imageWidthFactor;
            let sketchHeight = sketchWidth * imageAspectRatio;

            if (sketchHeight > window.innerHeight * imageMaxHeightFactor) {
              sketchHeight = window.innerHeight * imageMaxHeightFactor;
              sketchWidth = sketchHeight / imageAspectRatio;
            }


            return {w: sketchWidth, h: sketchHeight};
          }

      // Define the p5 sketch methods
      const sketch = (p) => {
        let backgroundImage;

        p.preload = () => {
          backgroundImage = p.loadImage(imagePath);
        };

        p.setup = () => {
          // create the canvas
          let dims = getSketchDims(backgroundImage);
          // console.log(dims);
          p.createCanvas(dims.w, dims.h);

          // Create the widget obejct
          p.widgetObject = new SelectableAreasWidget(
              {interactive, backgroundImage, maxSelections, hotspots}, p,
              updateHiddenInputs);
        };

        p.windowResized = () => {
          p.resizeCanvas(0, 0);

          let dims = getSketchDims(backgroundImage);
          p.resizeCanvas(dims.w, dims.h);
          p.widgetObject.resize();
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
      {interactive, backgroundImage, maxSelections, hotspots}, p,
      updateHiddenInputs) {
    /* begin control panel */
    // stroke weights are set by line thickness in pixels
    this.areaStrokeWeight = 3;
    this.hoveredAreaStrokeWeight = 3;
    this.keyboardFocusedAreaStrokeWeight = 4;
    this.selectedAreaStrokeWeight = 3;

    this.tooltipDuration = 120;      // number of frames
    this.hoverEffectDuration = 20;   // number of frames
    this.selectedFillOpacity = 100;  // 0-255, 0 is clear and 255 fully opaque
    this.lineDashLength = 5;         // length in pixels
    this.lineGapLength = 10;         // length in pixels

    this.tooltipTextHeight = 14;  // height in pixels
    /* end control panel */

    // read configuration data
    this.interactive = interactive;
    this.backgroundImage = backgroundImage;
    this.maxSelections = maxSelections;
    this.hotspots = hotspots;

    // link to the sketch instance and document input/outputs
    this.p = p;
    this.updateHiddenInputs = updateHiddenInputs;

    // interactivity
    this.lastInputFrame = 0;
    this.mouseVec = this.p.createVector();
    this.keyboardFocusIndex = -1;
    this.shiftDown = false;

    // complete setup in the resize function
    this.resize();
  }

  // used for canvas-size-dependent elements
  resize() {
    // create selectable area objects
    this.selectableAreas = [];
    for (const hotspot of this.hotspots) {
      this.selectableAreas.push(new SelectableArea(
          hotspot.area, hotspot.colorHexCode, hotspot.iconMarkVertexIndex,
          hotspot.iconMarkType, hotspot.tooltipID, this));
    };

    // set text size
    this.p.textSize(this.tooltipTextHeight);
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
    // draw tooltips over everything else
    for (const selectableArea of this.selectableAreas) {
      selectableArea.drawTooltip();
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
    if (this.selectableAreas.some(s => s.mouseFocused)) {
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
      selectableArea.tooltipFrames = 0;
    } else {
      if (currSelectedAreaCount < this.maxSelections) {
        selectableArea.selected = true;
        selectableArea.tooltipFrames = 0;
      } else {
        Swal.fire({
          title: 'Maximum Selections Exceeded',
          text: 'Please unselect an area before selecting another.',
          icon: 'warning'
        });
      }
    }

    // update the outputted selections
    this.exportModelState();
  }
}

class SelectableArea {
  constructor(
      vertices, colorHexCode, iconMarkVertexIndex, iconMarkType, tooltipID,
      widgetController) {
    // link to the widgetController
    this.widgetController = widgetController;
    this.p = this.widgetController.p;

    // interactivity
    this.focusedFrames = 0;
    this.selectedFrames = 0;
    this.mouseFocused = false;
    this.keyboardFocused = false;
    this.selected = false;

    // shape and features
    this.vertices = vertices.map(v => {
      return {x: v[0] * this.p.width, y: v[1] * this.p.height};
    });
    this.iconMarkVertexIndex = iconMarkVertexIndex;
    this.iconMarkType = iconMarkType;

    // tooltip
    this.tooltipID = tooltipID;
    this.tooltipFrames = -1;
    this.tooltipWidth = this.p.textWidth(this.tooltipID + ' is unselected.');
    this.tooltipVertex = {...this.vertices.reduce((prev, curr) => {
      return prev.y > curr.y ? prev : curr;
    })};
    this.tooltipVertex.y += this.p.textSize();

    let tooltipRightX = (this.tooltipWidth / 2) + this.tooltipVertex.x;
    if (tooltipRightX > (this.p.width - 20)) {
      let shiftAmount = tooltipRightX - this.p.width;
      this.tooltipVertex.x -= shiftAmount;
    }
    let tooltipLeftX = this.tooltipVertex.x - (this.tooltipWidth / 2);
    if (tooltipLeftX < 10) {
      let shiftAmount = 10 - tooltipLeftX;
      this.tooltipVertex.x += shiftAmount;
    }

    // colors
    this.strokeColor = this.p.color(colorHexCode);
    this.fillColor = this.p.color(colorHexCode);
    this.fillColor.setAlpha(this.widgetController.selectedFillOpacity);
  }

  draw() {
    this.p.push();

    // update timed animation frames
    if (this.selected) {
      this.selectedFrames = Math.min(
          this.selectedFrames + 1, this.widgetController.hoverEffectDuration);
    } else {
      this.selectedFrames = Math.max(this.selectedFrames - 2, 0);
    };
    if (this.keyboardFocused || this.mouseFocused) {
      this.focusedFrames = Math.min(
          this.focusedFrames + 1, this.widgetController.hoverEffectDuration);
    } else {
      this.focusedFrames = Math.max(this.focusedFrames - 2, 0)
    };
    let focusProgress =
        this.focusedFrames / this.widgetController.hoverEffectDuration;
    let selectedProgress =
        this.selectedFrames / this.widgetController.hoverEffectDuration;


    // base styling
    this.p.strokeWeight(this.widgetController.areaStrokeWeight);
    this.strokeColor.setAlpha(255);
    this.p.stroke(this.strokeColor);
    this.p.drawingContext.setLineDash([
      this.widgetController.lineDashLength, this.widgetController.lineGapLength
    ]);

    // set the fill based on selection progress
    if (selectedProgress == 0) {
      this.p.noFill();
    } else {
      this.fillColor.setAlpha(
          selectedProgress * this.widgetController.selectedFillOpacity);
      this.p.fill(this.fillColor);
    }

    // draw shape with fill
    this.p.beginShape();
    for (const areaVertex of this.vertices) {
      this.p.vertex(areaVertex.x, areaVertex.y);
    }
    this.p.endShape(this.p.CLOSE);

    // fade in solid stroke
    this.p.drawingContext.setLineDash([]);
    this.strokeColor.setAlpha(Math.max(focusProgress, selectedProgress) * 255);
    this.p.stroke(this.strokeColor);
    this.p.noFill();
    this.p.beginShape();

    // override stroke color and weight for keyboard focus
    if (this.keyboardFocused) {
      this.p.stroke('#FFA500');
      this.p.strokeWeight(
          this.widgetController.keyboardFocusedAreaStrokeWeight);
      this.p.drawingContext.setLineDash([]);
    }

    for (const areaVertex of this.vertices) {
      this.p.vertex(areaVertex.x, areaVertex.y);
    }
    this.p.endShape(this.p.CLOSE);

    this.p.pop();
  }

  drawTooltip() {
    // track whether or not to display tooltip
    if (typeof this.tooltipID === 'undefined') return;
    if (this.tooltipFrames < 0) return;
    if (this.tooltipFrames > this.widgetController.tooltipDuration) {
      this.tooltipFrames = -1;
      return;
    }
    this.tooltipFrames++;

    let message = this.selected ? this.tooltipID + ' is selected.' :
                                  this.tooltipID + ' is unselected.';

    // stylings
    this.p.push();
    this.p.noStroke();

    // tooltip background
    this.p.rectMode(this.p.CENTER);
    this.p.fill(0);
    this.p.rect(
        this.tooltipVertex.x, this.tooltipVertex.y,
        this.p.textWidth(message) * 1.05, this.p.textSize() * 1.1, 2);

    // tooltip text
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.fill(255);
    this.p.text(message, this.tooltipVertex.x, this.tooltipVertex.y);

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