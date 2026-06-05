import type { Validation, TestCase } from '@/content/curriculum.types';
import { executeCode, analyzeAST, transpileCode, runInWorker } from './typescript-runner';
import { translateError } from './hint-engine';

export interface TestCaseResult {
  passed: boolean;
  expected: string;
  received: string;
  label?: string;
}

export interface TestRunResult {
  passed: boolean;
  feedback: string;
  results: TestCaseResult[];
}

function normalizeOutput(s: string): string {
  return s.trim().replace(/\r\n/g, '\n');
}

function expectedToString(expected: string | number | boolean | undefined): string {
  if (expected === undefined) return '';
  return String(expected);
}

async function runOutputMatch(
  studentCode: string,
  testCases: TestCase[],
): Promise<TestRunResult> {
  const results: TestCaseResult[] = [];

  for (const tc of testCases) {
    const testCode = [tc.setupCode, tc.testCode].filter(Boolean).join('\n');
    const result = await executeCode(studentCode, testCode);

    if (!result.success && result.error) {
      return {
        passed: false,
        feedback: translateError(result.error),
        results: [{ passed: false, expected: expectedToString(tc.expectedOutput), received: translateError(result.error) }],
      };
    }

    const received = normalizeOutput(result.output);
    const expected = normalizeOutput(expectedToString(tc.expectedOutput));
    results.push({ passed: received === expected, expected, received });
  }

  const allPassed = results.every((r) => r.passed);
  const failed = results.find((r) => !r.passed);

  return {
    passed: allPassed,
    feedback: allPassed
      ? 'Todos os testes passaram!'
      : `Saída incorreta.\nEsperado: "${failed?.expected}"\nRecebido: "${failed?.received}"`,
    results,
  };
}

async function runFunctionTest(
  studentCode: string,
  functionName: string,
  testCases: TestCase[],
  additionalTests?: TestCase[],
): Promise<TestRunResult> {
  const allCases = [...testCases, ...(additionalTests ?? [])];
  const results: TestCaseResult[] = [];

  for (const tc of allCases) {
    const inputJson = JSON.stringify(tc.input ?? []);
    const testCode = `
var __result;
try {
  __result = ${functionName}(...${inputJson});
  console.log(__result);
} catch(__e) {
  console.log('ERRO: ' + __e.message);
}`.trim();

    const result = await executeCode(studentCode, testCode);

    if (!result.success && result.error) {
      return {
        passed: false,
        feedback: translateError(result.error),
        results: [{ passed: false, expected: expectedToString(tc.expectedOutput), received: translateError(result.error) }],
      };
    }

    const received = normalizeOutput(result.output);
    const expected = normalizeOutput(expectedToString(tc.expectedOutput));
    const label = `${functionName}(${(tc.input ?? []).join(', ')})`;

    results.push({ passed: received === expected, expected, received, label });
  }

  const allPassed = results.every((r) => r.passed);
  const failed = results.find((r) => !r.passed);

  return {
    passed: allPassed,
    feedback: allPassed
      ? 'Todos os testes passaram!'
      : `Teste falhou: ${failed?.label ?? ''}\nEsperado: "${failed?.expected}"\nRecebido: "${failed?.received}"`,
    results,
  };
}

async function runASTMatch(
  studentCode: string,
  requiredConstructs: string[],
  forbiddenConstructs: string[],
  testCases: TestCase[],
): Promise<TestRunResult> {
  const astResult = await analyzeAST(studentCode, requiredConstructs, forbiddenConstructs);

  if (!astResult.valid) {
    return {
      passed: false,
      feedback: astResult.message,
      results: [{ passed: false, expected: 'estrutura correta', received: astResult.message }],
    };
  }

  return runOutputMatch(studentCode, testCases);
}

async function runCustom(
  studentCode: string,
  testCases: TestCase[],
): Promise<TestRunResult> {
  const results: TestCaseResult[] = [];

  for (const tc of testCases) {
    if (!tc.testCode) continue;

    let jsStudentCode: string;
    try {
      jsStudentCode = await transpileCode(studentCode);
    } catch (err) {
      const msg = translateError(err instanceof Error ? err.message : String(err));
      return { passed: false, feedback: msg, results: [{ passed: false, expected: '', received: msg }] };
    }

    const testCode = `
var __customResult;
try {
  ${tc.testCode}
  console.log(JSON.stringify(__customResult));
} catch(__e) {
  console.log(JSON.stringify({ pass: false, message: __e.message }));
}`;

    const runResult = await runInWorker(`${jsStudentCode}\n${testCode}`);

    let passed = false;
    let message = '';
    try {
      const parsed = JSON.parse(runResult.output) as { pass: boolean; message: string };
      passed = parsed.pass;
      message = parsed.message;
    } catch {
      passed = false;
      message = translateError(runResult.output || runResult.error || 'Erro desconhecido');
    }

    results.push({ passed, expected: 'true', received: String(passed), label: message });
  }

  const allPassed = results.every((r) => r.passed);
  return {
    passed: allPassed,
    feedback: allPassed ? 'Todos os testes passaram!' : results.find((r) => !r.passed)?.label ?? 'Teste falhou',
    results,
  };
}

export async function runTests(
  studentCode: string,
  validation: Validation,
): Promise<TestRunResult> {
  const {
    strategy,
    testCases = [],
    functionName,
    requiredConstructs = [],
    forbiddenConstructs = [],
    additionalTests,
  } = validation;

  switch (strategy) {
    case 'output-match':
      return runOutputMatch(studentCode, testCases);
    case 'variable-check':
      return runOutputMatch(studentCode, testCases);
    case 'function-test':
      if (!functionName) {
        return { passed: false, feedback: 'Configuração inválida: functionName ausente.', results: [] };
      }
      return runFunctionTest(studentCode, functionName, testCases, additionalTests);
    case 'ast-match':
      return runASTMatch(studentCode, requiredConstructs, forbiddenConstructs, testCases);
    case 'custom':
      return runCustom(studentCode, testCases);
    default:
      return { passed: false, feedback: `Estratégia desconhecida: ${strategy as string}`, results: [] };
  }
}
