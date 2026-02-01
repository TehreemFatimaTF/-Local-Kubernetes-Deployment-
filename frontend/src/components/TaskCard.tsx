import React from 'react';
import { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const handleToggle = () => {
    onToggle?.(task.id);
  };

  const handleDelete = () => {
    onDelete?.(task.id);
  };

  const handleEdit = () => {
    onEdit?.(task);
  };

  return (
    <div className="card-3d p-4 mb-3 animate-fade-in group">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-smooth mt-0.5 ${
            task.completed
              ? 'bg-success-light dark:bg-success-dark border-success-light dark:border-success-dark'
              : 'border-light-border-secondary dark:border-dark-border-secondary hover:border-accent-500 dark:hover:border-accent-500'
          }`}
          aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        >
          {task.completed && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-medium transition-smooth ${
            task.completed
              ? 'line-through text-light-text-tertiary dark:text-dark-text-tertiary'
              : 'text-light-text-primary dark:text-dark-text-primary'
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`mt-1 text-sm transition-smooth ${
              task.completed
                ? 'text-light-text-tertiary dark:text-dark-text-tertiary'
                : 'text-light-text-secondary dark:text-dark-text-secondary'
            }`}>
              {task.description}
            </p>
          )}
          <div className="mt-2 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            {new Date(task.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
          <button
            onClick={handleEdit}
            className="px-3 py-1.5 text-sm font-medium text-accent-600 dark:text-accent-400 hover:bg-accent-500/10 rounded-lg transition-smooth"
            aria-label={`Edit task "${task.title}"`}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm font-medium text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10 rounded-lg transition-smooth"
            aria-label={`Delete task "${task.title}"`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;