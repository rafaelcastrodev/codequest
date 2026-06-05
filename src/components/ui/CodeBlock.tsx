import { useEffect, useRef } from 'react';
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
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.removeAttribute('data-highlighted');
      hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  return (
    <pre className={`cq-code-block bg-[#0A0A15] border border-bg-elevated rounded-xl p-4 overflow-x-auto ${className}`}>
      <code ref={codeRef} className={`language-${language} font-mono text-sm !bg-transparent`}>
        {code}
      </code>
    </pre>
  );
}
