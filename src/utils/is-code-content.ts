export function isCodeContent(content: string): boolean {
  return content.includes('\n') && (
    content.includes('let ') ||
    content.includes('const ') ||
    content.includes('function ') ||
    content.includes('console.log') ||
    content.includes('=>')
  );
}
