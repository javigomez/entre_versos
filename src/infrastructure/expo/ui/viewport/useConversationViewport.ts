import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { View } from 'react-native';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView, ScrollViewProps } from 'react-native';
import { anchorOffset, contentTopFromWindow, followingOffset, hasContentBelow, spacerHeight } from './scrollPolicy';
import { createScrollDriver } from './scrollDriver';
import type { ScrollDriver } from './scrollDriver';

export type ControlTarget = { id: string; ref: RefObject<View | null>; renderPreview: () => ReactNode };
export type ViewportController = {
  moveControl(target: ControlTarget, token: number, done: (token: number) => void): void;
  placeReply(messageId: string, token: number, done: (token: number) => void): void;
  setAnchor(messageId: string): void;
  interrupt(): void;
  reset(): void;
  dispose(): void;
};
export type MeasuredViewBinding = { ref: (node: View | null) => void; onLayout: (event: LayoutChangeEvent) => void };
export type ViewportBinding = {
  controller: ViewportController;
  scrollRef: RefObject<ScrollView | null>;
  scrollProps: Pick<ScrollViewProps, 'onScroll' | 'onLayout' | 'onScrollBeginDrag' | 'onTouchMove'>;
  bindMessage(id: string): MeasuredViewBinding;
  bindCursor(id: string): MeasuredViewBinding;
  bindRealContent: MeasuredViewBinding;
  onSpacerLayout(event: LayoutChangeEvent): void;
  spacerHeight: number;
  hasContentBelow: boolean;
  jumpToLatest(): void;
  transitionOverlay: ReactNode;
};

