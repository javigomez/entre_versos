import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TextChoiceChallenge as TextChoiceContent } from '../../../domain/schemas';
import { colors as c } from './theme';
import type { ControlTarget } from './viewport/useConversationViewport';

type Props = {
  challenge: TextChoiceContent;
  onAnswer: (id: string, target: ControlTarget) => void;
  disabled?: boolean;
  selectedOptionId?: string;
};

export function TextChoiceChallengeView({
  challenge, onAnswer, disabled = false, selectedOptionId,
}: Props) {
  return <View style={styles.container} testID="text-choice">
    <Text style={styles.prompt}>{challenge.prompt}</Text>
    <View style={styles.options}>{challenge.options.map(option =>
      <TextOption key={option.id} option={option} disabled={disabled}
        selected={selectedOptionId === option.id} onAnswer={onAnswer} />
    )}</View>
  </View>;
}

function TextOption({ option, disabled, selected, onAnswer }: {
  option: TextChoiceContent['options'][number];
  disabled: boolean;
  selected: boolean;
  onAnswer: Props['onAnswer'];
}) {
  const ref = useRef<View | null>(null);
  const renderPreview = () => <View style={[styles.option, selected && styles.selected]}>
    <Text style={styles.optionText}>{option.text}</Text>
  </View>;
  const target: ControlTarget = { id: option.id, ref, renderPreview };
  return <Pressable ref={ref} accessibilityRole="button"
    accessibilityLabel={option.text} accessibilityState={{ disabled, selected }}
    disabled={disabled} onPress={() => { if (!disabled) onAnswer(option.id, target); }}
    style={({ pressed }) => [styles.option, (pressed || selected) && styles.selected]}>
    <Text style={styles.optionText}>{option.text}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  prompt: { color: c.text, fontSize: 21, fontWeight: '600', lineHeight: 29, marginTop: 6, marginBottom: 16 },
  options: { gap: 10 },
  option: { width: '100%', minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: c.border,
    backgroundColor: '#303133', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  selected: { backgroundColor: '#353c2e', borderColor: c.accent },
  optionText: { color: c.text, fontSize: 18, lineHeight: 24, fontWeight: '700', textAlign: 'left' },
});
