import '../scss/style.scss';
import { MODULE_NAME } from './constants';
import { debug } from './helpers';
import TableMap from './TableMap';

let tableMap: TableMap;
let socket: SocketlibSocket;

Hooks.once('init', () => {
  debug('init');
  tableMap = new TableMap(socket);
});

Hooks.once('canvasInit', () => {
  debug('canvasInit');
  tableMap.canvasInit();
});

Hooks.on('canvasReady', () => {
  debug('canvasReady');
  tableMap.panToCentre(false, true);
});

Hooks.once('socketlib.ready', () => {
  debug('socketlib.ready');
  socket = socketlib.registerModule(MODULE_NAME);
});

const updateSetting = (setting: Setting) => {
  debug('updateSetting', { setting });
  if (setting.key.startsWith(MODULE_NAME)) {
    tableMap.updateSetting(setting);
  }
};

Hooks.on('updateSetting', updateSetting);
Hooks.on('createSetting', updateSetting);
