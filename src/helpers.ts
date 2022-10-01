import { DEBUG_MODE } from './constants';

export const getGame = (): Game => {
  if (!(game instanceof Game)) {
    throw new Error('game is not initialized yet!');
  }
  return game;
};

export const getCanvas = (): Canvas => {
  if (!(canvas instanceof Canvas) || !canvas.ready) {
    throw new Error('canvas is not initialized yet!');
  }
  return canvas;
};

const writeToConsole = (method: 'log' | 'error', ...args: any[]) => {
  console[method]('TableMap Module 🗺️ |', ...args);
};

export const log = (...args: any[]) => {
  if (DEBUG_MODE) {
    writeToConsole('log', ...args);
  }
};

export const error = (...args: any[]) => {
  writeToConsole('error', ...args);
};
