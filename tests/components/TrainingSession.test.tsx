import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { TrainingSession } from '../../src/infrastructure/expo/ui/TrainingSession';
import { initialProgress, restoreProgress, submitChallengeAnswer } from '../../src/domain/lesson';
import { conversation } from '../fixtures/conversation';
import { journeyLesson } from '../fixtures/journey';
import { createControlledViewport } from '../helpers/controlledViewport';

beforeEach(() => { jest.useFakeTimers(); jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false); });
afterEach(async () => { await cleanup(); jest.restoreAllMocks(); jest.clearAllTimers(); jest.useRealTimers(); });

async function completeActiveMessage() {
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Mostrar mensaje completo' })); });
}

async function completeActiveMessageIfNeeded() {
  const button = screen.queryByRole('button', { name: 'Mostrar mensaje completo' });
  if (button) await act(async () => { await fireEvent.press(button); });
}

async function finishTransition(viewport: ReturnType<typeof createControlledViewport>) {
  await act(async () => { jest.advanceTimersByTime(80); });
  await act(async () => { viewport.finishMove(); });
  await act(async () => { viewport.finishPlacement(); });
  await completeActiveMessageIfNeeded();
}

async function reachFirstChallenge(viewport: ReturnType<typeof createControlledViewport>) {
  await completeActiveMessageIfNeeded();
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Empezar' })); });
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Continuar' })); });
  await finishTransition(viewport);
  await completeActiveMessageIfNeeded();
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Continuar' })); });
  await finishTransition(viewport);
  await completeActiveMessageIfNeeded();
}

test('R01: Continuar espera movimiento y colocación antes de escribir', async () => {
  const viewport = createControlledViewport();
  await render(<TrainingSession lesson={conversation} initialProgress={initialProgress(conversation)} restored={false} onProgressChange={() => {}} viewportController={viewport.controller} />);
  await completeActiveMessageIfNeeded();
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Empezar' })); });
  expect(screen.getByRole('button', { name: 'Continuar' })).toBeOnTheScreen();
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Continuar' })); });
  expect(screen.queryByText('Quiero practicar.')).not.toBeOnTheScreen();
  await act(async () => { jest.advanceTimersByTime(80); });
  expect(viewport.moves).toHaveLength(1);
  await act(async () => { viewport.finishMove(); });
  expect(viewport.placements).toHaveLength(1);
  await act(async () => { viewport.finishPlacement(); });
  expect(screen.getByText(/▍/)).toBeOnTheScreen();
  await completeActiveMessageIfNeeded();
  expect(screen.getByText(/Quiero/)).toBeOnTheScreen();
  await completeActiveMessageIfNeeded();
  expect(screen.getByText(/Verso 1/)).toBeOnTheScreen();
  expect(screen.queryByText('Estoy preparado.')).not.toBeOnTheScreen();
});

test('R07: doble pulsación acepta una sola transición', async () => {
  const viewport = createControlledViewport();
  await render(<TrainingSession lesson={conversation} initialProgress={initialProgress(conversation)} restored={false} onProgressChange={() => {}} viewportController={viewport.controller} />);
  await completeActiveMessage();
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Empezar' })); });
  const button = screen.getByRole('button', { name: 'Continuar' });
  await act(async () => { await fireEvent.press(button); await fireEvent.press(button); });
  await act(async () => { jest.advanceTimersByTime(80); });
  expect(viewport.moves).toHaveLength(1);
});

test('J01: LEVANTARME permanece montado hasta que su transición pueda medirse', async () => {
  const viewport = createControlledViewport();
  await render(<TrainingSession lesson={journeyLesson} initialProgress={initialProgress(journeyLesson)} restored={false}
    onProgressChange={() => {}} viewportController={viewport.controller} />);
  await completeActiveMessage();

  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'LEVANTARME' })); });
  expect(screen.getByRole('button', { name: 'LEVANTARME' })).toBeDisabled();
  await act(async () => { jest.advanceTimersByTime(80); });
  expect(viewport.moves).toHaveLength(1);
});

test('R01: tras reiniciar, el primer mensaje termina y vuelve a mostrar LEVANTARME', async () => {
  const viewport = createControlledViewport();
  await render(<TrainingSession lesson={journeyLesson} initialProgress={initialProgress(journeyLesson)} restored={false}
    onProgressChange={() => {}} viewportController={viewport.controller} />);
  await completeActiveMessage();
  expect(screen.getByRole('button', { name: 'LEVANTARME' })).toBeOnTheScreen();

  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Reiniciar entrenamiento' })); });
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Reiniciar' })); });
  await completeActiveMessageIfNeeded();

  expect(screen.getByRole('button', { name: 'LEVANTARME' })).toBeOnTheScreen();
});

