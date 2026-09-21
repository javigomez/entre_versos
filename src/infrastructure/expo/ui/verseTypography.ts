export type VerseTypographyInput = {
  lines: string[];
  availableWidth: number;
  preferredSize: number;
  minimumSize: number;
  measureLine: (line: string, fontSize: number) => number;
};

export function findLargestVerseFontSize(input: VerseTypographyInput): number {
  const { lines, availableWidth, preferredSize, minimumSize, measureLine } = input;
  for (let size = Math.floor(preferredSize); size >= minimumSize; size -= 1) {
    if (lines.every(line => measureLine(line, size) <= availableWidth)) return size;
  }
  return minimumSize;
}
