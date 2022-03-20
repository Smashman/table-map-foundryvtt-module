import { PanView } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/canvas';
import { CLASS_NAME } from './constants';
import { getCanvas, getGame, wrapConsoleLog } from './helpers';
import { getSetting, ModuleSettings, registerSetting } from './settings';

class TableMap {
  width: number;
  height: number;
  diagonalSize: number;
  dpiOverride?: number;

  displayUserId: string;

  constructor() {
    this.registerSettings();
    
    this.width = window.screen.width;
    this.height = window.screen.height;

    this.displayUserId = getSetting(ModuleSettings.UserID);
    this.diagonalSize = getSetting(ModuleSettings.DiagonalSize);
    this.dpiOverride = getSetting(ModuleSettings.DPIOverride);

    this.runForDisplayUserOnly(() =>
      wrapConsoleLog('Current user is the Display User')
    );
  }

  registerSettings(): void {
    const users = getGame().users;
    const choices = users!.reduce(
      (prev, user) => ({ ...prev, [user.data._id]: user.data.name }),
      { '': '' }
    );

    registerSetting(ModuleSettings.UserID, choices);
    registerSetting(ModuleSettings.DiagonalSize);
    registerSetting(ModuleSettings.DPIOverride);
  }

  runForDisplayUserOnly(fn: Function): void {
    if (getGame().userId === this.displayUserId) {
      fn();
    }
  }

  calculateDPI(): number {
    const width = this.width;
    const ratio = this.height / width;
    const horizontalSize = Math.sqrt(
      Math.pow(this.diagonalSize, 2) / (1 + Math.pow(ratio, 2))
    );
    return width / horizontalSize;
  }

  hideUI(addOrRemove?: 'add' | 'remove'): void {
    this.runForDisplayUserOnly(() => {
      wrapConsoleLog(`${addOrRemove === 'remove' ? 'Showing' : 'Hiding'} UI`);
      document.body.classList[addOrRemove ?? 'add'](CLASS_NAME);
    });
  }

  toggleUI(): void {
    if (document.body.classList.contains(CLASS_NAME)) {
      this.hideUI('remove');
    } else {
      this.hideUI();
    }
  }

  panAndZoom(): void {
    this.runForDisplayUserOnly(() => {
      const canvas = getCanvas();
      const panOptions: PanView = {
        x: canvas.dimensions!.width / 2,
        y: canvas.dimensions!.height / 2,
        scale:
          this.dpiOverride || this.calculateDPI() / canvas.dimensions!.size,
      };
      wrapConsoleLog('Pan & Zoom', { panOptions });
      canvas.pan(panOptions);
    });
  }
}

export default TableMap;