export function useConversationViewport(reducedMotion: boolean): ViewportBinding {
  const scrollRef = useRef<ScrollView | null>(null);
  const driverRef = useRef<ScrollDriver | null>(null);
  const messageNodes = useRef(new Map<string, View | null>());
  const cursorNodes = useRef(new Map<string, View | null>());
  const offset = useRef(0);
  const viewportTop = useRef(0);
  const viewportHeight = useRef(0);
  const realBottom = useRef(0);
  const anchorTop = useRef(0);
  const anchorId = useRef<string | null>(null);
  const selectedViewportTop = useRef(0);
  const following = useRef(true);
  const generation = useRef(0);
  const spacerValue = useRef(0);
  const pendingMove = useRef<null | { generation: number; from: number; destination: number; token: number; done: (token: number) => void; overlay: { content: ReactNode; left: number; top: number; width: number; height: number } }>(null);
  const [spacer, setSpacer] = useState(0);
  const [below, setBelow] = useState(false);
  const [overlay, setOverlay] = useState<{ content: ReactNode; left: number; top: number; width: number; height: number } | null>(null);

  const requestSpacer = (height: number) => {
    spacerValue.current = Math.max(spacerValue.current, height);
    setSpacer(current => Math.max(current, height));
  };

  useEffect(() => {
    driverRef.current = createScrollDriver(
      { writeOffset(y) { scrollRef.current?.scrollTo({ y, animated: false }); offset.current = y; } },
      { now: Date.now, schedule: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id) },
      240,
    );
    return () => { driverRef.current?.dispose(); driverRef.current = null; };
  }, []);

  const measureViewport = () => (scrollRef.current as unknown as View | null)?.measureInWindow((_x, y) => { viewportTop.current = y; });
  const refreshBelow = () => setBelow(hasContentBelow(realBottom.current, offset.current, viewportHeight.current));
  const followCursor = (node: View | null) => {
    node?.measureInWindow((_x, y, _width, height) => {
      const cursorBottom = contentTopFromWindow(y + height, viewportTop.current, offset.current);
      const destination = followingOffset({
        offset: offset.current,
        viewportHeight: viewportHeight.current,
        cursorBottom,
        anchorTop: anchorTop.current,
        topInset: 10,
        bottomInset: 0,
        following: following.current,
      });
      if (destination === null) return;
      requestSpacer(spacerHeight(realBottom.current, viewportHeight.current, destination));
      scrollRef.current?.scrollTo({ y: destination, animated: false });
      offset.current = destination;
      refreshBelow();
    });
  };
  const bind = (id: string, cursor = false): MeasuredViewBinding => ({
    ref(node) { (cursor ? cursorNodes : messageNodes).current.set(id, node); },
    onLayout(event) {
      const { y, height } = event.nativeEvent.layout;
      if (id === 'real-content') realBottom.current = Math.max(0, y + height);
      const node = (cursor ? cursorNodes : messageNodes).current.get(id) ?? null;
      if (id === anchorId.current) node?.measureInWindow((_x, windowY) => {
        anchorTop.current = contentTopFromWindow(windowY, viewportTop.current, offset.current);
      });
      if (cursor) followCursor(node);
      refreshBelow();
    },
  });
  const startPendingMove = useCallback(() => {
    const request = pendingMove.current;
    if (!request || request.generation !== generation.current) return;
    pendingMove.current = null;
    requestAnimationFrame(() => driverRef.current?.move(offset.current, request.destination, reducedMotion, _result => {
      if (request.generation !== generation.current) return;
      setOverlay({ ...request.overlay, top: request.overlay.top - (offset.current - request.from) });
      request.done(request.token);
    }));
  }, [reducedMotion]);
  const controller = useMemo<ViewportController>(() => ({
    moveControl(target, token, done) {
      const ownGeneration = generation.current;
      following.current = true;
      target.ref.current?.measureInWindow((x, y, width, height) => {
        if (ownGeneration !== generation.current) return;
        const from = offset.current;
        selectedViewportTop.current = y - viewportTop.current;
        const contentTop = contentTopFromWindow(y, viewportTop.current, offset.current);
        const destination = anchorOffset(contentTop, 10);
        const requiredSpacer = spacerHeight(realBottom.current, viewportHeight.current, destination);
        pendingMove.current = { generation: ownGeneration, from, destination, token, done, overlay: { content: target.renderPreview(), left: x, top: y - viewportTop.current, width, height } };
        if (requiredSpacer > spacerValue.current) requestSpacer(requiredSpacer);
        else startPendingMove();
      });
    },
    placeReply(messageId, token, done) {
      const ownGeneration = generation.current;
      const node = messageNodes.current.get(messageId);
      node?.measureInWindow((_x, y) => {
        if (ownGeneration !== generation.current) return;
        const top = contentTopFromWindow(y, viewportTop.current, offset.current);
        const destination = following.current ? anchorOffset(top, 10) : Math.max(0, top - selectedViewportTop.current);
        requestSpacer(spacerHeight(realBottom.current, viewportHeight.current, destination));
        scrollRef.current?.scrollTo({ y: destination, animated: false });
        offset.current = destination;
        anchorTop.current = top;
        requestAnimationFrame(() => { if (ownGeneration === generation.current) { setOverlay(null); done(token); } });
      });
    },
    setAnchor(messageId) {
      anchorId.current = messageId;
      messageNodes.current.get(messageId)?.measureInWindow((_x, y) => { anchorTop.current = contentTopFromWindow(y, viewportTop.current, offset.current); });
    },
    interrupt() { following.current = false; driverRef.current?.interrupt(); },
    reset() { generation.current += 1; pendingMove.current = null; driverRef.current?.interrupt(); following.current = true; spacerValue.current = 0; setSpacer(0); setOverlay(null); },
    dispose() { generation.current += 1; pendingMove.current = null; driverRef.current?.dispose(); setOverlay(null); },
  }), [startPendingMove]);
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => { offset.current = Math.max(0, event.nativeEvent.contentOffset.y); refreshBelow(); };
  const onLayout = (event: LayoutChangeEvent) => { viewportHeight.current = Math.max(0, event.nativeEvent.layout.height); measureViewport(); refreshBelow(); };
  const interrupt = () => controller.interrupt();
  return {
    controller,
    scrollRef,
    scrollProps: { onScroll, onLayout, onScrollBeginDrag: interrupt, onTouchMove: interrupt },
    bindMessage: bind,
    bindCursor: id => bind(id, true),
    bindRealContent: bind('real-content'),
    onSpacerLayout(event) {
      spacerValue.current = Math.max(0, event.nativeEvent.layout.height);
      startPendingMove();
    },
    spacerHeight: spacer,
    hasContentBelow: below,
    jumpToLatest() { following.current = false; const destination = Math.max(0, realBottom.current - viewportHeight.current); scrollRef.current?.scrollTo({ y: destination, animated: false }); offset.current = destination; refreshBelow(); },
    transitionOverlay: overlay ? createElement(View, { pointerEvents: 'none', accessible: false, accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants', style: { position: 'absolute', left: overlay.left, top: overlay.top, width: overlay.width, height: overlay.height } }, overlay.content) : null,
  };
}
