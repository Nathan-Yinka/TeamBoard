import { ApiError } from '../../services/apiClient';

interface ApiErrorDisplayProps {
  error: unknown;
}

export function ApiErrorDisplay({ error }: ApiErrorDisplayProps): JSX.Element | null {
  if (!error) return null;

  let message = 'An unexpected error occurred. Please try again.';
  let errors: string[] = [];

  if (error instanceof ApiError) {
    message = error.message;
    if (error.errors && error.errors.length > 0) {
      errors = error.errors;
    }
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex flex-col gap-1.5 mt-2 text-sm">
      <span className="font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {message}
      </span>
      {errors.length > 0 && (
        <ul className="list-disc list-inside ml-2 text-red-600/90 text-[13px] flex flex-col gap-0.5">
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
