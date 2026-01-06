
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input
        {...props}
        className={`px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all duration-200 
          ${error ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'}`}
      />
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};
