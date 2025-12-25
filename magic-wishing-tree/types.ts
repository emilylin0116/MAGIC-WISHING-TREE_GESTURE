
export enum TreeState {
  TREE = 'TREE',
  EXPLODE = 'EXPLODE',
  SENDING = 'SENDING'
}

export interface HandData {
  x: number;
  y: number;
  isPinching: boolean;
  isOpen: boolean;
  rawLandmarks?: any;
}
