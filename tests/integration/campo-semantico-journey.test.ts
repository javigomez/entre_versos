import { challengesOf, initialProgress, submitChallengeAnswer } from '../../src/domain/lesson';
import { replayJourney } from '../../src/domain/image-journey';
import { campoSemanticoJourney } from '../../src/infrastructure/expo/content/campo-semantico-journey';

describe('campo semántico: viaje de palabras', () => {
  const journey = challengesOf(campoSemanticoJourney).find(challenge => challenge.type === 'image-journey');

  if (!journey || journey.type !== 'image-journey') throw new Error('Falta el viaje de imágenes');

  it('contiene un árbol navegable de seis decisiones y 80 imágenes originales', () => {
    expect(journey.nodes).toHaveLength(40);
    expect(journey.nodes.flatMap(node => node.options)).toHaveLength(80);

    const visit = (nodeId: string, history: string[]): string[][] => {
      const node = journey.nodes.find(candidate => candidate.id === nodeId);
      if (!node) throw new Error(`Nodo inexistente: ${nodeId}`);
      return node.options.flatMap(option => option.ending
        ? [[...history, option.id]]
        : visit(option.next!, [...history, option.id]));
    };

    const paths = visit(journey.startNodeId, []);
    expect(paths).toHaveLength(64);
    for (const path of paths) {
      expect(path).toHaveLength(6);
      expect(replayJourney(journey, path)?.ending).not.toBeNull();
    }
  });

  it('solo se completa tras la sexta imagen, conservando cada elección', () => {
    let progress = { ...initialProgress(campoSemanticoJourney), started: true };
    const firstPath = ['l1-viaje-nieve', 'l2-nieve-refugio', 'l3-refugio-ventana', 'l4-ventana-huellas', 'l5-huellas-rio', 'l6-rio-nadar'];
    for (const [index, optionId] of firstPath.entries()) {
      progress = submitChallengeAnswer(campoSemanticoJourney, progress, optionId);
      expect(progress.completed).toHaveLength(index === 5 ? 1 : 0);
    }
    expect(progress.history.map(entry => entry.optionId)).toEqual(firstPath);
  });
});
