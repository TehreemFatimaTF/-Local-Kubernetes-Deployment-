'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Task, TaskCreate } from '@/types/task';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { onTaskChange } from '@/lib/taskEvents';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; userId: string; title: string } | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTasks();
      if (response.error) {
        console.error('Error fetching tasks:', response.error);
        return;
      }
      if (response.data?.data?.tasks) {
        setTasks(response.data.data.tasks as Task[]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Listen for task changes from chatbot
  useEffect(() => {
    const cleanup = onTaskChange((detail) => {
      console.log('[Tasks] Task changed:', detail.type);
      // Refetch tasks when chatbot adds/updates/deletes tasks
      fetchTasks();
    });

    return cleanup;
  }, [fetchTasks]);

  const handleTaskCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!newTask.title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await apiClient.createTask(newTask.title, newTask.description);

      if (response.error) {
        console.error('Error creating task:', response.error);
        alert('Failed to create task: ' + response.error);
        return;
      }

      if (response.data?.data?.task) {
        const newTaskData = response.data.data.task as Task;
        setTasks(prevTasks => [newTaskData, ...prevTasks]);
        setNewTask({ title: '', description: '' });
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    try {
      const response = await apiClient.toggleTaskCompletion(taskId);
      if (response.error) {
        console.error('Error toggling task:', response.error);
        return;
      }
      if (response.data?.data?.task) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? response.data!.data.task as Task : task
          )
        );
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleTaskDelete = async (taskId: string, userId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete({ id: taskId, userId, title: task.title });
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      const response = await apiClient.deleteTask(taskToDelete.id);
      if (response.error) {
        console.error('Error deleting task:', response.error);
        return;
      }
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
      setShowDeleteModal(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Memoize filtered tasks to prevent unnecessary re-renders
  const filteredTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter(task => !task.completed);
    if (filter === 'completed') return tasks.filter(task => task.completed);
    return tasks;
  }, [tasks, filter]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-primary">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg-secondary dark:bg-dark-bg-primary relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-gradient">My</span>
              <span className="text-light-text-primary dark:text-dark-text-primary"> Tasks</span>
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">Manage your tasks efficiently</p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary px-6 py-3"
          >
            Create New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8 animate-slide-up">
          {(['all', 'active', 'completed'] as const).map((filterType) => (
            <button
              key={filterType}
              type="button"
              onClick={() => setFilter(filterType)}
              className={`px-6 py-2 rounded-lg font-medium transition-smooth ${
                filter === filterType
                  ? 'bg-accent-500 text-white shadow-glow'
                  : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-light-text-tertiary dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-xl mb-6">
              {filter === 'all' ? 'No tasks found' : `No ${filter} tasks`}
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="btn-primary px-8 py-3"
            >
              Create Your First Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="card-3d p-6 group animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => handleTaskToggle(task.id)}
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-250 ${
                      task.completed
                        ? 'bg-success-light dark:bg-success-dark text-white'
                        : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-tertiary dark:text-dark-text-tertiary hover:bg-accent-500 hover:text-white'
                    }`}
                  >
                    {task.completed ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" strokeWidth={2} />
                      </svg>
                    )}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/tasks/${task.id}`)}
                      className="px-3 py-1.5 text-sm font-medium text-accent-600 dark:text-accent-400 hover:bg-accent-500/10 rounded-lg transition-smooth"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTaskDelete(task.id, task.userId)}
                      className="px-3 py-1.5 text-sm font-medium text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10 rounded-lg transition-smooth"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-2 transition-smooth ${
                  task.completed
                    ? 'line-through text-light-text-tertiary dark:text-dark-text-tertiary'
                    : 'text-light-text-primary dark:text-dark-text-primary'
                }`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4 line-clamp-3">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                  <span>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                  {task.completed && (
                    <span className="badge">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card-3d p-8 max-w-md w-full animate-scale-in"
          >
            <h2 className="text-3xl font-bold mb-6">
              <span className="text-gradient">Create</span>
              <span className="text-light-text-primary dark:text-dark-text-primary"> New Task</span>
            </h2>
            <form onSubmit={handleTaskCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input-premium"
                  placeholder="Enter task title..."
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="input-premium resize-none"
                  placeholder="Enter task description..."
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !newTask.title.trim()}
                  className="btn-primary flex-1"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Task'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && taskToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card-3d p-8 max-w-md w-full animate-scale-in"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-error-light/10 dark:bg-error-dark/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error-light dark:text-error-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                Delete Task?
              </h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-3 mb-6">
                <p className="text-light-text-primary dark:text-dark-text-primary font-medium truncate">
                  "{taskToDelete.title}"
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTaskToDelete(null);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-6 py-2.5 bg-error-light dark:bg-error-dark text-white font-medium rounded-lg shadow-soft hover:shadow-glow transition-all duration-250"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
