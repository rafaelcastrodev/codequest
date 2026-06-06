import { useState, useCallback } from 'react';
import { executeCode } from '@/engine/typescript-runner';

export type PlaygroundStatus = 'idle' | 'running' | 'done' | 'error';

interface PlaygroundRunnerState {
  status: PlaygroundStatus;
  output: string;
  errorMessage: string | null;
}

export interface PlaygroundRunnerAPI extends PlaygroundRunnerState {
  run: (code: string) => Promise<void>;
  reset: () => void;
}

export function usePlaygroundRunner(): PlaygroundRunnerAPI {
  const [state, setState] = useState<PlaygroundRunnerState>({
    status: 'idle',
    output: '',
    errorMessage: null,
  });

  const reset = useCallback(() => {
    setState({ status: 'idle', output: '', errorMessage: null });
  }, []);

  const run = useCallback(async (code: string) => {
    setState({ status: 'running', output: '', errorMessage: null });

    const result = await executeCode(code);

    if (result.success) {
      setState({ status: 'done', output: result.output, errorMessage: null });
    } else {
      setState({
        status: 'error',
        output: result.output,
        errorMessage: result.error ?? 'Erro desconhecido ao executar o código.',
      });
    }
  }, []);

  return { ...state, run, reset };
}
