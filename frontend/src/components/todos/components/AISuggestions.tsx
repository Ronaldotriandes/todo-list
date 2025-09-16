'use client';

import Button from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { CreateSuggestion } from '../../ai/api';

interface AISuggestionsProps {
  onSelect: (suggestions: string[], selectAll?: boolean) => void;
  onClose: () => void;
  context?: string;
}

export default function AISuggestions({ onSelect, onClose, context }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, [context]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await CreateSuggestion({
        body: {
          goal: context || ''
        }
      });

      if (!response) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = response.data;
      setSuggestions(data.slice(0, 3));

    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      setError('Failed to get AI suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOne = (suggestion: string) => {
    onSelect([suggestion]);
  };

  const handleSelectAll = () => {
    onSelect(suggestions, true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Getting AI suggestions...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="mt-2 text-sm text-red-600">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSuggestions}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Here are some AI-generated todo suggestions:
                </p>

                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900 flex-1 mr-3">
                        {suggestion}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectOne(suggestion)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    onClick={fetchSuggestions}
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </Button>

                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSelectAll}
                      disabled={suggestions.length === 0}
                    >
                      Add All
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}