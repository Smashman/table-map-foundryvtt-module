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

export const wrapConsoleLog = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.log('Map Table Module 🗺️ |', ...args);
  }
};
