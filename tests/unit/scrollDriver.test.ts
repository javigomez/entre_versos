import { expect, jest, test } from '@jest/globals';
import { createScrollDriver } from '../../src/infrastructure/expo/ui/viewport/scrollDriver';

function fakeClock() {
  let time = 0; let next = 1; const queue = new Map<number, () => void>();
  return { clock: { now: () => time, schedule: (fn: () => void) => { const id = next++; queue.set(id, fn); return id; }, cancel: (id: number) => queue.delete(id) }, advance(ms: number) { time += ms; for (const [id, fn] of [...queue]) { queue.delete(id); fn(); } } };
}

test('anima a destino exacto y notifica una vez', () => {
  const fake = fakeClock(); const writes: number[] = []; const done = jest.fn();
  const driver = createScrollDriver({ writeOffset: y => writes.push(y) }, fake.clock, 240);
  driver.move(20, 220, false, done); fake.advance(16);
  expect(writes.at(-1)).toBeGreaterThan(20); expect(writes.at(-1)).toBeLessThan(220);
  fake.advance(256); expect(writes.at(-1)).toBe(220); expect(done).toHaveBeenCalledTimes(1);
});

test('interrumpir cancela y un nuevo movimiento invalida el anterior', () => {
  const fake = fakeClock(); const writes: number[] = []; const oldDone = jest.fn(); const newDone = jest.fn();
  const driver = createScrollDriver({ writeOffset: y => writes.push(y) }, fake.clock, 240);
  driver.move(0, 200, false, oldDone); fake.advance(16); driver.interrupt();
  expect(oldDone).toHaveBeenCalledWith('interrupted'); driver.move(10, 20, false, newDone); fake.advance(300);
  expect(newDone).toHaveBeenCalledWith('finished'); const count = writes.length; fake.advance(1000); expect(writes).toHaveLength(count);
});

test('movimiento reducido o distancia cero escribe una vez', () => {
  const fake = fakeClock(); const writes: number[] = []; const done = jest.fn();
  const driver = createScrollDriver({ writeOffset: y => writes.push(y) }, fake.clock, 240);
  driver.move(4, 4, false, done); driver.move(4, 40, true, done);
  expect(writes).toEqual([4, 40]); expect(done).toHaveBeenCalledTimes(2);
});
