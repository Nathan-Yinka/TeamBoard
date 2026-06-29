import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'green' | 'amber' | 'red';
}

const toneStyles = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200'
};

export function Badge({ children, tone = 'neutral' }: BadgeProps): JSX.Element {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border capitalize tracking-wide ${toneStyles[tone]}`}>
      {children}
    </span>
  );
}
