import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initialProgress, restoreProgress } from '../../../domain/session';
import type { Progress } from '../../../domain/progress';
import { colors as c } from './theme';
import { TrainingSession } from './TrainingSession';
import type { ContentRepository } from '../../../application/content-repository';
import type { ProgressRepository } from '../../../application/progress-repository';

export type TrainingScreenProps = { content: ContentRepository; progress: ProgressRepository };

export function TrainingScreen({ content, progress: progressRepository }: TrainingScreenProps) {
  const session = useMemo(() => content.load(), [content]);
  const [progress, setProgress] = useState<Progress>(() => initialProgress(session));
  const [loaded, setLoaded] = useState(false);
  const [restored, setRestored] = useState(false);
  const [notice, setNotice] = useState(false);
  useEffect(() => {
    let active = true;
    progressRepository.load().then(raw => {
      if (!active) return;
      const value = restoreProgress(session, raw);
      setProgress(value);
      setRestored(value.started);
    }).catch(() => { if (active) setNotice(true); }).finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [session, progressRepository]);
  const onProgressChange = useCallback((next: Progress) => {
    setProgress(next);
    void progressRepository.save(next).catch(() => setNotice(true));
  }, [progressRepository]);
  return <SafeAreaView style={s.safe}>{loaded
    ? <TrainingSession session={session} initialProgress={progress} restored={restored} onProgressChange={onProgressChange} storageNotice={notice} />
    : <View style={s.loading}><ActivityIndicator color={c.accent} /></View>}
  </SafeAreaView>;
}

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: c.bg }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
