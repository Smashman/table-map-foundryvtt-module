import { MODULE_NAME } from './constants';
import { getGame, log } from './helpers';

export const enum ModuleSettings {
  UserID = 'userId',
  DiagonalSize = 'diagonalSize',
  DPIOverride = 'dpiOverride',
}

export const settingsData: {
  [key in ModuleSettings]: ClientSettings.PartialSettingConfig<
    ClientSettings.Values[`${typeof MODULE_NAME}.${key}`]
  >;
} = {
  [ModuleSettings.UserID]: {
    name: 'Display User',
    hint: "User that will have UI hidden and map automatically scaled. Ensure they have a placeholder character and have 'Observer' permissions for all player characters",
    scope: 'world',
    type: String,
    config: true,
  },
  [ModuleSettings.DiagonalSize]: {
    name: 'Diagonal size of display',
    hint: 'Input number in inches. (Used with screen resolution to calculate correct canvas scale, so each map square will be 1 inch)',
    scope: 'world',
    type: Number,
    default: 40,
    config: true,
  },
  [ModuleSettings.DPIOverride]: {
    name: 'Custom DPI override',
    hint: "Force a custom DPI override for scale calculation, if you do not want the module to calculate the DPI (or it's calculating incorrectly)",
    scope: 'world',
    type: Number,
    config: true,
  },
};

export const registerSetting = <T extends ModuleSettings>(
  settingName: T,
  data?: ClientSettings.PartialSettingConfig<
    ClientSettings.Values[`${typeof MODULE_NAME}.${T}`]
  >
): void => {
  if (!data) {
    data = { ...settingsData[settingName] };
  }
  log(`Registering setting ${settingName}`, { data });
  getGame().settings.register(MODULE_NAME, settingName, data);
};

export const getSetting = <T extends ModuleSettings>(settingName: T) =>
  getGame().settings.get(MODULE_NAME, settingName);
