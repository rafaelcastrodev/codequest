import type { Monaco } from '@monaco-editor/react';

export function defineCodeQuestTheme(monaco: Monaco): void {
  monaco.editor.defineTheme('codequest-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '7C5CFC', fontStyle: 'bold' },
      { token: 'string', foreground: '00D4AA' },
      { token: 'number', foreground: 'FFB84D' },
      { token: 'comment', foreground: '8888AA', fontStyle: 'italic' },
      { token: 'type', foreground: '7C5CFC' },
    ],
    colors: {
      'editor.background': '#0A0A15',
      'editor.foreground': '#E8E8F0',
      'editorLineNumber.foreground': '#8888AA',
      'editorLineNumber.activeForeground': '#00D4AA',
      'editor.selectionBackground': '#25254266',
      'editor.lineHighlightBackground': '#1A1A2E88',
      'editorCursor.foreground': '#00D4AA',
      'editorBracketMatch.background': '#00D4AA22',
      'editorBracketMatch.border': '#00D4AA',
    },
  });
}
