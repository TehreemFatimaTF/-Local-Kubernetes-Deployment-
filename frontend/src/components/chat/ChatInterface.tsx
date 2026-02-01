/**
 * ChatInterface Component
 *
 * T062: Main chat interface component
 * T069: Error handling and display
 * Manages conversation state and coordinates MessageList and MessageInput
 */

'use client';

import React, { useState, useEffect } from 'react';
import MessageList, { Message } from './MessageList';
import MessageInput from './MessageInput';
import { sendChatMessage, ChatResponse, ErrorResponse } from '@/services/chatApi';
import { dispatchTaskEvent } from '@/lib/taskEvents';

interface ChatInterfaceProps {
  userId: string;
  conversationId?: string;
  onConversationCreated?: (conversationId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userId,
  conversationId: initialConversationId,
  onConversationCreated
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversation history if conversationId is provided
  useEffect(() => {
    if (initialConversationId) {
      setConversationId(initialConversationId);
      // In a real implementation, you would fetch the conversation history here
      // For now, we start with an empty message list
    }
  }, [initialConversationId]);

  const handleSendMessage = async (messageContent: string) => {
    // Clear any previous errors
    setError(null);

    // Add user message to UI immediately for better UX
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageContent,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to API
      const response: ChatResponse = await sendChatMessage(userId, {
        message: messageContent,
        conversation_id: conversationId
      });

      // Update conversation ID if this is a new conversation
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
        onConversationCreated?.(response.conversation_id);
      }

      // Replace temporary user message with actual message from server
      // and add assistant response
      setMessages((prev) => {
        // Remove temporary message
        const withoutTemp = prev.filter((m) => m.id !== userMessage.id);

        // Add user message (with real ID) and assistant response
        return [
          ...withoutTemp,
          {
            id: `user-${response.message_id}`,
            role: 'user' as const,
            content: messageContent,
            created_at: response.created_at
          },
          {
            id: response.message_id,
            role: response.role as 'assistant',
            content: response.content,
            tool_invocations: response.tool_invocations,
            created_at: response.created_at
          }
        ];
      });

      // Dispatch task events if AI used task-related tools
      if (response.tool_invocations && response.tool_invocations.length > 0) {
        response.tool_invocations.forEach((tool) => {
          const toolName = tool.tool_name.toLowerCase();

          if (toolName === 'add_task') {
            dispatchTaskEvent('task-added');
          } else if (toolName === 'update_task') {
            dispatchTaskEvent('task-updated', tool.parameters.task_id);
          } else if (toolName === 'delete_task') {
            dispatchTaskEvent('task-deleted', tool.parameters.task_id);
          } else if (toolName === 'complete_task') {
            dispatchTaskEvent('task-completed', tool.parameters.task_id);
          }
        });
      }
    } catch (err) {
      // Remove temporary user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));

      // Parse and display error
      if (err instanceof Error) {
        try {
          const errorData: ErrorResponse = JSON.parse(err.message);
          setError(`${errorData.code}: ${errorData.message}`);
        } catch {
          setError(err.message || 'Failed to send message');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-light-bg-primary dark:bg-dark-bg-secondary rounded-lg shadow-soft dark:shadow-dark-soft border border-light-border-primary dark:border-dark-border-primary">
      {/* Header */}
      <div className="border-b border-light-border-primary dark:border-dark-border-primary p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent-500 flex-shrink-0">
            <img
              src="https://i.pinimg.com/736x/6d/dc/3f/6ddc3f9a79c891e0efd6042624e08f51.jpg"
              alt="AI Assistant"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
              Chat Assistant
            </h2>
            {conversationId && (
              <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                Conversation ID: {conversationId.substring(0, 8)}...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-3 sm:mx-4 mt-3 sm:mt-4 p-3 sm:p-4 bg-error-light/10 dark:bg-error-dark/10 border border-error-light dark:border-error-dark rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-error-light dark:text-error-dark mb-1">
                Error
              </h3>
              <p className="text-xs sm:text-sm text-error-light dark:text-error-dark">
                {error}
              </p>
            </div>
            <button
              onClick={handleDismissError}
              className="ml-4 text-error-light hover:text-error-light/80 dark:text-error-dark dark:hover:text-error-dark/80 transition-colors"
              aria-label="Dismiss error"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder="Ask me to manage your tasks..."
      />
    </div>
  );
};

export default ChatInterface;
