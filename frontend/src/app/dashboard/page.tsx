'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Task } from '@/types/task';
import { onTaskChange } from '@/lib/taskEvents';

const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

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
    if (authLoading) {
      return;
    }

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Listen for task changes from chatbot
  useEffect(() => {
    const cleanup = onTaskChange((detail) => {
      console.log('[Dashboard] Task changed:', detail.type);
      // Refetch tasks when chatbot adds/updates/deletes tasks
      fetchTasks();
    });

    return cleanup;
  }, [fetchTasks]);

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

  // Memoize expensive calculations to prevent unnecessary re-renders
  // IMPORTANT: All hooks must be called BEFORE any conditional returns
  const completedTasks = useMemo(() =>
    tasks.filter(task => task.completed).length,
    [tasks]
  );

  const activeTasks = useMemo(() =>
    tasks.filter(task => !task.completed).length,
    [tasks]
  );

  const totalTasks = tasks.length;

  const completionRate = useMemo(() =>
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    [completedTasks, totalTasks]
  );

  // Conditional rendering AFTER all hooks
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-primary">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg-secondary dark:bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
            Welcome back, <span className="text-gradient">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-base sm:text-lg">
            Here's your productivity overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Tasks */}
          <div className="stat-card p-4 sm:p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-xs sm:text-sm font-medium mb-1">
                  Total Tasks
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary">
                  {totalTasks}
                </p>
              </div>
              <div className="icon-3d w-10 h-10 sm:w-12 sm:h-12">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-light-text-tertiary dark:text-dark-text-tertiary">All tasks</span>
            </div>
          </div>

          {/* Active Tasks */}
          <div className="stat-card p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-xs sm:text-sm font-medium mb-1">
                  Active
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary">
                  {activeTasks}
                </p>
              </div>
              <div className="icon-3d w-10 h-10 sm:w-12 sm:h-12">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="badge text-xs">⚡ In Progress</span>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="stat-card p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-xs sm:text-sm font-medium mb-1">
                  Completed
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary">
                  {completedTasks}
                </p>
              </div>
              <div className="icon-3d w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-success-light to-success-dark">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-success-light dark:text-success-dark font-medium">✓ Done</span>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="stat-card p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-xs sm:text-sm font-medium mb-1">
                  Completion
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary">
                  {completionRate}%
                </p>
              </div>
              <div className="icon-3d w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-warning-light to-warning-dark">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Success rate</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-3d p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in">
          <h2 className="text-lg sm:text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3 sm:mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link href="/tasks" className="flex-1 sm:flex-none">
              <button className="btn-primary w-full sm:w-auto text-sm sm:text-base">
                View All Tasks
              </button>
            </Link>
            <Link href="/tasks" className="flex-1 sm:flex-none">
              <button className="btn-secondary w-full sm:w-auto text-sm sm:text-base">
                Create New Task
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card-3d p-4 sm:p-6 animate-fade-in">
          <h2 className="text-lg sm:text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4 sm:mb-6">
            Recent Tasks
          </h2>

          {tasks.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-light-text-tertiary dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-base sm:text-lg mb-3 sm:mb-4">
                📭 No tasks yet
              </p>
              <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm sm:text-base mb-4 sm:mb-6">
                Create your first task to get started
              </p>
              <Link href="/tasks" className="inline-block w-full sm:w-auto px-4">
                <button className="btn-primary w-full sm:w-auto">
                  Create Your First Task
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task, index) => (
                <div
                  key={task.id}
                  className="card-3d p-3 sm:p-4 animate-scale-in group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-col sm:flex-row">
                    <button
                      onClick={() => handleTaskToggle(task.id)}
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-250 ${
                        task.completed
                          ? 'bg-success-light dark:bg-success-dark text-white'
                          : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-tertiary dark:text-dark-text-tertiary hover:bg-accent-500 hover:text-white'
                      }`}
                    >
                      {task.completed ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" strokeWidth={2} />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm sm:text-base font-medium transition-smooth ${
                        task.completed
                          ? 'line-through text-light-text-tertiary dark:text-dark-text-tertiary'
                          : 'text-light-text-primary dark:text-dark-text-primary'
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-xs sm:text-sm truncate mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link href={`/tasks/${task.id}`} className="flex-1 sm:flex-none">
                        <button className="w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm font-medium text-accent-600 dark:text-accent-400 hover:bg-accent-500/10 rounded-lg transition-smooth">
                          Edit
                        </button>
                      </Link>
                      <Link href="/tasks" className="flex-1 sm:flex-none">
                        <button className="w-full sm:w-auto btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                          View All
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
