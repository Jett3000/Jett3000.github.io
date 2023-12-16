const atomicStructureConfig = {
			container: 'sketch-container',
			particleInteractivity: {
				protons: true,
				electrons: true,
				nuetrons: true,
				shells: true,
			},
			atomData: {
				protons: 10,
				nuetrons: 10,
				shells: [2,4,4],
				atomCard: true
			},
			colors: ["#4B0082", "#6C6377", "#FFD700"]
		};

		let removeAtomicStructureWidget = runAtomicStructureWidget(atomicStructureConfig);