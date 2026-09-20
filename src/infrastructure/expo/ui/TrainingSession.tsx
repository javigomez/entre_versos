/* eslint-disable react-hooks/refs -- the viewport hook intentionally exposes native refs and imperative bindings. */
import { useEffect, useReducer, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Lesson } from '../../../domain/schemas';
import type { LessonProgress } from '../../../domain/lesson-progress';
import { challengesOf } from '../../../domain/lesson';
import { Action } from './Action';
import { ChatMessage } from './ChatMessage';
import { ChallengeView } from './ChallengeView';
import { ImageJourney } from './ImageJourney';
import { createChallengeImageResolver, type ChallengeImageResolver } from '../content/content-images';
import { colors as c } from './theme';
import { createFlow, reduceFlow } from '../../../application/conversation-flow';
import { useConversationViewport } from './viewport/useConversationViewport';
import type { ControlTarget, ViewportController } from './viewport/useConversationViewport';
import { replayJourney } from '../../../domain/image-journey';

export type TrainingSessionProps = { lesson: Lesson; initialProgress: LessonProgress; restored: boolean; onProgressChange: (progress: LessonProgress) => void; storageNotice?: boolean; viewportController?: ViewportController; resolveImage?: ChallengeImageResolver };

export function TrainingSession({ lesson, initialProgress, restored, onProgressChange, storageNotice = false, viewportController, resolveImage = createChallengeImageResolver() }: TrainingSessionProps) {
  const [state, dispatch] = useReducer((current: ReturnType<typeof createFlow>, event: Parameters<typeof reduceFlow>[2]) => reduceFlow(lesson, current, event), createFlow(lesson, initialProgress, restored));
  const [reducedMotion, setReducedMotion] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const target = useRef<ControlTarget | null>(null);
  const previousProgress = useRef(initialProgress);
  const viewport = useConversationViewport(reducedMotion);
  const controller = viewportController ?? viewport.controller;
  const challenges = challengesOf(lesson);
  const challenge = challenges[state.progress.completed.length];
  const journey = challenges.find(item => item.type === 'image-journey');
  const immersive = state.phase === 'waiting-journey' || state.phase === 'journey-transition';
  const journeyIds = journey?.type === 'image-journey'
    ? state.progress.history.filter(entry => entry.challengeId === journey.id).map(entry => entry.optionId) : [];
  const displayIds = state.phase === 'journey-transition' ? journeyIds.slice(0, -1) : journeyIds;
  const displayReplay = journey?.type === 'image-journey' ? replayJourney(journey, displayIds) : null;
  const displayNode = journey?.type === 'image-journey'
    ? journey.nodes.find(node => node.id === displayReplay?.nodeId) : undefined;

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => { if (previousProgress.current !== state.progress) { previousProgress.current = state.progress; onProgressChange(state.progress); } }, [onProgressChange, state.progress]);
  useEffect(() => { if (!immersive && state.anchorId) controller.setAnchor(state.anchorId); }, [controller, immersive, state.anchorId]);
  useEffect(() => {
    if (state.phase !== 'pressing') return;
    const token = state.token;
    const timer = setTimeout(() => dispatch({ type: 'PRESS_DONE', token }), reducedMotion ? 0 : 80);
    return () => clearTimeout(timer);
  }, [reducedMotion, state.phase, state.token]);
  useEffect(() => {
    if (state.phase !== 'moving' || !target.current) return;
    const token = state.token;
    controller.moveControl(target.current, token, finishedToken => dispatch({ type: 'MOVE_DONE', token: finishedToken }));
  }, [controller, state.phase, state.token]);
  useEffect(() => {
    if (state.phase !== 'placing' || !state.pending) return;
    const token = state.token;
    controller.placeReply(state.pending.messageId, token, finishedToken => dispatch({ type: 'PLACED', token: finishedToken }));
  }, [controller, state.pending, state.phase, state.token]);
  useEffect(() => () => controller.dispose(), [controller]);
  const wasImmersive = useRef(false);
  useEffect(() => {
    if (immersive && !wasImmersive.current) controller.interrupt();
    if (!immersive && wasImmersive.current) controller.reset();
    wasImmersive.current = immersive;
  }, [controller, immersive]);

  const transition = state.phase === 'pressing' || state.phase === 'moving';
  const placing = state.phase === 'placing';
  const visibleCount = state.revealed + (state.phase === 'writing' || placing ? 1 : 0);
  const pendingControl = state.pending?.controlId;
  const activeMessage = state.messages[state.revealed];
  const reset = () => { setConfirmReset(false); target.current = null; controller.reset(); dispatch({ type: 'RESET' }); };
  const activateStudent = (control: ControlTarget) => { target.current = control; dispatch({ type: 'ACTIVATE_STUDENT', controlId: control.id }); };
  const answer = (optionId: string, control: ControlTarget) => { target.current = control; dispatch({ type: 'ANSWER', controlId: control.id, optionId }); };

  return <View style={s.safe}>
    <View style={s.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Volver" style={s.round}><Text style={s.backText}>‹</Text></Pressable>
      <View style={s.chatTitle}><Text style={s.brandName}>▱  app de rimas</Text><Text style={s.brandSub}>{immersive ? 'Viaje de palabras' : 'Chat'}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Reiniciar entrenamiento" onPress={() => setConfirmReset(value => !value)} style={s.round}><Text style={s.resetIcon}>•••</Text></Pressable>
    </View>
    {confirmReset && <View style={s.confirm}><Text style={s.confirmText}>¿Volver al principio? Se borrará esta sesión.</Text><View style={s.confirmActions}><Pressable accessibilityRole="button" onPress={() => setConfirmReset(false)} style={s.smallButton}><Text style={s.confirmText}>Cancelar</Text></Pressable><Pressable accessibilityRole="button" onPress={reset} style={s.smallButton}><Text style={s.accent}>Reiniciar</Text></Pressable></View></View>}
    {immersive && journey?.type === 'image-journey' && displayNode
      ? <ImageJourney challengeId={journey.id} node={displayNode} locked={state.phase === 'journey-transition'}
          selectedOptionId={state.phase === 'journey-transition' ? journeyIds.at(-1) : undefined} token={state.token}
          reducedMotion={reducedMotion} resolveImage={resolveImage}
          onAnswer={(optionId, nodeId, token) => dispatch({ type: 'JOURNEY_ANSWER', optionId, nodeId, token })}
          onSettled={token => dispatch({ type: 'JOURNEY_SETTLED', token })} />
      : <View style={s.viewport}>
      <ScrollView ref={viewport.scrollRef} style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} scrollEventThrottle={16} {...viewport.scrollProps}>
        <View {...viewport.bindRealContent}>
          {state.messages.slice(0, visibleCount).map((message, index) => <View key={message.id} {...viewport.bindMessage(message.id)} style={placing && index === state.revealed ? s.hidden : undefined}><View {...viewport.bindCursor(message.id)}><ChatMessage message={message} animate={state.phase === 'writing' && index === state.revealed} reducedMotion={reducedMotion} token={state.token} onDone={(messageId, token) => dispatch({ type: 'MESSAGE_DONE', messageId, token })} /></View></View>)}
          {state.phase === 'waiting-start' && <Action id="start" label={lesson.startAction} onPress={control => { target.current = control; dispatch({ type: 'START' }); }} />}
          {(state.phase === 'waiting-student' || (transition && activeMessage?.action)) && activeMessage?.action && <Action label={activeMessage.action} disabled={transition} selected={transition && pendingControl === 'continue'} onPress={activateStudent} />}
          {(state.phase === 'waiting-choice' || (transition && challenge)) && challenge && challenge.type !== 'image-journey' && <ChallengeView challenge={challenge} disabled={transition} selectedOptionId={pendingControl} onAnswer={answer} resolveImage={resolveImage} />}
          {state.phase === 'finished' && <View style={s.finish}><Text style={s.finishIcon}>✳</Text><Text style={s.finishTitle}>Ya hay chispa.</Text><Text style={s.finishText}>{state.progress.completed.length} retos superados. Sigue jugando con tu voz.</Text><Action label="Volver a entrenar" onPress={reset} secondary /></View>}
          {storageNotice && <Text style={s.notice}>Guardado no disponible · puedes seguir jugando</Text>}
        </View>
        <View onLayout={viewport.onSpacerLayout} style={{ height: viewport.spacerHeight }} />
      </ScrollView>
      {viewport.transitionOverlay}
      {viewport.hasContentBelow && <Pressable accessibilityRole="button" accessibilityLabel="Volver al último mensaje" style={s.jump} onPress={viewport.jumpToLatest}><Text style={s.jumpText}>↓</Text></Pressable>}
    </View>}
  </View>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg }, viewport: { flex: 1, position: 'relative' }, scroll: { flex: 1 }, content: { paddingHorizontal: 25, paddingBottom: 28, paddingTop: 10 }, hidden: { opacity: 0 },
  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, round: { width: 46, height: 46, borderRadius: 23, backgroundColor: c.panel, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  backText: { color: c.text, fontSize: 42, lineHeight: 40, fontWeight: '300', marginTop: -3 }, chatTitle: { alignItems: 'center' }, brandName: { color: c.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.5 }, brandSub: { color: c.muted, fontSize: 16, marginTop: 2, fontWeight: '600' }, resetIcon: { fontSize: 21, letterSpacing: 3, color: c.text, marginLeft: 3 },
  confirm: { marginHorizontal: 16, marginBottom: 10, padding: 15, borderRadius: 12, backgroundColor: c.panel }, confirmText: { color: c.text, fontSize: 13 }, confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 }, smallButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }, accent: { color: c.accent },
  jump: { position: 'absolute', right: 20, bottom: 20, width: 44, height: 44, backgroundColor: c.panel, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border }, jumpText: { fontSize: 24, color: c.text }, notice: { color: c.muted, fontSize: 11, textAlign: 'center', marginTop: 18 },
  finish: { padding: 22, backgroundColor: c.panel, borderRadius: 22, marginBottom: 10 }, finishIcon: { color: c.accent, fontSize: 32 }, finishTitle: { color: c.text, fontSize: 26, fontWeight: '600', marginTop: 10 }, finishText: { color: c.muted, fontSize: 14, lineHeight: 22, marginTop: 8, marginBottom: 24 },
});
