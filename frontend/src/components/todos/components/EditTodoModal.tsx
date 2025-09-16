'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import type { Todo } from '@/stores/todoStore';
import { useTodoStore } from '@/stores/todoStore';
import { useEffect, useState } from 'react';

interface EditTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo;
  onSuccess?: () => void;
}

export default function EditTodoModal({ isOpen, onClose, todo, onSuccess }: EditTodoModalProps) {
  const { updateTodo } = useTodoStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'pending',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        status: todo.status,
      });
    }
  }, [todo]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateTodo(todo.id, {
        title: formData.title.trim(),
        description: formData.description,
        dueDate: formData.dueDate,
        status: formData.status,
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Error updating todo:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Todo" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="Title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter todo title"
            required
            fullWidth
          />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          />
        </div>

        <div>
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            required
            fullWidth
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="onProgress">On Progress</option>
            <option value="done">Done</option>
            <option value="overdue">Overdue</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading || !formData.title.trim() || !formData.dueDate}
          >
            Update Todo
          </Button>
        </div>
      </form>
    </Modal>
  );
}