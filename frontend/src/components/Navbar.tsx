'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-light-border-primary dark:border-dark-border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Interactive with Icon */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group" onClick={closeMobileMenu}>
            <div className="icon-3d w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 group-hover:scale-110 transition-all duration-300">
              <svg className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
              <span className="text-gradient group-hover:scale-105 inline-block transition-transform duration-300">Task</span>
              <span className="text-light-text-primary dark:text-dark-text-primary group-hover:text-accent-500 transition-smooth">Flow</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {!loading && isAuthenticated() && (
            <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
              <Link href="/dashboard" onClick={closeMobileMenu}>
                <div
                  className={`px-3 lg:px-4 py-2 rounded-lg font-medium text-sm lg:text-base transition-smooth ${
                    isActive('/dashboard')
                      ? 'bg-accent-500 text-white shadow-glow'
                      : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                  }`}
                >
                  📊 Dashboard
                </div>
              </Link>
              <Link href="/tasks" onClick={closeMobileMenu}>
                <div
                  className={`px-3 lg:px-4 py-2 rounded-lg font-medium text-sm lg:text-base transition-smooth ${
                    isActive('/tasks')
                      ? 'bg-accent-500 text-white shadow-glow'
                      : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                  }`}
                >
                  📝 Tasks
                </div>
              </Link>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {/* Theme Toggle */}
            <div className="scale-90 sm:scale-100">
              <ThemeToggle />
            </div>

            {loading ? (
              <div className="spinner" />
            ) : isAuthenticated() ? (
              <>
                {/* Desktop User Info & Logout */}
                <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4">
                  <div className="text-xs lg:text-sm text-light-text-secondary dark:text-dark-text-secondary max-w-[120px] lg:max-w-none truncate">
                    <span className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      {user?.name || user?.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-xs lg:text-sm px-3 lg:px-4 py-2 whitespace-nowrap"
                  >
                    Logout
                  </button>
                </div>

                {/* Mobile Hamburger Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors flex items-center justify-center text-light-text-primary dark:text-dark-text-primary"
                  aria-label="Toggle menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen ? (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link href="/login">
                  <button className="text-xs sm:text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary font-medium transition-smooth px-2 sm:px-3 py-2">
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="btn-primary text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 whitespace-nowrap">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {!loading && isAuthenticated() && isMobileMenuOpen && (
          <div className="md:hidden border-t border-light-border-primary dark:border-dark-border-primary animate-slide-down">
            <div className="py-4 space-y-2">
              {/* User Info */}
              <div className="px-4 py-2 text-sm">
                <span className="font-medium text-light-text-primary dark:text-dark-text-primary">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                  {user?.email}
                </p>
              </div>

              <div className="divider my-2" />

              {/* Navigation Links */}
              <Link href="/dashboard" onClick={closeMobileMenu}>
                <div
                  className={`mx-2 px-4 py-3 rounded-lg font-medium transition-smooth ${
                    isActive('/dashboard')
                      ? 'bg-accent-500 text-white shadow-glow'
                      : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                  }`}
                >
                  📊 Dashboard
                </div>
              </Link>
              <Link href="/tasks" onClick={closeMobileMenu}>
                <div
                  className={`mx-2 px-4 py-3 rounded-lg font-medium transition-smooth ${
                    isActive('/tasks')
                      ? 'bg-accent-500 text-white shadow-glow'
                      : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                  }`}
                >
                  📝 Tasks
                </div>
              </Link>

              <div className="divider my-2" />

              {/* Logout Button */}
              <div className="px-2">
                <button
                  onClick={handleLogout}
                  className="w-full btn-secondary text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
