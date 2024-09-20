declare namespace ClientSettings {
  interface Values {
    'table-map.userId': string;
    'table-map.diagonalSize': number | null;
    'table-map.dpiOverride': number | null;
  }
}

declare namespace Canvas {
  interface Dimensions {
    sceneX: number;
    sceneY: number;
  }
}
