import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, ...props }: InputProps): JSX.Element {
  const inputId = id ?? props.name ?? label;

  return (
    <label className="flex flex-col gap-1.5 text-slate-700 text-sm font-semibold" htmlFor={inputId}>
      <span>{label}</span>
      <input 
        className="w-full border border-slate-300 rounded-md bg-white text-slate-900 px-3 py-2 disabled:opacity-60 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-shadow" 
        id={inputId} 
        {...props} 
      />
    </label>
  );
}
