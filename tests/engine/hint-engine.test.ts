import { describe, it, expect } from 'vitest';
import { checkCommonMistakes, translateError, starsFromHints } from '@/engine/hint-engine';

describe('checkCommonMistakes', () => {
  const mistakes = [
    { pattern: 'var ', message: 'Use "let" ou "const" em vez de "var".' },
    { pattern: '==', message: 'Use "===" para comparar valores com segurança.' },
  ];

  it('returns null when no mistakes found', () => {
    expect(checkCommonMistakes('let x = 10;', mistakes)).toBeNull();
  });

  it('returns message for first matching pattern', () => {
    expect(checkCommonMistakes('var x = 10;', mistakes)).toBe(
      'Use "let" ou "const" em vez de "var".',
    );
  });

  it('matches the first applicable mistake', () => {
    expect(checkCommonMistakes('var x == 5;', mistakes)).toBe(
      'Use "let" ou "const" em vez de "var".',
    );
  });

  it('handles empty mistakes array', () => {
    expect(checkCommonMistakes('var x = 10;', [])).toBeNull();
  });
});

describe('translateError', () => {
  it('translates "Cannot find name" errors', () => {
    const result = translateError("Cannot find name 'foo'");
    expect(result).toContain('foo');
    expect(result).toContain('não existe');
  });

  it('translates type mismatch errors', () => {
    const result = translateError("Type 'string' is not assignable to type 'number'");
    expect(result).toContain('string');
    expect(result).toContain('number');
  });

  it('translates "is not defined" runtime errors', () => {
    const result = translateError('myVar is not defined');
    expect(result).toContain('myVar');
    expect(result).toContain('não está definida');
  });

  it('translates "is not a function" runtime errors', () => {
    const result = translateError('myFunc is not a function');
    expect(result).toContain('myFunc');
    expect(result).toContain('não é uma função');
  });

  it('translates maximum call stack errors', () => {
    const result = translateError('Maximum call stack size exceeded');
    expect(result).toContain('recursão infinita');
  });

  it('passes through already-translated messages', () => {
    expect(translateError('Saída incorreta')).toBe('Saída incorreta');
    expect(translateError('Todos os testes passaram!')).toBe('Todos os testes passaram!');
  });

  it('wraps unknown errors with "Erro:" prefix', () => {
    expect(translateError('Something unexpected happened')).toBe(
      'Erro: Something unexpected happened',
    );
  });
});

describe('starsFromHints', () => {
  it('returns 3 stars for 0 hints', () => {
    expect(starsFromHints(0)).toBe(3);
  });

  it('returns 2 stars for 1 hint', () => {
    expect(starsFromHints(1)).toBe(2);
  });

  it('returns 1 star for 2 hints', () => {
    expect(starsFromHints(2)).toBe(1);
  });

  it('returns 1 star for 3+ hints', () => {
    expect(starsFromHints(3)).toBe(1);
    expect(starsFromHints(10)).toBe(1);
  });
});
