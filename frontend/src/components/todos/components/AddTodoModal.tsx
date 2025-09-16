'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useTodoStore } from '@/stores/todoStore';
import { useState } from 'react';
import AISuggestions from './AISuggestions';

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddTodoModal({ isOpen, onClose, onSuccess }: AddTodoModalProps) {
  const { addTodo, fetchTodos } = useTodoStore();
  const [formData, setFormData] = useState({
    titles: [''],
    description: '',
    dueDate: '',
    status: 'pending',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiInput, setAiInput] = useState('');

  const handleChange = (field: string, value: string, index?: number) => {
    if (field === 'titles' && index !== undefined) {
      const newTitles = [...formData.titles];
      newTitles[index] = value;
      setFormData(prev => ({ ...prev, titles: newTitles }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };


  const removeTitleField = (index: number) => {
    if (formData.titles.length > 1) {
      const newTitles = formData.titles.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, titles: newTitles }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validTitles = formData.titles.filter(title => title.trim() !== '');

      await Promise.all(
        validTitles.map(title =>
          addTodo({
            title: title.trim(),
            description: formData.description,
            dueDate: formData.dueDate,
            status: 'pending',
          })
        )
      );

      if (onSuccess) {
        onSuccess();
      } else {
        fetchTodos();
      }

      setFormData({
        titles: [''],
        description: '',
        dueDate: '',
        status: 'pending',
      });

      onClose();
    } catch (error) {
      console.error('Error creating todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestions: string[], selectAll: boolean = false) => {
    if (selectAll) {
      setFormData(prev => ({
        ...prev,
        titles: suggestions
      }));
    } else {
      const emptyIndex = formData.titles.findIndex(title => title.trim() === '');
      if (emptyIndex !== -1) {
        handleChange('titles', suggestions[0], emptyIndex);
      } else {
        setFormData(prev => ({
          ...prev,
          titles: [...prev.titles, suggestions[0]]
        }));
      }
    }
    setShowSuggestions(false);
  };

  const resetForm = () => {
    setFormData({
      titles: [''],
      description: '',
      dueDate: '',
      status: 'pending',
    });
    setAiInput('');
    setShowSuggestions(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Todo" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Titles
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Enter context for AI suggestions..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSuggestions(true)}
                disabled={!aiInput.trim()}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Suggestions
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {formData.titles.map((title, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => handleChange('titles', e.target.value, index)}
                  placeholder={`Title ${index + 1}`}
                  required={index === 0}
                  fullWidth
                />
                {formData.titles.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTitleField(index)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter todo description..."
            rows={3}
            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            required
            fullWidth
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading || formData.titles.every(title => title.trim() === '') || !formData.dueDate}
          >
            Create Todo{formData.titles.filter(title => title.trim() !== '').length > 1 ? 's' : ''}
          </Button>
        </div>
      </form>

      {showSuggestions && (
        <AISuggestions
          onSelect={handleSuggestionSelect}
          onClose={() => setShowSuggestions(false)}
          context={aiInput}
        />
      )}
    </Modal>
  );
}