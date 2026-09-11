import { useRef } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { colors as c } from './theme';
import type { ControlTarget } from './viewport/useConversationViewport';

type ActionProps = { id?: string; label: string; onPress: (target: ControlTarget) => void; secondary?: boolean; disabled?: boolean; selected?: boolean };
export function Action({ id = 'continue', label, onPress, secondary = false, disabled = false, selected = false }: ActionProps) {
  const ref = useRef<View | null>(null);
  const preview = () => <View style={[s.button, secondary && s.secondary, selected && s.selected]}><Text style={s.label}>{label}</Text><Text style={s.arrow}>↗</Text></View>;
  const target: ControlTarget = { id, ref, renderPreview: preview };
  return <Pressable ref={ref} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled, selected }} disabled={disabled} onPress={() => { if (!disabled) onPress(target); }} style={({ pressed }) => [s.button, secondary && s.secondary, selected && s.selected, pressed && !disabled && { opacity: 0.7 }]}>
    <Text style={[s.label, secondary && { color: c.text }]}>{label}</Text><Text style={[s.arrow, secondary && { color: c.text }]}>↗</Text>
  </Pressable>;
}
const s = StyleSheet.create({
  button: { backgroundColor: c.action, minHeight: 56, borderRadius: 18, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secondary: { backgroundColor: c.panel, borderWidth: 1, borderColor: c.border },
  selected: { backgroundColor: '#353c2e', borderColor: c.accent, borderWidth: 1 },
  label: { fontSize: 15, fontWeight: '600', color: c.text }, arrow: { fontSize: 23, color: c.text },
});
