import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'error', duration = 2000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 动画进入
    setVisible(true);

    // 自动关闭
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // 等待退出动画完成
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    error: 'bg-red-500 text-white',
    success: 'bg-emerald-500 text-white',
    warning: 'bg-amber-500 text-white',
  };

  const icons = {
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 ${
        styles[type]
      } ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 -translate-y-4'}`}
    >
      {icons[type]}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
}
