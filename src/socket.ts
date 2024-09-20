import { debug, getGame, log, logError } from './helpers';
import TableMap from './TableMap';

export const enum SocketFunctions {
  PanToCentre = 'panToCentre',
  PanToCursor = 'panToCursor',
  ShowEntireMap = 'showEntireMap',
}

export class TableMapSocket {
  socket?: SocketlibSocket;
  tableMap: TableMap;

  constructor(tableMap: TableMap, socket?: SocketlibSocket) {
    this.socket = socket;
    this.tableMap = tableMap;
    if (socket) {
      log('Socket is available');
      this.registerSocketFunctions();
    } else {
      log('Socket is not available');
    }
  }

  registerSocketFunction<T extends SocketFunctions>(
    functionName: T,
    func: Function
  ): void {
    debug(`Registering socket function '${functionName}'`);
    this.socket?.register(functionName, (...params: any[]) => {
      debug(`Socket execution of ${functionName}`, { ...params });
      func(...params);
    });
  }

  registerSocketFunctions(): void {
    debug('Registering socket functions');
    this.registerSocketFunction(
      SocketFunctions.PanToCursor,
      (x: number, y: number) => {
        this.tableMap.panAndScale(x, y, true);
      }
    );
    this.registerSocketFunction(SocketFunctions.PanToCentre, () =>
      this.tableMap.panToCentre()
    );
    this.registerSocketFunction(SocketFunctions.ShowEntireMap, () =>
      this.tableMap.showEntireMap()
    );
  }

  get socketEnabled(): boolean {
    return !!this.socket;
  }

  get displayUserId(): string | null {
    return this.tableMap.displayUserId;
  }

  socketFunctions = {
    [SocketFunctions.PanToCentre]: () => {
      this.tryToExecuteAsUser(SocketFunctions.PanToCentre);
    },
    [SocketFunctions.PanToCursor]: (x: number, y: number) => {
      this.tryToExecuteAsUser(SocketFunctions.PanToCursor, x, y);
    },
    [SocketFunctions.ShowEntireMap]: () => {
      this.tryToExecuteAsUser(SocketFunctions.ShowEntireMap);
    },
  } satisfies {
    [key in SocketFunctions]: (...params: never) => void;
  };

  async tryToExecuteAsUser(functionName: SocketFunctions, ...params: any[]) {
    if (!this.displayUserId) {
      logError('Define a display user');
      return;
    }
    if (getGame().userId === this.displayUserId) {
      logError(`Attempted to send socket execution of ${functionName} to self`);
      return;
    }
    try {
      await this.socket?.executeAsUser(
        functionName,
        this.displayUserId,
        ...params
      );
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
  }
}
