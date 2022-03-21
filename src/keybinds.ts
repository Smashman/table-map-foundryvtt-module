import { MODULE_NAME } from './constants';
import { getGame, log } from './helpers';

export const enum ModuleKeybinds {
  PanToCentre = 'panToCentre',
  Fullscreen = 'fullscreen',
  ToggleUI = 'toggleUi',
}

const keybindData: { [key in ModuleKeybinds]: KeybindingActionConfig } = {
  [ModuleKeybinds.PanToCentre]: {
    name: 'Pan to centre',
    hint: 'Pans and scales the map to the centre for the display user',
    editable: [{ key: 'KeyT' }],
  },
  [ModuleKeybinds.Fullscreen]: {
    name: 'Toggle fullscreen',
    editable: [{ key: 'KeyF' }],
  },
  [ModuleKeybinds.ToggleUI]: {
    name: 'Toggle UI',
    hint: 'Hide or show the Foundry UI',
    editable: [{ key: 'KeyU' }],
  },
};

export const registerKeybind = <T extends ModuleKeybinds>(
  keybindName: T,
  onDown: (ctx: KeyboardEventContext) => boolean | void
): void => {
  const data: KeybindingActionConfig = { ...keybindData[keybindName], onDown };
  log(`Registering keybind ${keybindName}`);
  getGame().keybindings.register(MODULE_NAME, keybindName, data);
};
