import React from 'react';

interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface Question {
  id: number;
  name: string;
}

interface RadioProps {
  options: RadioOption[];
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  direction?: 'row' | 'column';
  size?: 'sm' | 'md' | 'lg';
  showHeader?: boolean;
  questions?: Question[];
  values?: Record<number, string>;
}

const Radio: React.FC<RadioProps> = ({
  options,
  name,
  value,
  onChange,
  label,
  error,
  helperText,
  disabled = false,
  direction = 'column',
  size = 'md',
  showHeader = false,
  questions,
  values
}) => {
  const sizeClasses = {
    sm: {
      radio: 'h-3 w-3',
      text: 'text-xs',
      gap: 'gap-1.5'
    },
    md: {
      radio: 'h-4 w-4',
      text: 'text-sm',
      gap: 'gap-2'
    },
    lg: {
      radio: 'h-5 w-5',
      text: 'text-base',
      gap: 'gap-3'
    }
  };

  const handleChange = (optionValue: string) => {
    if (!disabled && onChange) {
      onChange(optionValue);
    }
  };

  const handleQuestionChange = (questionId: number, value: string) => {
    if (onChange) {
      onChange(`${questionId}:${value}`);
    }
  };

  if (questions && questions.length > 0) {
    return (
      <div className="w-full">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col className="w-2/5" />
              {options.map((_, index) => (
                <col key={`col-${index}`} className="w-auto" />
              ))}
            </colgroup>
            {showHeader && (
              <thead>
                <tr>
                  <th className="text-left p-4 pr-8 font-medium text-gray-800 border-b border-gray-200">
                    Question
                  </th>
                  {options.map((option, index) => (
                    <th
                      key={`header-${index}`}
                      className={`text-center p-4 font-medium border-b border-gray-200 ${error ? 'text-red-700' : 'text-gray-700'} ${sizeClasses[size].text}`}
                    >
                      {option.label}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {questions.map((question, questionIndex) => (
                <tr key={question.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 pr-8 font-medium text-gray-700 text-left align-middle">
                    {question.name}
                  </td>
                  {options.map((option, optionIndex) => {
                    const isDisabled = disabled || option.disabled;
                    const isChecked = values?.[question.id] === option.value;
                    const questionName = `question-${question.id}`;

                    return (
                      <td key={`${questionName}-${optionIndex}`} className="text-center p-4 align-middle">
                        <div className="flex justify-center items-center">
                          <div
                            className={`relative ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={() => !isDisabled && handleQuestionChange(question.id, option.value)}
                          >
                            <input
                              type="radio"
                              id={`${questionName}-${optionIndex}`}
                              name={questionName}
                              value={option.value}
                              checked={isChecked}
                              onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                              disabled={isDisabled}
                              className="sr-only"
                            />
                            <div
                              className={`
                                ${sizeClasses[size].radio} rounded-full border-2 flex items-center justify-center transition-all duration-200 mx-auto
                                ${isChecked
                                  ? error
                                    ? 'border-red-500 bg-red-500'
                                    : 'border-blue-500 bg-blue-500'
                                  : error
                                    ? 'border-red-500 bg-white hover:border-red-400'
                                    : 'border-gray-300 bg-white hover:border-blue-500'
                                }
                                ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                              `}
                            >
                              {isChecked && (
                                <div
                                  className={`
                                    bg-white rounded-full
                                    ${size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-1.5 w-1.5' : 'h-2 w-2'}
                                  `}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="mt-2">
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}
        {helperText && !error && (
          <div className="mt-2">
            <span className="text-sm text-gray-500">{helperText}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-2/5" />
            {options.map((_, index) => (
              <col key={`col-${index}`} className="w-auto" />
            ))}
          </colgroup>
          {showHeader && (
            <thead>
              <tr>
                <th className="text-left p-4 pr-8 font-medium text-gray-800 border-b border-gray-200">
                  Question
                </th>
                {options.map((option, index) => (
                  <th
                    key={`header-${index}`}
                    className={`text-center p-4 font-medium border-b border-gray-200 ${error ? 'text-red-700' : 'text-gray-700'} ${sizeClasses[size].text}`}
                  >
                    {option.label}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 pr-8 font-medium text-gray-700 text-left align-middle">
                {label}
              </td>
              {options.map((option, index) => {
                const isDisabled = disabled || option.disabled;
                const isChecked = value === option.value;

                return (
                  <td key={`${name}-${index}`} className="text-center p-4 align-middle">
                    <div className="flex justify-center items-center">
                      <div
                        className={`relative ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => !isDisabled && handleChange(option.value)}
                      >
                        <input
                          type="radio"
                          id={`${name}-${index}`}
                          name={name}
                          value={option.value}
                          checked={isChecked}
                          onChange={(e) => handleChange(e.target.value)}
                          disabled={isDisabled}
                          className="sr-only"
                        />
                        <div
                          className={`
                            ${sizeClasses[size].radio} rounded-full border-2 flex items-center justify-center transition-all duration-200 mx-auto
                            ${isChecked
                              ? error
                                ? 'border-red-500 bg-red-500'
                                : 'border-blue-500 bg-blue-500'
                              : error
                                ? 'border-red-500 bg-white hover:border-red-400'
                                : 'border-gray-300 bg-white hover:border-blue-500'
                            }
                            ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          {isChecked && (
                            <div
                              className={`
                                bg-white rounded-full
                                ${size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-1.5 w-1.5' : 'h-2 w-2'}
                              `}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {error && (
        <div className="mt-2">
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}
      {helperText && !error && (
        <div className="mt-2">
          <span className="text-sm text-gray-500">{helperText}</span>
        </div>
      )}
    </div>
  );
};

export default Radio;
