import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Message } from '../../../application/messages';
import { colors as c } from './theme';

/** Ajuste global de la cadencia de escritura de maestro y jugador. */
export const TYPEWRITER_TICK_MS = 30;
const TYPEWRITER_CHARACTERS_PER_TICK = 3;

type ChatMessageProps = { message: Message; animate: boolean; reducedMotion: boolean; token: number; onDone: (messageId: string, token: number) => void };
export function ChatMessage({ message, animate, reducedMotion, token, onDone }: ChatMessageProps) {
  const [count, setCount] = useState(animate && !reducedMotion ? 0 : message.text.length);
  // A completed animation can trigger more than once when the accessibility
  // check and the interval finish in the same render. Advancing twice skips
  // the next message, which makes later student turns appear to auto-answer.
  const notified = useRef(false);
  useEffect(() => {
    if (!animate) return;
    if (reducedMotion) {
      const timer = setTimeout(() => setCount(message.text.length), 0);
      return () => clearTimeout(timer);
    }
    const timer = setInterval(() => setCount(n => Math.min(n + TYPEWRITER_CHARACTERS_PER_TICK, message.text.length)), TYPEWRITER_TICK_MS);
    return () => clearInterval(timer);
  }, [animate, message.text, reducedMotion]);
  useEffect(() => {
    if (animate && count >= message.text.length && !notified.current) {
      notified.current = true;
      onDone(message.id, token);
    }
  }, [animate, count, message.id, message.text.length, onDone, token]);
  const player = message.role === 'player';
  const verse = message.kind === 'verse';
  const writingPlayerMessage = player && animate && !reducedMotion && count < message.text.length;
  const visibleText = `${verse ? '«' : ''}${message.text.slice(0, count)}${animate && count < message.text.length ? '▍' : ''}${verse ? '»' : ''}`;
  const completeText = `${verse ? '«' : ''}${message.text}${verse ? '»' : ''}`;
  return <View style={[s.row, player && s.playerRow]}>
    {message.label && <Text style={s.label}>{message.label.toUpperCase()}</Text>}
    <View style={[player && s.bubble, verse && s.verse]}>
      {writingPlayerMessage ? <View style={s.typingLayer}>
        <Text testID="typing-reserve" accessible={false} style={[s.text, verse && s.verseText, s.typingReserve]}>{completeText}</Text>
        <Text testID="typing-content" style={[s.text, verse && s.verseText, s.typingText]}>{visibleText}</Text>
      </View> : <Text style={[s.text, verse && s.verseText]}>{visibleText}</Text>}
    </View>
    {animate && count < message.text.length && <Pressable accessibilityRole="button" accessibilityLabel="Mostrar mensaje completo" onPress={() => setCount(message.text.length)} style={s.skip}><Text style={s.skipText}>Mostrar completo</Text></Pressable>}
  </View>;
}
const s = StyleSheet.create({
  row: { marginBottom: 30 }, playerRow: { alignItems: 'flex-end', marginBottom: 28 },
  label: { color: c.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.8, marginTop: 8, marginBottom: 22 },
  text: { color: c.text, fontSize: 25, lineHeight: 35, fontWeight: '600', letterSpacing: -0.4, textAlign: 'left' },
  bubble: { backgroundColor: c.player, borderRadius: 20, borderBottomRightRadius: 5, paddingHorizontal: 18, paddingVertical: 12, maxWidth: '90%' },
  verse: { paddingVertical: 4 },
  verseText: { fontSize: 25, lineHeight: 35, fontWeight: '600' },
  typingLayer: { position: 'relative' },
  typingReserve: { opacity: 0 },
  typingText: { position: 'absolute', top: 0, left: 0, right: 0 },
  skip: { alignSelf: 'flex-start', paddingVertical: 8 }, skipText: { color: c.muted, fontSize: 11 },
});
