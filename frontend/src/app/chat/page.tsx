/**
 * Chat Page
 *
 * T067: Integration of chat components in main application
 * Protected route for authenticated users to interact with the AI chat assistant
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ChatInterface from '@/components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-primary">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light-bg-secondary dark:bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
            AI Chat Assistant
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
            Chat with your AI assistant to manage tasks and get help
          </p>
        </div>

        {/* Chat Interface */}
        <div className="h-[calc(100vh-16rem)] animate-fade-in">
          <ChatInterface
            userId={user.id}
            onConversationCreated={(conversationId) => {
              console.log('New conversation created:', conversationId);
            }}
          />
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fade-in">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 Tips for using the chat assistant
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Ask the assistant to add, update, or complete tasks</li>
            <li>• Request information about your existing tasks</li>
            <li>• The assistant can use tools to interact with your task list</li>
            <li>• Your conversation history is preserved across sessions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
