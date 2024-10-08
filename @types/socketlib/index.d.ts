interface SocketlibSocket {
  socketName: string;
  register(name: string, func: Function): void;
  executeAsUser(name: string, userId: string, ...args: any[]): Promise<void>;
}

declare namespace socketlib {
  function registerModule(name: string): SocketlibSocket;
}
