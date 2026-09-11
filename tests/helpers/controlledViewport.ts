import type { ControlTarget, ViewportController } from '../../src/infrastructure/expo/ui/viewport/useConversationViewport';

export function createControlledViewport() {
  const moves: { target: ControlTarget; token: number; done: (token: number) => void }[] = [];
  const placements: { messageId: string; token: number; done: (token: number) => void }[] = [];
  const controller: ViewportController = {
    moveControl(target, token, done) { moves.push({ target, token, done }); },
    placeReply(messageId, token, done) { placements.push({ messageId, token, done }); },
    setAnchor() {}, interrupt() {}, reset() {}, dispose() {},
  };
  return {
    controller, moves, placements,
    finishMove(index = moves.length - 1) { const request = moves[index]; if (!request) throw new Error('No hay movimiento pendiente'); request.done(request.token); },
    finishPlacement(index = placements.length - 1) { const request = placements[index]; if (!request) throw new Error('No hay colocación pendiente'); request.done(request.token); },
  };
}
