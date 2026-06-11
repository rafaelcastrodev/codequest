import SandboxWorker from './worker?worker';
import { instrumentCode } from './var-inspector';
import type { VarSnapshot } from './var-inspector';

export type { VarSnapshot };

export interface RunResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface InspectionResult extends RunResult {
  snapshots: VarSnapshot[];
}

export interface CompileError {
  message: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}

const WORKER_TIMEOUT_MS = 5000;

let tsModule: typeof import('typescript') | null = null;

async function getTs(): Promise<typeof import('typescript')> {
  if (!tsModule) {
    tsModule = (await import('typescript')) as typeof import('typescript');
  }
  return tsModule;
}

let lastCompileErrors: CompileError[] = [];

export function getLastCompileErrors(): CompileError[] {
  return lastCompileErrors;
}

export async function transpileCode(tsCode: string): Promise<string> {
  const ts = await getTs();

  const result = ts.transpileModule(tsCode, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
      strict: false,
      noEmit: false,
    },
    reportDiagnostics: true,
  });

  const diagnosticErrors = result.diagnostics?.filter((d) => d.category === 1) ?? [];

  if (diagnosticErrors.length > 0) {
    const sourceFile = ts.createSourceFile('student.ts', tsCode, ts.ScriptTarget.ES2020, true);
    lastCompileErrors = diagnosticErrors.map((d) => {
      const pos = d.start ?? 0;
      const len = d.length ?? 1;
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
      const end = sourceFile.getLineAndCharacterOfPosition(pos + len);
      return {
        message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
        line: line + 1,
        column: character + 1,
        endLine: end.line + 1,
        endColumn: end.character + 1,
      };
    });

    throw new Error(lastCompileErrors.map((e) => e.message).join('\n'));
  }

  lastCompileErrors = [];
  return result.outputText;
}

export function runInWorker(jsCode: string, collectSnapshots = false): Promise<RunResult & { snapshots?: VarSnapshot[] }> {
  return new Promise((resolve) => {
    const worker = new SandboxWorker();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        worker.terminate();
        resolve({
          success: false,
          output: '',
          error: '⏰ Tempo esgotado! Seu código tem um loop infinito ou demorou demais.',
        });
      }
    }, WORKER_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<RunResult & { snapshots?: VarSnapshot[] }>) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        resolve(event.data);
      }
    };

    worker.onerror = (event: ErrorEvent) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        resolve({ success: false, output: '', error: event.message });
      }
    };

    worker.postMessage({ code: jsCode, collectSnapshots });
  });
}

export async function executeCode(tsCode: string, testCode: string = ''): Promise<RunResult> {
  let jsCode: string;
  try {
    jsCode = await transpileCode(tsCode);
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : String(err),
    };
  }

  const combined = testCode ? `${jsCode}\n${testCode}` : jsCode;
  return runInWorker(combined);
}

export async function runWithInspection(
  tsCode: string,
  varNames: string[],
): Promise<InspectionResult> {
  let instrumented: string;
  try {
    instrumented = await instrumentCode(tsCode, varNames);
  } catch {
    return { success: false, output: '', error: 'Falha ao instrumentar código.', snapshots: [] };
  }

  let jsCode: string;
  try {
    jsCode = await transpileCode(instrumented);
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : String(err),
      snapshots: [],
    };
  }

  const result = await runInWorker(jsCode, true);
  return {
    success: result.success,
    output: result.output,
    error: result.error,
    snapshots: result.snapshots ?? [],
  };
}

export async function analyzeAST(
  tsCode: string,
  requiredConstructs: string[],
  forbiddenConstructs: string[],
): Promise<{ valid: boolean; message: string }> {
  const ts = await getTs();

  const sourceFile = ts.createSourceFile('student.ts', tsCode, ts.ScriptTarget.ES2020, true);

  const foundKinds = new Set<number>();

  function walk(node: import('typescript').Node): void {
    foundKinds.add(node.kind);
    ts.forEachChild(node, walk);
  }
  walk(sourceFile);

  const syntaxKind = ts.SyntaxKind as Record<string, unknown>;

  for (const construct of forbiddenConstructs) {
    const kind = syntaxKind[construct] as number | undefined;
    if (kind !== undefined && foundKinds.has(kind)) {
      return {
        valid: false,
        message: `Ops! Você usou "${construct}" que não é permitido neste exercício.`,
      };
    }
  }

  for (const construct of requiredConstructs) {
    const kind = syntaxKind[construct] as number | undefined;
    if (kind === undefined || !foundKinds.has(kind)) {
      return {
        valid: false,
        message: `Seu código precisa usar "${construct}". Tente de novo!`,
      };
    }
  }

  return { valid: true, message: '' };
}
