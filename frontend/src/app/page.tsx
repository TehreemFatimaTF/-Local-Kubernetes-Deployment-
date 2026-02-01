'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-primary">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg-secondary dark:bg-dark-bg-primary relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-accent-500/20 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-accent-400/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-accent-300/5 rounded-full blur-3xl animate-float" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Hero Section */}
        <div className="text-center animate-fade-in">
          {/* Logo Icon */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="icon-3d w-16 h-16 sm:w-20 sm:h-20 animate-scale-in">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold mb-4 sm:mb-6 tracking-tight px-4 leading-tight">
            <span className="text-gradient">Task</span>
            <span className="text-light-text-primary dark:text-dark-text-primary">Flow</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-light-text-secondary dark:text-dark-text-secondary font-medium mb-3 sm:mb-4 px-4">
            Organize • Achieve • Succeed
          </p>

          <p className="mt-4 sm:mt-6 md:mt-8 max-w-3xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl text-light-text-tertiary dark:text-dark-text-tertiary leading-relaxed px-4">
            Transform your productivity with our premium task management platform.
            <span className="block mt-2 sm:mt-3 text-accent-500 font-semibold text-base sm:text-lg md:text-xl">
              Intelligent. Precise. Powerful.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6 animate-slide-up px-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <button className="btn-primary w-full sm:w-auto px-8 sm:px-10 md:px-12 py-3 sm:py-4 text-base sm:text-lg group">
                Get Started Free
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <button className="btn-secondary w-full sm:w-auto px-8 sm:px-10 md:px-12 py-3 sm:py-4 text-base sm:text-lg">
                Sign In
              </button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 sm:mt-20 md:mt-24 lg:mt-32 animate-fade-in px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16">
            <span className="text-gradient">Why Choose</span>
            <span className="text-light-text-primary dark:text-dark-text-primary"> TaskFlow?</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
                title: "Premium Design",
                description: "Stunning 3D effects and smooth animations that make task management a premium experience"
              },
              {
                icon: (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Lightning Fast",
                description: "Optimized performance ensures smooth experience across all devices with instant response"
              },
              {
                icon: (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Secure & Private",
                description: "Enterprise-grade security keeps your data safe and protected with end-to-end encryption"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="stat-card p-6 sm:p-7 md:p-8 animate-scale-in group hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="icon-3d w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2 sm:mb-3 md:mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 sm:mt-20 md:mt-24 lg:mt-32 animate-fade-in px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              { number: "10K+", label: "Active Users", icon: "👥" },
              { number: "50K+", label: "Tasks Completed", icon: "✓" },
              { number: "99.9%", label: "Uptime", icon: "⚡" }
            ].map((stat, index) => (
              <div
                key={index}
                className="card-3d p-6 sm:p-7 md:p-8 text-center animate-slide-up hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base md:text-lg font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 sm:mt-20 md:mt-24 lg:mt-32 text-center animate-fade-in px-4">
          <div className="card-3d p-6 sm:p-8 md:p-10 lg:p-12 max-w-4xl mx-auto hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 md:mb-6">
              <span className="text-gradient">Ready to boost</span>
              <span className="text-light-text-primary dark:text-dark-text-primary"> your productivity?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-light-text-secondary dark:text-dark-text-secondary mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already achieving more with TaskFlow
            </p>
            <Link href="/signup" className="inline-block w-full sm:w-auto">
              <button className="btn-primary w-full sm:w-auto px-10 sm:px-12 md:px-16 py-4 sm:py-5 text-base sm:text-lg md:text-xl group">
                Start Free Today
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Additional Features Highlight */}
        <div className="mt-16 sm:mt-20 md:mt-24 text-center animate-fade-in px-4 pb-12 sm:pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              { icon: "🎨", label: "Beautiful UI" },
              { icon: "🚀", label: "Fast & Smooth" },
              { icon: "🔒", label: "Secure" },
              { icon: "💡", label: "AI Powered" }
            ].map((item, index) => (
              <div
                key={index}
                className="glass p-4 sm:p-6 rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-glow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{item.icon}</div>
                <div className="text-xs sm:text-sm md:text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
