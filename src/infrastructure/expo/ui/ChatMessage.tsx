import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View, type TextLayoutEvent } from 'react-native';
import type { Message } from '../../../application/messages';
import { colors as c } from './theme';
import { findLargestVerseFontSize } from './verseTypography';

/** Ajuste global de la cadencia de escritura de maestro y jugador. */
export const TYPEWRITER_TICK_MS = 30;
const TYPEWRITER_CHARACTERS_PER_TICK = 3;
const VERSE_PREFERRED_SIZE = 25;
const VERSE_MINIMUM_SIZE = 16;

type ChatMessageProps = { message: Message; animate: boolean; reducedMotion: boolean; token: number; onDone: (messageId: string, token: number) => void };
export function ChatMessage({ message, animate, reducedMotion, token, onDone }: ChatMessageProps) {
  const [count, setCount] = useState(animate && !reducedMotion ? 0 : message.text.length);
  const [verseFontSize, setVerseFontSize] = useState(VERSE_PREFERRED_SIZE);
  const [verseWidth, setVerseWidth] = useState<number | null>(null);
  const { fontScale } = useWindowDimensions();
  const measuredFontScale = useRef(fontScale);
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
  const handleVerseLayout = useCallback((event: { nativeEvent: { layout: { width: number } } }) => {
    if (!verse) return;
    const width = Math.max(0, event.nativeEvent.layout.width - (player ? 36 : 0));
    setVerseWidth(previous => {
      if (previous !== width) setVerseFontSize(VERSE_PREFERRED_SIZE);
      return width;
    });
  }, [player, verse]);
  const handleVerseTextLayout = useCallback((event: TextLayoutEvent) => {
    if (!verse || verseWidth === null || event.nativeEvent.lines.length === 0) return;
    const verseLines = message.text.split('\n');
    const renderedLines = event.nativeEvent.lines;
    const widestCharacterWidth = Math.max(...renderedLines.map(line => line.width / Math.max(line.text.length, 1)));
    const sizeToFit = measuredFontScale.current !== fontScale ? VERSE_PREFERRED_SIZE : verseFontSize;
    measuredFontScale.current = fontScale;
    const fittedSize = findLargestVerseFontSize({
      lines: verseLines,
      availableWidth: verseWidth,
      preferredSize: sizeToFit,
      minimumSize: VERSE_MINIMUM_SIZE,
      measureLine: (line, size) => line.length * widestCharacterWidth * size / sizeToFit,
    });
    const wraps = renderedLines.length > verseLines.length;
    const nextSize = wraps ? fittedSize : Math.min(sizeToFit, fittedSize);
    if (nextSize !== verseFontSize) setVerseFontSize(nextSize);
  }, [fontScale, message.text, measuredFontScale, verse, verseFontSize, verseWidth]);
  const writingPlayerMessage = player && animate && !reducedMotion && count < message.text.length;
  const visibleText = `${verse ? '«' : ''}${message.text.slice(0, count)}${animate && count < message.text.length ? '▍' : ''}${verse ? '»' : ''}`;
  const completeText = `${verse ? '«' : ''}${message.text}${verse ? '»' : ''}`;
  const verseStyle = verse ? { fontSize: verseFontSize, lineHeight: Math.round(verseFontSize * 1.4), fontWeight: '400' as const } : undefined;
  return <View style={[s.row, player && s.playerRow]}>
    {message.label && <Text style={s.label}>{message.label.toUpperCase()}</Text>}
    <View testID={verse ? 'verse-container' : undefined} onLayout={verse ? handleVerseLayout : undefined} style={[player && s.bubble, verse && s.verse]}>
      {writingPlayerMessage ? <View style={s.typingLayer}>
        <Text testID="typing-reserve" accessible={false} allowFontScaling={verse} style={[s.text, verse && s.verseText, verseStyle, s.typingReserve]}>{completeText}</Text>
        <Text testID="typing-content" allowFontScaling={verse} onTextLayout={verse ? handleVerseTextLayout : undefined} style={[s.text, verse && s.verseText, verseStyle, s.typingText]}>{visibleText}</Text>
      </View> : <Text testID={verse ? 'verse-text' : undefined} allowFontScaling={verse} onTextLayout={verse ? handleVerseTextLayout : undefined} style={[s.text, verse && s.verseText, verseStyle]}>{visibleText}</Text>}
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
  verseText: { fontSize: 25, lineHeight: 35, fontWeight: '400' },
  typingLayer: { position: 'relative' },
  typingReserve: { opacity: 0 },
  typingText: { position: 'absolute', top: 0, left: 0, right: 0 },
  skip: { alignSelf: 'flex-start', paddingVertical: 8 }, skipText: { color: c.muted, fontSize: 11 },
});
