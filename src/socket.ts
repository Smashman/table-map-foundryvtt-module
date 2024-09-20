import { getGame, logError } from './helpers';

const tryToExecuteAsUser =
  (socket?: SocketlibSocket) =>
  async (
    functionName: SocketFunctions,
    displayUserId: string,
    ...params: any[]
  ) => {
    if (getGame().userId === displayUserId) {
      logError(`Attempted to send socket execution of ${functionName} to self`);
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
}

export const socketFunctions = {
  [SocketFunctions.PanToCentre]:
    (socket?: SocketlibSocket) => (displayUserId: string | null) => {
      if (!displayUserId) {
        logError('Define a display user');
        return;
      }
      tryToExecuteAsUser(socket)(SocketFunctions.PanToCentre, displayUserId);
    },
  [SocketFunctions.PanToCursor]:
    (socket?: SocketlibSocket) =>
    (displayUserId: string | null, x: number, y: number) => {
      if (!displayUserId) {
        logError('Define a display user');
        return;
      }
      tryToExecuteAsUser(socket)(
        SocketFunctions.PanToCursor,
        displayUserId,
        x,
        y
      );
    },
} satisfies {
  [key in SocketFunctions]: (
    socket?: SocketlibSocket
  ) => (...params: never) => void;
};
