import type { UserInfo } from '../types';

interface UserInfoDisplayProps {
  userInfo: UserInfo;
  onLogout: () => void;
}

export function UserInfoDisplay({ userInfo, onLogout }: UserInfoDisplayProps) {
  return (
    <div className="bg-white border-b border-teal-100 sticky top-0 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* 用户头像 */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0">
              <span className="text-white text-sm sm:text-base font-semibold">
                {userInfo.name.charAt(0)}
              </span>
            </div>

            {/* 用户信息 */}
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                {userInfo.name}
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                <span className="inline-flex items-center gap-1 text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {userInfo.region}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-100">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {userInfo.hospitals.length} 家医院
                </span>
              </div>
            </div>
          </div>

          {/* 退出按钮 */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">退出</span>
          </button>
        </div>
      </div>
    </div>
  );
}
