import '../scss/style.scss';
import TableMap from './TableMap';

let tableMap: TableMap;

Hooks.once('canvasInit', () => {
  tableMap = new TableMap();
  tableMap.hideUI();
});

Hooks.on('canvasReady', () => {
  tableMap.panAndZoom();
});
