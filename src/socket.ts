import { getGame, logError } from './helpers';

const tryToExecuteAsUser =
  (socket?: SocketlibSocket) =>
  async (
    functionName: SocketFunctions,
    displayUserId: string | null,
    ...params: any[]
  ) => {
    if (getGame().userId === displayUserId) {
      logError(`Attempted to send socket execution of ${functionName} to self`);
      return;
    }
    if (!displayUserId) {
      logError('Define a display user');
      return;
    }
    try {
      await socket?.executeAsUser(functionName, displayUserId, ...params);
    } catch (error) {
      const errorName =
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name;

      if (errorName === 'SocketlibInvalidUserError') {
        return;
      } else if (errorName) {
        logError('Socketlib error', { error });
      } else {
        throw error;
      }
    }
  };

export const enum SocketFunctions {
  PanToCentre = 'panToCentre',
  PanToCursor = 'panToCursor',
  ShowEntireMap = 'showEntireMap',
}

export const socketFunctions = {
  [SocketFunctions.PanToCentre]: (socket) => (displayUserId: string | null) => {
    tryToExecuteAsUser(socket)(SocketFunctions.PanToCentre, displayUserId);
  },
  [SocketFunctions.PanToCursor]:
    (socket) => (displayUserId: string | null, x: number, y: number) => {
      tryToExecuteAsUser(socket)(
        SocketFunctions.PanToCursor,
        displayUserId,
        x,
        y
      );
    },
  [SocketFunctions.ShowEntireMap]:
    (socket) => (displayUserId: string | null) => {
      tryToExecuteAsUser(socket)(SocketFunctions.ShowEntireMap, displayUserId);
    },
} satisfies {
  [key in SocketFunctions]: (
    socket?: SocketlibSocket
  ) => (...params: never) => void;
};
