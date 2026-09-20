import { useMemo, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { LessonProgress } from '../../../domain/lesson-progress';
import type { ProgressRepository } from '../../../application/progress-repository';
import { createValidatedYamlContentRepository } from '../content/yaml-content-repository';
import raw from '../content/image-choice-demo.yaml';
import { createChallengeImageResolver } from '../content/content-images';
import { TrainingScreen } from './TrainingScreen';

export function ImageChoiceDemo() {
  const saved = useRef<LessonProgress | null>(null);
  const progress = useMemo<ProgressRepository>(() => ({ load: async () => saved.current, save: async value => { saved.current = value; } }), []);
  const content = useMemo(() => createValidatedYamlContentRepository(raw, createChallengeImageResolver()), []);
  return <SafeAreaProvider><TrainingScreen content={content} progress={progress} resolveImage={createChallengeImageResolver()} /></SafeAreaProvider>;
}
