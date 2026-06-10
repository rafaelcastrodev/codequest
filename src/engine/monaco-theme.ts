import type { Monaco } from '@monaco-editor/react';
import type { EditorTheme } from '@/store/settings.store';

interface ThemeDef {
  base: 'vs' | 'vs-dark';
  rules: { token: string; foreground: string; fontStyle?: string }[];
  colors: Record<string, string>;
}

const THEMES: Record<EditorTheme, ThemeDef> = {
  'codequest-dark': {
    base: 'vs-dark',
    rules: [
      { token: 'keyword', foreground: '7C5CFC', fontStyle: 'bold' },
      { token: 'string', foreground: '00D4AA' },
      { token: 'number', foreground: 'FFB84D' },
      { token: 'comment', foreground: 'A0AEC0', fontStyle: 'italic' },
      { token: 'type', foreground: '7C5CFC' },
    ],
    colors: {
      'editor.background': '#0A0A15',
      'editor.foreground': '#E8E8F0',
      'editorLineNumber.foreground': '#A0AEC0',
      'editorLineNumber.activeForeground': '#00D4AA',
      'editor.selectionBackground': '#25254266',
      'editor.lineHighlightBackground': '#1A1A2E88',
      'editorCursor.foreground': '#00D4AA',
      'editorBracketMatch.background': '#00D4AA22',
      'editorBracketMatch.border': '#00D4AA',
    },
  },
  dracula: {
    base: 'vs-dark',
    rules: [
      { token: 'keyword', foreground: 'FF79C6', fontStyle: 'bold' },
      { token: 'string', foreground: 'F1FA8C' },
      { token: 'number', foreground: 'BD93F9' },
      { token: 'comment', foreground: '6272A4', fontStyle: 'italic' },
      { token: 'type', foreground: '8BE9FD' },
    ],
    colors: {
      'editor.background': '#282A36',
      'editor.foreground': '#F8F8F2',
      'editorLineNumber.foreground': '#6272A4',
      'editorLineNumber.activeForeground': '#F8F8F2',
      'editor.selectionBackground': '#44475A',
      'editor.lineHighlightBackground': '#44475A88',
      'editorCursor.foreground': '#F8F8F2',
      'editorBracketMatch.background': '#44475A',
      'editorBracketMatch.border': '#FF79C6',
    },
  },
  monokai: {
    base: 'vs-dark',
    rules: [
      { token: 'keyword', foreground: 'F92672', fontStyle: 'bold' },
      { token: 'string', foreground: 'E6DB74' },
      { token: 'number', foreground: 'AE81FF' },
      { token: 'comment', foreground: '75715E', fontStyle: 'italic' },
      { token: 'type', foreground: '66D9EF' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#F8F8F2',
      'editorLineNumber.foreground': '#90908A',
      'editorLineNumber.activeForeground': '#F8F8F2',
      'editor.selectionBackground': '#49483E',
      'editor.lineHighlightBackground': '#3E3D32',
      'editorCursor.foreground': '#F8F8F0',
      'editorBracketMatch.background': '#49483E',
      'editorBracketMatch.border': '#A6E22E',
    },
  },
  'github-light': {
    base: 'vs',
    rules: [
      { token: 'keyword', foreground: 'CF222E', fontStyle: 'bold' },
      { token: 'string', foreground: '0A3069' },
      { token: 'number', foreground: '0550AE' },
      { token: 'comment', foreground: '6E7781', fontStyle: 'italic' },
      { token: 'type', foreground: '8250DF' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#1F2328',
      'editorLineNumber.foreground': '#8C959F',
      'editorLineNumber.activeForeground': '#1F2328',
      'editor.selectionBackground': '#0969DA33',
      'editor.lineHighlightBackground': '#F6F8FA',
      'editorCursor.foreground': '#0969DA',
      'editorBracketMatch.background': '#0969DA22',
      'editorBracketMatch.border': '#0969DA',
    },
  },
  solarized: {
    base: 'vs',
    rules: [
      { token: 'keyword', foreground: '859900', fontStyle: 'bold' },
      { token: 'string', foreground: '2AA198' },
      { token: 'number', foreground: 'D33682' },
      { token: 'comment', foreground: '93A1A1', fontStyle: 'italic' },
      { token: 'type', foreground: '268BD2' },
    ],
    colors: {
      'editor.background': '#FDF6E3',
      'editor.foreground': '#657B83',
      'editorLineNumber.foreground': '#93A1A1',
      'editorLineNumber.activeForeground': '#586E75',
      'editor.selectionBackground': '#EEE8D5',
      'editor.lineHighlightBackground': '#EEE8D5',
      'editorCursor.foreground': '#586E75',
      'editorBracketMatch.background': '#EEE8D5',
      'editorBracketMatch.border': '#859900',
    },
  },
};

export const EDITOR_THEME_LABELS: Record<EditorTheme, string> = {
  'codequest-dark': 'CodeQuest',
  dracula: 'Dracula',
  monokai: 'Monokai',
  'github-light': 'GitHub Light',
  solarized: 'Solarized',
};

export function defineAllThemes(monaco: Monaco): void {
  for (const [name, def] of Object.entries(THEMES)) {
    monaco.editor.defineTheme(name, { ...def, inherit: true });
  }
}

export function defineCodeQuestTheme(monaco: Monaco): void {
  defineAllThemes(monaco);
}
