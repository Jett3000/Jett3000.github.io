const periodicTableData = {
  'order': [
    'hydrogen',    'helium',       'lithium',      'beryllium',
    'boron',       'carbon',       'nitrogen',     'oxygen',
    'fluorine',    'neon',         'sodium',       'magnesium',
    'aluminium',   'silicon',      'phosphorus',   'sulfur',
    'chlorine',    'argon',        'potassium',    'calcium',
    'scandium',    'titanium',     'vanadium',     'chromium',
    'manganese',   'iron',         'cobalt',       'nickel',
    'copper',      'zinc',         'gallium',      'germanium',
    'arsenic',     'selenium',     'bromine',      'krypton',
    'rubidium',    'strontium',    'yttrium',      'zirconium',
    'niobium',     'molybdenum',   'technetium',   'ruthenium',
    'rhodium',     'palladium',    'silver',       'cadmium',
    'indium',      'tin',          'antimony',     'tellurium',
    'iodine',      'xenon',        'cesium',       'barium',
    'lanthanum',   'cerium',       'praseodymium', 'neodymium',
    'promethium',  'samarium',     'europium',     'gadolinium',
    'terbium',     'dysprosium',   'holmium',      'erbium',
    'thulium',     'ytterbium',    'lutetium',     'hafnium',
    'tantalum',    'tungsten',     'rhenium',      'osmium',
    'iridium',     'platinum',     'gold',         'mercury',
    'thallium',    'lead',         'bismuth',      'polonium',
    'astatine',    'radon',        'francium',     'radium',
    'actinium',    'thorium',      'protactinium', 'uranium',
    'neptunium',   'plutonium',    'americium',    'curium',
    'berkelium',   'californium',  'einsteinium',  'fermium',
    'mendelevium', 'nobelium',     'lawrencium',   'rutherfordium',
    'dubnium',     'seaborgium',   'bohrium',      'hassium',
    'meitnerium',  'darmstadtium', 'roentgenium',  'copernicium',
    'nihonium',    'flerovium',    'moscovium',    'livermorium',
    'tennessine',  'oganesson',    'ununennium'
  ],
  'hydrogen':
      {'name': 'Hydrogen', 'atomic_mass': 1.008, 'number': 1, 'symbol': 'H'},
  'helium':
      {'name': 'Helium', 'atomic_mass': 4.0026022, 'number': 2, 'symbol': 'He'},
  'lithium':
      {'name': 'Lithium', 'atomic_mass': 6.94, 'number': 3, 'symbol': 'Li'},
  'beryllium': {
    'name': 'Beryllium',
    'atomic_mass': 9.01218315,
    'number': 4,
    'symbol': 'Be'
  },
  'boron': {'name': 'Boron', 'atomic_mass': 10.81, 'number': 5, 'symbol': 'B'},
  'carbon':
      {'name': 'Carbon', 'atomic_mass': 12.011, 'number': 6, 'symbol': 'C'},
  'nitrogen':
      {'name': 'Nitrogen', 'atomic_mass': 14.007, 'number': 7, 'symbol': 'N'},
  'oxygen':
      {'name': 'Oxygen', 'atomic_mass': 15.999, 'number': 8, 'symbol': 'O'},
  'fluorine': {
    'name': 'Fluorine',
    'atomic_mass': 18.9984031636,
    'number': 9,
    'symbol': 'F'
  },
  'neon':
      {'name': 'Neon', 'atomic_mass': 20.17976, 'number': 10, 'symbol': 'Ne'},
  'sodium': {
    'name': 'Sodium',
    'atomic_mass': 22.989769282,
    'number': 11,
    'symbol': 'Na'
  },
  'magnesium': {
    'name': 'Magnesium',
    'atomic_mass': 24.305,
    'number': 12,
    'symbol': 'Mg'
  },
  'aluminium': {
    'name': 'Aluminium',
    'atomic_mass': 26.98153857,
    'number': 13,
    'symbol': 'Al'
  },
  'silicon':
      {'name': 'Silicon', 'atomic_mass': 28.085, 'number': 14, 'symbol': 'Si'},
  'phosphorus': {
    'name': 'Phosphorus',
    'atomic_mass': 30.9737619985,
    'number': 15,
    'symbol': 'P'
  },
  'sulfur':
      {'name': 'Sulfur', 'atomic_mass': 32.06, 'number': 16, 'symbol': 'S'},
  'chlorine':
      {'name': 'Chlorine', 'atomic_mass': 35.45, 'number': 17, 'symbol': 'Cl'},
  'argon':
      {'name': 'Argon', 'atomic_mass': 39.9481, 'number': 18, 'symbol': 'Ar'},
  'potassium': {
    'name': 'Potassium',
    'atomic_mass': 39.09831,
    'number': 19,
    'symbol': 'K'
  },
  'calcium':
      {'name': 'Calcium', 'atomic_mass': 40.0784, 'number': 20, 'symbol': 'Ca'},
  'scandium': {
    'name': 'Scandium',
    'atomic_mass': 44.9559085,
    'number': 21,
    'symbol': 'Sc'
  },
  'titanium': {
    'name': 'Titanium',
    'atomic_mass': 47.8671,
    'number': 22,
    'symbol': 'Ti'
  },
  'vanadium': {
    'name': 'Vanadium',
    'atomic_mass': 50.94151,
    'number': 23,
    'symbol': 'V'
  },
  'chromium': {
    'name': 'Chromium',
    'atomic_mass': 51.99616,
    'number': 24,
    'symbol': 'Cr'
  },
  'manganese': {
    'name': 'Manganese',
    'atomic_mass': 54.9380443,
    'number': 25,
    'symbol': 'Mn'
  },
  'iron':
      {'name': 'Iron', 'atomic_mass': 55.8452, 'number': 26, 'symbol': 'Fe'},
  'cobalt': {
    'name': 'Cobalt',
    'atomic_mass': 58.9331944,
    'number': 27,
    'symbol': 'Co'
  },
  'nickel':
      {'name': 'Nickel', 'atomic_mass': 58.69344, 'number': 28, 'symbol': 'Ni'},
  'copper':
      {'name': 'Copper', 'atomic_mass': 63.5463, 'number': 29, 'symbol': 'Cu'},
  'zinc': {'name': 'Zinc', 'atomic_mass': 65.382, 'number': 30, 'symbol': 'Zn'},
  'gallium':
      {'name': 'Gallium', 'atomic_mass': 69.7231, 'number': 31, 'symbol': 'Ga'},
  'germanium': {
    'name': 'Germanium',
    'atomic_mass': 72.6308,
    'number': 32,
    'symbol': 'Ge'
  },
  'arsenic': {
    'name': 'Arsenic',
    'atomic_mass': 74.9215956,
    'number': 33,
    'symbol': 'As'
  },
  'selenium': {
    'name': 'Selenium',
    'atomic_mass': 78.9718,
    'number': 34,
    'symbol': 'Se'
  },
  'bromine':
      {'name': 'Bromine', 'atomic_mass': 79.904, 'number': 35, 'symbol': 'Br'},
  'krypton':
      {'name': 'Krypton', 'atomic_mass': 83.7982, 'number': 36, 'symbol': 'Kr'},
  'rubidium': {
    'name': 'Rubidium',
    'atomic_mass': 85.46783,
    'number': 37,
    'symbol': 'Rb'
  },
  'strontium': {
    'name': 'Strontium',
    'atomic_mass': 87.621,
    'number': 38,
    'symbol': 'Sr'
  },
  'yttrium': {
    'name': 'Yttrium',
    'atomic_mass': 88.905842,
    'number': 39,
    'symbol': 'Y'
  },
  'zirconium': {
    'name': 'Zirconium',
    'atomic_mass': 91.2242,
    'number': 40,
    'symbol': 'Zr'
  },
  'niobium': {
    'name': 'Niobium',
    'atomic_mass': 92.906372,
    'number': 41,
    'symbol': 'Nb'
  },
  'molybdenum': {
    'name': 'Molybdenum',
    'atomic_mass': 95.951,
    'number': 42,
    'symbol': 'Mo'
  },
  'technetium':
      {'name': 'Technetium', 'atomic_mass': 98, 'number': 43, 'symbol': 'Tc'},
  'ruthenium': {
    'name': 'Ruthenium',
    'atomic_mass': 101.072,
    'number': 44,
    'symbol': 'Ru'
  },
  'rhodium': {
    'name': 'Rhodium',
    'atomic_mass': 102.905502,
    'number': 45,
    'symbol': 'Rh'
  },
  'palladium': {
    'name': 'Palladium',
    'atomic_mass': 106.421,
    'number': 46,
    'symbol': 'Pd'
  },
  'silver': {
    'name': 'Silver',
    'atomic_mass': 107.86822,
    'number': 47,
    'symbol': 'Ag'
  },
  'cadmium': {
    'name': 'Cadmium',
    'atomic_mass': 112.4144,
    'number': 48,
    'symbol': 'Cd'
  },
  'indium':
      {'name': 'Indium', 'atomic_mass': 114.8181, 'number': 49, 'symbol': 'In'},
  'tin': {'name': 'Tin', 'atomic_mass': 118.7107, 'number': 50, 'symbol': 'Sn'},
  'antimony': {
    'name': 'Antimony',
    'atomic_mass': 121.7601,
    'number': 51,
    'symbol': 'Sb'
  },
  'tellurium': {
    'name': 'Tellurium',
    'atomic_mass': 127.603,
    'number': 52,
    'symbol': 'Te'
  },
  'iodine': {
    'name': 'Iodine',
    'atomic_mass': 126.904473,
    'number': 53,
    'symbol': 'I'
  },
  'xenon':
      {'name': 'Xenon', 'atomic_mass': 131.2936, 'number': 54, 'symbol': 'Xe'},
  'cesium': {
    'name': 'Cesium',
    'atomic_mass': 132.905451966,
    'number': 55,
    'symbol': 'Cs'
  },
  'barium':
      {'name': 'Barium', 'atomic_mass': 137.3277, 'number': 56, 'symbol': 'Ba'},
  'lanthanum': {
    'name': 'Lanthanum',
    'atomic_mass': 138.905477,
    'number': 57,
    'symbol': 'La'
  },
  'cerium':
      {'name': 'Cerium', 'atomic_mass': 140.1161, 'number': 58, 'symbol': 'Ce'},
  'praseodymium': {
    'name': 'Praseodymium',
    'atomic_mass': 140.907662,
    'number': 59,
    'symbol': 'Pr'
  },
  'neodymium': {
    'name': 'Neodymium',
    'atomic_mass': 144.2423,
    'number': 60,
    'symbol': 'Nd'
  },
  'promethium':
      {'name': 'Promethium', 'atomic_mass': 145, 'number': 61, 'symbol': 'Pm'},
  'samarium': {
    'name': 'Samarium',
    'atomic_mass': 150.362,
    'number': 62,
    'symbol': 'Sm'
  },
  'europium': {
    'name': 'Europium',
    'atomic_mass': 151.9641,
    'number': 63,
    'symbol': 'Eu'
  },
  'gadolinium': {
    'name': 'Gadolinium',
    'atomic_mass': 157.253,
    'number': 64,
    'symbol': 'Gd'
  },
  'terbium': {
    'name': 'Terbium',
    'atomic_mass': 158.925352,
    'number': 65,
    'symbol': 'Tb'
  },
  'dysprosium': {
    'name': 'Dysprosium',
    'atomic_mass': 162.5001,
    'number': 66,
    'symbol': 'Dy'
  },
  'holmium': {
    'name': 'Holmium',
    'atomic_mass': 164.930332,
    'number': 67,
    'symbol': 'Ho'
  },
  'erbium':
      {'name': 'Erbium', 'atomic_mass': 167.2593, 'number': 68, 'symbol': 'Er'},
  'thulium': {
    'name': 'Thulium',
    'atomic_mass': 168.934222,
    'number': 69,
    'symbol': 'Tm'
  },
  'ytterbium': {
    'name': 'Ytterbium',
    'atomic_mass': 173.0451,
    'number': 70,
    'symbol': 'Yb'
  },
  'lutetium': {
    'name': 'Lutetium',
    'atomic_mass': 174.96681,
    'number': 71,
    'symbol': 'Lu'
  },
  'hafnium':
      {'name': 'Hafnium', 'atomic_mass': 178.492, 'number': 72, 'symbol': 'Hf'},
  'tantalum': {
    'name': 'Tantalum',
    'atomic_mass': 180.947882,
    'number': 73,
    'symbol': 'Ta'
  },
  'tungsten':
      {'name': 'Tungsten', 'atomic_mass': 183.841, 'number': 74, 'symbol': 'W'},
  'rhenium': {
    'name': 'Rhenium',
    'atomic_mass': 186.2071,
    'number': 75,
    'symbol': 'Re'
  },
  'osmium':
      {'name': 'Osmium', 'atomic_mass': 190.233, 'number': 76, 'symbol': 'Os'},
  'iridium': {
    'name': 'Iridium',
    'atomic_mass': 192.2173,
    'number': 77,
    'symbol': 'Ir'
  },
  'platinum': {
    'name': 'Platinum',
    'atomic_mass': 195.0849,
    'number': 78,
    'symbol': 'Pt'
  },
  'gold': {
    'name': 'Gold',
    'atomic_mass': 196.9665695,
    'number': 79,
    'symbol': 'Au'
  },
  'mercury': {
    'name': 'Mercury',
    'atomic_mass': 200.5923,
    'number': 80,
    'symbol': 'Hg'
  },
  'thallium':
      {'name': 'Thallium', 'atomic_mass': 204.38, 'number': 81, 'symbol': 'Tl'},
  'lead': {'name': 'Lead', 'atomic_mass': 207.21, 'number': 82, 'symbol': 'Pb'},
  'bismuth': {
    'name': 'Bismuth',
    'atomic_mass': 208.980401,
    'number': 83,
    'symbol': 'Bi'
  },
  'polonium':
      {'name': 'Polonium', 'atomic_mass': 209, 'number': 84, 'symbol': 'Po'},
  'astatine':
      {'name': 'Astatine', 'atomic_mass': 210, 'number': 85, 'symbol': 'At'},
  'radon': {'name': 'Radon', 'atomic_mass': 222, 'number': 86, 'symbol': 'Rn'},
  'francium':
      {'name': 'Francium', 'atomic_mass': 223, 'number': 87, 'symbol': 'Fr'},
  'radium':
      {'name': 'Radium', 'atomic_mass': 226, 'number': 88, 'symbol': 'Ra'},
  'actinium':
      {'name': 'Actinium', 'atomic_mass': 227, 'number': 89, 'symbol': 'Ac'},
  'thorium': {
    'name': 'Thorium',
    'atomic_mass': 232.03774,
    'number': 90,
    'symbol': 'Th'
  },
  'protactinium': {
    'name': 'Protactinium',
    'atomic_mass': 231.035882,
    'number': 91,
    'symbol': 'Pa'
  },
  'uranium': {
    'name': 'Uranium',
    'atomic_mass': 238.028913,
    'number': 92,
    'symbol': 'U'
  },
  'neptunium':
      {'name': 'Neptunium', 'atomic_mass': 237, 'number': 93, 'symbol': 'Np'},
  'plutonium':
      {'name': 'Plutonium', 'atomic_mass': 244, 'number': 94, 'symbol': 'Pu'},
  'americium':
      {'name': 'Americium', 'atomic_mass': 243, 'number': 95, 'symbol': 'Am'},
  'curium':
      {'name': 'Curium', 'atomic_mass': 247, 'number': 96, 'symbol': 'Cm'},
  'berkelium':
      {'name': 'Berkelium', 'atomic_mass': 247, 'number': 97, 'symbol': 'Bk'},
  'californium':
      {'name': 'Californium', 'atomic_mass': 251, 'number': 98, 'symbol': 'Cf'},
  'einsteinium':
      {'name': 'Einsteinium', 'atomic_mass': 252, 'number': 99, 'symbol': 'Es'},
  'fermium':
      {'name': 'Fermium', 'atomic_mass': 257, 'number': 100, 'symbol': 'Fm'},
  'mendelevium': {
    'name': 'Mendelevium',
    'atomic_mass': 258,
    'number': 101,
    'symbol': 'Md'
  },
  'nobelium':
      {'name': 'Nobelium', 'atomic_mass': 259, 'number': 102, 'symbol': 'No'},
  'lawrencium':
      {'name': 'Lawrencium', 'atomic_mass': 266, 'number': 103, 'symbol': 'Lr'},
  'rutherfordium': {
    'name': 'Rutherfordium',
    'atomic_mass': 267,
    'number': 104,
    'symbol': 'Rf'
  },
  'dubnium':
      {'name': 'Dubnium', 'atomic_mass': 268, 'number': 105, 'symbol': 'Db'},
  'seaborgium':
      {'name': 'Seaborgium', 'atomic_mass': 269, 'number': 106, 'symbol': 'Sg'},
  'bohrium':
      {'name': 'Bohrium', 'atomic_mass': 270, 'number': 107, 'symbol': 'Bh'},
  'hassium':
      {'name': 'Hassium', 'atomic_mass': 269, 'number': 108, 'symbol': 'Hs'},
  'meitnerium':
      {'name': 'Meitnerium', 'atomic_mass': 278, 'number': 109, 'symbol': 'Mt'},
  'darmstadtium': {
    'name': 'Darmstadtium',
    'atomic_mass': 281,
    'number': 110,
    'symbol': 'Ds'
  },
  'roentgenium': {
    'name': 'Roentgenium',
    'atomic_mass': 282,
    'number': 111,
    'symbol': 'Rg'
  },
  'copernicium': {
    'name': 'Copernicium',
    'atomic_mass': 285,
    'number': 112,
    'symbol': 'Cn'
  },
  'nihonium':
      {'name': 'Nihonium', 'atomic_mass': 286, 'number': 113, 'symbol': 'Nh'},
  'flerovium':
      {'name': 'Flerovium', 'atomic_mass': 289, 'number': 114, 'symbol': 'Fl'},
  'moscovium':
      {'name': 'Moscovium', 'atomic_mass': 289, 'number': 115, 'symbol': 'Mc'},
  'livermorium': {
    'name': 'Livermorium',
    'atomic_mass': 293,
    'number': 116,
    'symbol': 'Lv'
  },
  'tennessine':
      {'name': 'Tennessine', 'atomic_mass': 294, 'number': 117, 'symbol': 'Ts'},
  'oganesson':
      {'name': 'Oganesson', 'atomic_mass': 294, 'number': 118, 'symbol': 'Og'},
  'ununennium':
      {'name': 'Ununennium', 'atomic_mass': 315, 'number': 119, 'symbol': 'Uue'}
};

