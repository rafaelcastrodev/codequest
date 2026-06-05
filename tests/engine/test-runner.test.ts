import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RunResult } from '@/engine/typescript-runner';
import type { Validation } from '@/content/curriculum.types';

vi.mock('@/engine/typescript-runner', () => ({
  executeCode: vi.fn(),
  analyzeAST: vi.fn(),
  transpileCode: vi.fn(),
  runInWorker: vi.fn(),
}));

vi.mock('@/engine/hint-engine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/engine/hint-engine')>();
  return { ...actual };
});

import { runTests } from '@/engine/test-runner';
import { executeCode, analyzeAST, transpileCode, runInWorker } from '@/engine/typescript-runner';

const mockExecuteCode = vi.mocked(executeCode);
const mockAnalyzeAST = vi.mocked(analyzeAST);
const mockTranspileCode = vi.mocked(transpileCode);
const mockRunInWorker = vi.mocked(runInWorker);

function ok(output: string): RunResult {
  return { success: true, output, error: undefined };
}

function fail(error: string, output = ''): RunResult {
  return { success: false, output, error };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('output-match strategy', () => {
  const validation: Validation = {
    strategy: 'output-match',
    testCases: [{ expectedOutput: 'hello' }],
  };

  it('passes when output matches expected', async () => {
    mockExecuteCode.mockResolvedValue(ok('hello'));
    const result = await runTests('console.log("hello")', validation);
    expect(result.passed).toBe(true);
    expect(result.results[0]!.passed).toBe(true);
  });

  it('fails when output does not match', async () => {
    mockExecuteCode.mockResolvedValue(ok('world'));
    const result = await runTests('console.log("world")', validation);
    expect(result.passed).toBe(false);
    expect(result.results[0]!.received).toBe('world');
  });

  it('trims whitespace for comparison', async () => {
    mockExecuteCode.mockResolvedValue(ok('  hello  \n'));
    const result = await runTests('code', validation);
    expect(result.passed).toBe(true);
  });

  it('handles runtime errors', async () => {
    mockExecuteCode.mockResolvedValue(fail('x is not defined'));
    const result = await runTests('x', validation);
    expect(result.passed).toBe(false);
    expect(result.results[0]!.passed).toBe(false);
  });

  it('handles multiple test cases', async () => {
    const multi: Validation = {
      strategy: 'output-match',
      testCases: [
        { expectedOutput: 'a' },
        { expectedOutput: 'b' },
      ],
    };
    mockExecuteCode
      .mockResolvedValueOnce(ok('a'))
      .mockResolvedValueOnce(ok('b'));
    const result = await runTests('code', multi);
    expect(result.passed).toBe(true);
    expect(result.results).toHaveLength(2);
  });

  it('fails if any test case fails', async () => {
    const multi: Validation = {
      strategy: 'output-match',
      testCases: [
        { expectedOutput: 'a' },
        { expectedOutput: 'b' },
      ],
    };
    mockExecuteCode
      .mockResolvedValueOnce(ok('a'))
      .mockResolvedValueOnce(ok('wrong'));
    const result = await runTests('code', multi);
    expect(result.passed).toBe(false);
  });

  it('handles numeric expectedOutput', async () => {
    const v: Validation = {
      strategy: 'output-match',
      testCases: [{ expectedOutput: 42 }],
    };
    mockExecuteCode.mockResolvedValue(ok('42'));
    const result = await runTests('code', v);
    expect(result.passed).toBe(true);
  });

  it('handles boolean expectedOutput', async () => {
    const v: Validation = {
      strategy: 'output-match',
      testCases: [{ expectedOutput: true }],
    };
    mockExecuteCode.mockResolvedValue(ok('true'));
    const result = await runTests('code', v);
    expect(result.passed).toBe(true);
  });
});

describe('variable-check strategy', () => {
  const validation: Validation = {
    strategy: 'variable-check',
    testCases: [{
      input: ['x'],
      expectedOutput: '{"x":10}',
    }],
  };

  it('passes when variables match', async () => {
    mockExecuteCode.mockResolvedValue(ok('{"x":10}'));
    const result = await runTests('let x = 10;', validation);
    expect(result.passed).toBe(true);
  });

  it('fails when variable values differ', async () => {
    mockExecuteCode.mockResolvedValue(ok('{"x":5}'));
    const result = await runTests('let x = 5;', validation);
    expect(result.passed).toBe(false);
  });

  it('handles runtime error during variable check', async () => {
    mockExecuteCode.mockResolvedValue(fail('ReferenceError: x is not defined'));
    const result = await runTests('// empty', validation);
    expect(result.passed).toBe(false);
  });
});

describe('function-test strategy', () => {
  const validation: Validation = {
    strategy: 'function-test',
    functionName: 'add',
    testCases: [
      { input: [1, 2], expectedOutput: 3 },
      { input: [0, 0], expectedOutput: 0 },
    ],
  };

  it('passes when function returns correct values', async () => {
    mockExecuteCode
      .mockResolvedValueOnce(ok('3'))
      .mockResolvedValueOnce(ok('0'));
    const result = await runTests('function add(a, b) { return a + b; }', validation);
    expect(result.passed).toBe(true);
    expect(result.results).toHaveLength(2);
  });

  it('fails when function returns wrong value', async () => {
    mockExecuteCode
      .mockResolvedValueOnce(ok('3'))
      .mockResolvedValueOnce(ok('1'));
    const result = await runTests('function add(a, b) { return a + b; }', validation);
    expect(result.passed).toBe(false);
    expect(result.results[1]!.label).toContain('add');
  });

  it('includes additionalTests', async () => {
    const withAdditional: Validation = {
      ...validation,
      additionalTests: [{ input: [10, 20], expectedOutput: 30 }],
    };
    mockExecuteCode
      .mockResolvedValueOnce(ok('3'))
      .mockResolvedValueOnce(ok('0'))
      .mockResolvedValueOnce(ok('30'));
    const result = await runTests('code', withAdditional);
    expect(result.passed).toBe(true);
    expect(result.results).toHaveLength(3);
  });

  it('returns error when functionName is missing', async () => {
    const noName: Validation = {
      strategy: 'function-test',
      testCases: [{ input: [1], expectedOutput: 1 }],
    };
    const result = await runTests('code', noName);
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('functionName');
  });

  it('handles function runtime error', async () => {
    mockExecuteCode.mockResolvedValue(fail('add is not a function'));
    const result = await runTests('code', validation);
    expect(result.passed).toBe(false);
  });
});

describe('ast-match strategy', () => {
  const validation: Validation = {
    strategy: 'ast-match',
    requiredConstructs: ['ForStatement'],
    forbiddenConstructs: ['WhileStatement'],
    testCases: [{ expectedOutput: '1\n2\n3' }],
  };

  it('passes when AST is valid and output matches', async () => {
    mockAnalyzeAST.mockResolvedValue({ valid: true, message: '' });
    mockExecuteCode.mockResolvedValue(ok('1\n2\n3'));
    const result = await runTests('for (let i=1; i<=3; i++) console.log(i)', validation);
    expect(result.passed).toBe(true);
  });

  it('fails when required construct is missing', async () => {
    mockAnalyzeAST.mockResolvedValue({ valid: false, message: 'Seu código precisa usar "ForStatement"' });
    const result = await runTests('console.log(1)', validation);
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('ForStatement');
    expect(mockExecuteCode).not.toHaveBeenCalled();
  });

  it('fails when forbidden construct is used', async () => {
    mockAnalyzeAST.mockResolvedValue({ valid: false, message: 'Ops! Você usou "WhileStatement"' });
    const result = await runTests('while(true) {}', validation);
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('WhileStatement');
  });

  it('fails when AST is valid but output is wrong', async () => {
    mockAnalyzeAST.mockResolvedValue({ valid: true, message: '' });
    mockExecuteCode.mockResolvedValue(ok('wrong'));
    const result = await runTests('code', validation);
    expect(result.passed).toBe(false);
  });
});

describe('custom strategy', () => {
  const validation: Validation = {
    strategy: 'custom',
    testCases: [{
      testCode: '__customResult = { pass: true, message: "ok" };',
    }],
  };

  it('passes when custom test returns pass: true', async () => {
    mockTranspileCode.mockResolvedValue('var x = 1;');
    mockRunInWorker.mockResolvedValue(ok('{"pass":true,"message":"ok"}'));
    const result = await runTests('let x = 1;', validation);
    expect(result.passed).toBe(true);
  });

  it('fails when custom test returns pass: false', async () => {
    mockTranspileCode.mockResolvedValue('var x = 1;');
    mockRunInWorker.mockResolvedValue(ok('{"pass":false,"message":"valor incorreto"}'));
    const result = await runTests('let x = 1;', validation);
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('valor incorreto');
  });

  it('fails when transpilation fails', async () => {
    mockTranspileCode.mockRejectedValue(new Error("';' expected"));
    const result = await runTests('let x =', validation);
    expect(result.passed).toBe(false);
  });

  it('handles malformed JSON output', async () => {
    mockTranspileCode.mockResolvedValue('code');
    mockRunInWorker.mockResolvedValue(ok('not json'));
    const result = await runTests('code', validation);
    expect(result.passed).toBe(false);
  });

  it('skips test cases without testCode', async () => {
    const noCode: Validation = {
      strategy: 'custom',
      testCases: [{ expectedOutput: 'ignored' }],
    };
    const result = await runTests('code', noCode);
    expect(result.passed).toBe(true);
    expect(result.results).toHaveLength(0);
  });
});

describe('unknown strategy', () => {
  it('returns failure for unknown strategy', async () => {
    const validation = {
      strategy: 'nonexistent' as Validation['strategy'],
    };
    const result = await runTests('code', validation);
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('desconhecida');
  });
});

describe('edge cases', () => {
  it('handles empty testCases array', async () => {
    const validation: Validation = {
      strategy: 'output-match',
      testCases: [],
    };
    const result = await runTests('code', validation);
    expect(result.passed).toBe(true);
  });

  it('handles undefined testCases', async () => {
    const validation: Validation = {
      strategy: 'output-match',
    };
    const result = await runTests('code', validation);
    expect(result.passed).toBe(true);
  });
});
