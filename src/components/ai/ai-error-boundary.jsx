'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, CreditCard, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export class AIErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AI Feature Error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const isCreditsError = error?.message?.toLowerCase().includes('credit');
      const isUpgradeError = error?.message?.toLowerCase().includes('upgrade') || 
                            error?.message?.toLowerCase().includes('plan');
      
      return (
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">
                {isCreditsError ? 'Insufficient Credits' : 
                 isUpgradeError ? 'Premium Feature' : 
                 'AI Feature Error'}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {this.state.error?.message || 'Something went wrong with the AI analysis'}
              </p>
              <div className="flex gap-3 justify-center">
                {isCreditsError && (
                  <RouterButton
                    href="/credits"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Buy Credits
                  </RouterButton>
                )}
                {isUpgradeError && (
                  <RouterButton
                    href="/pricing"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </RouterButton>
                )}
                <Button
                  onClick={this.handleReset}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40 p-2 bg-gray-900 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Helper component for router navigation in class component
function RouterButton({ href, children, className }) {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push(href)}
      className={className}
    >
      {children}
    </Button>
  );
}