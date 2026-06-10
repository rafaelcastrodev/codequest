import { useMemo } from 'react';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import 'highlight.js/styles/atom-one-dark.min.css';

hljs.registerLanguage('typescript', typescript);

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = 'typescript', className = '' }: CodeBlockProps) {
  const { html, lineCount } = useMemo(() => {
    const normalized = code.replace(/\n+$/, '');
    return {
      html: hljs.highlight(normalized, { language }).value,
      lineCount: normalized.split('\n').length,
    };
  }, [code, language]);

  return (
    <pre className={`cq-code-block bg-bg-terminal border border-bg-elevated rounded-xl overflow-x-auto ${className}`}>
      <div className="cq-code-inner">
        <div className="cq-line-gutter" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <code
          className={`language-${language} cq-code-content`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </pre>
  );
}
