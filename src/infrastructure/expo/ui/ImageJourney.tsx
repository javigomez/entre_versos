import { useEffect, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { JourneyNode, JourneyOption } from '../../../domain/image-journey';
import type { ChallengeImageResolver } from '../content/content-images';
import { colors as c } from './theme';

type Props = {
  challengeId: string; node: JourneyNode; locked: boolean; selectedOptionId?: string;
  token: number; reducedMotion: boolean; resolveImage: ChallengeImageResolver;
  onAnswer: (optionId: string, nodeId: string, token: number) => void;
  onSettled: (token: number) => void;
};

export function ImageJourney({ challengeId, node, locked, selectedOptionId, token, reducedMotion, resolveImage, onAnswer, onSettled }: Props) {
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    opacity.setValue(1);
    if (!locked) return;
    if (reducedMotion) {
      const timer = setTimeout(() => onSettled(token), 0);
      return () => clearTimeout(timer);
    }
    const animation = Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true });
    animation.start(({ finished }) => { if (finished) onSettled(token); });
    return () => animation.stop();
  }, [locked, onSettled, opacity, reducedMotion, token]);
  return <View testID="image-journey" style={s.stage}>
    <Animated.View style={[s.body, { opacity }]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.row}>{node.options.map(option => <JourneyCard key={option.id}
          option={option} challengeId={challengeId} resolveImage={resolveImage} locked={locked}
          selected={selectedOptionId === option.id} onPress={() => onAnswer(option.id, node.id, token)} />)}</View>
      </ScrollView>
    </Animated.View>
  </View>;
}

function JourneyCard({ option, challengeId, resolveImage, locked, selected, onPress }: {
  option: JourneyOption; challengeId: string; resolveImage: ChallengeImageResolver; locked: boolean; selected: boolean; onPress: () => void;
}) {
  const [failed, setFailed] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={option.text} accessibilityHint={option.image.description}
    accessibilityState={{ disabled: locked, selected }} disabled={locked} onPress={onPress}
    style={({ pressed }) => [s.card, (pressed || selected) && s.selected]}>
    <View style={s.photo}>{failed ? <Text style={s.fallback}>Imagen no disponible</Text>
      : <Image testID={`journey-photo-${option.id}`} source={resolveImage(challengeId, option.image.file)}
          resizeMode="cover" style={s.image} accessible={false} onError={() => setFailed(true)} />}</View>
    <Text style={s.word}>{option.text}</Text>
  </Pressable>;
}

const s = StyleSheet.create({
  stage: { flex: 1, backgroundColor: '#000' }, body: { flex: 1 }, scroll: { flexGrow: 1, padding: 12, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 10 }, card: { flex: 1, minWidth: 0, borderWidth: 2, borderColor: c.border, borderRadius: 16, padding: 6, backgroundColor: c.panel },
  selected: { borderColor: c.accent }, photo: { width: '100%', aspectRatio: 9 / 16, overflow: 'hidden', borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg },
  image: { width: '100%', height: '100%' }, fallback: { color: c.muted, fontSize: 14, textAlign: 'center', padding: 8 }, word: { color: c.text, fontSize: 19, fontWeight: '700', textAlign: 'center', marginVertical: 10 },
});
