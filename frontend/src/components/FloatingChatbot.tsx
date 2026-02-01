/**
 * FloatingChatbot Component
 *
 * A floating chatbot widget that appears in the bottom-right corner
 * Provides quick access to the AI assistant from any page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';

const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Don't show on login/signup pages or chat page
  const shouldHide = ['/login', '/signup', '/chat'].includes(pathname);

  // Close chatbot when navigating to chat page
  useEffect(() => {
    if (pathname === '/chat') {
      setIsOpen(false);
    }
  }, [pathname]);

  if (shouldHide || !isAuthenticated()) {
    return null;
  }

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
    setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group overflow-hidden border-2 border-white dark:border-dark-bg-primary"
          aria-label="Open chat assistant"
        >
          <img
            src="https://i.pinimg.com/1200x/ce/a5/e4/cea5e48c88cba27483e015b3740f188c.jpg"
            alt="AI Assistant"
          
            className=" h-full w-fullobject-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Notification Badge (optional - can be used for unread messages) */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-light dark:bg-error-dark rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-primary flex items-center justify-center text-xs font-bold opacity-0 scale-0 transition-all duration-300">
            1
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={minimizeChat}
          />

          {/* Chat Container */}
          <div
            className={`fixed z-50 transition-all duration-300 ${
              isMinimized ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            } ${
              // Mobile: Full screen with padding
              'bottom-0 left-0 right-0 top-16 m-4 md:m-0' +
              // Desktop: Bottom-right corner
              ' md:bottom-6 md:right-6 md:left-auto md:top-auto md:w-[400px] md:h-[600px] lg:w-[450px] lg:h-[650px]'
            }`}
          >
            <div className="card-3d h-full flex flex-col overflow-hidden animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-light-border-primary dark:border-dark-border-primary bg-light-bg-primary dark:bg-dark-bg-secondary">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent-500 flex-shrink-0">
                    <img
                      src="https://i.pinimg.com/1200x/ce/a5/e4/cea5e48c88cba27483e015b3740f188c.jpg"
                      alt="AI Assistant"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                      AI Assistant
                    </h3>
                    <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                      Online
                    </p>
                  </div>
                </div>

                <button
                  onClick={minimizeChat}
                  className="w-8 h-8 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                  aria-label="Close chat"
                >
                  <svg
                    className="w-5 h-5"
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

              {/* Chat Interface */}
              <div className="flex-1 overflow-hidden">
                {user && (
                  <ChatInterface
                    userId={user.id}
                    onConversationCreated={(conversationId) => {
                      console.log('Conversation created:', conversationId);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FloatingChatbot;
