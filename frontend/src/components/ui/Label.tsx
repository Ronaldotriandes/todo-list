import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bold' | 'subtle';
}

const Label: React.FC<LabelProps> = ({
  children,
  required = false,
  error = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseClasses = `
    block font-medium transition-colors duration-200
    ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
    ${error ? 'text-red-700' : 'text-gray-700'}
  `;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const variantClasses = {
    default: 'font-medium',
    bold: 'font-semibold',
    subtle: 'font-normal text-gray-600'
  };

  return (
    <label
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  );
};

export default Label;
