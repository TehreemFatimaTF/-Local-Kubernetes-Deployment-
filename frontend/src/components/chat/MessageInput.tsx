/**
 * MessageInput Component
 *
 * T064: Message input component for chat interface
 * Handles user message input with validation and submission
 */

import React, { useState, FormEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...'
}) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate message
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    if (message.length > 10000) {
      setError('Message exceeds maximum length of 10,000 characters');
      return;
    }

    // Clear error and send message
    setError('');
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-light-border-primary dark:border-dark-border-primary p-3 sm:p-4">
      {error && (
        <div className="mb-2 text-xs sm:text-sm text-error-light dark:text-error-dark">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="flex-1 px-3 sm:px-4 py-2 border border-light-border-primary dark:border-dark-border-primary rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500
                     bg-light-bg-primary dark:bg-dark-bg-secondary
                     text-light-text-primary dark:text-dark-text-primary
                     placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-light-bg-tertiary dark:disabled:bg-dark-bg-tertiary
                     resize-none transition-all duration-250 text-sm sm:text-base"
        />

        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="btn-primary px-4 sm:px-6 py-2 self-end text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Send</span>
          <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      <div className="mt-2 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
        Press Enter to send, Shift+Enter for new line
      </div>
    </form>
  );
};

export default MessageInput;