test('R01: la respuesta del jugador empieza a escribirse tras ocupar el ancla', async () => {
  const viewport = createControlledViewport();
  await render(<TrainingSession lesson={conversation} initialProgress={initialProgress(conversation)} restored={false}
    onProgressChange={() => {}} viewportController={viewport.controller} />);
  await completeActiveMessage();
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Empezar' })); });
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Continuar' })); });
  await act(async () => { jest.advanceTimersByTime(80); });
  await act(async () => { viewport.finishMove(); });
  await act(async () => { viewport.finishPlacement(); });

  expect(screen.getByText(/▍/)).toBeOnTheScreen();
  expect(screen.getByTestId('typing-content')).not.toHaveTextContent('Quiero practicar.');
});

test('J01/J02: la imagen elegida se convierte en palabra y muestra el siguiente reto en el chat', async () => {
  const viewport = createControlledViewport();
  const lesson = { ...journeyLesson, startWithStudent: undefined };
  await render(<TrainingSession lesson={lesson} initialProgress={{ ...initialProgress(lesson), started: true }} restored
    onProgressChange={() => {}} viewportController={viewport.controller} resolveImage={() => 1 as never} />);

  const firstImage = screen.getByRole('button', { name: 'PASO1A' });
  await act(async () => { await fireEvent.press(firstImage); await fireEvent.press(firstImage); });
  expect(screen.getByRole('button', { name: 'PASO1A' })).toBeDisabled();
  await act(async () => { jest.advanceTimersByTime(80); });
  expect(viewport.moves).toHaveLength(1);
  await act(async () => { viewport.finishMove(); });
  await act(async () => { viewport.finishPlacement(); });
  await completeActiveMessageIfNeeded();
  expect(screen.getByText('Paso1a')).toBeOnTheScreen();
  await completeActiveMessageIfNeeded();
  expect(screen.getByRole('button', { name: 'PASO2A' })).toBeOnTheScreen();
  expect(screen.queryByTestId('image-journey')).not.toBeOnTheScreen();
});

test('J04: reducir movimiento conserva la palabra y el siguiente reto', async () => {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  const viewport = createControlledViewport();
  const lesson = { ...journeyLesson, startWithStudent: undefined };
  await render(<TrainingSession lesson={lesson} initialProgress={{ ...initialProgress(lesson), started: true }} restored
    onProgressChange={() => {}} viewportController={viewport.controller} resolveImage={() => 1 as never} />);
  await act(async () => {});

  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'PASO1A' })); });
  await act(async () => { jest.runOnlyPendingTimers(); });
  expect(viewport.moves).toHaveLength(1);
  await act(async () => { viewport.finishMove(); });
  await act(async () => { viewport.finishPlacement(); });
  expect(screen.getByText('Paso1a')).toBeOnTheScreen();
  await completeActiveMessageIfNeeded();
  expect(screen.getByRole('button', { name: 'PASO2A' })).toBeOnTheScreen();
});

test('UX-001 / R02 / R09 / J07: el cierre respeta el idioma editorial y espera la respuesta', async () => {
  const viewport = createControlledViewport();
  const lesson = { ...journeyLesson, startWithStudent: undefined, script: journeyLesson.script.map(step =>
    step.type === 'image-journey' ? { ...step, presentation: {
      masterLabel: 'Mestre', routeQuestion: 'Vols veure el camí que has fet?',
      routeAction: 'VEURE EL MEU RECORREGUT', routeAnswer: 'Vull veure el camí que he fet.',
      routeLabel: 'El teu recorregut', routeStart: 'Viatge',
      choiceHint: 'Tria una imatge per continuar el viatge',
    } } : step) };
  let progress = { ...initialProgress(lesson), started: true };
  for (const id of ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a']) progress = submitChallengeAnswer(lesson, progress, id);
  await render(<TrainingSession lesson={lesson} initialProgress={progress} restored
    onProgressChange={() => {}} viewportController={viewport.controller} resolveImage={() => 1 as never} />);
  expect(screen.getByText('Tria una imatge per continuar el viatge')).toBeOnTheScreen();
  expect(screen.queryByText('Elige una imagen para continuar el viaje')).not.toBeOnTheScreen();
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'NADAR' })); });
  await finishTransition(viewport);
  await completeActiveMessageIfNeeded();
  await completeActiveMessageIfNeeded();
  expect(screen.getByText('Vols veure el camí que has fet?')).toBeOnTheScreen();
  expect(screen.queryByText('El teu recorregut')).not.toBeOnTheScreen();
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'VEURE EL MEU RECORREGUT' })); });
  await finishTransition(viewport);
  expect(screen.getByText('Vull veure el camí que he fet.')).toBeOnTheScreen();
  await completeActiveMessageIfNeeded();
  expect(screen.getByText('Viatge → Paso1a → Paso2a → Paso3a → Paso4a → Paso5a → Nadar')).toBeOnTheScreen();
});

