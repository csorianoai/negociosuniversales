/**
 * Extracts the first JSON object from a string that may contain
 * markdown fences, preamble text, or trailing explanation.
 */
export function extractJson(text: string): string {
  let raw = text.trim();
  // Remove markdown code fences
  const fenceStart = raw.indexOf('```');
  if (fenceStart !== -1) {
    const afterFence = raw.indexOf('\n', fenceStart);
    if (afterFence !== -1) {
      raw = raw.slice(afterFence + 1);
    }
  }
  const fenceEnd = raw.lastIndexOf('```');
  if (fenceEnd !== -1) {
    raw = raw.slice(0, fenceEnd);
  }
  raw = raw.trim();
  // Find first { and last }
  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    return raw.slice(jsonStart, jsonEnd + 1);
  }
  return raw;
}
