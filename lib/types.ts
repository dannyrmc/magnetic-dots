export interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  size: number;
  lastForced: number; // timestamp when last forced to move
  assemblyDelay: number; // delay before starting assembly animation
}

export interface MouseState {
  x: number;
  y: number;
}