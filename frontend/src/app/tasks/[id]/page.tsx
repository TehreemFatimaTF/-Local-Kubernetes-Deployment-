'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import { Task } from '@/types/task';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const TaskDetailPage: React.FC = () => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id as string;
  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.getTask(taskId);

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      if (response.data?.data?.task) {
        const taskData = response.data.data.task;

        setTask({
          ...taskData,
          title: taskData.title || '',
          description: taskData.description || ''
        } as Task);
      }
    } catch (error: any) {
      console.error('Error fetching task:', error);
      setError(error.message || 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (taskId) {
      fetchTask();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, authLoading]);

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      const response = await apiClient.updateTask(taskId, {
        title: updatedTask.title,
        description: updatedTask.description,
        completed: updatedTask.completed
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        router.push('/tasks');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update task');
    }
  };

  const handleCancel = () => {
    router.push('/tasks');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-primary">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-primary">
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 bg-error-light/10 dark:bg-error-dark/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-error-light dark:text-error-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-error-light dark:text-error-dark mb-6 text-xl">{error}</p>
          <button
            onClick={() => router.push('/tasks')}
            className="btn-primary px-6 py-3"
          >
            ← Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-primary">
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-light-text-tertiary dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 text-xl">Task not found</p>
          <button
            onClick={() => router.push('/tasks')}
            className="btn-primary px-6 py-3"
          >
            ← Back to Tasks
          </button>
        </div>
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

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 animate-fade-in">
          <button
            onClick={() => router.push('/tasks')}
            className="text-accent-500 hover:text-accent-600 text-sm font-medium flex items-center gap-2 transition-smooth"
          >
            <span>←</span> Back to Tasks
          </button>
        </div>

        <h1 className="text-4xl font-bold mb-8 animate-fade-in">
          <span className="text-gradient">Edit</span>
          <span className="text-light-text-primary dark:text-dark-text-primary"> Task</span>
        </h1>

        <div className="card-3d p-8 animate-scale-in">
          <TaskForm
            task={task}
            onSubmit={handleTaskUpdate}
            onCancel={handleCancel}
            submitButtonText="Update Task"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
