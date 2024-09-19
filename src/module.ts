import '../scss/style.scss';
import TableMap from './TableMap';

let tableMap: TableMap;
let socket: SocketlibSocket;

Hooks.once('init', () => {
  tableMap = new TableMap(socket);
});

Hooks.once('canvasInit', () => {
  tableMap.canvasInit();
});

Hooks.on('canvasReady', () => {
  tableMap.panAndScaleCentre(false);
});

Hooks.once('socketlib.ready', () => {
  socket = socketlib.registerModule('table-map');
});
