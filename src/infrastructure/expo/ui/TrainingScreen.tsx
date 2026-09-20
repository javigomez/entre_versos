import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initialProgress, restoreProgress } from '../../../domain/lesson';
import type { LessonProgress } from '../../../domain/lesson-progress';
import { colors as c } from './theme';
import { TrainingSession } from './TrainingSession';
import type { ContentRepository } from '../../../application/content-repository';
import type { ProgressRepository } from '../../../application/progress-repository';
import { createChallengeImageResolver, type ChallengeImageResolver } from '../content/content-images';

export type TrainingScreenProps = { content: ContentRepository; progress: ProgressRepository; resolveImage?: ChallengeImageResolver };

export function TrainingScreen({ content, progress: progressRepository, resolveImage = createChallengeImageResolver() }: TrainingScreenProps) {
  const lesson = useMemo(() => content.load(), [content]);
  const [progress, setProgress] = useState<LessonProgress>(() => initialProgress(lesson));
  const [loaded, setLoaded] = useState(false);
  const [restored, setRestored] = useState(false);
  const [notice, setNotice] = useState(false);
  useEffect(() => {
    let active = true;
    progressRepository.load().then(raw => {
      if (!active) return;
      const value = restoreProgress(lesson, raw);
      setProgress(value);
      setRestored(value.started);
    }).catch(() => { if (active) setNotice(true); }).finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [lesson, progressRepository]);
  const onProgressChange = useCallback((next: LessonProgress) => {
    setProgress(next);
    void progressRepository.save(next).catch(() => setNotice(true));
  }, [progressRepository]);
  return <SafeAreaView style={s.safe}>{loaded
    ? <TrainingSession lesson={lesson} initialProgress={progress} restored={restored} onProgressChange={onProgressChange} storageNotice={notice} resolveImage={resolveImage} />
    : <View style={s.loading}><ActivityIndicator color={c.accent} /></View>}
  </SafeAreaView>;
}

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: c.bg }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
