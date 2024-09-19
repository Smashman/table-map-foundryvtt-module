import { AnimatedPanView } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/pixi/board';
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
  constructor(socket?: SocketlibSocket) {
    log('TableMap initialising');
    if (socket) {
      log('Socket is available');
      this.socket = socket;
      this.registerSocketFunctions();
    } else {
      log('Socket is not available');
    }
    this.registerKeybinds();
  }

  socket?: SocketlibSocket;

  get isDisplayUser(): boolean {
    return getGame().userId === this.displayUserId;
  }

  get isGM(): boolean {
    return !!getGame().user?.isGM;
  }

  registerKeybinds(): void {
    registerKeybind(
      ModuleKeybinds.PanToCentre,
      this.panAndScaleCentre.bind(this, true)
    );
    registerKeybind(
      ModuleKeybinds.PanToCursor,
      this.panAndScaleCursor.bind(this)
    );
    registerKeybind(
      ModuleKeybinds.Fullscreen,
      this.toggleFullscreen.bind(this)
    );
    registerKeybind(ModuleKeybinds.ToggleUI, this.toggleUI.bind(this));
  }

  registerSocketFunctions(): void {
    log('Registering socket functions');
    this.socket?.register('panToCursor', (x: number, y: number) => {
      log('panToCursor from socket', { x, y });
      this.panAndScale(x, y, true);
    });
    this.socket?.register('panToCentre', () => {
      log('panToCentre from socket');
      this.panAndScaleCentre();
    });
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

  runForGMOnly(fn: Function): void {
    if (this.isGM) {
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

  clamp(x: number, y: number): { x: number; y: number } {
    const width = window.screen.width;
    const height = window.screen.height;

    const diagonalSize = getSetting(ModuleSettings.DiagonalSize);
    const dpiOverride = getSetting(ModuleSettings.DPIOverride);
    const dpi = dpiOverride || this.calculateDPI(width, height, diagonalSize);

    const canvas = getCanvas();
    const dimensions = canvas.dimensions;

    if (dimensions) {
      const scale = dpi / dimensions.size;

      const [screenWidth, screenHeight] = canvas.screenDimensions;

      const midPointX = screenWidth / 2 / scale;
      const midPointY = screenHeight / 2 / scale;

      const left = midPointX + dimensions.sceneX;
      const top = midPointY + dimensions.sceneY;
      const right = dimensions.sceneX + dimensions.sceneWidth - midPointX;
      const bottom = dimensions.sceneY + dimensions.sceneHeight - midPointY;

      const clampedPosition = {
        x,
        y,
      };

      if (x < left) {
        clampedPosition.x = left;
      } else if (x > right) {
        clampedPosition.x = right;
      }

      if (y < top) {
        clampedPosition.y = top;
      } else if (y > bottom) {
        clampedPosition.y = bottom;
      }

      if (screenWidth > dimensions.sceneWidth * scale) {
        clampedPosition.x = dimensions.width / 2;
      }
      if (screenHeight > dimensions.sceneHeight * scale) {
        clampedPosition.y = dimensions.height / 2;
      }

      log('Clamped position', { clampedPosition });

      return clampedPosition;
    }
    return { x: 0, y: 0 };
  }

  panAndScale(x: number, y: number, animate: boolean = true): void {
    this.runForDisplayUserOnly(() => {
      const width = window.screen.width;
      const height = window.screen.height;

      const diagonalSize = getSetting(ModuleSettings.DiagonalSize);
      const dpiOverride = getSetting(ModuleSettings.DPIOverride);

      const dpi = dpiOverride || this.calculateDPI(width, height, diagonalSize);
      const canvas = getCanvas();
      const dimensions = canvas.dimensions;

      const clampedPosition = this.clamp(x, y);

      if (dimensions) {
        const panOptions: AnimatedPanView = {
          x: clampedPosition.x,
          y: clampedPosition.y,
          scale: dpi / dimensions.size,
        };
        log('Pan & Scale', { panOptions, animate });
        canvas[animate ? 'animatePan' : 'pan'](panOptions);
      } else {
        error('Canvas dimensions are null');
      }
    });
  }

  panAndScaleCentre(animate: boolean = true): void {
    const canvas = getCanvas();
    const dimensions = canvas.dimensions;

    this.runForGMOnly(() => {
      if (!this.displayUserId) {
        error('Please define a display user,');
        return;
      }
      this.socket?.executeAsUser('panToCentre', this.displayUserId);
    });

    if (dimensions) {
      const x = dimensions.width / 2;
      const y = dimensions.height / 2;

      this.panAndScale(x, y, animate);
    } else {
      error('Canvas dimensions are null');
    }
  }

  panAndScaleCursor(): void {
    const canvas = getCanvas();
    const mousePosition = canvas.mousePosition;

    log({ mousePosition });

    this.runForGMOnly(() => {
      if (!this.displayUserId) {
        error('Please define a display user,');
        return;
      }

      this.socket?.executeAsUser(
        'panToCursor',
        this.displayUserId,
        mousePosition.x,
        mousePosition.y
      );
    });

    this.panAndScale(mousePosition.x, mousePosition.y);
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
