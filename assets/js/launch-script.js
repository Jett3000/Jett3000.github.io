const atomicStructureConfig = {
  container: 'sketch-container',
  particleInteractivity: {
    protons: true,
    neutrons: true,
    electrons: true,
    shells: true,
  },
  maxElements: 20,
  atomData: {protons: 6, neutrons: 6, shells: [2, 4], atomCard: true},
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
