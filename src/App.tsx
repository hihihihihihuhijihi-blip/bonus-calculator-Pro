import { useState } from 'react';
import { Login } from './components/Login';
import { UserInfoDisplay } from './components/UserInfo';
import { SalesInput } from './components/SalesInput';
import { ResultTable } from './components/ResultTable';
import { calculateBonus, getUserInfo } from './lib/calculator';
import { getAllSalesData } from './utils/storage';
import type { CalculationResult, YearlySummary, UserInfo as UserInfoType } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfoType | null>(null);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [summary, setSummary] = useState<YearlySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentView, setCurrentView] = useState<'input' | 'result'>('input');

  const handleLogin = (userName: string) => {
    setCurrentUser(userName);
    const info = getUserInfo(userName);
    if (info) {
      setUserInfo(info);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserInfo(null);
    setResults([]);
    setSummary(null);
    setError(null);
    setCurrentView('input');
  };

  const handleCalculate = () => {
    if (!currentUser) return;

    setIsCalculating(true);
    setError(null);

    setTimeout(() => {
      const salesData = getAllSalesData(currentUser);

      if (salesData.length === 0) {
        setError('请先输入销售数据');
        setIsCalculating(false);
        return;
      }

      const calculation = calculateBonus(currentUser, salesData);

      if (calculation.error) {
        setError(calculation.error);
        setResults([]);
        setSummary(null);
      } else {
        setError(null);
        setResults(calculation.results);
        setSummary(calculation.summary);
        setCurrentView('result');
      }
      setIsCalculating(false);
    }, 500);
  };

  const handleBackToInput = () => {
    setCurrentView('input');
  };

  const handleDataSaved = () => {
    setResults([]);
    setSummary(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">
      {/* 装饰背景 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-200/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-200/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <UserInfoDisplay userInfo={userInfo!} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 relative z-0">
        {currentView === 'input' ? (
          <>
            <SalesInput userInfo={userInfo!} onDataSaved={handleDataSaved} />

            {/* 计算按钮 */}
            <div className="mb-8 flex justify-center">
              <button
                onClick={handleCalculate}
                disabled={isCalculating}
                className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all font-semibold shadow-lg shadow-teal-500/25 ${
                  isCalculating ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isCalculating ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    计算中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    开始计算奖金
                  </>
                )}
              </button>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium text-sm">{error}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {/* 返回按钮 */}
            <div className="mb-4">
              <button
                onClick={handleBackToInput}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回修改
              </button>
            </div>

            {results.length > 0 && summary && (
              <>
                <ResultTable results={results} summary={summary} />

              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
