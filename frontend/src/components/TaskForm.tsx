import React, { useState, useEffect } from 'react';
import { Task } from '@/types/task';

interface TaskFormData {
  id?: string;
  title: string;
  description?: string;
  completed?: boolean;
}

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Task) => void | Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  submitButtonText = task?.id ? 'Update Task' : 'Create Task'
}) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
    }
  }, [task]);

  const validateInputs = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }

    if (title.trim().length < 1 || title.trim().length > 200) {
      setError('Title must be between 1 and 200 characters');
      return false;
    }

    if (description && description.length > 1000) {
      setError('Description must not exceed 1000 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateInputs()) {
      return;
    }

    onSubmit({
      ...task,
      id: task?.id || '',
      userId: task?.userId || '',
      title: title.trim(),
      description: description.trim() || undefined,
      completed: task?.completed || false,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Task);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Message */}
      {error && (
        <div
          className="bg-error-light/10 dark:bg-error-dark/10 border border-error-light/20 dark:border-error-dark/20 text-error-light dark:text-error-dark px-4 py-3 rounded-lg text-sm animate-fade-in"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
          Task Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-premium"
          placeholder="Enter task title..."
          required
        />
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="input-premium resize-none"
          placeholder="Enter task description..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="btn-primary flex-1"
        >
          {submitButtonText}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;