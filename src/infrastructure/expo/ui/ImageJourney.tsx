import { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { JourneyOption } from '../../../domain/image-journey';
import type { ChallengeImageResolver } from '../content/content-images';
import { colors as c } from './theme';
import type { ControlTarget } from './viewport/useConversationViewport';

type Props = { challengeId: string; choiceHint?: string; options: readonly JourneyOption[]; selectedOptionId?: string; disabled?: boolean; resolveImage: ChallengeImageResolver; onAnswer: (optionId: string, target: ControlTarget) => void };

export function ImageJourney({ challengeId, choiceHint = 'Elige una imagen para continuar el viaje', options, disabled = false, selectedOptionId, resolveImage, onAnswer }: Props) {
  return <View style={s.container}>
    <Text style={s.hint}>{choiceHint}</Text>
    <View style={s.row}>{options.map(option => <JourneyCard key={option.id} option={option} challengeId={challengeId}
      resolveImage={resolveImage} disabled={disabled} selected={selectedOptionId === option.id} onAnswer={onAnswer} />)}</View>
  </View>;
}

function JourneyCard({ option, challengeId, resolveImage, disabled, selected, onAnswer }: {
  option: JourneyOption; challengeId: string; resolveImage: ChallengeImageResolver; disabled: boolean; selected: boolean; onAnswer: Props['onAnswer'];
}) {
  const ref = useRef<View | null>(null); const [failed, setFailed] = useState(false);
  const visual = (preview = false, highlighted = selected) => <View style={[s.card, preview && s.preview, highlighted && s.selected]}>
    <View style={s.photo}>{failed ? <Text style={s.fallback}>Imagen no disponible</Text>
      : <Image testID={`journey-photo-${option.id}`} source={resolveImage(challengeId, option.image.file)}
          resizeMode="cover" style={s.image} accessible={false} onError={() => setFailed(true)} />}</View>
  </View>;
  const target: ControlTarget = { id: option.id, ref, renderPreview: () => visual(true) };
  return <Pressable accessibilityRole="button" accessibilityLabel={option.text} accessibilityHint={option.image.description}
    ref={ref} accessibilityState={{ disabled, selected }} disabled={disabled} onPress={() => { if (!disabled) onAnswer(option.id, target); }}
    style={s.touch}>{({ pressed }) => visual(false, pressed || selected)}</Pressable>;
}

const s = StyleSheet.create({ container: { marginBottom: 14 }, hint: { color: c.muted, fontSize: 14, marginTop: 8, marginBottom: 18 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 12 }, touch: { flex: 1, minWidth: 0 }, card: { flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: 22, padding: 10, backgroundColor: '#303133' }, preview: { width: '100%', height: '100%' },
  selected: { borderColor: c.accent }, photo: { width: '100%', aspectRatio: 9 / 16, overflow: 'hidden', borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg },
  image: { width: '100%', height: '100%' }, fallback: { color: c.muted, fontSize: 14, textAlign: 'center', padding: 8 },
});
