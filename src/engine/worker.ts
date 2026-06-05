/// <reference lib="webworker" />

export type {};

interface WorkerInput {
  code: string;
}

interface WorkerOutput {
  success: boolean;
  output: string;
  error?: string;
}

function stringifyArg(arg: unknown): string {
  if (arg === null) return 'null';
  if (typeof arg === 'undefined') return 'undefined';
  if (typeof arg === 'string') return arg;
  if (typeof arg === 'object' || Array.isArray(arg)) {
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

self.onmessage = (event: MessageEvent<WorkerInput>) => {
  const { code } = event.data;
  const lines: string[] = [];

  const mockConsole = {
    log: (...args: unknown[]) => {
      if (lines.length < 1000) lines.push(args.map(stringifyArg).join(' '));
    },
    warn: (...args: unknown[]) => {
      if (lines.length < 1000) lines.push(args.map(stringifyArg).join(' '));
    },
    error: (...args: unknown[]) => {
      if (lines.length < 1000) lines.push(args.map(stringifyArg).join(' '));
    },
    info: (...args: unknown[]) => {
      if (lines.length < 1000) lines.push(args.map(stringifyArg).join(' '));
    },
  };

  try {
    // Shadow dangerous globals by passing them as undefined parameters
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      'console',
      'fetch',
      'XMLHttpRequest',
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'importScripts',
      'eval',
      code,
    );
    fn(mockConsole, undefined, undefined, undefined, undefined, undefined, undefined, undefined);

    const result: WorkerOutput = { success: true, output: lines.join('\n') };
    self.postMessage(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const result: WorkerOutput = {
      success: false,
      output: lines.join('\n'),
      error: message,
    };
    self.postMessage(result);
  }
};
