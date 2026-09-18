import type { Lesson } from '../../src/domain/schemas';

export const conversation: Lesson = {
  id: 'ux-fixture-v1',
  startAction: 'Empezar',
  completion: 'Fin del entrenamiento.',
  script: [
    { type: 'master', text: 'Bienvenido.' },
    { type: 'student', action: 'Continuar', text: 'Quiero practicar.' },
    { type: 'master', text: 'Verso 1\nVerso 2\nVerso 3\nVerso 4' },
    { type: 'student', action: 'Continuar', text: 'Estoy preparado.' },
    {
      type: 'single-choice', id: 'q1', master: 'Busca el contrario.',
      prompt: 'Contrario de escaso', correctOptionId: 'a',
      options: [
        { id: 'a', text: 'Abundante', emoji: '🌊' },
        { id: 'b', text: 'Suficiente', emoji: '👌' },
        { id: 'c', text: 'Completo', emoji: '🧩' },
        { id: 'd', text: 'Variado', emoji: '🎨' },
      ],
      success: 'Correcto.', retry: 'No es correcto. Prueba otra vez.',
    },
    { type: 'master', text: 'Ahora cambia el ejercicio.' },
    { type: 'student', action: 'Continuar', text: 'Vamos al siguiente.' },
    {
      type: 'single-choice', id: 'q2', master: 'Una última pregunta.',
      prompt: 'Contrario de sereno', correctOptionId: 'e',
      options: [
        { id: 'e', text: 'Agitado', emoji: '🌪️' },
        { id: 'f', text: 'Callado', emoji: '🤫' },
        { id: 'g', text: 'Prudente', emoji: '🧐' },
        { id: 'h', text: 'Lento', emoji: '🐢' },
      ],
      success: 'Muy bien.', retry: 'Inténtalo de nuevo.',
    },
  ],
};
