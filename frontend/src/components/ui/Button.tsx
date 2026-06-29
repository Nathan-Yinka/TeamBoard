import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const variantStyles = {
  primary: 'bg-teal-600 text-white hover:bg-teal-700 border border-transparent shadow-sm',
  secondary: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-sm',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
};

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps): JSX.Element {
  return (
    <button 
      className={`inline-flex items-center justify-center min-h-[36px] px-4 py-1.5 rounded-md font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-teal-500/50 ${variantStyles[variant]} ${className}`.trim()} 
      {...props}
    >
      {children}
    </button>
  );
}
