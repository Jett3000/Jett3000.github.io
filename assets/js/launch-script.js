const atomicStructureConfig = {
  container: 'sketch-container',
  particleInteractivity: {
    protons: true,
    electrons: true,
    neutrons: true,
    shells: true,
  },
  maxElements: 20,
  atomData: {protons: 10, neutrons: 10, shells: [2, 4, 4], atomCard: true},
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
