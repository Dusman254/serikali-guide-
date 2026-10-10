/**
 * Production Application Error Boundary & 500 Screen
 * Intercepts client-side runtime errors, prevents white-screens,
 * and presents an authoritative, branded recovery interface.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorId: '',
  };

  public static getDerivedStateFromError(_: Error): State {
    return {
      hasError: true,
      errorId: `ERR-${Date.now().toString(36).toUpperCase()}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[CLIENT_BOUNDARY_CRASH]', error, errorInfo);
    // In production, dispatch error beacon to server error logger
    try {
      if (typeof window !== 'undefined') {
        const beaconData = JSON.stringify({
          errorId: this.state.errorId,
          message: error.message || 'Client React crash',
          url: window.location.href,
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/errors/log', beaconData);
        }
      }
    } catch {}
  }

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleReturnHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F3EF] text-[#141413] px-4 py-12">
          <div className="max-w-xl w-full text-center space-y-6 bg-[#EAE9E4]/60 border border-[#141413]/15 p-8 sm:p-12 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D94E34] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>HTTP 500 · System Advisory</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-5xl text-[#141413] leading-tight">
              An unexpected procedural interface error occurred.
            </h1>

            <p className="text-xs sm:text-sm text-[#5E5D59] leading-relaxed max-w-md mx-auto">
              Our statutory systems encountered an isolated client rendering exception. No client dossier or payment data has been compromised.
            </p>

            <div className="p-3 bg-[#F4F3EF] border border-[#141413]/10 text-xs font-mono-num text-[#6E6D68]">
              <span>Error Tracking Ref: </span>
              <strong className="text-[#141413]">{this.state.errorId}</strong>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleReturnHome}
                className="px-5 py-2.5 border border-[#141413]/25 hover:border-[#141413] text-[#141413] text-xs font-mono-num uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
