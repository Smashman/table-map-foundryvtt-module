import { PanView } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/canvas';
import { CLASS_NAME } from './constants';
import { error, getCanvas, getGame, log } from './helpers';
import { ModuleKeybinds, registerKeybind } from './keybinds';
import {
  getSetting,
  ModuleSettings,
  registerSetting,
  settingsData,
} from './settings';

class TableMap {
  displayUserId: string | null = null;
  constructor() {
    this.registerKeybinds();
  }

  get isDisplayUser(): boolean {
    return getGame().userId === this.displayUserId;
  }

  registerKeybinds(): void {
    registerKeybind(ModuleKeybinds.PanToCentre, this.panAndScale.bind(this));
    registerKeybind(
      ModuleKeybinds.Fullscreen,
      this.toggleFullscreen.bind(this)
    );
    registerKeybind(ModuleKeybinds.ToggleUI, this.toggleUI.bind(this));
  }

  canvasInit(): void {
    this.registerSettings();
    this.displayUserId = getSetting(ModuleSettings.UserID);
    this.runForDisplayUserOnly(() => log('Current user is the Display User'));
    this.hideUI();
  }

  registerSettings(): void {
    const choices: Record<string, string> = getGame().users!.reduce(
      (prev, user) => ({ ...prev, [user.id]: user.name }),
      { '': '' }
    );

    const userIdData = { ...settingsData[ModuleSettings.UserID], choices };

    registerSetting(ModuleSettings.UserID, userIdData);
    registerSetting(ModuleSettings.DiagonalSize);
    registerSetting(ModuleSettings.DPIOverride);
  }

  runForDisplayUserOnly(fn: Function): void {
    if (this.isDisplayUser) {
      fn();
    }
  }

  calculateDPI(width: number, height: number, diagonalSize: number): number {
    const ratio = height / width;
    const horizontalSize = Math.sqrt(
      Math.pow(diagonalSize, 2) / (1 + Math.pow(ratio, 2))
    );
    return width / horizontalSize;
  }

  hideUI(addOrRemove: 'add' | 'remove' = 'add'): void {
    this.runForDisplayUserOnly(() => {
      log(`${addOrRemove === 'remove' ? 'Showing' : 'Hiding'} UI`);
      document.body.classList[addOrRemove](CLASS_NAME);
    });
  }

  toggleUI(): void {
    if (document.body.classList.contains(CLASS_NAME)) {
      this.hideUI('remove');
    } else {
      this.hideUI();
    }
  }

  panAndScale(): void {
    this.runForDisplayUserOnly(() => {
      const width = window.screen.width;
      const height = window.screen.height;

      const diagonalSize = getSetting(ModuleSettings.DiagonalSize);
      const dpiOverride = getSetting(ModuleSettings.DPIOverride);

      const dpi = dpiOverride || this.calculateDPI(width, height, diagonalSize);
      const canvas = getCanvas();
      const dimensions = canvas.dimensions;

      if (dimensions) {
        const panOptions: PanView = {
          x: dimensions.width / 2,
          y: dimensions.height / 2,
          scale: dpi / dimensions.size,
        };
        log('Pan & Scale', { panOptions });
        canvas.pan(panOptions);
      } else {
        error('Canvas dimensions is null');
      }
    });
  }

  toggleFullscreen(): void {
    this.runForDisplayUserOnly(() => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }
}

export default TableMap;
