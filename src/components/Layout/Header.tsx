'use client';

import { Bell, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Reviewer } from '@/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { currentUser, updateReviewerStatus, getSystemStats } = useAppStore();
  const stats = getSystemStats();

  const isReviewer = currentUser?.role === 'reviewer';
  const reviewer = currentUser as Reviewer | null;

  const handleStatusToggle = () => {
    if (reviewer) {
      const newStatus = reviewer.status === 'online' ? 'offline' : 'online';
      updateReviewerStatus(reviewer.id, newStatus);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* 审核员状态切换 */}
        {isReviewer && reviewer && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">工作状态：</span>
            <button
              onClick={handleStatusToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                reviewer.status === 'online'
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  reviewer.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              {reviewer.status === 'online' ? '在线' : '离线'}
            </button>
          </div>
        )}

        {/* 待处理数量 */}
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg">
          <Bell className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-700">
            待处理: {stats.totalPending}
          </span>
        </div>

        {/* 刷新按钮 */}
        <button
          onClick={() => window.location.reload()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="刷新"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
