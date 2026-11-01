const SUMMARY_LENGTH = 120;

export function buildSummary(markdown: string): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const chars = Array.from(plain);
  return chars.length > SUMMARY_LENGTH ? `${chars.slice(0, SUMMARY_LENGTH).join('')}…` : plain;
}
