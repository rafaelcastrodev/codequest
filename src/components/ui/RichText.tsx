import type { ReactNode } from 'react';

interface RichTextProps {
  content: string;
  className?: string;
}

function parseInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(
        <strong key={match.index} className="font-bold text-text-main">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      parts.push(
        <code
          key={match.index}
          className="bg-bg-elevated text-primary px-1.5 py-0.5 rounded font-mono text-[0.9em]"
        >
          {match[3]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function RichText({ content, className = '' }: RichTextProps) {
  const lines = content.split('\n');

  return (
    <div className={className}>
      {lines.map((line, i) => (
        <p key={`${i}-${line.slice(0, 20)}`} className={line.trim() === '' ? 'h-3' : ''}>
          {parseInline(line)}
        </p>
      ))}
    </div>
  );
}
