const widgetConfig = {
  container: 'sketch-container',
  interactive: true,
  imagePath: 'assets/img/solar-system.png',
  imageWidth: 100,
  maxImageHeight: 50,
  selecbleAreaCount: 1,
  hotspots: [{
    area: [[0.25, 0.25], [0.75, 0.25], [0.75, 0.75], [0.25, 0.75]],
    iconMark: [0.75, 0.25],
    color: 'blue'
  }]
};

let removeWidget = runSelectableAreasWidget(widgetConfig);
