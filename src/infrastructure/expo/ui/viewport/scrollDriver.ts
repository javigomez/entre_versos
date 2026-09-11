export type Clock = { now(): number; schedule(callback: () => void): number; cancel(id: number): void };
export type ScrollPort = { writeOffset(y: number): void };
export type MoveResult = 'finished' | 'interrupted';
export type ScrollDriver = {
  move(from: number, to: number, reducedMotion: boolean, onDone: (result: MoveResult) => void): void;
  interrupt(): void;
  dispose(): void;
};

export function createScrollDriver(port: ScrollPort, clock: Clock, durationMs: number): ScrollDriver {
  let frame: number | null = null;
  let callback: ((result: MoveResult) => void) | null = null;
  let generation = 0;
  const cancelFrame = () => { if (frame !== null) { clock.cancel(frame); frame = null; } };
  const finish = (result: MoveResult) => { cancelFrame(); const done = callback; callback = null; if (done) done(result); };
  const move = (from: number, to: number, reducedMotion: boolean, onDone: (result: MoveResult) => void) => {
    generation += 1;
    cancelFrame(); callback = null;
    const run = generation;
    callback = onDone;
    if (reducedMotion || from === to || durationMs <= 0) { port.writeOffset(to); finish('finished'); return; }
    const start = clock.now();
    const tick = () => {
      if (run !== generation) return;
      const t = Math.min(1, Math.max(0, (clock.now() - start) / durationMs));
      const eased = 1 - (1 - t) ** 3;
      port.writeOffset(from + (to - from) * eased);
      if (t >= 1) finish('finished');
      else frame = clock.schedule(tick);
    };
    frame = clock.schedule(tick);
  };
  return {
    move,
    interrupt() { if (callback) finish('interrupted'); else cancelFrame(); generation += 1; },
    dispose() { generation += 1; cancelFrame(); callback = null; },
  };
}
