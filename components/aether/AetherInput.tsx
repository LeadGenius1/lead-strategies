'use client';

import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface AetherInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const AetherInput = forwardRef<HTMLInputElement, AetherInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-neutral-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input-aether ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

AetherInput.displayName = 'AetherInput';

interface AetherSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const AetherSelect = forwardRef<HTMLSelectElement, AetherSelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-neutral-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`select-aether ${error ? 'border-red-500/50' : ''} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

AetherSelect.displayName = 'AetherSelect';

interface AetherTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const AetherTextarea = forwardRef<HTMLTextAreaElement, AetherTextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-neutral-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`input-aether min-h-[120px] resize-y ${error ? 'border-red-500/50' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

AetherTextarea.displayName = 'AetherTextarea';
