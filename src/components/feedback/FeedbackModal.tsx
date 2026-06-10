import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

const APPS_SCRIPT_URL = import.meta.env.VITE_FEEDBACK_URL as string | undefined;

const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 1000;

type FeedbackType = 'suggestion' | 'bug';
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const location = useLocation();

  const [type, setType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const trimmedMessage = message.trim();
  const isValid = trimmedMessage.length >= MESSAGE_MIN_LENGTH;
  const charsLeft = MESSAGE_MAX_LENGTH - message.length;

  const resetForm = useCallback(() => {
    setType('suggestion');
    setMessage('');
    setStatus('idle');
  }, []);

  const handleClose = useCallback(() => {
    if (status === 'loading') return;
    onClose();
    if (status !== 'idle') {
      setTimeout(resetForm, 300);
    }
  }, [status, onClose, resetForm]);

  const handleSubmit = useCallback(async () => {
    if (!isValid || !APPS_SCRIPT_URL) return;

    setStatus('loading');

    const payload = {
      version: __APP_VERSION__,
      route: location.pathname,
      type,
      message: trimmedMessage,
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [isValid, type, trimmedMessage, location.pathname]);

  if (!APPS_SCRIPT_URL) return null;

  return (
    <Modal open={open} onClose={handleClose} title="Feedback">
      {status === 'success' ? (
        <div className="text-center py-4">
          <p className="text-2xl mb-2" aria-hidden="true">
            &#10024;
          </p>
          <p className="font-body text-text-main font-semibold">
            Obrigado pelo feedback!
          </p>
          <p className="font-body text-text-muted text-sm mt-1">
            Sua mensagem foi enviada com sucesso.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={handleClose}
          >
            Fechar
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="feedback-type"
              className="block font-body text-sm text-text-muted mb-1.5"
            >
              Reportar
            </label>
            <select
              id="feedback-type"
              value={type}
              onChange={(e) => setType(e.target.value as FeedbackType)}
              disabled={status === 'loading'}
              className="w-full bg-bg-elevated border border-bg-elevated rounded-lg px-3 py-2
                font-body text-text-main text-sm
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary
                disabled:opacity-50"
            >
              <option value="suggestion">Sugestão</option>
              <option value="bug">Bug</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="feedback-message"
              className="block font-body text-sm text-text-muted mb-1.5"
            >
              Mensagem
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
              disabled={status === 'loading'}
              rows={4}
              placeholder="Descreva sua sugestão ou o bug que encontrou..."
              className="w-full bg-bg-elevated border border-bg-elevated rounded-lg px-3 py-2
                font-body text-text-main text-sm resize-none
                placeholder:text-text-muted/60
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary
                disabled:opacity-50"
            />
            <div className="flex justify-between mt-1">
              <p
                className={`font-body text-xs ${
                  trimmedMessage.length > 0 && !isValid
                    ? 'text-accent'
                    : 'text-text-muted'
                }`}
              >
                {trimmedMessage.length > 0 && !isValid
                  ? `Mínimo de ${MESSAGE_MIN_LENGTH} caracteres`
                  : ' '}
              </p>
              <p
                className={`font-body text-xs ${
                  charsLeft < 50 ? 'text-warning' : 'text-text-muted'
                }`}
              >
                {charsLeft}
              </p>
            </div>
          </div>

          {status === 'error' && (
            <p className="font-body text-sm text-accent" role="alert">
              Não foi possível enviar. Tente novamente.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={status === 'loading'}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              loading={status === 'loading'}
              disabled={!isValid}
            >
              Enviar
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
