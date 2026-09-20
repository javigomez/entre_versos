import { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageChoiceChallenge as ImageChoiceContent } from '../../../domain/schemas';
import { colors as c } from './theme';
import type { ControlTarget } from './viewport/useConversationViewport';
import type { ChallengeImageResolver } from '../content/content-images';

type Props = { challenge: ImageChoiceContent; onAnswer: (id: string, target: ControlTarget) => void; resolveImage: ChallengeImageResolver; disabled?: boolean; selectedOptionId?: string };
export function ImageChoiceChallenge({ challenge, onAnswer, resolveImage, disabled = false, selectedOptionId }: Props) {
  return <View style={s.container}><Text style={s.prompt}>{challenge.prompt}</Text><Text style={s.hint}>Elige un camino</Text><View style={s.options}>{challenge.options.map(option => <ImageChoiceOption key={option.id} challengeId={challenge.id} option={option} resolveImage={resolveImage} disabled={disabled} selected={selectedOptionId === option.id} onAnswer={onAnswer} />)}</View></View>;
}
function ImageChoiceOption({ challengeId, option, resolveImage, disabled, selected, onAnswer }: { challengeId: string; option: ImageChoiceContent['options'][number]; resolveImage: ChallengeImageResolver; disabled: boolean; selected: boolean; onAnswer: Props['onAnswer'] }) {
  const ref = useRef<View | null>(null); const [failed, setFailed] = useState(false); const source = resolveImage(challengeId, option.image.file);
  const visual = (preview = false) => <View style={[s.option, preview && s.preview, selected && s.selected]}><View style={s.photo}>{failed ? <Text style={s.fallback}>Imagen no disponible</Text> : <Image source={source} accessibilityIgnoresInvertColors resizeMode="cover" style={s.image} onError={() => setFailed(true)} />}</View><Text style={s.text}>{option.text}</Text></View>;
  const target: ControlTarget = { id: option.id, ref, renderPreview: () => visual(true) };
  return <Pressable ref={ref} accessibilityRole="button" accessibilityLabel={option.text} accessibilityHint={option.image.description} accessibilityState={{ disabled, selected }} disabled={disabled} onPress={() => { if (!disabled) onAnswer(option.id, target); }} style={({ pressed }) => [s.option, (pressed || selected) && s.selected]}>{visual()}</Pressable>;
}
const s = StyleSheet.create({ container: { marginBottom: 14 }, prompt: { color: c.text, fontSize: 21, fontWeight: '600', lineHeight: 29, marginTop: 6 }, hint: { color: c.muted, fontSize: 14, marginTop: 8, marginBottom: 18 }, options: { flexDirection: 'row', gap: 12, alignItems: 'stretch' }, option: { flex: 1, minWidth: 0, borderRadius: 22, borderWidth: 1, borderColor: c.border, backgroundColor: '#303133', padding: 10 }, preview: { width: '100%', height: '100%' }, selected: { backgroundColor: '#353c2e', borderColor: c.accent }, photo: { width: '100%', aspectRatio: 9 / 16, borderRadius: 12, overflow: 'hidden', backgroundColor: c.panel, alignItems: 'center', justifyContent: 'center' }, image: { width: '100%', height: '100%' }, fallback: { color: c.muted, fontSize: 12, textAlign: 'center' }, text: { color: c.text, fontSize: 21, fontWeight: '700', textAlign: 'center', marginTop: 8, lineHeight: 27 } });
