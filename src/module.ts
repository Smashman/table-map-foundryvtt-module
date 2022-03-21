import '../scss/style.scss';
import TableMap from './TableMap';

let tableMap: TableMap;

Hooks.once('init', () => {
  tableMap = new TableMap();
});

Hooks.once('canvasInit', () => {
  tableMap.canvasInit();
});

Hooks.on('canvasReady', () => {
  tableMap.panAndScale();
});
