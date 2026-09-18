import type { Lesson } from '../domain/schemas';
import { initialProgress, submitChallengeAnswer } from '../domain/lesson';
import type { LessonProgress } from '../domain/lesson-progress';
import { messagesFor } from './message-projector';
import type { Message } from './messages';

export type Phase = 'writing' | 'waiting-start' | 'waiting-student' | 'waiting-choice' | 'pressing' | 'moving' | 'placing' | 'finished';
export type PendingReply = { nextProgress: LessonProgress; nextMessages: Message[]; messageId: string; controlId: string };
export type FlowState = { progress: LessonProgress; messages: Message[]; revealed: number; phase: Phase; token: number; anchorId: string | null; pending: PendingReply | null };
export type FlowEvent =
  | { type: 'START' }
  | { type: 'ACTIVATE_STUDENT'; controlId: string }
  | { type: 'ANSWER'; controlId: string; optionId: string }
  | { type: 'PRESS_DONE'; token: number }
  | { type: 'MOVE_DONE'; token: number }
  | { type: 'PLACED'; token: number }
  | { type: 'MESSAGE_DONE'; token: number; messageId: string }
  | { type: 'RESET' };

function phaseFor(lesson: Lesson, state: Pick<FlowState, 'progress' | 'messages' | 'revealed'>): Phase {
  if (state.revealed < state.messages.length)
    return state.messages[state.revealed].role === 'player' && state.messages[state.revealed].action ? 'waiting-student' : 'writing';
  if (!state.progress.started) return 'waiting-start';
  if (state.progress.completed.length === lesson.script.filter(item => item.type === 'single-choice').length) return 'finished';
  return 'waiting-choice';
}

export function createFlow(lesson: Lesson, progress: LessonProgress, restored: boolean): FlowState {
  const messages = messagesFor(lesson, progress);
  const revealed = restored ? messages.length : 0;
  const state = { progress, messages, revealed };
  const first = messages[0]?.id ?? null;
  return { ...state, phase: phaseFor(lesson, state), token: 0, anchorId: first, pending: null };
}

export function reduceFlow(lesson: Lesson, state: FlowState, event: FlowEvent): FlowState {
  if (event.type === 'RESET') {
    const progress = initialProgress(lesson);
    const messages = messagesFor(lesson, progress);
    return { progress, messages, revealed: 0, phase: 'writing', token: state.token + 1, anchorId: messages[0]?.id ?? null, pending: null };
  }
  switch (event.type) {
    case 'START': {
      if (state.phase !== 'waiting-start') return state;
      const progress = { ...state.progress, started: true };
      const messages = messagesFor(lesson, progress);
      const next = { ...state, progress, messages, token: state.token + 1 };
      return { ...next, phase: phaseFor(lesson, next) };
    }
    case 'ACTIVATE_STUDENT': {
      if (state.phase !== 'waiting-student') return state;
      const message = state.messages[state.revealed];
      if (!message?.action || message.role !== 'player' || event.controlId !== 'continue') return state;
      return { ...state, phase: 'pressing', token: state.token + 1, pending: { nextProgress: state.progress, nextMessages: state.messages, messageId: message.id, controlId: event.controlId } };
    }
    case 'ANSWER': {
      if (state.phase !== 'waiting-choice') return state;
      const nextProgress = submitChallengeAnswer(lesson, state.progress, event.optionId);
      if (nextProgress === state.progress) return state;
      const nextMessages = messagesFor(lesson, nextProgress);
      const message = nextMessages[state.revealed];
      if (!message || message.role !== 'player' || message.action) return state;
      return { ...state, phase: 'pressing', token: state.token + 1, pending: { nextProgress, nextMessages, messageId: message.id, controlId: event.controlId } };
    }
    case 'PRESS_DONE':
      return state.phase === 'pressing' && event.token === state.token ? { ...state, phase: 'moving' } : state;
    case 'MOVE_DONE': {
      if (state.phase !== 'moving' || event.token !== state.token || !state.pending) return state;
      return { ...state, progress: state.pending.nextProgress, messages: state.pending.nextMessages, phase: 'placing', anchorId: state.pending.messageId };
    }
    case 'PLACED':
      return state.phase === 'placing' && event.token === state.token && state.pending ? { ...state, phase: 'writing', pending: null } : state;
    case 'MESSAGE_DONE': {
      if (state.phase !== 'writing' || event.token !== state.token || state.messages[state.revealed]?.id !== event.messageId) return state;
      const next = { ...state, revealed: state.revealed + 1, token: state.token + 1 };
      return { ...next, phase: phaseFor(lesson, next) };
    }
  }
}
