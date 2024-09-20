import { MODULE_NAME } from './constants';
import { getGame, log } from './helpers';

export const enum ModuleKeybinds {
  PanToCentre = 'panToCentre',
  PanToCursor = 'panToCursor',
  ShowEntireMap = 'showEntireMap',
  Fullscreen = 'fullscreen',
  ToggleUI = 'toggleUi',
}

const keybindData: { [key in ModuleKeybinds]: KeybindingActionConfig } = {
  [ModuleKeybinds.PanToCursor]: {
    name: 'Pan to cursor',
    hint: 'Pans and scales the map to your current cursor position for the display user',
    editable: [{ key: 'KeyT' }],
  },
  [ModuleKeybinds.PanToCentre]: {
    name: 'Pan to centre',
    hint: 'Pans and scales the map to the centre for the display user',
    editable: [{ key: 'KeyT', modifiers: ['SHIFT'] }],
  },
  [ModuleKeybinds.ShowEntireMap]: {
    name: 'Show entire map',
    hint: 'Scales map to show it in its entirety',
    editable: [{ key: 'KeyT', modifiers: ['ALT'] }],
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
