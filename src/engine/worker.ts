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

const MAX_OUTPUT_LINES = 1000;

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

const BLOCKED_GLOBALS = [
  'fetch', 'XMLHttpRequest', 'localStorage', 'sessionStorage', 'indexedDB',
  'importScripts', 'self', 'postMessage', 'close',
  'WebSocket', 'Worker', 'SharedWorker', 'BroadcastChannel',
  'navigator', 'location', 'origin', 'caches',
  'EventSource', 'ServiceWorker', 'Notification',
] as const;

function lockdownPrototypes(): void {
  const freezeTarget = (obj: object): void => {
    try {
      Object.freeze(obj);
    } catch { /* some envs restrict freezing builtins */ }
  };

  freezeTarget(Object.prototype);
  freezeTarget(Array.prototype);
  freezeTarget(Function.prototype);
  freezeTarget(String.prototype);
  freezeTarget(Number.prototype);
  freezeTarget(Boolean.prototype);
  freezeTarget(RegExp.prototype);
  freezeTarget(Date.prototype);
  freezeTarget(Error.prototype);
  freezeTarget(Promise.prototype);
  freezeTarget(Map.prototype);
  freezeTarget(Set.prototype);
  freezeTarget(JSON);
  freezeTarget(Math);
}

function buildSandboxedCode(userCode: string): string {
  const blockedParams = BLOCKED_GLOBALS.join(',');
  const undefinedArgs = BLOCKED_GLOBALS.map(() => 'void 0').join(',');

  return `"use strict";
(function(${blockedParams}) {
${userCode}
}).call(Object.create(null), ${undefinedArgs});`;
}

self.onmessage = (event: MessageEvent<WorkerInput>) => {
  const { code } = event.data;
  const lines: string[] = [];

  const mockConsole = {
    log: (...args: unknown[]) => {
      if (lines.length < MAX_OUTPUT_LINES) lines.push(args.map(stringifyArg).join(' '));
    },
    warn: (...args: unknown[]) => {
      if (lines.length < MAX_OUTPUT_LINES) lines.push(args.map(stringifyArg).join(' '));
    },
    error: (...args: unknown[]) => {
      if (lines.length < MAX_OUTPUT_LINES) lines.push(args.map(stringifyArg).join(' '));
    },
    info: (...args: unknown[]) => {
      if (lines.length < MAX_OUTPUT_LINES) lines.push(args.map(stringifyArg).join(' '));
    },
  };

  try {
    lockdownPrototypes();

    const sandboxed = buildSandboxedCode(code);

    const SafeFunction = Function;
    const dangerousGlobals = ['eval', 'Function', 'globalThis'];
    for (const name of dangerousGlobals) {
      try {
        Object.defineProperty(globalThis, name, {
          value: undefined, configurable: true, writable: false,
        });
      } catch { /* may fail if already frozen */ }
    }

    const fn = SafeFunction('console', sandboxed);
    fn(mockConsole);

    if (lines.length >= MAX_OUTPUT_LINES) {
      lines.push('[... output truncado — limite de 1000 linhas atingido]');
    }
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
