import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SingleChoiceChallenge as SingleChoiceContent } from '../../../domain/schemas';
import { colors as c } from './theme';
import type { ControlTarget } from './viewport/useConversationViewport';

type ChoiceProps = { challenge: SingleChoiceContent; onAnswer: (id: string, target: ControlTarget) => void; disabled?: boolean; selectedOptionId?: string };
export function SingleChoiceChallenge({ challenge, onAnswer, disabled = false, selectedOptionId }: ChoiceProps) {
  return <View style={s.container}>
    <Text style={s.prompt}>{challenge.prompt}</Text>
    <Text style={s.hint}>Tria una resposta</Text>
    <View style={s.options}>{challenge.options.map(option => <ChoiceOption key={option.id} option={option} disabled={disabled} selected={selectedOptionId === option.id} onAnswer={onAnswer} />)}</View>
    <Text style={s.note}>Sense presses. Cada intent t’ensenya alguna cosa.</Text>
  </View>;
}
function ChoiceOption({ option, disabled, selected, onAnswer }: { option: SingleChoiceContent['options'][number]; disabled: boolean; selected: boolean; onAnswer: ChoiceProps['onAnswer'] }) {
  const ref = useRef<View | null>(null);
  const preview = () => <View style={[s.option, selected && s.selected]}><Text style={s.emoji}>{option.emoji}</Text><Text style={s.text}>{option.text}</Text></View>;
  const target: ControlTarget = { id: option.id, ref, renderPreview: preview };
  return <Pressable ref={ref} accessibilityRole="button" accessibilityLabel={option.text} accessibilityState={{ disabled, selected }} disabled={disabled} onPress={() => { if (!disabled) onAnswer(option.id, target); }} style={({ pressed }) => [s.option, (pressed || selected) && s.selected]}>
    <Text style={s.emoji}>{option.emoji}</Text><Text style={s.text}>{option.text}</Text>
  </Pressable>;
}
const s = StyleSheet.create({
  container: { marginBottom: 14 }, prompt: { color: c.text, fontSize: 21, fontWeight: '600', lineHeight: 29, marginTop: 6 },
  hint: { color: c.muted, fontSize: 14, marginTop: 8, marginBottom: 18 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  option: { width: '48%', height: 142, borderRadius: 22, borderWidth: 1, borderColor: c.border, backgroundColor: '#303133', alignItems: 'center', justifyContent: 'center', padding: 10 },
  selected: { backgroundColor: '#353c2e', borderColor: c.accent },
  emoji: { fontSize: 39, lineHeight: 48, marginBottom: 8 }, text: { fontSize: 21, color: c.text, fontWeight: '700', textAlign: 'center' },
  note: { color: c.muted, textAlign: 'center', marginTop: 20, fontSize: 12 },
});
