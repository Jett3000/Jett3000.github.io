const atomicStructureConfig = {
  container: 'sketch-container',
  particleInteractivity: {
    protons: true,
    neutrons: true,
    electrons: true,
    shells: true,
  },
  maxElements: 100,
  atomData: {protons: 20, neutrons: 20, shells: [2, 8, 8, 2], atomCard: true},
  atomColors: {
    protonColor: '#EF3F54',
    neutronColor: '#8BC867',
    electronColor: '#49C7EA',
    buttonUnfocusedColor: '#DBF1FD',
    buttonFocusedColor: '#BCE7FF'
  }
};

let removeAtomicStructureWidget =
    runAtomicStructureWidget(atomicStructureConfig);