test('R03/R09: un error conserva el intento, repone cuatro opciones y el acierto retira la parrilla antigua', async () => {
  const viewport = createControlledViewport();
  await render(<TrainingSession lesson={conversation} initialProgress={initialProgress(conversation)} restored={false} onProgressChange={() => {}} viewportController={viewport.controller} />);
  await reachFirstChallenge(viewport);

  expect(screen.getAllByRole('button').filter(button => ['Abundante', 'Suficiente', 'Completo', 'Variado'].includes(button.props.accessibilityLabel))).toHaveLength(4);
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Suficiente' })); });
  expect(screen.getByRole('button', { name: 'Abundante' })).toBeDisabled();
  await finishTransition(viewport);
  await completeActiveMessageIfNeeded();
  expect(screen.getAllByRole('button').filter(button => ['Abundante', 'Suficiente', 'Completo', 'Variado'].includes(button.props.accessibilityLabel))).toHaveLength(4);

  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Abundante' })); });
  await finishTransition(viewport);
  await completeActiveMessageIfNeeded();
  expect(screen.getByText('Suficiente')).toBeOnTheScreen();
  expect(screen.getByText('No es correcto. Prueba otra vez.')).toBeOnTheScreen();
  expect(screen.getByText('Abundante')).toBeOnTheScreen();
  expect(screen.getByText('Correcto.')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Suficiente' })).not.toBeOnTheScreen();
  await completeActiveMessageIfNeeded();
  expect(screen.getByText(/Ahora cambia/)).toBeOnTheScreen();
});

test('P01 / R02 / R09: mejorar q1 no obliga a resolverlo otra vez', async () => {
  const viewport = createControlledViewport();
  let saved = initialProgress(conversation);
  const view = await render(<TrainingSession lesson={conversation}
    initialProgress={saved} restored={false}
    onProgressChange={next => { saved = next; }}
    viewportController={viewport.controller} />);
  await reachFirstChallenge(viewport);
  await act(async () => {
    await fireEvent.press(screen.getByRole('button', { name: 'Abundante' }));
  });
  await finishTransition(viewport);
  expect(saved.completed).toEqual(['q1']);
  await view.unmount();

  const updated = { ...conversation, script: conversation.script.map(item =>
    item.type === 'single-choice' && item.id === 'q1'
      ? { ...item, correctOptionId: 'b' } : item) };
  const restored = restoreProgress(updated, JSON.parse(JSON.stringify(saved)));
  await render(<TrainingSession lesson={updated} initialProgress={restored}
    restored={true} onProgressChange={() => {}}
    viewportController={createControlledViewport().controller} />);
  expect(restored.completed).toEqual(['q1']);
  expect(screen.queryByRole('button', { name: 'Abundante' })).not.toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Agitado' })).toBeOnTheScreen();
});

test('reset durante moving invalida el callback tardío y guarda solo cambios de progreso', async () => {
  const viewport = createControlledViewport();
  const onProgressChange = jest.fn();
  await render(<TrainingSession lesson={conversation} initialProgress={initialProgress(conversation)} restored={false} onProgressChange={onProgressChange} viewportController={viewport.controller} />);
  await completeActiveMessage();
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Empezar' })); });
  expect(onProgressChange).toHaveBeenCalledTimes(1);
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Continuar' })); });
  await act(async () => { jest.advanceTimersByTime(80); });
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Reiniciar entrenamiento' })); });
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Reiniciar' })); });
  await act(async () => { viewport.finishMove(); });
  expect(screen.queryByText('Quiero practicar.')).not.toBeOnTheScreen();
  expect(onProgressChange).toHaveBeenCalledTimes(2);
});
