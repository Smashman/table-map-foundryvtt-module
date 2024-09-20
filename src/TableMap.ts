import { AnimatedPanView } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/pixi/board';
import { CLASS_NAME } from './constants';
import { logError, getCanvas, getGame, debug, log } from './helpers';
import { ModuleKeybinds, registerKeybind } from './keybinds';
import {
  getSetting,
  ModuleSettings,
  registerSetting,
  settingsData,
} from './settings';
import { SocketFunctions, socketFunctions } from './socket';

class TableMap {
  displayUserId: string | null = null;
  diagonalSize: number | null = null;
  dpiOverride: number | null = null;
  socket?: SocketlibSocket;

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

  canvasInit(): void {
    this.registerSettings();
    this.displayUserId = getSetting(ModuleSettings.UserID);
    this.diagonalSize = getSetting(ModuleSettings.DiagonalSize);
    this.dpiOverride = getSetting(ModuleSettings.DPIOverride);
    this.runForDisplayUserOnly(() => debug('Current user is the Display User'));
    this.hideUI();
  }

  get isDisplayUser(): boolean {
    return getGame().userId === this.displayUserId;
  }

  get isGM(): boolean {
    return !!getGame().user?.isGM;
  }

  registerKeybinds(): void {
    registerKeybind(
      ModuleKeybinds.PanToCentre,
      this.panToCentre.bind(this, true, false)
    );
    registerKeybind(ModuleKeybinds.PanToCursor, this.panToCursor.bind(this));
    registerKeybind(
      ModuleKeybinds.ShowEntireMap,
      this.showEntireMap.bind(this)
    );
    registerKeybind(
      ModuleKeybinds.Fullscreen,
      this.toggleFullscreen.bind(this)
    );
    registerKeybind(ModuleKeybinds.ToggleUI, this.toggleUI.bind(this));
  }

  registerSocketFunctions(): void {
    debug('Registering socket functions');
    this.socket?.register(
      SocketFunctions.PanToCursor,
      (x: number, y: number) => {
        debug('panToCursor from socket', { x, y });
        this.panAndScale(x, y, true);
      }
    );
    this.socket?.register(SocketFunctions.PanToCentre, () => {
      debug('panToCentre from socket');
      this.panToCentre();
    });
    this.socket?.register(SocketFunctions.ShowEntireMap, () => {
      debug('showEntireMap from socket');
      this.showEntireMap();
    });
  }

  registerSettings(): void {
    const choices: Record<string, string> = getGame().users!.reduce(
      (prev, user) => {
        if (user.isGM) {
          return { ...prev };
        }
        return { ...prev, [user.id]: user.name };
      },
      { '': '' }
    );

    const userIdData = { ...settingsData[ModuleSettings.UserID], choices };

    registerSetting(ModuleSettings.UserID, userIdData);
    registerSetting(ModuleSettings.DiagonalSize);
    registerSetting(ModuleSettings.DPIOverride);
  }

  updateSetting(_setting: Setting): void {
    this.displayUserId = getSetting(ModuleSettings.UserID);
    this.diagonalSize = getSetting(ModuleSettings.DiagonalSize);
    this.dpiOverride = getSetting(ModuleSettings.DPIOverride);
  }

  runForDisplayUserOnly(fn: Function): void {
    if (!this.displayUserId) {
      logError('Define a display user to use TableMap');
    }
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
      debug(`${addOrRemove === 'remove' ? 'Showing' : 'Hiding'} UI`);
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

    const canvas = getCanvas();
    const dimensions = canvas.dimensions;

    if (dimensions && this.diagonalSize) {
      const dpi =
        this.dpiOverride || this.calculateDPI(width, height, this.diagonalSize);

      const scale = dpi / dimensions.size;

      const [screenWidth, screenHeight] = canvas.screenDimensions;

      const midPointX = screenWidth / 2 / scale;
      const midPointY = screenHeight / 2 / scale;

      const left = midPointX + dimensions.sceneX;
      const top = midPointY + dimensions.sceneY;
      const right = dimensions.sceneX + dimensions.sceneWidth - midPointX;
      const bottom = dimensions.sceneY + dimensions.sceneHeight - midPointY;

      const clampedPosition = { x, y };

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

      debug('Clamped position', { clampedPosition });

      return clampedPosition;
    }
    return { x: 0, y: 0 };
  }

  panAndScale(x: number, y: number, animate: boolean = true): void {
    this.runForDisplayUserOnly(() => {
      const width = window.screen.width;
      const height = window.screen.height;
      const canvas = getCanvas();
      const dimensions = canvas.dimensions;

      if (!this.diagonalSize) {
        logError('Define the diagonal size of your screen');
      }

      if (dimensions && this.diagonalSize) {
        const clampedPosition = this.clamp(x, y);
        const dpi =
          this.dpiOverride ||
          this.calculateDPI(width, height, this.diagonalSize);
        const panOptions: AnimatedPanView = {
          x: clampedPosition.x,
          y: clampedPosition.y,
          scale: dpi / dimensions.size,
        };
        debug('Pan & Scale', { panOptions, animate });
        canvas[animate ? 'animatePan' : 'pan'](panOptions);
      } else {
        logError('Canvas dimensions are null');
      }
    });
  }

  panToCentre(animate: boolean = true, canvasReady: boolean = false): void {
    const canvas = getCanvas();
    const dimensions = canvas.dimensions;

    if (!canvasReady) {
      this.runForGMOnly(() => {
        socketFunctions[SocketFunctions.PanToCentre](this.socket)(
          this.displayUserId
        );
      });
    }

    this.runForDisplayUserOnly(() => {
      if (dimensions) {
        const x = dimensions.width / 2;
        const y = dimensions.height / 2;

        this.panAndScale(x, y, animate);
      } else {
        logError('Canvas dimensions are null');
      }
    });
  }

  panToCursor(): void {
    const canvas = getCanvas();
    const mousePosition = canvas.mousePosition;

    debug({ mousePosition });

    this.runForGMOnly(() => {
      socketFunctions[SocketFunctions.PanToCursor](this.socket)(
        this.displayUserId,
        mousePosition.x,
        mousePosition.y
      );
    });

    this.panAndScale(mousePosition.x, mousePosition.y);
  }

  showEntireMap(): void {
    debug('Show entire map');

    this.runForGMOnly(() => {
      socketFunctions[SocketFunctions.ShowEntireMap](this.socket)(
        this.displayUserId
      );
    });

    this.runForDisplayUserOnly(() => {
      const canvas = getCanvas();
      const [screenWidth, screenHeight] = canvas.screenDimensions;
      const dimensions = canvas.dimensions;
      if (dimensions) {
        const scaleX = screenWidth / dimensions.sceneWidth;
        const scaleY = screenHeight / dimensions.sceneHeight;

        debug('Scale', { scaleX, scaleY });

        const panOptions: AnimatedPanView = {
          x: dimensions.width / 2,
          y: dimensions.height / 2,
          scale: Math.min(scaleX, scaleY),
        };
        canvas.animatePan(panOptions);
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
