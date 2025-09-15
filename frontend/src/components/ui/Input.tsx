import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'outlined',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = `
    text-black px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2
    ${fullWidth ? 'w-full' : ''}
    ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
    ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;

  const variantClasses = {
    outlined: 'border border-gray-300',
    filled: 'bg-gray-50 border-b-2 border-t-0 border-x-0 rounded-t-md rounded-b-none',
    standard: 'border-0 border-b-2 bg-transparent rounded-none px-0'
  };

  return (
    <div className={`flex flex-col space-y-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className={`text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'}`}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-sm text-gray-500">{helperText}</span>
      )}
    </div>
  );
};

export default Input;
