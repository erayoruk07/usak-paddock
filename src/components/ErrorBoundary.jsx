import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-16 px-6 text-center rounded-3xl bg-[#141822] border-2 border-red-500/50 p-8 space-y-4 max-w-lg mx-auto my-12 animate-fade-in shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center mx-auto mb-2 border border-red-500/40">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white">Bu Ekranda Beklenmedik Bir Hata Oluştu</h3>
          <p className="text-xs text-gray-400">
            {this.state.error?.message || 'Sayfa yüklenirken bir sorun oluştu.'}
          </p>
          <div className="pt-2 flex justify-center space-x-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
                else window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-red-600/30 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yeniden Dene</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
