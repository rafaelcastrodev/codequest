import { useState, useCallback } from 'react';
import { runTests } from '@/engine/test-runner';
import { checkCommonMistakes, starsFromHints } from '@/engine/hint-engine';
import type { Validation, CommonMistake } from '@/content/curriculum.types';

export type RunStatus = 'idle' | 'running' | 'passed' | 'failed' | 'error' | 'mistake';

export type RunOutcome =
  | { type: 'passed'; stars: number }
  | { type: 'failed' }
  | { type: 'error' }
  | { type: 'mistake' };

interface RunnerState {
  status: RunStatus;
  output: string;
  errorMessage: string | null;
  mistakeMessage: string | null;
}

export interface CodeRunnerAPI extends RunnerState {
  run: (
    code: string,
    validation: Validation,
    commonMistakes: CommonMistake[],
    hintsUsed: number,
  ) => Promise<RunOutcome>;
  reset: () => void;
}

export function useCodeRunner(): CodeRunnerAPI {
  const [state, setState] = useState<RunnerState>({
    status: 'idle',
    output: '',
    errorMessage: null,
    mistakeMessage: null,
  });

  const reset = useCallback(() => {
    setState({ status: 'idle', output: '', errorMessage: null, mistakeMessage: null });
  }, []);

  const run = useCallback(
    async (
      code: string,
      validation: Validation,
      commonMistakes: CommonMistake[],
      hintsUsed: number,
    ): Promise<RunOutcome> => {
      const mistake = checkCommonMistakes(code, commonMistakes);
      if (mistake) {
        setState({ status: 'mistake', output: '', errorMessage: null, mistakeMessage: mistake });
        return { type: 'mistake' };
      }

      setState({ status: 'running', output: '', errorMessage: null, mistakeMessage: null });

      const testResult = await runTests(code, validation);

      if (testResult.passed) {
        setState({ status: 'passed', output: testResult.feedback, errorMessage: null, mistakeMessage: null });
        return { type: 'passed', stars: starsFromHints(hintsUsed) };
      }

      setState({
        status: 'failed',
        output: testResult.output,
        errorMessage: testResult.feedback,
        mistakeMessage: null,
      });
      return { type: 'failed' };
    },
    [],
  );

  return { ...state, run, reset };
}
