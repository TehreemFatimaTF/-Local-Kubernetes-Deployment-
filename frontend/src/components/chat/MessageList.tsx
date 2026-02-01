/**
 * MessageList Component
 *
 * T063: Message list component for displaying conversation history
 * T068: Tool invocation metadata display
 * Displays messages with role-based styling and tool invocation details
 */

import React, { useEffect, useRef } from 'react';
import { ToolInvocation } from '@/services/chatApi';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_invocations?: ToolInvocation[];
  created_at: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderToolInvocations = (toolInvocations: ToolInvocation[]) => {
    return (
      <div className="mt-3 space-y-2">
        <div className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
          Tool Invocations:
        </div>
        {toolInvocations.map((tool, index) => (
          <div
            key={index}
            className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary rounded-lg p-2 sm:p-3 text-xs sm:text-sm"
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="badge text-xs">
                {tool.tool_name}
              </span>
              <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                {formatTimestamp(tool.timestamp)}
              </span>
            </div>

            {Object.keys(tool.parameters).length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Parameters:
                </div>
                <pre className="text-xs bg-light-bg-primary dark:bg-dark-bg-primary p-2 rounded border border-light-border-primary dark:border-dark-border-primary overflow-x-auto">
                  {JSON.stringify(tool.parameters, null, 2)}
                </pre>
              </div>
            )}

            {Object.keys(tool.result).length > 0 && (
              <div>
                <div className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Result:
                </div>
                <pre className="text-xs bg-light-bg-primary dark:bg-dark-bg-primary p-2 rounded border border-light-border-primary dark:border-dark-border-primary overflow-x-auto">
                  {JSON.stringify(tool.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="text-center text-light-text-secondary dark:text-dark-text-secondary">
          <p className="text-base sm:text-lg font-medium mb-2">No messages yet</p>
          <p className="text-sm">Start a conversation by sending a message below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 shadow-soft dark:shadow-dark-soft ${
              message.role === 'user'
                ? 'bg-accent-500 text-white'
                : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </span>
              <span
                className={`text-xs ${
                  message.role === 'user'
                    ? 'text-white/80'
                    : 'text-light-text-tertiary dark:text-dark-text-tertiary'
                }`}
              >
                {formatTimestamp(message.created_at)}
              </span>
            </div>

            <div className="whitespace-pre-wrap break-words text-sm sm:text-base">
              {message.content}
            </div>

            {message.tool_invocations && message.tool_invocations.length > 0 && (
              renderToolInvocations(message.tool_invocations)
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-3 sm:p-4 shadow-soft dark:shadow-dark-soft">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
