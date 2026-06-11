export interface VarSnapshot {
  line: number;
  vars: Record<string, unknown>;
}

export async function instrumentCode(
  tsCode: string,
  varNames: string[],
): Promise<string> {
  const ts = await (await import('typescript') as typeof import('typescript'));

  const sourceFile = ts.createSourceFile(
    'inspect.ts',
    tsCode,
    ts.ScriptTarget.ES2020,
    true,
    ts.ScriptKind.TS,
  );

  const tryCaptures = varNames.map(
    (v) => `try { __v.${v} = ${v}; } catch {}`,
  );
  const captureBlock = `(function() { var __v: any = {}; ${tryCaptures.join(' ')} return __v; })()`;

  const insertions: Array<{ pos: number; line: number }> = [];

  for (const stmt of sourceFile.statements) {
    const endPos = stmt.getEnd();
    const { line } = sourceFile.getLineAndCharacterOfPosition(stmt.getStart());
    insertions.push({ pos: endPos, line: line + 1 });
  }

  let result = tsCode;
  for (let i = insertions.length - 1; i >= 0; i--) {
    const { pos, line } = insertions[i];
    const snippet = `\n__snapshot__(${line}, ${captureBlock});`;
    result = result.slice(0, pos) + snippet + result.slice(pos);
  }

  return result;
}
