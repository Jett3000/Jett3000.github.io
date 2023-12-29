const atomicStructureConfig = {
  container: 'sketch-container',
  particleInteractivity: {
    protons: true,
    electrons: true,
    neutrons: true,
    shells: true,
  },
  atomData: {protons: 10, neutrons: 10, shells: [2, 4, 4], atomCard: true},
  atomColors: {
    protonColor: '#4B0082',
    neutronColor: '#6C6377',
    electronColor: '#FFD700',
    buttonFocusColor: '#DCEBFC'
  }
};

let removeAtomicStructureWidget =
    runAtomicStructureWidget(atomicStructureConfig);
