import { useState } from 'react';
import { getUserList } from '../lib/calculator';

interface LoginProps {
  onLogin: (userName: string) => void;
}

type View = 'login' | 'register';

export function Login({ onLogin }: LoginProps) {
  const [view, setView] = useState<View>('login');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');

    if (!userName.trim()) {
      setError('请输入姓名');
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '{}');
    const userData = registeredUsers[userName.trim()];

    if (!userData) {
      setError('该用户尚未注册，请先注册');
      return;
    }

    if (userData.password !== password) {
      setError('密码错误');
      return;
    }

    onLogin(userName.trim());
  };

  const handleRegister = () => {
    setError('');

    if (!userName.trim()) {
      setError('请输入姓名');
      return;
    }

    if (!password) {
      setError('请设置密码');
      return;
    }

    if (password.length < 4) {
      setError('密码长度至少4位');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    const userList = getUserList();
    const userExists = userList.some(
      name => name === userName || name === userName.trim()
    );

    if (!userExists) {
      setError('该姓名不在经办人列表中，无法注册');
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '{}');
    if (registeredUsers[userName.trim()]) {
      setError('该用户已注册，请直接登录');
      return;
    }

    registeredUsers[userName.trim()] = {
      name: userName.trim(),
      password: password,
      registeredAt: new Date().toISOString(),
    };
    localStorage.setItem('registered_users', JSON.stringify(registeredUsers));

    onLogin(userName.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (view === 'login') {
        handleLogin();
      } else {
        handleRegister();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 flex items-center justify-center p-4 sm:p-6">
      {/* 装饰背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg shadow-teal-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">奖金计算器</h1>
          <p className="text-gray-500 mt-1">医药代表专版</p>
        </div>

        {/* 登录/注册卡片 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-teal-900/10 border border-teal-100 overflow-hidden">
          {/* 切换标签 */}
          <div className="flex bg-gray-50/80">
            <button
              onClick={() => { setView('login'); setError(''); }}
              className={`flex-1 py-4 text-sm font-medium transition-all relative ${
                view === 'login'
                  ? 'text-teal-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              登录
              {view === 'login' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500" />
              )}
            </button>
            <button
              onClick={() => { setView('register'); setError(''); }}
              className={`flex-1 py-4 text-sm font-medium transition-all relative ${
                view === 'register'
                  ? 'text-teal-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              注册
              {view === 'register' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500" />
              )}
            </button>
          </div>

          {/* 表单 */}
          <div className="p-6 sm:p-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  经办人姓名
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    placeholder="请输入您的姓名"
                    autoComplete="username"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    placeholder={view === 'login' ? '请输入密码' : '设置密码（至少4位）'}
                    autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                </div>
              </div>

              {view === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    确认密码
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-3 text-base bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="再次输入密码"
                      autoComplete="new-password"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                onClick={view === 'login' ? handleLogin : handleRegister}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all font-semibold shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {view === 'login' ? '立即登录' : '注册账号'}
              </button>
            </div>

            {/* 提示信息 */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                {view === 'login' ? (
                  <>
                    首次使用请先<strong>注册</strong>，注册姓名需与经办人列表一致
                  </>
                ) : (
                  <>
                    注册前请确认您的姓名在经办人列表中，注册后仅可查看自己的奖金数据
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 医药代表奖金管理系统
        </p>
      </div>
    </div>
  );
}
