export type FollowInput = {
  offset: number;
  viewportHeight: number;
  cursorBottom: number;
  anchorTop: number;
  topInset: number;
  bottomInset: number;
  following: boolean;
};

export function anchorOffset(anchorTop: number, topInset: number): number {
  return Math.max(0, anchorTop - topInset);
}

export function followingOffset(input: FollowInput): number | null {
  const { offset, viewportHeight, cursorBottom, anchorTop, topInset, bottomInset, following } = input;
  const anchor = anchorOffset(anchorTop, topInset);
  if (!following || viewportHeight <= 0 || offset >= anchor) return null;
  const wanted = Math.min(anchor, Math.max(offset, cursorBottom + bottomInset - viewportHeight));
  return wanted > offset ? wanted : null;
}

export function spacerHeight(realBottom: number, viewportHeight: number, requiredOffset: number): number {
  return Math.max(0, requiredOffset + viewportHeight - realBottom);
}

export function hasContentBelow(realBottom: number, offset: number, viewportHeight: number): boolean {
  return realBottom > offset + viewportHeight;
}

export function contentTopFromWindow(elementTop: number, viewportTop: number, offset: number): number {
  return elementTop - viewportTop + offset;
}