const runAtomicStructureWidget =
    ({container, particleInteractivity, maxElements, atomData, atomColors}) => {
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
        p.setup = () => {
          // create the canvas
          p.createCanvas(dims.w, dims.h)

          // load default colors if none are passed in
          if (typeof atomColors === 'undefined' || atomColors == null) {
            atomColors = {
              protonColor: '#EF3F54',
              neutronColor: '#8BC867',
              electronColor: '#49C7EA',
              buttonUnfocusedColor: '#DBF1FD',
              buttonFocusedColor: '#BCE7FF'
            }
          }

          // Create the widget obejct
          p.widgetObject = new AtomicStructureWidget(
              {particleInteractivity, maxElements, atomData, atomColors}, p,
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

class AtomicStructureWidget {
  /**
   * Instantiate an atomic structure widget
   * @param inputs
   * Inputs:
   * @param widgetConfig object detailing:
   * - particleInteractivity:
   *    - Protons: boolean / display or hide
   *    - Electrons: boolean / display or hide
   *    - Neutrons: boolean / display or hide
   *    - Shells: boolean / display or hide
   * - atomData:
   *    - protons: integer / number of protons
   *    - neutrons: integer / number of neutrons
   *    - shells: array / number of electrons per shell
   *    - atomCard: boolean / show the atom's periodic table entry
   * - atomColors:
   *    - protonColor: string (hex code) / color of protons
   *    - neutronColor: string (hex code) / color of neutrons
   *    - electronColor: string (hex code) / color of electrons
   *    - buttonUnfocusedColor: string (hex code) / color of unfocused buttons
   *    - buttonFocusColor: string (hex code) / color of focused buttons
   * @param {p5} p The p5.js sketch object
   * @param updateHiddenInputs a function that exports data to input fields in
   *     the document
   */
  constructor(widgetConfig, p, updateHiddenInputs) {
    /* begin control panel */
    // shells and particles
    this.shellWeight = 1;             // line thickness in pixels
    this.highlightedShellWeight = 2;  // line thickness in pixels
    this.electronSizePercent = 0.66;  // as % of nucleus particle size
    this.spreadPercent = 0.5;  // controls the nucleus particle spread factor
    this.particleHoverScale = 1.1;  // amount to scale hovered particles by
    this.particleGraspScale = 1.5;  // amount to scale grapsed particles by
    this.particleSpeed = 0.08;  // interpolation to target position per frame

    // UI palette
    this.lowerButtonGapPercent = 0.03;      // gap size as % of palette width
    this.hoverEffectDuration = 10;          // effect duration in frames
    this.paletteParticleHoverOpacity = 35;  // opacity of fill on hover, 0-255

    // atom card
    this.atomCardMarginPercent = 0.1;  // margin as percent of the card's width
    /* end control panel */

    // read configuration data
    this.particleInteractivity = widgetConfig.particleInteractivity;
    this.maxElements = widgetConfig.maxElements;
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
    this.shiftDown = false;
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
    this.maxParticleSize;
    this.nucleusSpreadFactor;
    this.paletteX;
    this.paletteY;
    this.paletteWidth;
    this.paletteElementHeight;
    this.paletteElementSpacing;
    this.paletteHeight;
    this.paletteLabelOffset;
    this.atomCardDims;

    // complete size dependent setup
    this.resize();

    // populate model according to config
    this.resetAtom();
  }

  // used for canvas-size-dependent elements
  resize() {
    if (this.p.width > this.p.height) {
      /* landscape & desktop view */
      // set the dimension and position of the palette
      this.paletteWidth = this.p.width * 0.28;
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
    if (typeof this.particleSize === 'undefined') {
      this.particleSize = this.maxParticleSize;
    }

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
        this.particleInteractivity.neutrons, this);
    paletteTLCorner.y += this.paletteElementHeight + this.paletteElementSpacing;
    this.paletteElectron = new PaletteParticle(
        paletteTLCorner.copy(), paletteElementDims.copy(), 'electron',
        this.particleInteractivity.electrons, this);
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
    // resize the atom to fit the space
    let maxShellRadius =
        this.minShellRadius() + this.activeShells * this.particleSize;
    if (maxShellRadius > this.atomCenter.y * 0.95) {
      this.resizeAtom(0.95);
    } else if (
        maxShellRadius < this.atomCenter.y * 0.9 &&
        this.particleSize < this.maxParticleSize) {
      this.resizeAtom(1.05);
    }

    // visually respond to the mouse
    this.updateHoverEffects();

    // draw particles leaving the scene
    this.particlesInDeletion.forEach(particle => particle.draw());
    // remove particles that have left the scene
    this.particlesInDeletion = this.particlesInDeletion.filter(particle => {
      return particle.pos.dist(particle.targetPos) > 1;
    });

    // draw the protons and neutrons in the nucleus
    for (let i = this.nucleusParticles.length - 1; i >= 0; i--) {
      this.nucleusParticles[i].draw();
    }

    // draw the ui elements
    this.particleButtons.forEach(pb => pb.draw());
    if (this.particleInteractivity.shells) this.shellAdjuster.draw();
    if (this.particleInteractivity.shells ||
        this.particleInteractivity.protons ||
        this.particleInteractivity.neutrons ||
        this.particleInteractivity.electrons) {
      this.undoButton.draw();
      this.resetButton.draw();
    }

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
    for (let shellIndex = 0; shellIndex < this.activeShells; shellIndex++) {
      let shellRadius = this.minShellRadius() + shellIndex * this.particleSize;

      this.p.push();
      this.p.noFill();
      this.p.stroke(0);
      this.p.strokeWeight(this.shellWeight);
      if (highlightedShell == shellIndex)
        this.p.strokeWeight(this.highlightedShellWeight);
      this.p.ellipse(this.atomCenter.x, this.atomCenter.y, shellRadius * 2);
      this.p.pop();
      //  envenly distribute electrons on shells
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

    // draw grapsed or hovered particles
    let allParticles = this.nucleusParticles.concat(this.shellParticles);
    for (const particle of allParticles) {
      if (particle.mouseFocused || particle.inUserGrasp) {
        particle.draw();
      }
    }

    // draw tagline
    this.p.textSize(this.taglineSize);
    this.p.textAlign(this.p.CENTER, this.p.TOP);
    let taglineY = this.p.width > this.p.height ?
        this.p.height - this.taglineSize :
        this.paletteY - this.taglineSize / 2;
    this.p.text(
        'Click on a particle to remove it', this.atomCenter.x, taglineY);
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
        if (this.activeShells >= this.maxElements) return;
        this.activeShells++;
        if (tracking) this.userActions.push('addShell');
        break;
      case 'proton':
      case 'neutron':
        let color;
        let endPos;
        let interactivity;
        if (element == 'proton') {
          if (this.activeProtons >= this.maxElements) return;
          color = this.atomColors.protonColor;
          interactivity = this.particleInteractivity.protons;
          endPos = this.paletteProton.particlePos.copy();
          this.activeProtons++;
          if (tracking) this.userActions.push('addProton');
        } else {
          if (this.activeNeutrons >= this.maxElements) return;
          color = this.atomColors.neutronColor;
          interactivity = this.particleInteractivity.neutrons;
          endPos = this.paletteNeutron.particlePos.copy();
          this.activeNeutrons++;
          if (tracking) this.userActions.push('addNeutron');
        }
        // create new particle
        particle = new AtomicParticle(
            this.p.createVector(this.p.mouseX, this.p.mouseY), endPos,
            this.particleSize, color, interactivity, this, this.p);
        // calculate rest position
        particle.targetPos =
            this.indexToRestPosition(this.nucleusParticles.length);
        // add to the model
        this.nucleusParticles.push(particle);
        break;
      case 'electron':
        if (this.activeElectrons >= this.maxElements) return;
        // create new particle
        particle = new AtomicParticle(
            this.p.createVector(this.p.mouseX, this.p.mouseY),
            this.paletteElectron.particlePos.copy(),
            this.particleSize * this.electronSizePercent,
            this.atomColors.electronColor, this.particleInteractivity.electrons,
            this, this.p);
        particle.calculateShell(
            this.atomCenter, this.minShellRadius(), this.particleSize,
            this.activeShells);
        // add to the model
        this.shellParticles.push(particle);
        this.activeElectrons++;

        // if there are no shells yet, create one
        if (this.activeShells < 1) {
          this.activeShells++;
          if (tracking)
            this.userActions.push({action: 'addElectron', addedShellToo: true});
        } else {
          if (tracking) this.userActions.push('addElectron');
        }
        break;
    }

    // update the document model hidden input field
    this.exportModelState();
  }

  subtractElement(element, tracking = true) {
    switch (element) {
      case 'shell':
        if (this.activeShells <= 0) return;

        // remove shell particles on the outermost shell
        let deletedElectrons = this.shellParticles.filter(
            e => {return e.shell == this.activeShells});
        this.shellParticles = this.shellParticles.filter(
            e => {return e.shell != this.activeShells});

        this.activeShells--;
        this.activeElectrons -= deletedElectrons.length;
        if (tracking) {
          if (deletedElectrons.length == 0) {
            this.userActions.push('subtractShell');
          } else {
            this.userActions.push({
              action: 'subtractShell',
              shellElectrons: deletedElectrons.length
            });
          }
        }
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

            // if its the last particle, simply remove
            if (i == this.nucleusParticles.length - 1) {
              this.particlesInDeletion = this.particlesInDeletion.concat(
                  this.nucleusParticles.splice(i, 1));
            } else {
              // otherwise replace with the last particle
              let endParticle = this.nucleusParticles.pop();
              let deletedParticle = this.nucleusParticles[i];
              this.nucleusParticles[i] = endParticle;
              this.particlesInDeletion.push(deletedParticle);
            }
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
    // update the document model hidden input field
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
    this.nucleusSpreadFactor = this.particleSize * this.spreadPercent;

    this.nucleusParticles.forEach((particle, i) => {
      particle.size = this.particleSize;
    });
    this.shellParticles.forEach((particle, i) => {
      particle.size = this.particleSize * this.electronSizePercent;
    });

    this.remapNucleus();
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
    this.nucleusSpreadFactor = this.particleSize * this.spreadPercent;

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
    let userAction = this.userActions.pop();
    if (typeof userAction === 'string') {
      switch (userAction) {
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
      }
    } else {
      switch (userAction.action) {
        case 'subtractElectron':
          this.addElement('electron', false);
          let revivedParticle =
              this.shellParticles[this.shellParticles.length - 1];
          revivedParticle.shell = userAction.shell;
          revivedParticle.inUserGrasp = false;
          break;
        case 'subtractShell':
          this.addElement('shell', false);
          let counter = userAction.shellElectrons;
          while (counter--) {
            this.addElement('electron', false);
          }
          break;
        case 'addElectron':
          this.subtractElement('electron', false);
          this.subtractElement('shell', false);
          break;
      }
    }
  }

  indexToRestPosition(i) {
    // based on sunflower seed dispersal pattern & golden ratio
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
      return;
    }

    // undo button
    if (this.undoButton.mouseOnButton(this.mouseVec)) {
      this.undoLastAction();
      this.lastInputWasAdjuster = true;
      return;
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
        return;
      }
    }
  }

  handleClickEnd() {
    this.mouseVec.x = this.p.mouseX;
    this.mouseVec.y = this.p.mouseY;

    // delete quickly clicked particles
    if (this.p.frameCount - this.lastInputFrame < 10 &&
        !this.lastInputWasAdjuster &&
        !this.undoButton.mouseOnButton(this.mouseVec)) {
      // delete nucleus particles under the mouse
      for (const [i, particle] of this.nucleusParticles.entries()) {
        if (particle.inUserGrasp) {
          if (particle.color == this.atomColors.protonColor) {
            this.activeProtons--;
            this.userActions.push('subtractProton');
          } else {
            this.activeNeutrons--;
            this.userActions.push('subtractNeutron');
          }

          // set particle for deletion
          particle.delete();

          // if it's the last particle, simply remove
          if (i == this.nucleusParticles.length - 1) {
            this.particlesInDeletion = this.particlesInDeletion.concat(
                this.nucleusParticles.splice(i, 1));
          } else {
            // otherwise replace with the last particle
            let endParticle = this.nucleusParticles.pop();
            this.nucleusParticles[i] = endParticle;
            this.particlesInDeletion.push(particle);
          }
          // remap rest positions
          this.remapNucleus();
          break;
        }
      }

      // delete shell particles under the mouse
      for (const electron of this.shellParticles) {
        if (electron.inUserGrasp) {
          electron.delete();
          this.activeElectrons--;
          this.userActions.push(
              {action: 'subtractElectron', shell: electron.shell});
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

    // update the document model hidden input field
    this.exportModelState();
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

class AtomicParticle {
  constructor(pos, deletionPos, size, color, interactive, widgetController, p) {
    // positioning
    this.pos = pos;
    this.targetPos = pos.copy();
    this.deletionPos = deletionPos;
    this.shell = 0;
    // appearance
    this.size = size;
    this.color = color;

    // link to sketch instance
    this.p = p;
    this.widgetController = widgetController;

    // interactivity
    this.interactive = interactive;
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
      drawSize = this.p.lerp(
          this.size, this.size * this.widgetController.particleHoverScale,
          this.p.min(
              1,
              this.framesHovered / this.widgetController.hoverEffectDuration));
    } else {
      this.framesHovered = 0;
    }

    // set size and position user grasp
    if (this.inUserGrasp) {
      this.pos.x = this.p.mouseX;
      this.pos.y = this.p.mouseY;
      drawSize = this.size * this.widgetController.particleGraspScale;
    } else {
      this.pos.lerp(this.targetPos, this.widgetController.particleSpeed);
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
  constructor(topLeftCorner, dims, widgetController) {
    // link to controller
    this.widgetController = widgetController;
    this.p = widgetController.p;

    // positioning
    this.topLeftCorner = topLeftCorner;
    this.dims = dims;
    this.centerPos = topLeftCorner.copy().add(dims.x / 2, dims.y / 2);
    this.capDims = dims.copy();
    this.capDims.y *= 0.7;
    this.capDims.x = this.capDims.y * 1.6;
    this.leftCapCenter = this.p.createVector(
        this.centerPos.x - (this.dims.x - this.capDims.x) / 2,
        this.centerPos.y);
    this.rightCapCenter = this.p.createVector(
        this.centerPos.x + (this.dims.x - this.capDims.x) / 2,
        this.centerPos.y);
    this.labelPos = this.centerPos.copy();

    // hover and keyboard focused display
    this.subtractMouseFocused = false;
    this.subtractKeyboardFocused = false;
    this.addMouseFocused = false;
    this.addKeyboardFocused = false;
    this.subtractFramesHovered = 0;
    this.addFramesHovered = 0;
    this.unfocusedColor =
        this.p.color(this.widgetController.atomColors.buttonUnfocusedColor);
    this.focusedColor =
        this.p.color(this.widgetController.atomColors.buttonFocusedColor);
  }

  draw() {
    this.p.push();
    this.p.rectMode(this.p.CENTER);

    // draw minus button
    // set button fill color
    if (this.subtractMouseFocused || this.subtractKeyboardFocused) {
      this.subtractFramesHovered++;
      let hoverProgress = this.p.min(
          1,
          this.subtractFramesHovered /
              this.widgetController.hoverEffectDuration);
      this.p.fill(this.p.lerpColor(
          this.unfocusedColor, this.focusedColor, hoverProgress));
    } else {
      this.subtractFramesHovered = 0;
      this.p.fill(this.unfocusedColor)
    }
    // set button stroke
    if (this.subtractKeyboardFocused) {
      this.p.stroke('#FFA500');
      this.p.strokeWeight(3);
    } else {
      this.p.noStroke();
    }
    this.p.rect(
        this.leftCapCenter.x, this.leftCapCenter.y, this.capDims.x,
        this.capDims.y, 6);
    // draw plus button
    // set button fill color
    if (this.addMouseFocused || this.addKeyboardFocused) {
      this.addFramesHovered++;
      let hoverProgress = this.p.min(1, this.addFramesHovered / 20);
      this.p.fill(this.p.lerpColor(
          this.unfocusedColor, this.focusedColor, hoverProgress));
    } else {
      this.addFramesHovered = 0;
      this.p.fill(this.unfocusedColor)
    }
    // set button stroke
    if (this.addKeyboardFocused) {
      this.p.stroke('#FFA500');
      this.p.strokeWeight(3);
    } else {
      this.p.noStroke();
    }
    this.p.rect(
        this.rightCapCenter.x, this.rightCapCenter.y, this.capDims.x,
        this.capDims.y, 6);

    // draw the -/+ signs
    this.p.stroke(0);
    this.p.strokeWeight(1.2);
    // minus sign
    this.p.line(
        this.leftCapCenter.x - this.capDims.x / 7, this.leftCapCenter.y,
        this.leftCapCenter.x + this.capDims.x / 7, this.leftCapCenter.y);
    // plus sign
    this.p.line(
        this.rightCapCenter.x - this.capDims.x / 7, this.rightCapCenter.y,
        this.rightCapCenter.x + this.capDims.x / 7, this.rightCapCenter.y);
    this.p.line(
        this.rightCapCenter.x, this.rightCapCenter.y - this.capDims.x / 7,
        this.rightCapCenter.x, this.rightCapCenter.y + this.capDims.x / 7);

    // draw the label
    this.p.fill(0);
    this.p.noStroke();
    this.p.textSize(this.dims.y / 3);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text('Shells', this.labelPos.x, this.labelPos.y);

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
      topLeftCorner, dims, particleType, interactive, widgetController) {
    // link to controller
    this.widgetController = widgetController;
    this.p = widgetController.p;

    // positioning and sizing
    this.topLeftCorner = topLeftCorner;
    this.dims = dims;
    this.bottomRightCorner = topLeftCorner.copy().add(this.dims);
    this.particleSize = dims.y * 2 / 3;
    this.particlePos =
        this.topLeftCorner.copy().add(this.particleSize / 1.2, this.dims.y / 2);
    this.labelPos =
        this.topLeftCorner.copy().add(this.dims.x / 2, this.dims.y / 2);
    this.countPos = this.topLeftCorner.copy().add(
        dims.x - this.particleSize / 2, this.dims.y / 2);

    // particle
    switch (particleType) {
      case 'proton':
        this.particleColor = widgetController.atomColors.protonColor;
        this.labelText = 'Protons';
        break;
      case 'neutron':
        this.particleColor = widgetController.atomColors.neutronColor;
        this.labelText = 'Neutrons';
        break;
      case 'electron':
        this.particleColor = widgetController.atomColors.electronColor;
        this.labelText = 'Electrons';
        break;
    }

    // mouse and keyboard focus
    this.clearColor = this.p.color(this.particleColor);
    this.clearColor.setAlpha(0);
    this.hoverColor = this.p.color(this.particleColor);
    this.hoverColor.setAlpha(this.widgetController.paletteParticleHoverOpacity);
    this.keyboardFocused = false;
    this.mouseFocused = false;
    this.interactive = interactive;
    this.framesHovered = 0;

    // label
    this.particleType = particleType;
    this.labelCount = 0;
  }

  draw() {
    this.p.push();
    // set the fill color
    if ((this.mouseFocused || this.keyboardFocused) && this.interactive) {
      this.framesHovered++;
      this.p.fill(this.p.lerpColor(
          this.clearColor, this.hoverColor,
          this.p.min(
              1,
              this.framesHovered / this.widgetController.hoverEffectDuration)))
    } else {
      this.framesHovered = 0;
      this.p.noFill();
    }

    // set the stroke
    if (this.keyboardFocused) {
      this.p.stroke('#FFA500');
      this.p.strokeWeight(3);
    }

    // draw outer container
    this.p.rect(
        this.topLeftCorner.x, this.topLeftCorner.y, this.dims.x, this.dims.y,
        6);

    // draw the particle
    this.p.stroke(0);
    this.p.strokeWeight(1.6);
    this.p.fill(this.particleColor);
    this.p.ellipse(this.particlePos.x, this.particlePos.y, this.particleSize);
    if (this.particleType == 'proton') {
      // draw plus
      this.p.line(
          this.particlePos.x, this.particlePos.y - this.particleSize / 5,
          this.particlePos.x, this.particlePos.y + this.particleSize / 5);
      this.p.line(
          this.particlePos.x - this.particleSize / 5, this.particlePos.y,
          this.particlePos.x + this.particleSize / 5, this.particlePos.y);
    } else if (this.particleType == 'electron') {
      // draw minus
      this.p.line(
          this.particlePos.x - this.particleSize / 5, this.particlePos.y,
          this.particlePos.x + this.particleSize / 5, this.particlePos.y);
    }

    // draw the label
    this.p.textSize(this.dims.y / 3);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.fill(0);
    this.p.noStroke();
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
    return this.interactive && mouseVec.x > this.topLeftCorner.x &&
        mouseVec.x < this.bottomRightCorner.x &&
        mouseVec.y > this.topLeftCorner.y &&
        mouseVec.y < this.bottomRightCorner.y;
  }
}

class WidgetButton {
  constructor(topLeftCorner, dims, labelText, widgetController) {
    // link to controller
    this.widgetController = widgetController;
    this.p = widgetController.p;

    // positioning
    let reducedHeight = dims.y * 0.75;
    let margin = (dims.y - reducedHeight) / 2;
    this.rectPos = topLeftCorner.copy().add(0, margin);
    this.rectDims = this.p.createVector(dims.x, reducedHeight);
    this.rectBounds = this.rectPos.copy().add(this.rectDims);

    // label
    this.labelText = labelText;
    this.labelPos = topLeftCorner.copy().add(dims.x / 2, dims.y / 2);
    this.labelSize = dims.y / 3;

    // hover and keyboard focusing
    this.mouseFocused = false;
    this.keyboardFocused = false;
    this.framesHovered = 0;
    this.unfocusedColor =
        this.p.color(this.widgetController.atomColors.buttonUnfocusedColor);
    this.focusedColor =
        this.p.color(this.widgetController.atomColors.buttonFocusedColor);
  }

  draw() {
    this.p.push();
    // set the fill color for hover
    if (this.mouseFocused || this.keyboardFocused) {
      this.framesHovered++;
      let hoverProgress = this.p.min(
          1, this.framesHovered / this.widgetController.hoverEffectDuration);
      this.p.fill(this.p.lerpColor(
          this.unfocusedColor, this.focusedColor, hoverProgress));
    } else {
      this.framesHovered = 0;
      this.p.fill(this.unfocusedColor)
    }

    // set the stroke for keyboard focus
    if (this.keyboardFocused) {
      this.p.stroke('#FFA500');
      this.p.strokeWeight(3);
    } else {
      this.p.noStroke();
    }

    // draw outer container
    this.p.rect(
        this.rectPos.x, this.rectPos.y, this.rectDims.x, this.rectDims.y, 6);

    // draw the label
    this.p.noStroke();
    this.p.textSize(this.labelSize);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.fill(0);
    this.p.text(this.labelText, this.labelPos.x, this.labelPos.y);

    this.p.pop();
  }

  mouseOnButton(mouseVec) {
    return mouseVec.x > this.rectPos.x && mouseVec.x < this.rectBounds.x &&
        mouseVec.y > this.rectPos.y && mouseVec.y < this.rectBounds.y;
  }
}

class AtomicDataCard {
  constructor(topLeftCorner, dims, p) {
    // link to controller and p5 instance
    this.p = p;

    // size and positioning
    this.topLeftCorner = topLeftCorner.copy();
    this.dims = dims;
    this.nametabHeight = this.dims.y / 4;
    this.nametabY = topLeftCorner.y + dims.y - this.nametabHeight;
    this.symbolPosition =
        topLeftCorner.copy().add(dims.x * 2 / 3, dims.y * 2 / 5);
    this.namePosition = topLeftCorner.copy().add(
        this.dims.x / 2, this.dims.y - this.nametabHeight / 2);
    this.numberPosition =
        topLeftCorner.copy().add(dims.x * 1 / 4, dims.y * 3 / 5);
    this.molarPosition = topLeftCorner.copy().add(dims.x * 1 / 4, dims.y / 5)
  }

  draw(protonCount) {
    // if no protons are in the model, or element doesen't exist
    // skip displaying
    if (protonCount <= 0 || protonCount >= 120) return;

    // extract the periodic table data
    let elementID = periodicTableData.order[protonCount - 1];
    let elementData = periodicTableData[elementID];


    this.p.push();
    // outer container
    this.p.noFill();
    this.p.rect(
        this.topLeftCorner.x, this.topLeftCorner.y, this.dims.x, this.dims.y,
        6);
    this.p.fill(200);
    this.p.rect(
        this.topLeftCorner.x, this.nametabY, this.dims.x, this.nametabHeight, 0,
        0, 6, 6);

    // text
    this.p.fill(0);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(this.dims.y / 5);
    this.p.text(
        '' + elementData.number, this.numberPosition.x, this.numberPosition.y);
    this.p.text(
        '' + this.p.round(elementData.atomic_mass), this.molarPosition.x,
        this.molarPosition.y);
    // prevent text overflow on element name
    while (this.p.textWidth('' + elementData.name) > this.dims.x * 0.9) {
      this.p.textSize(this.p.textSize() - 1);
    };
    this.p.text(
        '' + elementData.name, this.namePosition.x, this.namePosition.y);
    this.p.textSize(this.dims.y / 3);
    this.p.text(
        '' + elementData.symbol, this.symbolPosition.x, this.symbolPosition.y);


    this.p.pop();
  }
}